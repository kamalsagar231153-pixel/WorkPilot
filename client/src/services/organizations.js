import api from '../api/axios';

export const orgApi = {
  getMine: () => api.get('/organizations/me').then((r) => r.data.organization),
  updateMine: (payload) =>
    api.put('/organizations/me', payload).then((r) => r.data.organization),
};
