const asyncHandler = require('../utils/asyncHandler');
const orgService = require('../services/organization.service');

const getMyOrg = asyncHandler(async (req, res) => {
  const org = await orgService.getMyOrg(req.user.organizationId);
  res.json({ success: true, organization: org });
});

const updateMyOrg = asyncHandler(async (req, res) => {
  const org = await orgService.updateMyOrg(req.user.organizationId, req.body);
  res.json({ success: true, organization: org });
});

module.exports = { getMyOrg, updateMyOrg };
