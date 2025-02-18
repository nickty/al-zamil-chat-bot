const mongoose = require('mongoose');

const customResponseSchema = new mongoose.Schema({
  keyword: { type: String, required: true, unique: true },
  response: { type: String, required: true },
});

const CustomResponse = mongoose.model('CustomResponse', customResponseSchema);

module.exports = { CustomResponse };