const express = require("express")
const { authMiddleware } = require("../middleware/auth")
const engineeringService = require("../services/engineeringService")
const { upload } = require("../config/multer")
const { uploadFile } = require("../services/storageService")

const router = express.Router()

router.use(authMiddleware)

router.post("/analyze", upload.single("drawing"), async (req, res, next) => {
  try {
    const { equipmentType } = req.body
    const file = req.file

    if (!file) {
      return res.status(400).json({ error: "No drawing file uploaded" })
    }

    if (!equipmentType) {
      return res.status(400).json({ error: "Equipment type is required" })
    }

    // First upload the file to Cloudinary using the existing storage service
    const uploadedFile = await uploadFile(file, req.user._id)

    // Then proceed with the analysis
    const analysis = await engineeringService.analyzeDesign(
      { ...file, storageUrl: uploadedFile.storageUrl },
      equipmentType,
      req.user._id,
    )

    res.json(analysis)
  } catch (error) {
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
    res.json(standards)
  } catch (error) {
    next(error)
  }
})

module.exports = router

