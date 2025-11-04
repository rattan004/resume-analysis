import mongoose from 'mongoose';

// Define the schema for the Candidate's personality metrics
const personalityMetricSchema = new mongoose.Schema({
    candidate: { type: Number, required: true }, // Candidate's raw score (e.g., 75)
    ideal: { type: Number, required: true },     // Ideal score from JobProfile (e.g., 80)
    match: { type: Number, required: true },     // Calculated match score (e.g., 95)
}, { _id: false });

// Define the main Candidate Schema
const candidateSchema = new mongoose.Schema({
    // Link to the job profile this candidate was analyzed against
    jobId: {
        type: String,
        required: true,
        index: true, // Index for quick lookup of all candidates for a job
    },
    
    // --- Extracted Raw Data ---
    name: { type: String, required: true },
    email: { type: String },
    jobTitle: { type: String },
    summary: { type: String },
    
    // --- Calculated Scores ---
    overallMatch: { 
        type: Number, 
        required: true,
        min: 0,
        max: 100,
    },
    skillsMatch: { type: Number },
    personalityFit: { type: Number },

    // --- Stats and Breakdowns ---
    quickStats: {
        perfectSkillMatch: { type: Number, default: 0 },
        partialSkillMatch: { type: Number, default: 0 },
        missingSkills: { type: Number, default: 0 },
    },
    
    skillsBreakdown: {
        perfectMatches: [String],
        partialMatches: [String],
        missingMatches: [String],
    },

    // --- Detailed Personality Profile ---
    personalityProfile: {
        Openness: personalityMetricSchema,
        Conscientiousness: personalityMetricSchema,
        Extraversion: personalityMetricSchema,
        Agreeableness: personalityMetricSchema,
        'Emotional Stability': personalityMetricSchema, // Use quotes for keys with spaces
    },
    
    // You might add a field for the raw resume file path later, but this covers the analysis results
    
}, { timestamps: true }); // Automatically adds 'createdAt' and 'updatedAt'

// Export the model
const Candidate = mongoose.model('Candidate', candidateSchema);

export default Candidate;