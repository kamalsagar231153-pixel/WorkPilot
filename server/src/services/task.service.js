const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

async function listTasks(organizationId, { projectId } = {}) {
  const filter = { organizationId };
  if (projectId) {
    const project = await Project.findOne({ _id: projectId, organizationId });
    if (!project) throw ApiError.notFound('Project not found');
    filter.projectId = projectId;
  }
  return Task.find(filter).sort({ createdAt: -1 });
}

async function getTask(organizationId, id) {
  const task = await Task.findOne({ _id: id, organizationId });
  if (!task) throw ApiError.notFound('Task not found');
  return task;
}

// a task can only live under a project / assignee that belongs to the same org
async function checkProject(organizationId, projectId) {
  const ok = await Project.findOne({ _id: projectId, organizationId });
  if (!ok) throw ApiError.badRequest('Project not in your organization');
}
async function checkAssignee(organizationId, assignee) {
  if (!assignee) return;
  const ok = await User.findOne({ _id: assignee, organizationId });
  if (!ok) throw ApiError.badRequest('Assignee not in your organization');
}

async function createTask(organizationId, { title, description, status, projectId, assignee }) {
  await checkProject(organizationId, projectId);
  await checkAssignee(organizationId, assignee);
  return Task.create({
    title,
    description,
    status,
    projectId,
    assignee: assignee || null,
    organizationId,
  });
}

async function updateTask(organizationId, id, data) {
  if (data.projectId) await checkProject(organizationId, data.projectId);
  if (data.assignee !== undefined) await checkAssignee(organizationId, data.assignee);

  const update = {};
  for (const k of ['title', 'description', 'status', 'projectId', 'assignee']) {
    if (data[k] !== undefined) update[k] = data[k];
  }

  const task = await Task.findOneAndUpdate({ _id: id, organizationId }, update, {
    new: true,
    runValidators: true,
  });
  if (!task) throw ApiError.notFound('Task not found');
  return task;
}

async function deleteTask(organizationId, id) {
  const task = await Task.findOneAndDelete({ _id: id, organizationId });
  if (!task) throw ApiError.notFound('Task not found');
  return task;
}

module.exports = { listTasks, getTask, createTask, updateTask, deleteTask };
