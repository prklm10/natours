// NPM package
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
// Self-made packages

const AppError = require('./utils/appError');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

// 1) Global Middleware
// Set Seecurity HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
// Limiting requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message:
    'Too many requests from this IP, Please try again in an hour',
});

app.use('/api', limiter);

// Body Parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// Data sanitization against no sql injections
app.use(mongoSanitize());

// Data sanitize to limit xss attack

app.use(xss());

// Preventing parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'maxGroupSize',
      'difficulty',
      'ratingsAverage',
      'ratingsQuantity',
      'price',
    ],
  })
);
//Servign staic files
app.use(express.static(`${__dirname}/public`));

//  TEST Middleware

app.use((req, res, next) => {
  req.requestedTime = new Date().toISOString();
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
