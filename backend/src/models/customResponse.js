const mongoose = require('mongoose');

const customResponseSchema = new mongoose.Schema({
  category: { type: String, required: true },
  keywords: {
    type: [String],
    required: true,
    validate: {
      validator: function(v) {
        return v.length > 0 && v.every(keyword => keyword != null && keyword !== '');
      },
      message: 'At least one non-empty keyword is required'
    }
  },
  response: { type: String, required: true },
});

// Optionally, create a compound index on category and keywords if needed
// customResponseSchema.index({ category: 1, keywords: 1 }, { unique: true });

const CustomResponse = mongoose.model('CustomResponse', customResponseSchema);

module.exports = { CustomResponse };