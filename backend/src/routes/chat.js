const express = require('express');
const { generateResponse, getChatHistory } = require('../services/chatService');

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const { message } = req.body;
    const response = await generateResponse(message);
    res.json(response);
  } catch (error) {
    next(error);
  }
});

router.get('/history', async (req, res, next) => {
  try {
    const history = await getChatHistory();
    res.json(history);
  } catch (error) {
    next(error);
  }
});

module.exports = router;