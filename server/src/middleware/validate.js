const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

// runs right after the express-validator rule chain on a route
module.exports = function validate(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  throw ApiError.badRequest(errors.array()[0].msg);
};
