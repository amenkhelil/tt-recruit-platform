import api from './axios';

export const profileApi = {
  getMine: async () => {
    const res = await api.get('/api/profile');
    return res.data;
  },

  updateMine: async (data) => {
    const res = await api.patch('/api/profile', data);
    return res.data;
  },

  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    const res = await api.post('/api/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
};
