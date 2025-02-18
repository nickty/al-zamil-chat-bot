const { CustomResponse } = require('../models/customResponse');

async function addCustomResponse(category, keywords, response) {
  // Ensure keywords is an array and remove any empty strings
  const cleanedKeywords = Array.isArray(keywords) 
    ? keywords.filter(k => k.trim() !== '')
    : [keywords].filter(k => k && k.trim() !== '');

  if (cleanedKeywords.length === 0) {
    throw new Error('At least one non-empty keyword is required');
  }

  try {
    const newResponse = new CustomResponse({ category, keywords: cleanedKeywords, response });
    await newResponse.save();
    return newResponse;
  } catch (error) {
    if (error.code === 11000) {
      // Handle duplicate key error
      throw new Error('One or more keywords already exist. Please use unique keywords.');
    }
    throw error;
  }
}

async function getCustomResponse(message) {
  const words = message.toLowerCase().split(' ');
  const customResponse = await CustomResponse.findOne({
    keywords: { $in: words }
  });
  
  return customResponse ? customResponse.response : null;
}

async function getAllCustomResponses() {
  return CustomResponse.find();
}

async function getSuggestions(partialInput) {
  const words = partialInput.toLowerCase().split(' ');
  const lastWord = words[words.length - 1];
  
  const suggestions = await CustomResponse.aggregate([
    { $unwind: "$keywords" },
    { $match: { keywords: { $regex: `^${lastWord}`, $options: 'i' } } },
    { $group: { _id: "$keywords" } },
    { $limit: 5 }
  ]);
  
  return suggestions.map(s => s._id);
}

module.exports = { addCustomResponse, getCustomResponse, getAllCustomResponses, getSuggestions };