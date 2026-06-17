const asyncHandler = require('../utils/asyncHandler');
const projectService = require('../services/project.service');

const list = asyncHandler(async (req, res) => {
  const projects = await projectService.listProjects(req.user.organizationId);
  res.json({ success: true, projects });
});

const getOne = asyncHandler(async (req, res) => {
  const project = await projectService.getProject(req.user.organizationId, req.params.id);
  res.json({ success: true, project });
});

const create = asyncHandler(async (req, res) => {
  const project = await projectService.createProject(
    req.user.organizationId,
    req.user.userId,
    req.body
  );
  res.status(201).json({ success: true, project });
});

const update = asyncHandler(async (req, res) => {
  const project = await projectService.updateProject(
    req.user.organizationId,
    req.params.id,
    req.body
  );
  res.json({ success: true, project });
});

const remove = asyncHandler(async (req, res) => {
  await projectService.deleteProject(req.user.organizationId, req.params.id);
  res.json({ success: true, message: 'Project deleted' });
});

module.exports = { list, getOne, create, update, remove };
