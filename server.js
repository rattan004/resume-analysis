import express from "express"
import cors from "cors"
import path from "path"
import fs from "fs"
import rateLimit from "express-rate-limit"
import { fileURLToPath } from "url"
import dotenv from "dotenv"
import multer from "multer" 
import { spawn } from "child_process" 
import { Types } from 'mongoose'; 

// 🎯 NEW IMPORTS for MongoDB
import connectDB from './config/db.js'; 
import JobProfile from './models/JobProfile.js'; 
import Candidate from './models/Candidate.js'; 


// Import all routes
import candidatesRoutes from "./routes/candidates.js" 
import analysisRoutes from "./routes/analysis.js"
import authRoutes from "./routes/auth.js"
import contactRoutes from "./routes/contact.js" 


// Configure dotenv
dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// General rate limiting (Unchanged)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: {
    message: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
})

app.use(generalLimiter)

// CORS configuration (Unchanged)
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
)

// Body parsing middleware (Unchanged)
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Define uploads directory path and create it if it doesn't exist (Unchanged)
const uploadsDir = path.join(__dirname, "uploads")
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

app.use("/uploads", express.static(uploadsDir))

// Multer Configuration for file uploads (Unchanged)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'), false);
        }
    }
});


// --- DATA TRANSFORMATION LOGIC (Unchanged, now expecting 0-100 scale) ---
function transformData(rawData, requirements) {
    const candidateSkills = rawData.skills || [];
    const requiredSkills = requirements.REQUIRED_SKILLS || []; 
    const idealPersonality = requirements.IDEAL_PERSONALITY || {}; 
    
    // 🎯 IMPROVED DEBUGGING: Log everything in detail
    console.log('--- TRANSFORM DATA INPUTS ---');
    console.log('Required Skills:', requiredSkills);
    console.log('Ideal Personality Type:', idealPersonality.constructor.name);
    console.log('Ideal Personality Content:', idealPersonality);
    console.log('Candidate Personality:', rawData.personality);
    console.log('Candidate Skills:', candidateSkills);
    console.log('-----------------------------');

    const getSafeScore = (score) => Number.isFinite(score) ? score : 0;

    // Skills calculation
    const perfectMatches = candidateSkills.filter(skill => requiredSkills.includes(skill));
    const requiredButMissing = requiredSkills.filter(skill => !candidateSkills.includes(skill));
    const extraSkills = candidateSkills.filter(skill => !requiredSkills.includes(skill)); 
    
    const requiredCount = requiredSkills.length;
    
    const skillsMatchRaw = (requiredCount > 0) 
        ? (perfectMatches.length / requiredCount) * 100
        : 0; 
        
    const skillsMatch = Math.min(100, Math.round(skillsMatchRaw));

    let personalityFitSum = 0;
    let personalityProfile = {};

    // ✅ FIXED: Convert Mongoose Map to regular object first
    let idealPersonalityObj = {};
    
    if (idealPersonality instanceof Map) {
        // Convert Map to regular object properly
        idealPersonality.forEach((value, key) => {
            idealPersonalityObj[key] = value;
        });
        console.log('Converted Ideal Personality Object:', idealPersonalityObj);
    } else {
        idealPersonalityObj = idealPersonality;
    }

    const traits = Object.keys(idealPersonalityObj);
    const traitCount = traits.length;

    console.log('--- PERSONALITY TRAIT ANALYSIS ---');
    console.log('Traits for comparison:', traits);
    
    traits.forEach(trait => {
        let candidateScore = 0;
        let idealScore = 0;
        
        // Get candidate score
        if (rawData.personality && rawData.personality[trait] !== undefined) {
            candidateScore = getSafeScore(rawData.personality[trait]);
        }
        
        // Get ideal score from the converted object
        idealScore = getSafeScore(idealPersonalityObj[trait]);
        
        // Calculate match score (0-100 scale)
        const matchScore = 100 - Math.abs(candidateScore - idealScore);
        const finalMatchScore = Math.max(0, matchScore);
        
        personalityFitSum += finalMatchScore;
        
        personalityProfile[trait] = {
            candidate: candidateScore,
            ideal: idealScore,
            match: finalMatchScore,
        };
        
        // 🎯 CRITICAL: Log each trait comparison
        console.log(`Trait: ${trait} | Candidate: ${candidateScore} | Ideal: ${idealScore} | Match: ${finalMatchScore}`);
    });
    
    console.log('--- PERSONALITY CALCULATION ---');
    console.log('Total traits:', traitCount);
    console.log('Personality Fit Sum:', personalityFitSum);
    
    const personalityFitRaw = (traitCount > 0)
        ? (personalityFitSum / traitCount)
        : 0; 
        
    const calculatedPersonalityFit = getSafeScore(Math.round(personalityFitRaw));
    
    console.log('Calculated Personality Fit:', calculatedPersonalityFit);
    console.log('--------------------------------');
    
    const finalPersonalityFit = calculatedPersonalityFit; 
    
    const overallMatchRaw = (skillsMatch * 0.6) + (finalPersonalityFit * 0.4);
    const overallMatch = getSafeScore(Math.round(overallMatchRaw));

    return {
        name: rawData.name,
        email: rawData.email,
        jobTitle: rawData.jobTitle,
        summary: rawData.summary,
        
        overallMatch, 
        skillsMatch,
        personalityFit: finalPersonalityFit,
        
        quickStats: {
            perfectSkillMatch: perfectMatches.length,
            partialSkillMatch: extraSkills.length, 
            missingSkills: requiredButMissing.length,
        },
        skillsBreakdown: {
            perfectMatches: perfectMatches,
            partialMatches: extraSkills, 
            missingMatches: requiredButMissing,
        },
        personalityProfile,
    };
}

