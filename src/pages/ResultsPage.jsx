'use client'
export const dynamic = "force-dynamic";
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Info, Loader2, AlertTriangle } from 'lucide-react';
import api from '../services/api'; 
import './ResultsPage.css';

// ----------------------------------------------------------------------
// Helper Functions & Components
// ----------------------------------------------------------------------

// Helper function to determine the color class
const getScoreColor = (score) => {
    const s = Number(score) || 0;
    if (s >= 90) return "excellent";
    if (s >= 80) return "good";
    if (s >= 65) return "fair";
    return "poor";
};

// Modal for Big Five Personality Info
const PersonalityModal = ({ onClose }) => (
    <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
                <h3>Big Five Personality Model</h3>
                <button className="modal-close" onClick={onClose}>
                    &times;
                </button>
            </div>
            <div className="modal-body">
                <p>
                    The Big Five personality model (OCEAN) is a widely accepted framework in psychology that measures five
                    key personality dimensions:
                </p>

                <div className="personality-traits">
                    <div className="trait">
                        <h4 style={{ color: "var(--primary)" }}>Openness to Experience</h4>
                        <p>Creativity, curiosity, and willingness to try new things</p>
                    </div>
                    <div className="trait">
                        <h4 style={{ color: "var(--success)" }}>Conscientiousness</h4>
                        <p>Organization, discipline, and attention to detail</p>
                    </div>
                    <div className="trait">
                        <h4 style={{ color: "var(--secondary)" }}>Extraversion</h4>
                        <p>Sociability, assertiveness, and energy in social situations</p>
                    </div>
                    <div className="trait">
                        <h4 style={{ color: "var(--accent)" }}>Agreeableness</h4>
                        <p>Cooperation, trust, and consideration for others</p>
                    </div>
                    <div className="trait">
                        <h4 style={{ color: "var(--error)" }}>Neuroticism</h4>
                        <p>Emotional stability and stress management (lower scores are better)</p>
                    </div>
                </div>

                <div className="how-it-works">
                    <h4>How it works:</h4>
                    <p>
                        Our AI analyzes resume language patterns to infer personality traits, then compares them against the
                        ideal profile for your job role to determine cultural and behavioral fit.
                    </p>
                </div>
            </div>
        </div>
    </div>
);

// ----------------------------------------------------------------------
// Main ResultsPage Component
// ----------------------------------------------------------------------

