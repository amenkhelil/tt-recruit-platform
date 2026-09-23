import api from './axios';

export const applicationsApi = {
  apply: async (data) => {
    const res = await api.post('/api/applications', data);
    return res.data;
  },

  myApplications: async () => {
    const res = await api.get('/api/applications/mine');
    return res.data;
  },

  applicantsForJob: async (jobId) => {
    const res = await api.get(`/api/applications/job/${jobId}`);
    return res.data;
  },

  getById: async (id) => {
    const res = await api.get(`/api/applications/${id}`);
    return res.data;
  },

  updateStatus: async (id, status) => {
    const res = await api.patch(`/api/applications/${id}/status`, { status });
    return res.data;
  },
};
