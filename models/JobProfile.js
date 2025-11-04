import mongoose from 'mongoose';

const jobProfileSchema = new mongoose.Schema({
    jobId: {
        type: String,
        required: true,
        unique: true,
    },
    // The structure of the extracted JD requirements
    REQUIRED_SKILLS: {
        type: [String],
        default: [],
    },
    IDEAL_PERSONALITY: {
        type: Map, // Stores key-value pairs like { trait: score }
        of: Number,
        default: {},
    },
    jobTitle: { // Optional field added for context
        type: String,
        default: 'Extracted Job Description'
    },
    // TTL Index: Document automatically deleted after 3600 seconds (1 hour)
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 3600 
    }
});

const JobProfile = mongoose.model('JobProfile', jobProfileSchema);

export default JobProfile;