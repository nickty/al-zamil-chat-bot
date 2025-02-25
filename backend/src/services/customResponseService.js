const { CustomResponse } = require("../models/customResponse")

async function addCustomResponse(category, keywords, response, userId) {
  try {
    // Validate keywords array
    if (!Array.isArray(keywords) || keywords.length === 0) {
      throw new Error("Keywords must be a non-empty array")
    }

    // Clean and normalize keywords
    const cleanedKeywords = keywords.map((k) => k.trim().toLowerCase()).filter((k) => k.length > 0)

    // Remove duplicates
    const uniqueKeywords = [...new Set(cleanedKeywords)]

    const newResponse = await CustomResponse.create({
      userId,
      category: category.trim(),
      keywords: uniqueKeywords,
      response: response.trim(),
    })

    return newResponse
  } catch (error) {
    console.error("Error adding custom response:", error)
    throw error
  }
}

async function getAllCustomResponses(userId) {
  try {
    return await CustomResponse.find({ userId }).sort({ createdAt: -1 })
  } catch (error) {
    console.error("Error getting custom responses:", error)
    throw error
  }
}

async function getSuggestions(input, userId) {
  try {
    if (!input) {
      return []
    }

    const lowercaseInput = input.toLowerCase()

    // Find custom responses where any keyword matches the input
    const responses = await CustomResponse.find({
      userId,
      keywords: {
        $elemMatch: {
          $regex: new RegExp(lowercaseInput, "i"),
        },
      },
    }).limit(5)

    // Extract matching keywords from the responses
    const suggestions = responses.reduce((acc, response) => {
      const matchingKeywords = response.keywords.filter((keyword) => keyword.toLowerCase().includes(lowercaseInput))
      return [...acc, ...matchingKeywords]
    }, [])

    // Remove duplicates and limit to 5 suggestions
    return [...new Set(suggestions)].slice(0, 5)
  } catch (error) {
    console.error("Error getting suggestions:", error)
    throw error
  }
}

module.exports = {
  addCustomResponse,
  getAllCustomResponses,
  getSuggestions,
}

