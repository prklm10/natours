const express = require('express');
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes');

const userRouter = require('./routes/userRoutes');

const app = express();

// Middleware
app.use(morgan('dev'));
app.use(express.json());

//Servign staic files
app.use(express.static(`${__dirname}/public`));
// Middleware

app.use('/api/v1/users', userRouter);

app.use('/api/v1/tours', tourRouter);

module.exports = app;
