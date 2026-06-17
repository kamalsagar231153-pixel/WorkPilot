import api from '../api/axios';

export const projectsApi = {
  list: () => api.get('/projects').then((r) => r.data.projects),
  get: (id) => api.get(`/projects/${id}`).then((r) => r.data.project),
  create: (payload) => api.post('/projects', payload).then((r) => r.data.project),
  update: (id, payload) => api.put(`/projects/${id}`, payload).then((r) => r.data.project),
  remove: (id) => api.delete(`/projects/${id}`).then((r) => r.data),
};
