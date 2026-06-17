const asyncHandler = require('../utils/asyncHandler');
const userService = require('../services/user.service');

const list = asyncHandler(async (req, res) => {
  const users = await userService.listUsers(req.user.organizationId);
  res.json({ success: true, users });
});

const getOne = asyncHandler(async (req, res) => {
  const user = await userService.getUser(req.user.organizationId, req.params.id);
  res.json({ success: true, user });
});

const create = asyncHandler(async (req, res) => {
  const user = await userService.createUser(req.user.organizationId, req.body);
  res.status(201).json({ success: true, user });
});

const update = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(req.user.organizationId, req.params.id, req.body);
  res.json({ success: true, user });
});

const remove = asyncHandler(async (req, res) => {
  await userService.deleteUser(req.user.organizationId, req.params.id, req.user.userId);
  res.json({ success: true, message: 'User deleted' });
});

module.exports = { list, getOne, create, update, remove };
