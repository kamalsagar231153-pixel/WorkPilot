// wrap async controllers so a thrown error reaches express' error handler
// instead of leaving the request hanging.
module.exports = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
