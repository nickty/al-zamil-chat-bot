const mongoose = require("mongoose")

const attachmentSchema = new mongoose.Schema({
  filename: String,
  originalName: String,
  mimetype: String,
  size: Number,
  storageUrl: String,
})

const chatHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  userMessage: { type: String, required: true },
  aiResponse: { type: String, required: true },
  attachments: [attachmentSchema],
  timestamp: { type: Date, default: Date.now },
})

const ChatHistory = mongoose.model("ChatHistory", chatHistorySchema)

module.exports = { ChatHistory }

