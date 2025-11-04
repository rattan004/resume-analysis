// src/components/RankingPage.jsx
"use client"

import { useState, useEffect } from "react"
import { Link, useParams } from "react-router-dom" 
import { MapPin, Eye, BarChart3, Brain } from "lucide-react"
import api from "../services/api"
import "./RankingPage.css"

const RankingPage = () => {
    const [candidates, setCandidates] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const { analysisId } = useParams()

    useEffect(() => {
        fetchCandidates(analysisId)
    }, [analysisId])

    const fetchCandidates = async (id) => {
        if (!id) {
            setError("Invalid analysis ID (Job ID) provided.")
            setLoading(false)
            return
        }

        try {
            setLoading(true)
            setError("")

            const results = await api.getAnalysisResults(id)
            
            const rawCandidates = results.candidates || []
            
            // 🎯 DEBUG: Log the raw candidate data to see the actual property names
            console.log('Raw candidate data from API:', rawCandidates);
            
            const cleanCandidateList = rawCandidates.map(c => ({ ...c }));
            
            const rankedCandidates = cleanCandidateList
                .sort((a, b) => (b.overallMatch || 0) - (a.overallMatch || 0))
                .map((c, index) => ({ ...c, rank: index + 1 }));
            
            setCandidates(rankedCandidates) 
            
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || "Failed to load analysis results."
            setError(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    const getMatchColor = (percentage) => {
        const p = Number(percentage) || 0; 
        if (p >= 90) return "excellent"
        if (p >= 85) return "good"
        if (p >= 75) return "fair"
        return "poor"
    }

    const getRankBadgeColor = (rank) => {
        if (rank === 1) return "gold"
        if (rank === 2) return "silver"
        if (rank === 3) return "bronze"
        return "default"
    }
        
    const formatExperience = (exp) => {
        if (typeof exp === 'number') {
            const years = Math.floor(exp);
            const months = Math.round((exp - years) * 12);
            if (years === 0 && months === 0) return 'Less than 1 month';
            if (months === 0) return `${years} year${years !== 1 ? 's' : ''}`;
            return `${years}y ${months}m`;
        }
        return exp || 'N/A';
    }

    return (
        <div className="ranking-page">
            <div className="container">
                {/* Feature Cards */}
                <div className="features-section">
                    <div className="feature-card">
                        <div className="feature-icon primary"> <Eye /> </div>
                        <div className="feature-content"> <h3>Smart Analysis</h3> <p>AI-powered skill and personality matching</p> </div>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon secondary"> <BarChart3 /> </div>
                        <div className="feature-content"> <h3>Precise Ranking</h3> <p>Candidate ranking with detailed scores</p> </div>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon accent"> <Brain /> </div>
                        <div className="feature-content"> <h3>Personality Insights</h3> <p>Big Five trait analysis and matching</p> </div>
                    </div>
                </div>

                {/* Candidates Ranking Section */}
                <div className="ranking-section">
                    <div className="ranking-header">
                        <h1>Ranked Candidates for Analysis #{analysisId}</h1>
                        <p>Click on any candidate to view their detailed analysis, personality profile, and resume preview.</p>
                    </div>

                    {loading && <div className="loading-message"> <p>Loading candidates...</p> </div>}
                    {error && <div className="error-message"> <p>{error}</p> <Link to="/" className="btn btn-primary"> Return to Home </Link> </div>}
                    {!loading && !error && candidates.length === 0 && (
                        <div className="error-message"> 
                            <p>No candidates found for this analysis ID. Please check your uploads.</p> 
                            <Link to="/" className="btn btn-primary"> Return to Home </Link> 
                        </div>
                    )}

                    <div className="candidates-list">
                        {candidates.map((candidate) => {
                            const candidateIdentifier = candidate._id || candidate.id;
                            
                            // 🎯 FIX: Use the correct property names from backend
                            const skillsScore = candidate.skillsMatch || 0; // Changed from candidate.skills
                            const personalityScore = candidate.personalityFit || 0; // Changed from candidate.personality
                            const overallScore = candidate.overallMatch || 0;
                            
                            return (
                                <div key={candidateIdentifier || `no-id-${Math.random()}`} className="candidate-card">
                                    <div className="candidate-header">
                                        <div className="candidate-basic-info">
                                            <div className={`rank-badge ${getRankBadgeColor(candidate.rank)}`}>#{candidate.rank || 'N/A'}</div>
                                            <div className="candidate-avatar">
                                                <div className="avatar-circle">
                                                    {(candidate.name || 'Candidate').split(" ")
                                                        .filter((n, i) => i < 2) 
                                                        .map((n) => n[0])
                                                        .join("")}
                                                </div>
                                            </div>
                                            
                                            <div className="candidate-details">
                                                <h3>{candidate.name || 'Candidate Name N/A'}</h3>
                                                <p className="candidate-title">{candidate.jobTitle || candidate.summary || 'Job Title/Summary N/A'}</p>
                                                <p className="candidate-email">{candidate.email || 'Email N/A'}</p>
                                            </div>

                                        </div>
                                        {/* 🎯 FIX: Use the correct overall score variable */}
                                        <div className={`overall-match ${getMatchColor(overallScore)}`}>
                                            {overallScore}%
                                        </div>
                                    </div>

                                    <div className="candidate-metrics">
                                        <div className="metric">
                                            <div className="metric-icon">⭐</div>
                                            <div className="metric-info">
                                                <span className="metric-label">Skills</span>
                                                {/* 🎯 FIX: Use skillsScore instead of candidate.skills */}
                                                <span className={`metric-value ${getMatchColor(skillsScore)}`}>
                                                    {skillsScore}%
                                                </span>
                                            </div>
                                        </div>

                                        <div className="metric">
                                            <div className="metric-icon">🧠</div>
                                            <div className="metric-info">
                                                <span className="metric-label">Personality</span>
                                                {/* 🎯 FIX: Use personalityScore instead of candidate.personality */}
                                                <span className={`metric-value ${getMatchColor(personalityScore)}`}>
                                                    {personalityScore}%
                                                </span>
                                            </div>
                                        </div>

                                        <div className="metric">
                                            <div className="metric-icon">💼</div>
                                            <div className="metric-info">
                                                <span className="metric-label">Experience</span>
                                                <span className="metric-value">{formatExperience(candidate.experience)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="candidate-footer">
                                        <div className="candidate-location">
                                            <MapPin size={16} />
                                            <span>{candidate.location || 'Location N/A'}</span>
                                        </div>
                                        
                                        {candidateIdentifier ? (
                                            <Link 
                                                to={`/results?analysisId=${analysisId}&candidateId=${candidateIdentifier}`} 
                                                className="view-details-btn"
                                            >
                                                View Details →
                                            </Link>
                                        ) : (
                                            <button className="view-details-btn disabled" disabled title="Details unavailable: Missing Candidate ID in data.">
                                                View Details
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RankingPage