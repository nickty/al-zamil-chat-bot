const express = require("express")
const { authMiddleware } = require("../middleware/auth")
const engineeringService = require("../services/engineeringService")
const { upload } = require("../config/multer")
const { uploadFile } = require("../services/storageService")

const router = express.Router()

// Apply auth middleware to all routes
router.use(authMiddleware)

// Handle file upload and analysis
router.post("/analyze", upload.single("drawing"), async (req, res, next) => {
  try {
    console.log("Received engineering analysis request")

    const { equipmentType } = req.body
    const file = req.file

    if (!file) {
      console.error("No file uploaded")
      return res.status(400).json({ error: "No drawing file uploaded" })
    }

    if (!equipmentType) {
      console.error("No equipment type specified")
      return res.status(400).json({ error: "Equipment type is required" })
    }

    console.log("File received:", file.originalname, "Equipment type:", equipmentType)

    // First upload the file to storage
    const uploadedFile = await uploadFile(file, req.user._id)
    console.log("File uploaded to storage:", uploadedFile.storageUrl)

    // Then proceed with the analysis
    const analysis = await engineeringService.analyzeDesign(
      { ...file, storageUrl: uploadedFile.storageUrl },
      equipmentType,
      req.user._id,
    )

    console.log("Analysis completed, sending response")
    res.json(analysis)
  } catch (error) {
    console.error("Error in /analyze endpoint:", error)
    next(error)
  }
})

router.get("/analysis/:projectId", async (req, res, next) => {
  try {
    const analysis = await engineeringService.getAnalysis(req.params.projectId)
    if (!analysis) {
      return res.status(404).json({ error: "Analysis not found" })
    }
    res.json(analysis)
  } catch (error) {
    next(error)
  }
})

router.get("/standards/:type", async (req, res, next) => {
  try {
    const standards = await engineeringService.getStandards(req.params.type)
    if (!standards) {
      return res.status(404).json({ error: "Standards not found" })
    }
    res.json(standards)
  } catch (error) {
    next(error)
  }
})

module.exports = router

