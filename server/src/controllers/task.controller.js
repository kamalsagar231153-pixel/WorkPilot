const asyncHandler = require('../utils/asyncHandler');
const taskService = require('../services/task.service');

const list = asyncHandler(async (req, res) => {
  const tasks = await taskService.listTasks(req.user.organizationId, {
    projectId: req.query.projectId,
  });
  res.json({ success: true, tasks });
});

const getOne = asyncHandler(async (req, res) => {
  const task = await taskService.getTask(req.user.organizationId, req.params.id);
  res.json({ success: true, task });
});

const create = asyncHandler(async (req, res) => {
  const task = await taskService.createTask(req.user.organizationId, req.body);
  res.status(201).json({ success: true, task });
});

const update = asyncHandler(async (req, res) => {
  const task = await taskService.updateTask(req.user.organizationId, req.params.id, req.body);
  res.json({ success: true, task });
});

const remove = asyncHandler(async (req, res) => {
  await taskService.deleteTask(req.user.organizationId, req.params.id);
  res.json({ success: true, message: 'Task deleted' });
});

module.exports = { list, getOne, create, update, remove };
