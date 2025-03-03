const mongoose = require("mongoose")

const attachmentSchema = new mongoose.Schema({
  filename: String,
  originalName: String,
  mimetype: String,
  size: Number,
  storageUrl: String,
})

const engineeringAnalysisSchema = new mongoose.Schema({
  projectId: { type: String, required: true },
  equipmentType: { type: String, required: true },
  drawings: [attachmentSchema],
  analysis: {
    specifications: [String],
    materials: [
      {
        name: String,
        quantity: Number,
        unit: String,
        estimatedCost: Number,
      },
    ],
    recommendations: [String],
    compliance: {
      status: { type: String, enum: ["pass", "warning", "fail"] },
      details: [String],
      standards: {
        asme: Boolean,
        iso: Boolean,
        api: Boolean,
      },
    },
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

const EngineeringAnalysis = mongoose.model("EngineeringAnalysis", engineeringAnalysisSchema)

module.exports = { EngineeringAnalysis }

