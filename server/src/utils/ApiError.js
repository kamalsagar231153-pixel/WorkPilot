// small error type that carries an http status, so controllers/services can
// just throw and the errorHandler turns it into the right response.
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(m = 'Bad request') { return new ApiError(400, m); }
  static unauthorized(m = 'Unauthorized') { return new ApiError(401, m); }
  static forbidden(m = 'Forbidden') { return new ApiError(403, m); }
  static notFound(m = 'Not found') { return new ApiError(404, m); }
  static conflict(m = 'Conflict') { return new ApiError(409, m); }
}

module.exports = ApiError;