// -----------------------------------------------------------------------------

// --- 1. API Endpoint to analyze Job Description (JD) ---
app.post('/api/analysis/job', upload.single('jobDescription'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No job description file provided.' });
    }

    const filePath = req.file.path;
    const pythonScriptPath = path.join(__dirname, 'job_analyzer.py'); 

    const pythonProcess = spawn('python', [pythonScriptPath, filePath]);

    let pythonOutput = '';
    let pythonError = '';

    pythonProcess.stdout.on('data', (data) => {
        pythonOutput += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
        pythonError += data.toString();
    });

    pythonProcess.on('close', async (code) => { 
        // Clean up the uploaded file immediately
        fs.unlink(filePath, (err) => {
            if (err) console.error('Failed to delete uploaded JD file:', err);
        });

        if (code !== 0 || (pythonError && !pythonOutput)) {
            console.error(`JD Python script failed (Code ${code}): ${pythonError}`);
            return res.status(500).json({ 
                success: false, 
                message: 'Failed to run job analysis script.', 
                details: pythonError || 'Unknown error.'
            });
        }
        
        try {
            const jsonMatch = pythonOutput.trim().match(/({[\s\S]*})$/);
            
            if (!jsonMatch) {
                console.error('JD script output error:', pythonOutput);
                return res.status(500).json({ success: false, message: 'Invalid output from job analysis script.' });
            }
            
            const result = JSON.parse(jsonMatch[1]);

            if (!result.success) {
                return res.status(400).json({ success: false, message: result.error || 'Job analysis failed.' });
            }
            
            // 🎯 FIX: Scale the ideal personality scores from 0-1 to 0-100 
            // to match the calculation logic in transformData.
            const scaledIdealPersonality = {};
            for (const [trait, score] of Object.entries(result.data.IDEAL_PERSONALITY)) {
                // Ensure it's treated as a number and cap at 100
                scaledIdealPersonality[trait] = Math.min(100, Math.round(Number(score) * 100));
            }


            // 🎯 DEBUGGING LOG: Check the extracted profile before saving
            console.log('--- JOB ANALYSIS OUTPUT (Scaled) ---');
            console.log('Scaled IDEAL_PERSONALITY:', scaledIdealPersonality);
            console.log('------------------------------------');


            // SAVE THE IDEAL PROFILE TO MONGODB ATLAS
            // Use a standard ObjectId as the jobId, or generate a unique string
            const jobId = new Types.ObjectId().toString(); 
            
            const jobProfileData = {
                jobId: jobId,
                REQUIRED_SKILLS: result.data.REQUIRED_SKILLS,
                IDEAL_PERSONALITY: scaledIdealPersonality, // Use the scaled data
                jobTitle: result.data.jobTitle || 'Extracted Job Description' 
            };

            const savedProfile = await JobProfile.create(jobProfileData);

            // Send back the ID and the extracted data
            res.json({ 
                success: true, 
                jobId: savedProfile.jobId, // Use the ID from the saved document
                jobProfile: {
                    REQUIRED_SKILLS: savedProfile.REQUIRED_SKILLS,
                    IDEAL_PERSONALITY: savedProfile.IDEAL_PERSONALITY
                }
            });

        } catch (e) {
            console.error('Processing JD failed:', e);
            res.status(500).json({ success: false, message: 'Internal error during JD data processing or database save.' });
        }
    });
});


