import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Store the get token function - will be set by the app
let getTokenFunction = null;

// Function to set the token getter (called from App component)
export const setAuthTokenGetter = (getToken) => {
  getTokenFunction = getToken;
};

// Axios request interceptor to add auth token to requests
api.interceptors.request.use(
  async (config) => {
    // Only add token if getTokenFunction is set (user is authenticated)
    if (getTokenFunction) {
      try {
        const token = await getTokenFunction();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Error getting auth token:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

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

// WhatsApp API
export const whatsappApi = {
  sendBulkMessages: (data) => api.post('/whatsapp/send-bulk/', data),
  getRegistrantsCount: (eventId) => api.get(`/whatsapp/registrants-count/${eventId}`),
  getFieldValues: (eventId, fieldName) => api.get(`/whatsapp/field-values/${eventId}/${encodeURIComponent(fieldName)}`),
};

// Message Templates API
export const messageTemplatesApi = {
  getAll: () => api.get('/message-templates/'),
  getById: (id) => api.get(`/message-templates/${id}`),
  create: (data) => api.post('/message-templates/', data),
  update: (id, data) => api.put(`/message-templates/${id}`, data),
  delete: (id) => api.delete(`/message-templates/${id}`),
};

export default api;
