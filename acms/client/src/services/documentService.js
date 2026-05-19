import api from './api';

export const documentService = {
  getAll: (params) => api.get('/api/documents', { params }),
  getOne: (id) => api.get(`/api/documents/${id}`),
  upload: (formData, onProgress) =>
    api.post('/api/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => onProgress && onProgress(Math.round((e.loaded * 100) / e.total)),
    }),
  update: (id, data) => api.put(`/api/documents/${id}`, data),
  delete: (id) => api.delete(`/api/documents/${id}`),
};

export const categoryService = {
  getAll: () => api.get('/api/categories'),
};

export const userService = {
  getMe: () => api.get('/api/users/me'),
  updateMe: (data) => api.put('/api/users/me', data),
  changePassword: (data) => api.put('/api/users/me/password', data),
  deleteMe: () => api.delete('/api/users/me'),
};

export const adminService = {
  getStats: () => api.get('/api/admin/stats'),
  getUsers: (params) => api.get('/api/admin/users', { params }),
  updateUserStatus: (id, isActive) => api.put(`/api/admin/users/${id}/status`, { isActive }),
  deleteUser: (id) => api.delete(`/api/admin/users/${id}`),
  manageCategory: (data) => api.put('/api/admin/categories', data),
  getAuditLogs: (params) => api.get('/api/admin/audit-logs', { params }),
};
