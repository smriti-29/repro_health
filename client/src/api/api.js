import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  // Register new user
  register: (userData) => api.post('/auth/register', userData),
  
  // Login user
  login: (credentials) => api.post('/auth/login', credentials),
  
  // Logout user
  logout: () => api.post('/auth/logout'),
  
  // Get current user profile
  getProfile: () => api.get('/auth/me'),
  
  // Refresh token
  refreshToken: () => api.post('/auth/refresh'),
  
  // Forgot password
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  
  // Reset password
  resetPassword: (token, newPassword) => api.post('/auth/reset-password', { token, newPassword }),
};

// Onboarding API
export const onboardingAPI = {
  // Get onboarding progress
  getProgress: () => api.get('/onboarding/progress'),
  
  // Save onboarding step
  saveStep: (stepNumber, data) => api.post(`/onboarding/step/${stepNumber}`, data),
  
  // Get onboarding step data
  getStep: (stepNumber) => api.get(`/onboarding/step/${stepNumber}`),
  
  // Complete onboarding
  complete: () => api.post('/onboarding/complete'),
  
  // Reset onboarding
  reset: () => api.post('/onboarding/reset'),
  
  // Get onboarding summary
  getSummary: () => api.get('/onboarding/summary'),
};

// Health API (for future use)
export const healthAPI = {
  // Get health logs
  getLogs: () => api.get('/health/logs'),
  
  // Create health log
  createLog: (logData) => api.post('/health/logs', logData),
  
  // Update health log
  updateLog: (logId, logData) => api.put(`/health/logs/${logId}`, logData),
  
  // Delete health log
  deleteLog: (logId) => api.delete(`/health/logs/${logId}`),
};

// Medication API (for future use)
export const medicationAPI = {
  // Get medications
  getMedications: () => api.get('/medications'),
  
  // Add medication
  addMedication: (medicationData) => api.post('/medications', medicationData),
  
  // Update medication
  updateMedication: (medicationId, medicationData) => api.put(`/medications/${medicationId}`, medicationData),
  
  // Delete medication
  deleteMedication: (medicationId) => api.delete(`/medications/${medicationId}`),
};

// Reminders API (for future use)
export const remindersAPI = {
  // Get reminders
  getReminders: () => api.get('/reminders'),
  
  // Create reminder
  createReminder: (reminderData) => api.post('/reminders', reminderData),
  
  // Update reminder
  updateReminder: (reminderId, reminderData) => api.put(`/reminders/${reminderId}`, reminderData),
  
  // Delete reminder
  deleteReminder: (reminderId) => api.delete(`/reminders/${reminderId}`),
};

// Medical Records API (for future use)
export const recordsAPI = {
  // Get medical records
  getRecords: () => api.get('/records'),
  
  // Upload medical record
  uploadRecord: (recordData) => api.post('/records', recordData),
  
  // Delete medical record
  deleteRecord: (recordId) => api.delete(`/records/${recordId}`),
};

// AI Analysis API (for future use)
export const aiAPI = {
  // Get AI insights
  getInsights: () => api.get('/ai/insights'),
  
  // Get predictions
  getPredictions: () => api.get('/ai/predictions'),
  
  // Get health recommendations
  getRecommendations: () => api.get('/ai/recommendations'),
};

export default api;
