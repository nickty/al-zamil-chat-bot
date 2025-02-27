const express = require("express")
const { authMiddleware, adminMiddleware } = require("../middleware/auth")
const multer = require("multer")
const {
  addCustomResponse,
  getAllCustomResponses,
  getSuggestions,
  getAttachment,
} = require("../services/customResponseService")
const { uploadFile, deleteFile } = require("../services/storageService")

const router = express.Router()

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "text/plain",
    ]

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(
        new Error("Invalid file type. Only images, documents (PDF, Word, Excel, PowerPoint, CSV, TXT) are allowed."),
        false,
      )
    }
  },
})

// Apply auth middleware to all routes
router.use(authMiddleware)

// Get all custom responses (accessible to all authenticated users)
router.get("/", async (req, res) => {
  try {
    const responses = await getAllCustomResponses()
    res.json(responses)
  } catch (error) {
    console.error("Error getting custom responses:", error)
    res.status(500).json({ error: "Failed to get custom responses" })
  }
})

// Get suggestions (accessible to all authenticated users)
router.get("/suggestions", async (req, res) => {
  try {
    const { query } = req.query
    const suggestions = await getSuggestions(query)
    res.json(suggestions)
  } catch (error) {
    console.error("Error getting suggestions:", error)
    res.status(500).json({ error: "Failed to get suggestions" })
  }
})

// Routes that require admin privileges
router.post("/", adminMiddleware, upload.array("attachments", 5), async (req, res) => {
  try {
    const { category, keywords, response } = req.body
    const userId = req.user._id
    const files = req.files || []

    if (!category || !keywords || !response) {
      const missingFields = []
      if (!category) missingFields.push("category")
      if (!keywords) missingFields.push("keywords")
      if (!response) missingFields.push("response")

      return res.status(400).json({
        error: `Missing required fields: ${missingFields.join(", ")}`,
      })
    }

    let parsedKeywords
    try {
      parsedKeywords = JSON.parse(keywords)
      if (!Array.isArray(parsedKeywords)) {
        throw new Error("Keywords must be an array")
      }
    } catch (e) {
      return res.status(400).json({ error: "Invalid keywords format" })
    }

    const attachments = []
    for (const file of files) {
      try {
        const uploadedFile = await uploadFile(file, userId)
        attachments.push(uploadedFile)
      } catch (error) {
        console.error("File upload error:", error)
        for (const attachment of attachments) {
          try {
            await deleteFile(attachment.filename)
          } catch (deleteError) {
            console.error("Error deleting file after upload failure:", deleteError)
          }
        }
        return res.status(400).json({ error: `File upload failed: ${error.message}` })
      }
    }

    const newResponse = await addCustomResponse(category, parsedKeywords, response, userId, attachments)
    res.status(201).json(newResponse)
  } catch (error) {
    console.error("Error adding custom response:", error)
    res.status(400).json({ error: error.message })
  }
})

// Get attachment (accessible to all authenticated users)
router.get("/attachment/:id/:filename", async (req, res) => {
  try {
    const { id, filename } = req.params
    const file = await getAttachment(id, filename)
    if (!file) {
      return res.status(404).json({ error: "File not found" })
    }
    res.redirect(file.storageUrl)
  } catch (error) {
    console.error("Error getting attachment:", error)
    res.status(500).json({ error: "Failed to get attachment" })
  }
})

module.exports = router

