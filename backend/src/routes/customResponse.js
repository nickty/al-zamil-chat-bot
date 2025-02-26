const express = require("express")
const authMiddleware = require("../middleware/auth")
const multer = require("multer")
const {
  addCustomResponse,
  getAllCustomResponses,
  getSuggestions,
  getAttachment,
} = require("../services/customResponseService")
const { uploadFile } = require("../services/storageService")

const router = express.Router()


// Apply auth middleware to all routes
router.use(authMiddleware)

// Handle multiple files upload with custom response
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      // Images
      "image/jpeg",
      "image/png",
      "image/gif",
      // Documents
      "application/pdf",
      "application/msword", // .doc
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
      "application/vnd.ms-excel", // .xls
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "text/csv", // .csv
      "application/vnd.ms-powerpoint", // .ppt
      "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
      "text/plain", // .txt
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

router.post("/", upload.array("attachments", 5), async (req, res) => {
  try {
    console.log("Request body:", req.body)
    console.log("Files received:", req.files?.length || 0)

    const { category, keywords, response } = req.body
    const userId = req.user._id
    const files = req.files || []

    // Validate required fields
    if (!category || !keywords || !response) {
      const missingFields = []
      if (!category) missingFields.push("category")
      if (!keywords) missingFields.push("keywords")
      if (!response) missingFields.push("response")

      return res.status(400).json({
        error: `Missing required fields: ${missingFields.join(", ")}`,
      })
    }

    // Parse and validate keywords
    let parsedKeywords
    try {
      parsedKeywords = JSON.parse(keywords)
      if (!Array.isArray(parsedKeywords)) {
        throw new Error("Keywords must be an array")
      }
    } catch (e) {
      return res.status(400).json({ error: "Invalid keywords format" })
    }

    // Upload files to Cloudinary
    const attachments = []
    for (const file of files) {
      try {
        const uploadedFile = await uploadFile(file, userId)
        attachments.push(uploadedFile)
      } catch (error) {
        console.error("File upload error:", error)
        // Clean up any files that were already uploaded
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

    // Create custom response
    const newResponse = await addCustomResponse(category, parsedKeywords, response, userId, attachments)

    res.status(201).json(newResponse)
  } catch (error) {
    console.error("Error adding custom response:", error)
    res.status(400).json({ error: error.message })
  }
})

// Get attachment
router.get("/attachment/:id/:filename", async (req, res) => {
  try {
    const { id, filename } = req.params
    const userId = req.user._id

    const file = await getAttachment(id, filename, userId)
    if (!file) {
      return res.status(404).json({ error: "File not found" })
    }

    res.redirect(file.storageUrl)
  } catch (error) {
    console.error("Error getting attachment:", error)
    res.status(500).json({ error: "Failed to get attachment" })
  }
})

// Get all custom responses
router.get("/", async (req, res) => {
  try {
    const userId = req.user._id
    const responses = await getAllCustomResponses(userId)
    res.json(responses)
  } catch (error) {
    console.error("Error getting custom responses:", error)
    res.status(500).json({ error: "Failed to get custom responses" })
  }
})

// Get suggestions
router.get("/suggestions", async (req, res) => {
  try {
    const query = req.query.query || ""
    const userId = req.user._id

    console.log("Processing suggestion request:", { query, userId })

    const suggestions = await getSuggestions(query, userId)
    res.json(suggestions)
  } catch (error) {
    console.error("Error getting suggestions:", error)
    res.status(500).json({ error: "Failed to get suggestions" })
  }
})

module.exports = router