// GET route for Job Profile details (Unchanged)
app.get("/api/analysis/job/:jobId", async (req, res) => {
    try {
        const jobId = req.params.jobId;
        const jobProfileDoc = await JobProfile.findOne({ jobId: jobId });

        if (!jobProfileDoc) {
            return res.status(404).json({ success: false, message: 'Job profile not found or expired.' });
        }

        res.json({
            success: true,
            jobProfile: {
                jobId: jobProfileDoc.jobId,
                jobTitle: jobProfileDoc.jobTitle,
                REQUIRED_SKILLS: jobProfileDoc.REQUIRED_SKILLS,
                IDEAL_PERSONALITY: jobProfileDoc.IDEAL_PERSONALITY
            }
        });

    } catch (e) {
        console.error('Failed to retrieve job profile:', e);
        res.status(500).json({ success: false, message: 'Internal error during database retrieval.' });
    }
});

// GET route for retrieving ALL analysis results (Unchanged)
app.get("/api/analysis/results/:analysisId", async (req, res) => {
    try {
        const jobId = req.params.analysisId; // analysisId is the jobId

        // Find all candidates associated with this Job ID
        const candidates = await Candidate.find({ jobId: jobId }).lean();

        if (candidates.length === 0) {
            return res.status(404).json({ success: false, message: 'No results found for this analysis ID.' });
        }

        // Format for frontend: includes the MongoDB _id as the unique identifier
        const formattedCandidates = candidates.map(c => ({
            _id: c._id.toString(), // CRITICAL: Expose the MongoDB _id
            ...c
        }));

        res.json({
            success: true,
            candidates: formattedCandidates 
        });

    } catch (e) {
        console.error('Failed to retrieve analysis results:', e);
        res.status(500).json({ success: false, message: 'Internal error retrieving analysis results.' });
    }
});


