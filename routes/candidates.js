import express from "express"
import auth from "../middleware/auth.js"
import Candidate from "../models/Candidate.js" // 🎯 CRITICAL: Import the MongoDB Model

const router = express.Router()

// Get all candidates (from user's analyses)
// Endpoint: GET /api/candidates/
router.get("/", auth, async (req, res) => {
  try {
    // For this application structure, candidates are retrieved per job analysis ID,
    // so this endpoint remains empty/placeholder, focusing logic on the ID-specific route.
    const candidates = []
    res.json({ candidates })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get candidate details by MongoDB _id
// Endpoint: GET /api/candidates/:id
router.get("/:id", auth, async (req, res) => {
  try {
    const candidateId = req.params.id // MongoDB ID is a string, no need for Number.parseInt

    // 🎯 CRITICAL FIX: Look up the candidate by their MongoDB _id
    const candidate = await Candidate.findById(candidateId).lean()

    if (!candidate) {
      return res.status(404).json({
        message: `Candidate with ID ${candidateId} not found.`,
      })
    }

    // Return the found candidate data
    res.status(200).json({
      _id: candidate._id.toString(), // Ensure _id is present as a string
      candidateId: candidate._id.toString(), // Match frontend expectation
      ...candidate,
    })
    
  } catch (error) {
    // Handle case where ID format is invalid (e.g., shorter than 24 hex characters)
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: "Invalid candidate ID format." });
    }
    console.error("Error retrieving candidate details:", error);
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

export default router
