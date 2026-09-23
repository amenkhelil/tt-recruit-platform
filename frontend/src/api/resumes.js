import api from './axios';

export const resumesApi = {
  upload: async (file) => {
    const formData = new FormData();
    formData.append('resume', file);
    const res = await api.post('/api/resumes', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  list: async () => {
    const res = await api.get('/api/resumes');
    return res.data;
  },

  getById: async (id) => {
    const res = await api.get(`/api/resumes/${id}`);
    return res.data;
  },

  setPrimary: async (id) => {
    const res = await api.patch(`/api/resumes/${id}/primary`);
    return res.data;
  },

  remove: async (id) => {
    const res = await api.delete(`/api/resumes/${id}`);
    return res.data;
  },
};
