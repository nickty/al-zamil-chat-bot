const express = require('express');
const cors = require('cors');
const { chatRouter } = require('./routes/chat');
const { customResponseRouter } = require('./routes/customResponse');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/chat', chatRouter);
app.use('/api/custom-responses', customResponseRouter);

app.use(errorHandler);

module.exports = app;