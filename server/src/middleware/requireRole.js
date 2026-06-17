const ApiError = require('../utils/ApiError');

// use after auth: requireRole('admin')
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    throw ApiError.forbidden('Not allowed');
  }
  next();
};

module.exports = requireRole;
