/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';

const API_Base_URL = 'http://localhost:3000/api';


export const api = axios.create({
  baseURL: API_Base_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


// Add auth token to the requests

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


// Handle auth Errors

api.interceptors.response.use(
  (Response) => Response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);


// API endpoints

export const authApi = {
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
