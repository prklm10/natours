const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};
const handleDuplicateErrorDB = (err) => {
  //console.log(err.keyValue.name);
  const message = `Duplicate Field Value: "${err.keyValue.name}". Please use another value`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map(
    (el) => el.message
  );
  const message = `Invalid input error: ${errors.join(
    '. '
  )}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError(
    `Invalid Token! Please login again`,
    401
  );
const handleTokenExpiredError = () =>
  new AppError(
    'Session Expired! Please login again.',
    401
  );

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};
const sendErrorProd = (err, res) => {
  //opoerational error we trust
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
    // programming or other unnown error we don't want to send to the client
  } else {
    // 1 log error

    console.error('ERROR', err);
    // 2 send error
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong',
    });
  }
};

module.exports = (err, req, res, next) => {
  console.log(err.name);
  err.statusCode = err.statusCode || 500;
  console.log(process.env.NODE_ENV);
  err.status = err.status || 'error';
  let error = { ...err };
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (
    process.env.NODE_ENV === 'production'
  ) {
    if (err.name === 'CastError')
      error = handleCastErrorDB(error);

    if (err.code === 11000)
      error = handleDuplicateErrorDB(error);

    if (err.name === 'ValidationError')
      error = handleValidationErrorDB(error);

    if (err.name === 'JsonWebTokenError')
      error = handleJWTError();

    if (err.name === 'TokenExpiredError')
      error = handleTokenExpiredError();

    sendErrorProd(error, res);
  }
};
