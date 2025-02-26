const { CustomResponse } = require("../models/customResponse")
const { deleteFile } = require("./storageService")

async function addCustomResponse(category, keywords, response, userId, attachments = []) {
  try {
    if (!Array.isArray(keywords) || keywords.length === 0) {
      throw new Error("Keywords must be a non-empty array")
    }

    const cleanedKeywords = keywords.map((k) => k.trim().toLowerCase()).filter((k) => k.length > 0)
    const uniqueKeywords = [...new Set(cleanedKeywords)]

    // Check for existing keywords
    const existingResponse = await CustomResponse.findOne({
      userId,
      keywords: { $in: uniqueKeywords },
    })

    if (existingResponse) {
      const conflictingKeywords = existingResponse.keywords.filter((k) => uniqueKeywords.includes(k)).join(", ")
      throw new Error(`Keywords already exist: ${conflictingKeywords}`)
    }

    const newResponse = await CustomResponse.create({
      userId,
      category: category.trim(),
      keywords: uniqueKeywords,
      response: response.trim(),
      attachments,
    })

    return newResponse
  } catch (error) {
    console.error("Error adding custom response:", error)

    // Clean up any uploaded files if the database operation fails
    if (attachments && attachments.length > 0) {
      for (const attachment of attachments) {
        try {
          await deleteFile(attachment.filename)
        } catch (deleteError) {
          console.error("Error deleting file after failed response creation:", deleteError)
        }
      }
    }

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

async function getSuggestions(query, userId) {
  try {
    if (!query || typeof query !== "string") {
      return []
    }

    const lowercaseQuery = query.toLowerCase()

    const responses = await CustomResponse.find({
      userId,
      keywords: {
        $elemMatch: {
          $regex: new RegExp(escapeRegExp(lowercaseQuery), "i"),
        },
      },
    }).limit(5)

    const suggestions = responses.reduce((acc, response) => {
      const matchingKeywords = response.keywords.filter((keyword) => keyword.toLowerCase().includes(lowercaseQuery))
      return [...acc, ...matchingKeywords]
    }, [])

    return [...new Set(suggestions)].slice(0, 5)
  } catch (error) {
    console.error("Error getting suggestions:", error)
    throw error
  }
}

async function getAttachment(responseId, filename, userId) {
  try {
    const response = await CustomResponse.findOne({
      _id: responseId,
      userId,
      "attachments.filename": filename,
    })

    if (!response) {
      return null
    }

    return response.attachments.find((a) => a.filename === filename)
  } catch (error) {
    console.error("Error getting attachment:", error)
    throw error
  }
}

// Helper function to escape special characters in regex
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

module.exports = {
  addCustomResponse,
  getAllCustomResponses,
  getSuggestions,
  getAttachment,
}

