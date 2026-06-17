const Project = require('../models/Project');
const Task = require('../models/Task');
const ApiError = require('../utils/ApiError');

// every query is scoped to organizationId. asking for another org's id just
// comes back empty -> 404, so we never confirm it exists.

const listProjects = (organizationId) =>
  Project.find({ organizationId }).sort({ createdAt: -1 });

async function getProject(organizationId, id) {
  const project = await Project.findOne({ _id: id, organizationId });
  if (!project) throw ApiError.notFound('Project not found');
  return project;
}

const createProject = (organizationId, userId, { name, description }) =>
  Project.create({ name, description, organizationId, createdBy: userId });

async function updateProject(organizationId, id, data) {
  const update = {};
  if (data.name !== undefined) update.name = data.name;
  if (data.description !== undefined) update.description = data.description;

  const project = await Project.findOneAndUpdate({ _id: id, organizationId }, update, {
    new: true,
    runValidators: true,
  });
  if (!project) throw ApiError.notFound('Project not found');
  return project;
}

async function deleteProject(organizationId, id) {
  const project = await Project.findOneAndDelete({ _id: id, organizationId });
  if (!project) throw ApiError.notFound('Project not found');
  await Task.deleteMany({ projectId: id, organizationId }); // clean up its tasks
  return project;
}

module.exports = { listProjects, getProject, createProject, updateProject, deleteProject };
