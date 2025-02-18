const { CustomResponse } = require('../models/customResponse');

async function addCustomResponse(keyword, response) {
  const newResponse = new CustomResponse({ keyword, response });
  await newResponse.save();
  return newResponse;
}

async function getCustomResponse(message) {
  const keywords = await CustomResponse.find({}, 'keyword');
  const matchingKeyword = keywords.find(k => message.toLowerCase().includes(k.keyword.toLowerCase()));
  
  if (matchingKeyword) {
    const customResponse = await CustomResponse.findOne({ keyword: matchingKeyword.keyword });
    return customResponse.response;
  }
  
  return null;
}

async function getAllCustomResponses() {
  return CustomResponse.find();
}

module.exports = { addCustomResponse, getCustomResponse, getAllCustomResponses };