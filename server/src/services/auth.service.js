const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const Organization = require('../models/Organization');
const ApiError = require('../utils/ApiError');

function signToken(user) {
  return jwt.sign(
    { userId: user._id, organizationId: user.organizationId, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// signup = brand new org + its first user (the admin). wrapped in a txn so we
// can't end up with an org that has no users.
async function register({ name, email, password, orgName }) {
  if (await User.findOne({ email: email.toLowerCase() })) {
    throw ApiError.conflict('Email already exists');
  }

  const session = await mongoose.startSession();
  try {
    let created;
    await session.withTransaction(async () => {
      const [org] = await Organization.create([{ name: orgName }], { session });
      const [user] = await User.create(
        [{ name, email, password, organizationId: org._id, role: 'admin' }],
        { session }
      );
      created = user;
    });
    return { token: signToken(created), user: created };
  } finally {
    session.endSession();
  }
}

async function login({ email, password }) {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  // same message either way so we don't reveal which field was wrong
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized('Invalid credentials');
  }
  return { token: signToken(user), user };
}

async function getMe(userId, organizationId) {
  const user = await User.findOne({ _id: userId, organizationId }).populate(
    'organizationId',
    'name'
  );
  if (!user) throw ApiError.notFound('User not found');
  return user;
}

module.exports = { register, login, getMe, signToken };
