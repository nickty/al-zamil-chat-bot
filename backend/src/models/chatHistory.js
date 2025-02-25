const mongoose = require("mongoose")

const chatHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  userMessage: { type: String, required: true },
  aiResponse: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
})

const ChatHistory = mongoose.model("ChatHistory", chatHistorySchema)

module.exports = { ChatHistory }
