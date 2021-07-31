const express = require('express');
const morgan = require('morgan');
const AppError = require('./utils/appError');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

// Middleware
app.use(morgan('dev'));
app.use(express.json());
//Servign staic files
app.use(express.static(`${__dirname}/public`));

// Middleware

app.use((req, res, next) => {
  next();
});

app.use('/api/v1/users', userRouter);

app.use('/api/v1/tours', tourRouter);

// Middleware for all undefind path on server
app.all('*', (req, res, next) => {
  //   res.status(400).json({
  //     status: 'Fail',
  //     message: `Can't find ${req.originalUrl} on the server`,
  //   });
  // if we pass anything in next() then express will assume it is error and it will skip all other middleware and go directly to error handling middleware
  next(
    new AppError(
      `Can't find ${req.originalUrl} on the server`,
      404
    )
  );
});

app.use(globalErrorHandler);

module.exports = app;
