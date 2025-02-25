const express = require("express")
const { generateResponse, getChatHistory } = require("../services/chatService")
const authMiddleware  = require("../middleware/auth")

const router = express.Router()

router.use(authMiddleware)

router.post("/", async (req, res, next) => {
  try {
    const { message } = req.body
    const response = await generateResponse(message, req.user._id)
    res.json(response)
  } catch (error) {
    next(error)
  }
})

router.get("/history", async (req, res, next) => {
  try {
    const history = await getChatHistory(req.user._id)
    res.json(history)
  } catch (error) {
    next(error)
  }
})

module.exports = { chatRouter: router }

