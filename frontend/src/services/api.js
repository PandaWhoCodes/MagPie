import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Events API
export const eventsApi = {
  getAll: () => api.get('/events'),
  getActive: () => api.get('/events/active'),
  getById: (id) => api.get(`/events/${id}`),
  create: (data) => api.post('/events', data),
  update: (id, data) => api.patch(`/events/${id}`, data),
  toggle: (id) => api.post(`/events/${id}/toggle`),
  clone: (id, newName) => api.post(`/events/${id}/clone?new_name=${encodeURIComponent(newName)}`),
  delete: (id) => api.delete(`/events/${id}`),
  getRegistrations: (id) => api.get(`/events/${id}/registrations`),
  updateFields: (id, fields) => api.put(`/events/${id}/fields`, fields),
};

// Registrations API
export const registrationsApi = {
  create: (data) => api.post('/registrations', data),
  getById: (id) => api.get(`/registrations/${id}`),
  getProfile: (email, phone) => {
    const params = new URLSearchParams();
    if (email) params.append('email', email);
    if (phone) params.append('phone', phone);
    return api.get(`/registrations/profile/autofill?${params.toString()}`);
  },
  checkIn: (eventId, email) => api.post(`/registrations/check-in/${eventId}`, { email }),
};

// QR Codes API
export const qrCodesApi = {
  create: (data) => api.post('/qr-codes', data),
  getById: (id) => api.get(`/qr-codes/${id}`),
  getByEvent: (eventId) => api.get(`/qr-codes/event/${eventId}`),
  delete: (id) => api.delete(`/qr-codes/${id}`),
};

// Branding API
export const brandingApi = {
  get: () => api.get('/branding'),
  update: (data) => api.put('/branding', data),
};

export default api;
