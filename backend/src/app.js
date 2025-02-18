const express = require('express');
const cors = require('cors');
const chatRouter = require('./routes/chat');
const customResponseRouter = require('./routes/customResponse');
const errorHandler = require('./middleware/errorHandler');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// app.use('/api', (req, res) => {
//     res.json("hello");
// })


// Routes
app.use('/api/chat', chatRouter);
app.use('/api/custom-responses', customResponseRouter);


// Error handling middleware
app.use(errorHandler);

module.exports = app;