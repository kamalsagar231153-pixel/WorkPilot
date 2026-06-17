const Organization = require('../models/Organization');
const ApiError = require('../utils/ApiError');

// you only ever touch your own org (the one in your token). there is no
// "list all orgs" on purpose.

async function getMyOrg(organizationId) {
  const org = await Organization.findById(organizationId);
  if (!org) throw ApiError.notFound('Organization not found');
  return org;
}

async function updateMyOrg(organizationId, { name }) {
  const org = await Organization.findByIdAndUpdate(
    organizationId,
    { name },
    { new: true, runValidators: true }
  );
  if (!org) throw ApiError.notFound('Organization not found');
  return org;
}

module.exports = { getMyOrg, updateMyOrg };