// --- 2. API Endpoint for Resume Analysis (Added scaling) ---
app.post("/api/analysis/resume", upload.single('resume'), async (req, res) => {
    const jobId = req.body.jobId; // Expecting the jobId from the frontend
    
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No resume file provided.' });
    }
    
    // 1. FETCH IDEAL PROFILE FROM MONGODB
    const jobProfileDoc = await JobProfile.findOne({ jobId: jobId });

    if (!jobProfileDoc) {
        // Clean up resume file
        fs.unlink(req.file.path, (err) => {
             if (err) console.error('Failed to delete uploaded resume file:', err);
        });
        return res.status(400).json({ success: false, message: 'Job requirements not found or expired. Please upload the Job Description first.' });
    }

    // NOTE: jobRequirements.IDEAL_PERSONALITY is now guaranteed to be 0-100 scale from the JD upload.
    const jobRequirements = {
        REQUIRED_SKILLS: jobProfileDoc.REQUIRED_SKILLS,
        IDEAL_PERSONALITY: jobProfileDoc.IDEAL_PERSONALITY
    };

    // 🎯 DEBUGGING LOG: Check the job requirements being used for scoring
    console.log('--- RESUME ANALYSIS JOB REQUIREMENTS ---');
    console.log('Job ID:', jobId);
    console.log('IDEAL_PERSONALITY from DB (SHOULD BE 0-100):', jobRequirements.IDEAL_PERSONALITY);
    console.log('----------------------------------------');

    const filePath = req.file.path;
    const pythonScriptPath = path.join(__dirname, 'resume_analyzer.py');

    // 2. EXECUTE PYTHON SCRIPT 
    const pythonProcess = spawn('python', [pythonScriptPath, filePath]);
    
    let pythonOutput = '';
    let pythonError = '';

    pythonProcess.stdout.on('data', (data) => {
        pythonOutput += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
        pythonError += data.toString();
    });

    pythonProcess.on('close', async (code) => {
        // Clean up the uploaded file asynchronously
        fs.unlink(filePath, (err) => {
            if (err) console.error('Failed to delete uploaded file:', err);
        });

        if (code !== 0 || (pythonError && !pythonOutput)) {
            console.error(`Python script failed (Code ${code}): ${pythonError}`);
            return res.status(500).json({ 
                success: false, 
                message: 'Failed to run resume analysis script.', 
                details: pythonError || 'Unknown error. Check python installation and script dependencies.'
            });
        }
        
        try {
            const jsonMatch = pythonOutput.trim().match(/({[\s\S]*})$/);
            
            if (!jsonMatch) {
                console.error("Python output did not contain valid JSON:", pythonOutput);
                return res.status(500).json({ success: false, message: 'Invalid output from analysis script.' });
            }
            
            const pythonResult = JSON.parse(jsonMatch[1]);
            
            if (!pythonResult.success) {
                return res.status(400).json({ success: false, message: pythonResult.error || 'Analysis failed.' });
            }

            // 🎯 FIX: Scale the candidate personality scores from 0-1 to 0-100 
            // to match the calculation logic in transformData.
            const scaledCandidatePersonality = {};
            for (const [trait, score] of Object.entries(pythonResult.data.personality || {})) {
                 // Ensure it's treated as a number and cap at 100
                scaledCandidatePersonality[trait] = Math.min(100, Math.round(Number(score) * 100));
            }
            
            // Overwrite the raw 0-1 scores with the scaled 0-100 scores
            pythonResult.data.personality = scaledCandidatePersonality;


            // 🎯 DEBUGGING LOG: Check the candidate data from the python script
            console.log('--- RESUME ANALYSIS CANDIDATE DATA (Scaled) ---');
            console.log('Candidate Personality from Python:', pythonResult.data.personality);
            console.log('-----------------------------------------------');


            // 3. TRANSFORM DATA using the DYNAMIC jobRequirements
            const analyzedData = transformData(pythonResult.data, jobRequirements);

            // 4. PREPARE AND SAVE DATA TO MONGODB
            const candidateDocument = {
                jobId: jobId,
                ...analyzedData
            };
            
            // CRITICAL FIX: Save the candidate data to MongoDB
            const savedCandidate = await Candidate.create(candidateDocument);

            // 5. SEND FINAL DATA: Use the MongoDB _id as the unique candidate ID
            res.json({ 
                success: true, 
                candidateId: savedCandidate._id.toString(), 
                candidates: [{ 
                    _id: savedCandidate._id.toString(), 
                    ...analyzedData 
                }] 
            });

        } catch (e) {
            console.error('Processing failed:', e);
            res.status(500).json({ success: false, message: 'Internal error during data processing or database save.' });
        }
    });
});


// --- Use Routes ---
// Import and mount the candidatesRoutes router
app.use("/api/candidates", candidatesRoutes) 

// Use other routes
app.use("/api/auth", authRoutes)
app.use("/api/analysis", analysisRoutes) 
app.use("/api/contact", contactRoutes)



// Health check endpoint (Unchanged)
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "AI Resume Screening API is running",
    timestamp: new Date().toISOString(),
  })
})

// Error handling middleware (Unchanged)
app.use((err, req, res, next) => {
  console.error("Error:", err)
  
  if (err.message === 'Only PDF files are allowed') {
    return res.status(415).json({ message: err.message });
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ message: "File size too large (max 10MB)." });
  }
  
  res.status(500).json({
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : "Something went wrong",
  })
})

// 404 handler (Unchanged)
app.use((req, res) => {
  res.status(404).json({ message: "API endpoint not found" })
})

const PORT = process.env.PORT || 5000

// Final Step: Connect to the database, then start the server (Unchanged)
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`)
        console.log(`📊 API Health: http://localhost:${PORT}/api/health`)
        console.log(`🌐 Frontend: ${process.env.FRONTEND_URL || "http://localhost:5173"}`)
    });
}).catch(err => {
    console.error("Failed to start server due to DB connection error:", err);
});
