/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API endpoints
const authApi = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  register: (userData: any) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
};

export const studentApi = {
  register: (studentData: any) => api.post('/students/register', studentData),
  getAll: (params?: any) => api.get('/students', { params }),
  getById: (id: string) => api.get(`/students/${id}`),
  update: (id: string, data: any) => api.put(`/students/${id}`, data),
  delete: (id: string) => api.delete(`/students/${id}`),
};

export const messageApi = {
  send: (messageData: any) => api.post('/messages/send', messageData),
  getConversation: (userId: string) => api.get(`/messages/conversation/${userId}`),
  getUnread: () => api.get('/messages/unread'),
  getUsers: () => api.get('/messages/users'),
  markAsRead: (messageId: string) => api.put(`/messages/read/${messageId}`),
};

export const courseApi = {
  getAll: () => api.get('/courses'),
  create: (courseData: any) => api.post('/courses', courseData),
  update: (id: string, data: any) => api.put(`/courses/${id}`, data),
  delete: (id: string) => api.delete(`/courses/${id}`),
  enroll: (studentId: string, courseId: string) => api.post('/courses/enroll', { studentId, courseId }),
};

export const analyticsApi = {
  getStudentsByCity: () => api.get('/analytics/students-by-city'),
  getHealthStatus: () => api.get('/analytics/health-status'),
  getEnrollmentStats: () => api.get('/analytics/enrollment-stats'),
  getRecentActivity: () => api.get('/analytics/recent-activity'),
};

export const healthApi = {
  create: (healthData: any) => api.post('/health/records', healthData),
  getAll: (params?: any) => api.get('/health/records', { params }),
  getByStudentId: (studentId: string) => api.get(`/health/records/${studentId}`),
  update: (studentId: string, data: any) => api.put(`/health/records/${studentId}`, data),
  delete: (studentId: string) => api.delete(`/health/records/${studentId}`),
  addVisit: (studentId: string, visitData: any) => api.post(`/health/records/${studentId}/visits`, visitData),
  getStatistics: () => api.get('/health/statistics'),
};

export const instructorApi = {
  getAll: (params?: any) => api.get('/instructors', { params }),
  getById: (id: string) => api.get(`/instructors/${id}`),
  create: (instructorData: any) => api.post('/instructors', instructorData),
  update: (id: string, data: any) => api.put(`/instructors/${id}`, data),
  delete: (id: string) => api.delete(`/instructors/${id}`),
  assignCourse: (instructorId: string, courseId: string) => api.post('/instructors/assign-course', { instructorId, courseId }),
  unassignCourse: (instructorId: string, courseId: string) => api.post('/instructors/unassign-course', { instructorId, courseId }),
};

export const leaveApi = {
  submit: (leaveData: any) => api.post('/leave', leaveData),
  getAll: (params?: any) => api.get('/leave', { params }),
  getById: (id: string) => api.get(`/leave/${id}`),
  update: (id: string, data: any) => api.put(`/leave/${id}`, data),
  delete: (id: string) => api.delete(`/leave/${id}`),
  review: (id: string, reviewData: any) => api.put(`/leave/${id}/review`, reviewData),
  getStatistics: () => api.get('/leave/statistics'),
};

export const departmentApi = {
  getAll: (params?: any) => api.get('/departments', { params }),
  getById: (id: string) => api.get(`/departments/${id}`),
  create: (departmentData: any) => api.post('/departments', departmentData),
  update: (id: string, data: any) => api.put(`/departments/${id}`, data),
  delete: (id: string) => api.delete(`/departments/${id}`),
  getStatistics: () => api.get('/departments/statistics'),
};

export const feedbackApi = {
  submit: (feedbackData: any) => api.post('/feedback', feedbackData),
  getAll: (params?: any) => api.get('/feedback', { params }),
  getById: (id: string) => api.get(`/feedback/${id}`),
  updateStatus: (id: string, statusData: any) => api.put(`/feedback/${id}/status`, statusData),
  respond: (id: string, responseData: any) => api.post(`/feedback/${id}/respond`, responseData),
  delete: (id: string) => api.delete(`/feedback/${id}`),
  getStatistics: () => api.get('/feedback/statistics'),
};

export const mealScheduleApi = {
  getAll: (params?: any) => api.get('/meal-schedule', { params }),
  getById: (id: string) => api.get(`/meal-schedule/${id}`),
  create: (scheduleData: any) => api.post('/meal-schedule', scheduleData),
  update: (id: string, data: any) => api.put(`/meal-schedule/${id}`, data),
  delete: (id: string) => api.delete(`/meal-schedule/${id}`),
  getStatistics: () => api.get('/meal-schedule/statistics'),
};

export const mealFeedbackApi = {
  submit: (feedbackData: any) => api.post('/meal-feedback', feedbackData),
  getAll: (params?: any) => api.get('/meal-feedback', { params }),
  getMyFeedback: (params?: any) => api.get('/meal-feedback/my-feedback', { params }),
  update: (id: string, data: any) => api.put(`/meal-feedback/${id}`, data),
  delete: (id: string) => api.delete(`/meal-feedback/${id}`),
  getStatistics: () => api.get('/meal-feedback/statistics'),
};

export const graduationGalleryApi = {
  getAll: (params?: any) => api.get('/graduation-gallery', { params }),
  getById: (id: string) => api.get(`/graduation-gallery/${id}`),
  upload: (imageData: any) => api.post('/graduation-gallery', imageData),
  update: (id: string, data: any) => api.put(`/graduation-gallery/${id}`, data),
  delete: (id: string) => api.delete(`/graduation-gallery/${id}`),
  getStatistics: () => api.get('/graduation-gallery/statistics'),
  getForAdmin: (params?: any) => api.get('/graduation-gallery/admin', { params }),
};

export const semesterApi = {
  getAll: (params?: any) => api.get('/semesters', { params }),
  getActive: () => api.get('/semesters/active'),
  getById: (id: string) => api.get(`/semesters/${id}`),
  create: (semesterData: any) => api.post('/semesters', semesterData),
  update: (id: string, data: any) => api.put(`/semesters/${id}`, data),
  delete: (id: string) => api.delete(`/semesters/${id}`),
  setActive: (id: string) => api.put(`/semesters/${id}/activate`),
  getStatistics: (id: string) => api.get(`/semesters/${id}/statistics`),
};

export const courseRegistrationApi = {
  register: (registrationData: any) => api.post('/course-registrations/register', registrationData),
  getMyRegistrations: (params?: any) => api.get('/course-registrations/my-registrations', { params }),
  dropCourse: (registrationId: string) => api.put(`/course-registrations/drop/${registrationId}`),
  getAvailableCourses: (params?: any) => api.get('/course-registrations/available-courses', { params }),
  getAll: (params?: any) => api.get('/course-registrations', { params }),
  updateStatus: (registrationId: string, statusData: any) => api.put(`/course-registrations/${registrationId}/status`, statusData),
  addGrade: (registrationId: string, gradeData: any) => api.put(`/course-registrations/${registrationId}/grade`, gradeData),
  getStatistics: (params?: any) => api.get('/course-registrations/statistics', { params }),
};