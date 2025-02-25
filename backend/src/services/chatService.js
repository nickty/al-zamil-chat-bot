const { ChatHistory } = require("../models/chatHistory")
const { CustomResponse } = require("../models/customResponse")

async function generateResponse(message, userId) {
  try {
    // First, check for custom responses
    const customResponses = await CustomResponse.find({ userId })
    for (const cr of customResponses) {
      if (cr.keywords.some((keyword) => message.toLowerCase().includes(keyword.toLowerCase()))) {
        const chatEntry = await ChatHistory.create({
          userId,
          userMessage: message,
          aiResponse: cr.response,
        })
        return { role: "assistant", content: cr.response }
      }
    }

    // If no custom response matches, use default response
    const defaultResponse =
      "I'm sorry, I don't have a specific answer for that question. Please contact our sales team for more information."
    await ChatHistory.create({
      userId,
      userMessage: message,
      aiResponse: defaultResponse,
    })

    return { role: "assistant", content: defaultResponse }
  } catch (error) {
    console.error("Error generating response:", error)
    throw error
  }
}

async function getChatHistory(userId) {
  return ChatHistory.find({ userId }).sort({ timestamp: -1 }).limit(50)
}

module.exports = { generateResponse, getChatHistory }

