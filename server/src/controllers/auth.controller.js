const asyncHandler = require('../utils/asyncHandler');
const authService = require('../services/auth.service');

const register = asyncHandler(async (req, res) => {
  const { name, email, password, orgName } = req.body;
  const { token, user } = await authService.register({ name, email, password, orgName });
  res.status(201).json({ success: true, token, user });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { token, user } = await authService.login({ email, password });
  res.json({ success: true, token, user });
});

const me = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user.userId, req.user.organizationId);
  res.json({ success: true, user });
});

module.exports = { register, login, me };
