import api from './axios';

export const getCourses        = ()         => api.get('/courses');
export const getCourse         = (slug)     => api.get(`/courses/${slug}`);
export const enrollCourse      = (id)       => api.post(`/courses/${id}/enroll`);
export const getEnrolled       = ()         => api.get('/courses/me/enrolled');
export const getLesson         = (id)       => api.get(`/lessons/${id}`);
export const completeLesson    = (id)       => api.post(`/lessons/${id}/complete`);
export const getCourseProgress = (courseId) => api.get(`/progress/course/${courseId}`);
export const getLeaderboard    = ()         => api.get('/gamification/leaderboard');
export const getMyStats        = ()         => api.get('/gamification/me/stats');
export const getMyBadges       = ()         => api.get('/gamification/me/badges');
