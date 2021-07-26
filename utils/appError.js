class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;

    this.status = `${statusCode}`.startsWith('4')
      ? 'fail'
      : 'error';
    this.isOperational = true; // If error occurred due to npm packages or any other programming error will not have this isOperational property;
    Error.captureStackTrace(
      this,
      this.constructor
    );
  }
}

module.exports = AppError;
