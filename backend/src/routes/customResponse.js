const express = require('express');
const { addCustomResponse, getAllCustomResponses } = require('../services/customResponseService');

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const { keyword, response } = req.body;
    const newResponse = await addCustomResponse(keyword, response);
    res.status(201).json(newResponse);
  } catch (error) {
    next(error);
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

module.exports = router;