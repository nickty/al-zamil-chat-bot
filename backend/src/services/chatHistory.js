const { ChatHistory } = require('../models/chatHistory');
const { getCustomResponse } = require('./customResponseService');

async function generateResponse(message) {
  const customResponse = await getCustomResponse(message);
  
  let aiResponse;
  if (customResponse) {
    aiResponse = customResponse;
  } else {
    aiResponse = "I'm sorry, I don't have a specific answer for that question. Please contact our sales team for more information.";
  }

  await ChatHistory.create({ userMessage: message, aiResponse });

  return { role: 'assistant', content: aiResponse };
}

async function getChatHistory() {
  return ChatHistory.find().sort({ timestamp: -1 }).limit(50);
}

module.exports = { generateResponse, getChatHistory };