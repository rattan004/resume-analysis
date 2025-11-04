import express from "express"
import { body, validationResult } from "express-validator"
import rateLimit from "express-rate-limit"
import Contact from '../models/Contact.js'

const router = express.Router()

// Rate limiting for contact form submissions
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 contact requests per windowMs
  message: {
    message: "Too many contact form submissions from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Submit contact form
router.post(
  "/",
  contactLimiter, // Add rate limiting
  [
    body("name").trim().isLength({ min: 2 }).withMessage("Name must be at least 2 characters"),
    body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email"),
    body("subject").trim().isLength({ min: 3 }).withMessage("Subject must be at least 3 characters"),
    body("message").trim().isLength({ min: 10 }).withMessage("Message must be at least 10 characters"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const { name, email, subject, message } = req.body

      // Create and save contact message to MongoDB
      const contactMessage = new Contact({
        fullName: name,
        email,
        subject,
        message,
        status: "new",
        priority: "low"
      })

      await contactMessage.save()

      res.status(201).json({
        message: "Message sent successfully. We will get back to you soon!",
        messageId: contactMessage._id,
        timestamp: contactMessage.createdAt
      })
    } catch (error) {
      console.error("Contact error:", error)
      
      // Handle MongoDB validation errors
      if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(err => err.message)
        return res.status(400).json({
          message: "Validation failed",
          errors: errors
        })
      }

      // Handle duplicate key errors (if any)
      if (error.code === 11000) {
        return res.status(400).json({
          message: "A message with this email already exists recently"
        })
      }

      res.status(500).json({ message: "Server error sending message" })
    }
  }
)

// Get all contact submissions (for admin)
router.get("/submissions", async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query
    
    const query = {}
    if (status && ['new', 'in-progress', 'resolved'].includes(status)) {
      query.status = status
    }

    const submissions = await Contact.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v')

    const total = await Contact.countDocuments(query)

    res.json({
      message: "Submissions retrieved successfully",
      data: {
        submissions,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total
      }
    })

  } catch (error) {
    console.error("Error fetching contact submissions:", error)
    res.status(500).json({ message: "Server error fetching submissions" })
  }
})

// Get single contact submission
router.get("/submissions/:id", async (req, res) => {
  try {
    const submission = await Contact.findById(req.params.id)
    
    if (!submission) {
      return res.status(404).json({
        message: "Contact submission not found"
      })
    }

    res.json({
      message: "Submission retrieved successfully",
      data: submission
    })

  } catch (error) {
    console.error("Error fetching contact submission:", error)
    res.status(500).json({ message: "Server error fetching submission" })
  }
})

// Update contact submission status (for admin)
router.patch("/submissions/:id", async (req, res) => {
  try {
    const { status, priority, adminNotes } = req.body
    
    const updateData = {}
    if (status) updateData.status = status
    if (priority) updateData.priority = priority
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes

    const submission = await Contact.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )

    if (!submission) {
      return res.status(404).json({
        message: "Contact submission not found"
      })
    }

    res.json({
      message: "Submission updated successfully",
      data: submission
    })

  } catch (error) {
    console.error("Error updating contact submission:", error)
    res.status(500).json({ message: "Server error updating submission" })
  }
})

// Get contact statistics (for admin dashboard)
router.get("/statistics", async (req, res) => {
  try {
    const totalSubmissions = await Contact.countDocuments()
    const newSubmissions = await Contact.countDocuments({ status: 'new' })
    const inProgressSubmissions = await Contact.countDocuments({ status: 'in-progress' })
    const resolvedSubmissions = await Contact.countDocuments({ status: 'resolved' })

    // Get submissions from last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const recentSubmissions = await Contact.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    })

    res.json({
      message: "Statistics retrieved successfully",
      data: {
        total: totalSubmissions,
        new: newSubmissions,
        inProgress: inProgressSubmissions,
        resolved: resolvedSubmissions,
        recent: recentSubmissions
      }
    })

  } catch (error) {
    console.error("Error fetching contact statistics:", error)
    res.status(500).json({ message: "Server error fetching statistics" })
  }
})

export default router