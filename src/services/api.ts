import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://electriborne.net/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle token expiration
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      
      // Show toast notification
      toast.error('Votre session a expiré. Veuillez vous reconnecter.');
      
      // Redirect to login page
      /*setTimeout(() => {
        window.location.href = '/login';
      }, 1000);*/
    }
    
    // Handle server errors
    if (error.response?.status === 500) {
      toast.error('Une erreur serveur est survenue. Veuillez réessayer plus tard.');
    }
    
    // Handle network errors
    if (error.message === 'Network Error') {
      toast.error('Problème de connexion au serveur. Vérifiez votre connexion internet.');
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email: string, password: string) => 
    api.post('/auth/login', { email, password }),
  
  register: (userData: any) => 
    api.post('/auth/register', userData),
  
  refreshToken: (refreshToken: string) => 
    api.post('/auth/refresh', { refreshToken }),
  
  logout: () => 
    api.post('/auth/logout'),
  
  getProfile: () => 
    api.get('/auth/me'),
  
  updateProfile: (profileData: any) => 
    api.put('/auth/profile', profileData),
  
  changePassword: (currentPassword: string, newPassword: string) => 
    api.put('/auth/change-password', { currentPassword, newPassword })
};

// Users API
export const usersAPI = {
  getAll: (params?: any) => 
    api.get('/users', { params }),
  
  getTechnicians: () => 
    api.get('/users/technicians'),
  
  getClients: () => 
    api.get('/users/clients'),
  
  getById: (_id: string) => 
    api.get(`/users/${_id}`),
  
  create: (userData: any) => 
    api.post('/users', userData),
  
  update: (_id: string, userData: any) => 
    api.put(`/users/${_id}`, userData),
  
  delete: (_id: string) => 
    api.delete(`/users/${_id}`),
  
  toggleStatus: (_id: string) => 
    api.patch(`/users/${_id}/toggle-status`),
  
  getStats: () => 
    api.get('/users/stats/overview'),

  getContacts: () => 
    api.get('/users/contacts'),

  updateNotificationSettings: (settings: any) => 
    api.put('/users/me/notification-settings', settings)
};

// Companies API
export const companiesAPI = {
  getAll: (params?: any) => 
    api.get('/companies', { params }),
  
  getById: (_id: string) => 
    api.get(`/companies/${_id}`),
  
  create: (companyData: any) => 
    api.post('/companies', companyData),
  
  update: (id: string, companyData: any) => 
    api.put(`/companies/${id}`, companyData),
  
  delete: (id: string) => 
    api.delete(`/companies/${id}`),
  
  toggleStatus: (id: string) => 
    api.patch(`/companies/${id}/toggle-status`),
  
  search: (query: string) => 
    api.get(`/companies/search/${query}`),
  
  getStats: () => 
    api.get('/companies/stats/overview'),
  
  updateStats: (id: string) => 
    api.patch(`/companies/${id}/update-stats`)
};

// Requests API
export const requestsAPI = {
  getAll: (params?: any) => 
    api.get('/requests', { params }),
  
  getUrgent: () => 
    api.get('/requests/urgent'),
  
  getMy: () => 
    api.get('/requests/my'),
  
  getById: (id: string) => 
    api.get(`/requests/${id}`),
  
  create: (requestData: any) => 
    api.post('/requests', requestData),
  
  update: (id: string, requestData: any) => 
    api.put(`/requests/${id}`, requestData),
  
  delete: (id: string) => 
    api.delete(`/requests/${id}`),
  
  assign: (id: string, technicianId: string) => 
    api.patch(`/requests/${id}/assign`, { technicianId }),
  
  complete: (id: string, actualDuration?: number) => 
    api.patch(`/requests/${id}/complete`, { actualDuration }),
  
  getStats: () => 
    api.get('/requests/stats/overview')
};

