class ErrorHander extends Error {
  constructor(statusCode, message, hint) {
    super();
    this.name = 'ErrorHandler';

    // Error.captureStackTrace(this, ErrorHandler);
    this.status = statusCode;
    this.message = message;
    this.hint = hint;
  }
}

module.exports = ErrorHander;
