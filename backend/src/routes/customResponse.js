const express = require("express")
const  authMiddleware  = require("../middleware/auth")
const { addCustomResponse, getAllCustomResponses, getSuggestions } = require("../services/customResponseService")

const router = express.Router()

// Apply auth middleware to all routes
router.use(authMiddleware)

router.post("/", async (req, res) => {
  try {
    const { category, keywords, response } = req.body
    const userId = req.user._id

    if (!category || !keywords || !response) {
      return res.status(400).json({ error: "Category, keywords, and response are required" })
    }

    const newResponse = await addCustomResponse(category, keywords, response, userId)
    res.status(201).json(newResponse)
  } catch (error) {
    console.error("Error adding custom response:", error)
    res.status(400).json({ error: error.message })
  }
})

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

router.get("/suggestions", async (req, res) => {
  try {

    // Get the query parameter and ensure it's a string
    const query = req.query.query || ""
    const userId = req.user._id

    const suggestions = await getSuggestions(query, userId)
    res.json(suggestions)
  } catch (error) {
    console.error("Error getting suggestions:", error)
    res.status(500).json({ error: "Failed to get suggestions" })
  }
})

module.exports = router

