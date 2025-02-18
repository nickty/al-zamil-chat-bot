const mongoose = require('mongoose');

const customResponseSchema = new mongoose.Schema({
  category: { type: String, required: true, index: true },
  keywords: { type: [String], required: true, validate: v => Array.isArray(v) && v.length > 0 },
  response: { type: String, required: true },
});

// Create a compound index on keywords to ensure uniqueness across all keywords
customResponseSchema.index({ keywords: 1 }, { unique: true });

const CustomResponse = mongoose.model('CustomResponse', customResponseSchema);

module.exports = { CustomResponse };