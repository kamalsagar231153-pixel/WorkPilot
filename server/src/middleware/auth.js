const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');

// Reads the Bearer token and pulls org + role straight off the signed payload.
// We never read organizationId/role from the body or query - that's the whole
// point of signing them into the token.
module.exports = function auth(req, res, next) {
  const header = req.headers.authorization || '';

  if (!header.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Missing token');
  }

  try {
    const decoded = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    req.user = {
      userId: decoded.userId,
      organizationId: decoded.organizationId,
      role: decoded.role,
    };
    next();
  } catch {
    throw ApiError.unauthorized('Invalid or expired token');
  }
};
