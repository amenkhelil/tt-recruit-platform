import api, { getAccessToken } from './axios';

const baseURL = import.meta.env.VITE_API_URL || '';

export const filesApi = {
  getResumeDownloadUrl: (resumeId) => {
    return `${baseURL}/api/files/resumes/${resumeId}`;
  },

  downloadResumeBlob: async (resumeId) => {
    const res = await api.get(`/api/files/resumes/${resumeId}`, {
      responseType: 'blob',
    });
    return res.data;
  },

  getAvatarUrl: (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${baseURL}${path}`;
  },
};
