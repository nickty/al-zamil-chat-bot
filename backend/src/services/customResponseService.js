const { CustomResponse } = require("../models/customResponse");

async function addCustomResponse(category, keywords, response) {
  if (!category || typeof category !== "string" || category.trim() === "") {
    throw new Error("Category is required and must be a non-empty string");
  }

  if (!Array.isArray(keywords) || keywords.length === 0) {
    throw new Error("Keywords must be a non-empty array");
  }

  const cleanedKeywords = keywords.filter(
    (keyword) => keyword != null && keyword !== ""
  );

  if (cleanedKeywords.length === 0) {
    throw new Error("At least one non-empty keyword is required");
  }

  if (!response || typeof response !== "string" || response.trim() === "") {
    throw new Error("Response is required and must be a non-empty string");
  }

  try {
    // Check for existing keywords
    const existingKeywords = await CustomResponse.find({
      keywords: { $in: cleanedKeywords },
    });

    if (existingKeywords.length > 0) {
      const duplicates = existingKeywords.flatMap((doc) =>
        doc.keywords.filter((k) => cleanedKeywords.includes(k))
      );
      throw new Error(
        `The following keywords already exist: ${duplicates.join(
          ", "
        )}. Please use unique keywords.`
      );
    }

    // console.log(CustomResponse.getIndexes());

    const newResponse = new CustomResponse({
      category,
      keywords: cleanedKeywords,
      response,
    });

    try {
      await newResponse.save();
      return newResponse;
    } catch (error) {
      console.error("Error saving new response:", error);
      throw error;
    }
  } catch (error) {
    if (error.name === "MongoError" && error.code === 11000) {
      throw new Error(
        "One or more keywords already exist. Please use unique keywords."
      );
    }
    throw error;
  }
}

async function getCustomResponse(message) {
  const words = message.toLowerCase().split(" ");
  const customResponse = await CustomResponse.findOne({
    keywords: { $in: words },
  });

  return customResponse ? customResponse.response : null;
}

async function getAllCustomResponses() {
  return CustomResponse.find();
}

async function getSuggestions(partialInput) {
  const words = partialInput.toLowerCase().split(" ");
  const lastWord = words[words.length - 1];

  const suggestions = await CustomResponse.aggregate([
    { $unwind: "$keywords" },
    { $match: { keywords: { $regex: `^${lastWord}`, $options: "i" } } },
    { $group: { _id: "$keywords" } },
    { $limit: 5 },
  ]);

  return suggestions.map((s) => s._id);
}

module.exports = {
  addCustomResponse,
  getCustomResponse,
  getAllCustomResponses,
  getSuggestions,
};
