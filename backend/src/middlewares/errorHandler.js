const ApiError = require('../utils/ApiError');
const env = require('../config/env');

function errorHandler(err, req, res, next) {
  let error = err;

  if (err.name === 'ValidationError') {
    error = ApiError.badRequest('Validation failed', Object.values(err.errors).map((e) => e.message));
  } else if (err.name === 'CastError') {
    error = ApiError.badRequest(`Invalid value for field: ${err.path}`);
  } else if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {}).join(', ');
    error = ApiError.conflict(`Duplicate value for field(s): ${field}`);
  } else if (err.name === 'MulterError') {
    error = ApiError.badRequest(`File upload error: ${err.message}`);
  }

  if (!(error instanceof ApiError)) {
    console.error(err.stack || err.message);
    error = ApiError.internal(env.NODE_ENV === 'production' ? 'Something went wrong' : err.message);
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    ...(error.details ? { details: error.details } : {}),
  });
}

function notFoundHandler(req, res, next) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

module.exports = { errorHandler, notFoundHandler };