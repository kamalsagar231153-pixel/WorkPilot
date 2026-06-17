const ApiError = require('../utils/ApiError');

const notFound = (req, res, next) =>
  next(ApiError.notFound(`No route for ${req.method} ${req.originalUrl}`));

// central error formatter - mounted last in server.js
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let status = err.statusCode || 500;
  let message = err.message || 'Server error';

  // translate the common mongoose ones into something sane
  if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors)[0]?.message || 'Validation failed';
  } else if (err.name === 'CastError') {
    status = 400;
    message = `Invalid ${err.path}`;
  } else if (err.code === 11000) {
    status = 409;
    message = `${Object.keys(err.keyValue || { field: 1 })[0]} already exists`;
  }

  if (status === 500) console.error(err);

  res.status(status).json({ success: false, message });
}

module.exports = { notFound, errorHandler };
