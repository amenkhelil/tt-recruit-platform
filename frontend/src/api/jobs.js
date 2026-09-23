import api from './axios';

export const jobsApi = {
  search: async (params = {}) => {
    const res = await api.get('/api/jobs', { params });
    return res.data;
  },

  getById: async (id) => {
    const res = await api.get(`/api/jobs/${id}`);
    return res.data;
  },

  create: async (data) => {
    const res = await api.post('/api/jobs', data);
    return res.data;
  },

  update: async (id, data) => {
    const res = await api.patch(`/api/jobs/${id}`, data);
    return res.data;
  },

  remove: async (id) => {
    const res = await api.delete(`/api/jobs/${id}`);
    return res.data;
  },

  myJobs: async () => {
    const res = await api.get('/api/jobs/mine');
    return res.data;
  },

  stats: async () => {
    const res = await api.get('/api/jobs/stats');
    return res.data;
  },
};