const ResultsPage = () => {
    const [candidateData, setCandidateData] = useState(null);
    const [jobProfile, setJobProfile] = useState(null);
    const [showPersonalityModal, setShowPersonalityModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [searchParams] = useSearchParams();
    const analysisId = searchParams.get('analysisId');
    const candidateId = searchParams.get('candidateId');
    const navigate = useNavigate();

    useEffect(() => {
        const loadData = async () => {
            if (analysisId && candidateId) {
                // Primary path: Both IDs are present, fetch detailed reports
                fetchCandidateDetails(analysisId, candidateId);
            } else {
                // Fallback path: Missing candidateId, try to load the first candidate from the analysis batch
                const fallbackAnalysisId = searchParams.get("analysisId") || localStorage.getItem("currentAnalysisId");
                if (fallbackAnalysisId) {
                    fetchOriginalCandidateData(fallbackAnalysisId);
                } else {
                    setError('Missing analysis ID or candidate ID in the URL/storage.');
                    setLoading(false);
                }
            }
        };
        loadData();
    }, [analysisId, candidateId]);

    // Handle back to ranking with analysisId
    const handleBackToRanking = () => {
        if (analysisId) {
            navigate(`/ranking/${analysisId}`);
        } else {
            // Fallback to home if no analysisId
            navigate('/');
        }
    };

    /**
     * Fetches detailed candidate data and the job profile.
     * This uses two separate API calls: getCandidateDetails and getJobProfile.
     */
    const fetchCandidateDetails = async (aId, cId) => {
        try {
            setLoading(true);
            setError('');
            
            // api.getCandidateDetails returns the candidate object directly.
            // api.getJobProfile returns { jobProfile: {...} }
            const [candidateRes, jobRes] = await Promise.all([
                api.getCandidateDetails(cId),
                api.getJobProfile(aId) 
            ]);

            if (candidateRes && jobRes && jobRes.jobProfile) {
                setCandidateData(candidateRes);
                setJobProfile(jobRes.jobProfile); // Access the nested jobProfile
            } else {
                throw new Error("Candidate or Job Profile data was incomplete or not found.");
            }

        } catch (err) {
            const errorMessage = err.message || "Failed to load detailed analysis.";
            setError(errorMessage);
            console.error("Error fetching detailed analysis:", err);
        } finally {
            setLoading(false);
        }
    };
    
    /**
     * Fetches the full analysis result (a list of candidates) and uses the first one.
     * Used as a fallback if the direct candidate ID is missing.
     */
    const fetchOriginalCandidateData = async (aId) => {
        try {
            setLoading(true);
            // api.getAnalysisResults returns { candidates: [...] }
            const data = await api.getAnalysisResults(aId);
            
            if (data.candidates && data.candidates.length > 0) {
                // Use the first candidate in the list for a displayable result
                setCandidateData(data.candidates[0]); 
            } else {
                setError("No candidate data found in the analysis results.");
            }
        } catch (err) {
            setError(err.message || "Failed to load candidate data.");
            console.error("Error fetching original candidate data:", err);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="results-page loading">
                <div className="container">
                    <div className="loading-message">
                        <Loader2 size={32} className="spinner" />
                        <p>Loading candidate details...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error && !candidateData) {
        return (
            <div className="results-page error">
                <div className="container">
                    <div className="error-message">
                        <AlertTriangle size={32} />
                        <h1>Error</h1>
                        <p>{error}</p>
                        <button onClick={handleBackToRanking} className="btn btn-primary">
                            Back to Rankings
                        </button>
                    </div>
                </div>
            </div>
        );
    }
    
    // --- Data Destructuring ---
    const candidate = candidateData || {};
    
    const {
        name,
        email,
        overallMatch,
        skillsMatch,
        personalityFit,
        quickStats = {}, 
        skillsBreakdown = {}, 
        personalityProfile = {}, 
    } = candidate;

    // Helper to render skill tags
    const renderSkillTags = (skillsArray, className) => (
        <div className="skill-tags">
            {skillsArray?.map((skill, index) => (
                <span key={index} className={`skill-tag ${className}`}>
                    {skill}
                </span>
            ))}
        </div>
    );

    // Default to 'N/A' or 0 if data is missing, which is a safer approach
    const defaultName = name || 'N/A';
    const defaultEmail = email || 'N/A';
    const defaultOverallMatch = overallMatch ?? 0;
    const defaultSkillsMatch = skillsMatch ?? 0;
    const defaultPersonalityFit = personalityFit ?? 0;

    return (
        <div className="results-page">
            <div className="container">
                
                {/* Fixed Back Button */}
                <button onClick={handleBackToRanking} className="back-button">
                    <ArrowLeft size={20} />
                    Return to Ranking
                </button>

                {/* Candidate Info and Overall Match */}
                <div className={`candidate-summary-box ${getScoreColor(defaultOverallMatch)}`}>
                    <div className="candidate-info">
                        <h1>{defaultName}</h1>
                        <p className="candidate-email">{defaultEmail}</p>
                        {jobProfile && (
                            <p className="job-info">
                                Matching for: {jobProfile.title} at {jobProfile.company}
                            </p>
                        )}
                    </div>
                    
                    <div className="overall-match-score">
                        {/* Ensure score color applies to the number */}
                        <div className={`score-number-large ${getScoreColor(defaultOverallMatch)}`}>{defaultOverallMatch}%</div>
                        <p className="score-label-large">Overall Match</p>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="results-content-grid">
                    <div className="results-left-column">
                        
                        {/* Score Breakdown */}
                        <div className="score-breakdown-card card">
                            <h2>Score Breakdown</h2>
                            
                            <div className="breakdown-item">
                                <div className="breakdown-label">
                                    <h3>Skills Match</h3>
                                    <p>Technical and functional skill alignment</p>
                                </div>
                                <div className="breakdown-value">
                                    <span className={`score-percentage ${getScoreColor(defaultSkillsMatch)}`}>{defaultSkillsMatch}%</span>
                                </div>
                            </div>
                            
                            <div className="breakdown-item">
                                <div className="breakdown-label">
                                    <h3>Personality Fit</h3>
                                    <p>Big five personality trait alignment</p>
                                </div>
                                <div className="breakdown-value">
                                    <span className={`score-percentage ${getScoreColor(defaultPersonalityFit)}`}>{defaultPersonalityFit}%</span>
                                </div>
                            </div>
                        </div>

                        {/* Personality Profile */}
                        <div className="personality-profile-card card">
                            <div className="card-header">
                                <h2>Personality Profile</h2>
                                <button className="info-button" onClick={() => setShowPersonalityModal(true)}>
                                    <p>i</p>
                                    <Info size={16  } />
                                </button>
                            </div>

                            <div className="personality-traits-list">
                                {Object.keys(personalityProfile).length > 0 ? (
                                    Object.entries(personalityProfile).map(([trait, data]) => (
                                        <div key={trait} className="personality-trait-row">
                                            <span className="trait-name-bold">{trait.charAt(0).toUpperCase() + trait.slice(1)}</span>
                                            <span className="trait-scores-label">
                                                Candidate: {data.candidate ?? 'N/A'} | Ideal: {data.ideal ?? 'N/A'}
                                            </span>
                                            {/* Ensure the match score is formatted with a percentage sign */}
                                            <span className="trait-match-percent">
                                                {data.match !== undefined && data.match !== null 
                                                    ? `${Math.round(data.match)}%` 
                                                    : '-% Match'}
                                            </span> 
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-sm text-gray-500">Personality data not available.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="results-right-column">
                        {/* Quick Stats */}
                        <div className="quick-stats-card card">
                            <h2>Quick Stats</h2>
                            <div className="quick-stats-list">
                                <div className="stat-row">
                                    <span className="stat-label">Perfect Skill Match</span>
                                    <span className="stat-value">{quickStats.perfectSkillMatch ?? 0}</span>
                                </div>
                                <div className="stat-row">
                                    <span className="stat-label">Partial Skill Match</span>
                                    <span className="stat-value">{quickStats.partialSkillMatch ?? 0}</span>
                                </div>
                                <div className="stat-row">
                                    <span className="stat-label">Missing Skills</span>
                                    <span className="stat-value">{quickStats.missingSkills ?? 0}</span>
                                </div>
                            </div>
                        </div>

                        {/* Skills Match Details */}
                        <div className="skills-details-card card">
                            <div className="card-header">
                                <h2>Skills Match</h2>
                                <span className="overall-match-percent">{defaultSkillsMatch}%</span>
                            </div>
                            <p className="card-subtitle">Overall Match</p>

                            <div className="skills-breakdown">
                                <div className="skill-category">
                                    <h4>Perfect Matches ({skillsBreakdown.perfectMatches?.length || 0})</h4>
                                    {renderSkillTags(skillsBreakdown.perfectMatches, 'perfect')}
                                </div>

                                <div className="skill-category">
                                    <h4>Partial Matches ({skillsBreakdown.partialMatches?.length || 0})</h4>
                                    {renderSkillTags(skillsBreakdown.partialMatches, 'partial')}
                                </div>

                                <div className="skill-category">
                                    <h4>Missing Skills ({skillsBreakdown.missingMatches?.length || 0})</h4>
                                    {renderSkillTags(skillsBreakdown.missingMatches, 'missing')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Personality Info Modal */}
            {showPersonalityModal && <PersonalityModal onClose={() => setShowPersonalityModal(false)} />}
        </div>
    );
}

export default ResultsPage;