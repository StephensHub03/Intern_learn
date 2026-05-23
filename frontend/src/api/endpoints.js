/**
 * Centralized API endpoint functions.
 */
import api from './axios'

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register/', data),
  login: (data) => api.post('/auth/login/', data),
  logout: (refreshToken) => api.post('/auth/logout/', { refresh: refreshToken }),
  refreshToken: (refresh) => api.post('/auth/token/refresh/', { refresh }),
  me: () => api.get('/auth/me/'),
  updateMe: (data) => api.patch('/auth/me/', data),
  listUsers: (params) => api.get('/auth/users/', { params }),
  toggleUserActive: (id) => api.patch(`/auth/users/${id}/toggle-active/`),
}

// ─── Courses ─────────────────────────────────────────────────────────────────
export const coursesAPI = {
  list: () => api.get('/courses/'),
  create: (data) => api.post('/courses/', data),
  get: (id) => api.get(`/courses/${id}/`),
  update: (id, data) => api.put(`/courses/${id}/`, data),
  delete: (id) => api.delete(`/courses/${id}/`),
  enroll: (id) => api.post(`/courses/${id}/enroll/`),
  students: (id) => api.get(`/courses/${id}/students/`),
}

// ─── Sessions ────────────────────────────────────────────────────────────────
export const sessionsAPI = {
  list: () => api.get('/sessions/'),
  create: (data) => api.post('/sessions/', data),
  get: (id) => api.get(`/sessions/${id}/`),
  update: (id, data) => api.put(`/sessions/${id}/`, data),
  delete: (id) => api.delete(`/sessions/${id}/`),
}

// ─── Assignments ─────────────────────────────────────────────────────────────
export const assignmentsAPI = {
  list: () => api.get('/assignments/'),
  create: (data) => api.post('/assignments/', data),
  get: (id) => api.get(`/assignments/${id}/`),
  submit: (id, data) => api.post(`/assignments/${id}/submit/`, data),
  results: (id) => api.get(`/assignments/${id}/results/`),
  myResult: (id) => api.get(`/assignments/${id}/my-result/`),
}

// ─── Progress ────────────────────────────────────────────────────────────────
export const progressAPI = {
  list: () => api.get('/progress/'),
  get: (courseId) => api.get(`/progress/${courseId}/`),
  markSessionComplete: (sessionId) =>
    api.post(`/progress/session/${sessionId}/complete/`),
}

// ─── Certificates ────────────────────────────────────────────────────────────
export const certificatesAPI = {
  list: () => api.get('/certificates/'),
  download: (id) =>
    api.get(`/certificates/${id}/download/`, { responseType: 'blob' }),
}
