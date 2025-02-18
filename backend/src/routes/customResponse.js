const express = require('express');
const { addCustomResponse, getAllCustomResponses, getSuggestions } = require('../services/customResponseService');

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const { category, keywords, response } = req.body;
    const newResponse = await addCustomResponse(category, keywords, response);
    res.status(201).json(newResponse);
  } catch (error) {
    if (error.message.includes('keywords already exist')) {
      res.status(400).json({ error: error.message });
    } else {
      next(error);
    }
  }
});

router.get('/', async (req, res, next) => {
  try {
    const responses = await getAllCustomResponses();
    res.json(responses);
  } catch (error) {
    next(error);
  }
});

router.get('/suggestions', async (req, res, next) => {
  try {
    const { input } = req.query;
    const suggestions = await getSuggestions(input);
    res.json(suggestions);
  } catch (error) {
    next(error);
  }
});

module.exports = router;