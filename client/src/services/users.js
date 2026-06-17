import api from '../api/axios';

export const usersApi = {
  list: () => api.get('/users').then((r) => r.data.users),
  get: (id) => api.get(`/users/${id}`).then((r) => r.data.user),
  create: (payload) => api.post('/users', payload).then((r) => r.data.user),
  update: (id, payload) => api.put(`/users/${id}`, payload).then((r) => r.data.user),
  remove: (id) => api.delete(`/users/${id}`).then((r) => r.data),
};
