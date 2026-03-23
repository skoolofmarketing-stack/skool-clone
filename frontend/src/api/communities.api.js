import api from './axios';

export const getCommunities   = ()         => api.get('/communities');
export const getCommunity     = (slug)     => api.get(`/communities/${slug}`);
export const createCommunity  = (data)     => api.post('/communities', data);
export const joinCommunity    = (id)       => api.post(`/communities/${id}/join`);
export const leaveCommunity   = (id)       => api.delete(`/communities/${id}/leave`);
export const getPosts         = (communityId) => api.get(`/posts/community/${communityId}`);
export const createPost       = (data)     => api.post('/posts', data);
export const deletePost       = (id)       => api.delete(`/posts/${id}`);
export const likePost         = (id)       => api.post(`/posts/${id}/like`);
export const getComments      = (postId)   => api.get(`/comments/post/${postId}`);
export const createComment    = (data)     => api.post('/comments', data);
export const likeComment      = (id)       => api.post(`/comments/${id}/like`);
