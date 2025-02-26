const mongoose = require("mongoose")

const attachmentSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
  },
  originalName: {
    type: String,
    required: true,
  },
  mimetype: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  storageUrl: {
    type: String,
    required: true,
  },
})

const customResponseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  keywords: [
    {
      type: String,
      required: true,
    },
  ],
  response: {
    type: String,
    required: true,
  },
  attachments: [attachmentSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

customResponseSchema.index({ userId: 1, keywords: 1 })

const CustomResponse = mongoose.model("CustomResponse", customResponseSchema)

module.exports = { CustomResponse }

