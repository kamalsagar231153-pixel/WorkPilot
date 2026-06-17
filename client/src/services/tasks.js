import api from '../api/axios';

export const tasksApi = {
  list: (projectId) =>
    api
      .get('/tasks', { params: projectId ? { projectId } : {} })
      .then((r) => r.data.tasks),
  get: (id) => api.get(`/tasks/${id}`).then((r) => r.data.task),
  create: (payload) => api.post('/tasks', payload).then((r) => r.data.task),
  update: (id, payload) => api.put(`/tasks/${id}`, payload).then((r) => r.data.task),
  remove: (id) => api.delete(`/tasks/${id}`).then((r) => r.data),
};
