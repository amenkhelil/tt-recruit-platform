import api from './axios';

export const authApi = {
  register: async (data) => {
    const res = await api.post('/api/auth/register', data);
    return res.data;
  },

  verifyEmail: async (data) => {
    const res = await api.post('/api/auth/verify-email', data);
    return res.data;
  },

  resendOtp: async (data) => {
    const res = await api.post('/api/auth/resend-otp', data);
    return res.data;
  },

  login: async (data) => {
    const res = await api.post('/api/auth/login', data);
    return res.data;
  },

  refresh: async () => {
    const res = await api.post('/api/auth/refresh');
    return res.data;
  },

  logout: async () => {
    const res = await api.post('/api/auth/logout');
    return res.data;
  },

  forgotPassword: async (data) => {
    const res = await api.post('/api/auth/forgot-password', data);
    return res.data;
  },

  resetPassword: async (data) => {
    const res = await api.post('/api/auth/reset-password', data);
    return res.data;
  },

  changePassword: async (data) => {
    const res = await api.post('/api/auth/change-password', data);
    return res.data;
  },

  getMe: async () => {
    const res = await api.get('/api/auth/me');
    return res.data;
  },
};