// Quotes API
export const quotesAPI = {
  getAll: (params?: any) => 
    api.get('/quotes', { params }),
  
  getMy: () => 
    api.get('/quotes/my'),
  
  getById: (id: string) => 
    api.get(`/quotes/${id}`),
  
  create: (quoteData: any) => 
    api.post('/quotes', quoteData),
  
  update: (id: string, quoteData: any) => 
    api.put(`/quotes/${id}`, quoteData),
  
  send: (id: string) => 
    api.post(`/quotes/${id}/send`),
  
  respond: (id: string, accepted: boolean, comments?: string) => 
    api.post(`/quotes/${id}/respond`, { accepted, comments })
};

// Payments API
export const paymentsAPI = {
  getAll: (params?: any) => 
    api.get('/payments', { params }),
  
  getMy: () => 
    api.get('/payments/my'),
  
  getById: (id: string) => 
    api.get(`/payments/${id}`),
  
  createPaymentIntent: (quoteId: string, paymentType: string, amount: number) => 
    api.post('/payments/create-payment-intent', { quoteId, paymentType, amount }),
  
  confirmPayment: (paymentIntentId: string) => 
    api.post('/payments/confirm', { paymentIntentId }),
  
  getInvoice: (id: string) => 
    api.get(`/payments/${id}/invoice`),
  
  getReceipt: (id: string) => 
    api.get(`/payments/${id}/receipt`),
  
  getStats: () => 
    api.get('/payments/stats/overview')
};

// Reports API
export const reportsAPI = {
  getAll: (params?: any) => 
    api.get('/reports', { params }),
  
  getMy: () => 
    api.get('/reports/my'),
  
  getById: (id: string) => 
    api.get(`/reports/${id}`),
  
  create: (reportData: FormData) => 
    api.post('/reports', reportData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }),
  
  update: (id: string, reportData: FormData) => 
    api.put(`/reports/${id}`, reportData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }),
  
  uploadPhotos: (id: string, formData: FormData) => 
    api.post(`/reports/${id}/photos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }),
  
  generatePDF: (id: string) => 
    api.get(`/reports/${id}/pdf`, { responseType: 'blob' }),
  
  sendToBatuta: (id: string) => 
    api.post(`/reports/${id}/send-to-batuta`),
  
  generateCertificate: (id: string) => 
    api.post(`/reports/${id}/generate-certificate`)
};

// Messages API
export const messagesAPI = {
  getConversations: () => 
    api.get('/messages/conversations'),
  
  getConversation: (id: string) => 
    api.get(`/messages/conversations/${id}`),
  
  createConversation: (conversationData: any) => 
    api.post('/messages/conversations', conversationData),
  
  getConversation: (id: string) => 
    api.get(`/messages/conversations/${id}`),
  
  sendMessage: (conversationId: string, content: string, attachments?: File[]) => {
    const formData = new FormData();
    formData.append('content', content);
    
    if (attachments && attachments.length > 0) {
      attachments.forEach(file => {
        formData.append('attachments', file);
      });
    }
    
    return api.post(`/messages/conversations/${conversationId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  markAsRead: (conversationId: string) => 
    api.patch(`/messages/conversations/${conversationId}/read`)
};

// Site Customization API
export const siteCustomizationAPI = {
  getAll: () => 
    api.get('/site-customization'),
  
  update: (customizationData: any) => 
    api.put('/site-customization', customizationData),
  
  uploadImage: (formData: FormData) => 
    api.post('/site-customization/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }),
  
  deleteImage: (publicId: string) => 
    api.delete(`/site-customization/image/${publicId}`),
  
  reset: () => 
    api.get('/site-customization/reset')
};

// Dashboard API
export const dashboardAPI = {
  getTechnicianDashboard: () => 
    api.get('/dashboard/technician'),
};

// Notifications API
export const notificationsAPI = {
  getMy: () => 
    api.get('/notifications/my'),
  markAsRead: (id: string) => 
    api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => 
    api.post('/notifications/mark-all-read'),
  delete: (id: string) => 
    api.delete(`/notifications/${id}`),
};

export default api;