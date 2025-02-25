const mongoose = require("mongoose")

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
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Add index for better query performance
customResponseSchema.index({ userId: 1, keywords: 1 })

const CustomResponse = mongoose.model("CustomResponse", customResponseSchema)

module.exports = { CustomResponse }

