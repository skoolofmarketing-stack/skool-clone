import api from './axios';

export const register      = (data) => api.post('/auth/register', data);
export const login         = (data) => api.post('/auth/login', data);
export const logout        = (refreshToken) => api.post('/auth/logout', { refreshToken });
export const getMe         = () => api.get('/users/me');
export const updateProfile = (data) => api.patch('/users/me', data);
export const uploadAvatar  = (formData) => api.post('/users/me/avatar', formData);
export const changePassword = (data) => api.patch('/users/me/password', data);
