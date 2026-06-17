const User = require('../models/User');
const ApiError = require('../utils/ApiError');

const listUsers = (organizationId) =>
  User.find({ organizationId }).sort({ createdAt: -1 });

async function getUser(organizationId, id) {
  const user = await User.findOne({ _id: id, organizationId });
  if (!user) throw ApiError.notFound('User not found');
  return user;
}

async function createUser(organizationId, { name, email, password, role }) {
  if (await User.findOne({ email: email.toLowerCase() })) {
    throw ApiError.conflict('Email already exists');
  }
  // org is forced from the token - an admin can't drop a user into another org
  return User.create({
    name,
    email,
    password,
    role: role === 'admin' ? 'admin' : 'member',
    organizationId,
  });
}

async function updateUser(organizationId, id, data) {
  const update = {};
  if (data.name !== undefined) update.name = data.name;
  if (data.role !== undefined) update.role = data.role === 'admin' ? 'admin' : 'member';

  const user = await User.findOneAndUpdate({ _id: id, organizationId }, update, {
    new: true,
    runValidators: true,
  });
  if (!user) throw ApiError.notFound('User not found');
  return user;
}

async function deleteUser(organizationId, id, requesterId) {
  if (String(id) === String(requesterId)) {
    throw ApiError.badRequest("You can't delete your own account");
  }
  const user = await User.findOneAndDelete({ _id: id, organizationId });
  if (!user) throw ApiError.notFound('User not found');
  return user;
}

module.exports = { listUsers, getUser, createUser, updateUser, deleteUser };
