
'use client'
export const dynamic = "force-dynamic";
import { useState } from 'react';
import { Upload, CircleCheck as CheckCircle, X, Eye, ChartBar as BarChart3, Brain } from 'lucide-react';
import api from '../services/api'; // Ensure this path is correct
import './HomePage.css';
import { useRouter } from 'next/navigation';

const HomePage = () => {
    const router = useRouter()
    // 🎯 UPDATED STATE: 'resume' is now an array of files
    const [uploadedFiles, setUploadedFiles] = useState({
        resume: [], // Array to hold multiple resume files
        jobDescription: null // Single JD file
    });
    const [dragOver, setDragOver] = useState({
        resume: false,
        jobDescription: false
    });
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState('');

    // ... (handleDragOver and handleDragLeave remain the same) ...
    const handleDragOver = (e, type) => {
        e.preventDefault();
        setDragOver(prev => ({ ...prev, [type]: true }));
    };

    const handleDragLeave = (e, type) => {
        e.preventDefault();
        setDragOver(prev => ({ ...prev, [type]: false }));
    };

    // 🎯 UPDATED HANDLER: Handles multiple files for resumes (type 'resume')
    const handleDrop = (e, type) => {
        e.preventDefault();
        setDragOver(prev => ({ ...prev, [type]: false }));
        
        const files = Array.from(e.dataTransfer.files);

        if (type === 'resume') {
            // Append new files to the existing array
            setUploadedFiles(prev => ({ ...prev, resume: [...prev.resume, ...files] }));
        } else if (type === 'jobDescription' && files.length > 0) {
            // Only allow one JD file
            setUploadedFiles(prev => ({ ...prev, jobDescription: files[0] }));
        }
    };

    // 🎯 UPDATED HANDLER: Handles multiple files selection for resumes
    const handleFileSelect = (e, type) => {
        const files = Array.from(e.target.files);

        if (type === 'resume') {
             // Append new files to the existing array
            setUploadedFiles(prev => ({ ...prev, resume: [...prev.resume, ...files] }));
        } else if (files.length > 0) {
            // Only allow one JD file
            setUploadedFiles(prev => ({ ...prev, jobDescription: files[0] }));
        }
    };
    
    // 🎯 UPDATED HANDLER: Removes a specific file from the array (by index) or nulls the single file
    const removeFile = (type, index) => {
        if (type === 'resume') {
            setUploadedFiles(prev => ({
                ...prev,
                resume: prev.resume.filter((_, i) => i !== index)
            }));
        } else if (type === 'jobDescription') {
            setUploadedFiles(prev => ({ ...prev, jobDescription: null }));
        }
    };

    const handleStartAnalysis = () => {
        // Must have at least one resume and one job description
        if (uploadedFiles.resume.length > 0 && uploadedFiles.jobDescription) {
            performAnalysis();
        }
    };

    // 🎯 CORE LOGIC UPDATE: Two sequential steps, with a parallel step for multiple resumes
    const performAnalysis = async () => {
        if (uploadedFiles.resume.length === 0 || !uploadedFiles.jobDescription) return;

        try {
            setIsAnalyzing(true);
            setError('');
            
            // --- STEP 1: UPLOAD AND ANALYZE JOB DESCRIPTION (Get the jobId) ---
            console.log("Step 1: Analyzing Job Description...");
            const jobFormData = new FormData();
            jobFormData.append('jobDescription', uploadedFiles.jobDescription);
            
            const jobResponse = await api.analyzeJob(jobFormData); 
            
            const jobId = jobResponse.jobId; 
            if (!jobId) {
                 throw new Error("Server failed to return a Job ID after analysis.");
            }
            
            // --- STEP 2: UPLOAD ALL RESUMES AND START MATCHING ---
            console.log(`Step 2: Analyzing ${uploadedFiles.resume.length} resumes with Job ID: ${jobId}...`);

            // Create an array of promises, one for each resume file
            const analysisPromises = uploadedFiles.resume.map((file, _ ) => {
                const resumeFormData = new FormData();
                resumeFormData.append('resume', file);
                resumeFormData.append('jobId', jobId); 
                
                // Call the analyzeResume function for each file
                return api.analyzeResume(resumeFormData)
                    .then(response => ({ 
                        ...response, 
                        fileName: file.name // Keep the file name for display/ranking
                    }))
                    .catch(err => {
                        console.error(`Analysis failed for file ${file.name}:`, err);
                        // Return an error object instead of failing the whole Promise.all
                        return { success: false, error: err.message, fileName: file.name };
                    });
            });

            // Wait for all resume analyses to complete in parallel
            const allResults = await Promise.all(analysisPromises);
            
            // Aggregate all successful candidates into a single array
            let allCandidates = [];
            let successfulAnalyses = 0;

            allResults.forEach(result => {
                if (result.success && result.candidates && result.candidates.length > 0) {
                    allCandidates.push(result.candidates[0]); // Assuming one candidate per resume file
                    successfulAnalyses++;
                } else {
                    console.warn(`Skipped failed analysis for ${result.fileName}: ${result.error || 'Unknown error'}`);
                }
            });
            
            if (successfulAnalyses === 0) {
                throw new Error("No resumes were successfully analyzed. Please check file formats.");
            }

            // Combine all candidates into the expected result structure for the ranking page
            const finalResult = {
                success: true,
                candidates: allCandidates
            };

            // Store the final aggregated result keyed by the jobId
            localStorage.setItem(`analysis-${jobId}`, JSON.stringify(finalResult));
            localStorage.setItem('currentAnalysisId', jobId);
            
            // Navigate to the ranking/results page
          
            router.push(`/ranking/${jobId}`);
            
        } catch (err) {
            const serverMessage = err.message.includes('Analysis Error:') ? err.message.replace('Analysis Error: ', '') : (err.response?.data?.error || err.response?.data?.message);
            const errorMessage = serverMessage || err.message || 'Analysis failed. Please try again.';
            setError(`Analysis Error: ${errorMessage}`);
            console.error(err);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const resumeCount = uploadedFiles.resume.length;

    return (
        <div className="homepage">
            <div className="container">
                {/* ... (Features and Progress Steps JSX remain the same) ... */}
                <div className="features-section">
                    <div className="feature-card">
                        <div className="feature-icon primary">
                            <Eye />
                        </div>
                        <div className="feature-content">
                            <h3>Smart Analysis</h3>
                            <p>AI-powered skill and personality matching</p>
                        </div>
                    </div>
                    
                    <div className="feature-card">
                        <div className="feature-icon secondary">
                            <BarChart3 />
                        </div>
                        <div className="feature-content">
                            <h3>Precise Ranking</h3>
                            <p>Candidate ranking with detailed scores</p>
                        </div>
                    </div>
                    
                    <div className="feature-card">
                        <div className="feature-icon accent">
                            <Brain />
                        </div>
                        <div className="feature-content">
                            <h3>Personality Insights</h3>
                            <p>Big Five trait analysis and matching</p>
                        </div>
                    </div>
                </div>

                <div className="progress-steps">
                    <div className="step active">
                        <div className="step-number">1</div>
                        <span>Upload Files</span>
                    </div>
                    <div className="step-line"></div>
                    <div className="step">
                        <div className="step-number">2</div>
                        <span>Start Analysis</span>
                    </div>
                    <div className="step-line"></div>
                    <div className="step">
                        <div className="step-number">3</div>
                        <span>View Results</span>
                    </div>
                </div>

                {/* Upload Section */}
                <div className="upload-section">
                    <h2>Upload Files</h2>
                    
                    <div className="upload-grid">
                        
                        {/* 🎯 UPDATED RESUME UPLOAD */}
                        <div className="upload-area">
                            <h3>Upload Resumes ({resumeCount} total)</h3>
                            <div 
                                className={`upload-dropzone ${dragOver.resume ? 'drag-over' : ''} ${resumeCount > 0 ? 'has-file' : ''}`}
                                onDragOver={(e) => handleDragOver(e, 'resume')}
                                onDragLeave={(e) => handleDragLeave(e, 'resume')}
                                onDrop={(e) => handleDrop(e, 'resume')}
                            >
                                {resumeCount > 0 ? (
                                    <div className="upload-success">
                                        <CheckCircle className="success-icon" />
                                        <p>{resumeCount} file(s) uploaded successfully</p>
                                    </div>
                                ) : (
                                    <div className="upload-prompt">
                                        <Upload className="upload-icon" />
                                        <p>Drop **multiple** resume files here or click to browse (PDF, DOCX)</p>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    onChange={(e) => handleFileSelect(e, 'resume')}
                                    className="file-input"
                                    multiple // 🎯 Allows multiple file selection
                                />
                            </div>
                            <div className="uploaded-files-list">
                                {uploadedFiles.resume.map((file, index) => (
                                    <div key={index} className="uploaded-file">
                                        <span>{file.name}</span>
                                        <button 
                                            onClick={() => removeFile('resume', index)}
                                            className="remove-file"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Job Description Upload (unchanged) */}
                        <div className="upload-area">
                            <h3>Upload Job Description</h3>
                            <div 
                                className={`upload-dropzone ${dragOver.jobDescription ? 'drag-over' : ''} ${uploadedFiles.jobDescription ? 'has-file' : ''}`}
                                onDragOver={(e) => handleDragOver(e, 'jobDescription')}
                                onDragLeave={(e) => handleDragLeave(e, 'jobDescription')}
                                onDrop={(e) => handleDrop(e, 'jobDescription')}
                            >
                                {uploadedFiles.jobDescription ? (
                                    <div className="upload-success">
                                        <CheckCircle className="success-icon" />
                                        <p>1 file uploaded successfully</p>
                                    </div>
                                ) : (
                                    <div className="upload-prompt">
                                        <Upload className="upload-icon" />
                                        <p>Drop Job Description file here or click to browse</p>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept=".pdf,.doc,.docx,.txt"
                                    onChange={(e) => handleFileSelect(e, 'jobDescription')}
                                    className="file-input"
                                />
                            </div>
                            {uploadedFiles.jobDescription && (
                                <div className="uploaded-file">
                                    <span>{uploadedFiles.jobDescription.name}</span>
                                    <button 
                                        onClick={() => removeFile('jobDescription')}
                                        className="remove-file"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="start-analysis-section">
                        {error && (
                            <div className="error-message">
                                <p>{error}</p>
                            </div>
                        )}
                        <button 
                            className={`btn btn-success start-analysis-btn ${
                                resumeCount > 0 && uploadedFiles.jobDescription && !isAnalyzing ? '' : 'disabled'
                            }`}
                            onClick={handleStartAnalysis}
                            disabled={resumeCount === 0 || !uploadedFiles.jobDescription || isAnalyzing}
                        >
                            {isAnalyzing ? `Analyzing ${resumeCount} Resumes...` : 'Start Analysis'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;