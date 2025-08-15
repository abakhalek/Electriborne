import api from './api';
import axios, { AxiosError } from 'axios';

// Auth API
const authService = {
  login: async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },
  
  register: async (userData: any) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },
  
  refreshToken: async (refreshToken: string) => {
    try {
      const response = await api.post('/auth/refresh', { refreshToken });
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },
  
  logout: async () => {
    try {
      const response = await api.post('/auth/logout');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  getProfile: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data.data.user;
    } catch (error) {
      throw error;
    }
  },
  
  updateProfile: async (profileData: any) => {
    try {
      const response = await api.put('/auth/profile', profileData);
      return response.data.data.user;
    } catch (error) {
      throw error;
    }
  },
  
  changePassword: async (currentPassword: string, newPassword: string) => {
    try {
      const response = await api.put('/auth/change-password', { currentPassword, newPassword });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// Users API
const usersService = {
  getAll: async (params?: any) => {
    try {
      const response = await api.get('/users', { params });
      console.log('Raw user data from backend:', response.data.data.users);
      return { items: response.data.data.users, total: response.data.data.pagination.total };
    } catch (error) {
      throw error;
    }
  },
  
  getTechnicians: async () => {
    try {
      const response = await api.get('/users/technicians');
      return response.data.data.technicians;
    } catch (error) {
      throw error;
    }
  },
  
  getAvailableTechnicians: async (params?: any) => {
    try {
      const response = await api.get('/users/technicians/available', { params });
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },
  
  getClients: async (department?: string) => {
    try {
      const params = department ? { departement: department } : {};
      const response = await api.get('/users/clients', { params });
      return response.data.data.clients;
    } catch (error) {
      throw error;
    }
  },
  
  getById: async (id: string) => {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data.data.user;
    } catch (error) {
      throw error;
    }
  },
  
  create: async (userData: any) => {
    try {
      const response = await api.post('/users', userData);
      return response.data.data.user;
    } catch (error) {
      throw error;
    }
  },
  
  update: async (id: string, userData: any) => {
    try {
      const response = await api.put(`/users/${id}`, userData);
      return response.data.data.user;
    } catch (error) {
      throw error;
    }
  },
  
  delete: async (id: string) => {
    try {
      const response = await api.delete(`/users/${id}`);
      return response.data.success;
    } catch (error) {
      throw error;
    }
  },

  getStats: async () => {
    try {
      const response = await api.get('/users/stats/overview');
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },
  getContacts: async () => {
    try {
      const response = await api.get('/users/contacts');
      return response.data.data.users;
    } catch (error) {
      throw error;
    }
  },
  toggleStatus: async (id: string) => {
    try {
      const response = await api.patch(`/users/${id}/toggle-status`);
      return response.data.data.user;
    } catch (error) {
      throw error;
    }
  },
  updateNotificationSettings: async (settings: any) => {
    try {
      const response = await api.put('/users/me/notification-settings', settings);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }
};
// Companies API
const companiesService = {
  getAll: async (params?: any) => {
    try {
      const response = await api.get('/companies', { params });
      return { items: response.data.data.companies, total: response.data.data.pagination.total };
    } catch (error) {
      throw error;
    }
  },
  
  getById: async (id: string) => {
    try {
      const response = await api.get(`/companies/${id}`);
      return response.data.data.company;
    } catch (error) {
      throw error;
    }
  },
  
  create: async (companyData: any) => {
    try {
      const response = await api.post('/companies', companyData);
      return response.data.data.company;
    } catch (error) {
      throw error;
    }
  },
  
  update: async (id: string, companyData: any) => {
    try {
      const response = await api.put(`/companies/${id}`, companyData);
      return response.data.data.company;
    } catch (error) {
      throw error;
    }
  },
  
  delete: async (id: string) => {
    try {
      const response = await api.delete(`/companies/${id}`);
      return response.data.success;
    } catch (error) {
      throw error;
    }
  },
  
  toggleStatus: async (id: string) => {
    try {
      const response = await api.patch(`/companies/${id}/toggle-status`);
      return response.data.data.company;
    } catch (error) {
      throw error;
    }
  },
  
  search: async (query: string) => {
    try {
      const response = await api.get(`/companies/search/${query}`);
      return response.data.data.companies;
    } catch (error) {
      throw error;
    }
  },
  
  getStats: async () => {
    try {
      const response = await api.get('/companies/stats/overview');
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },
  
  updateStats: async (id: string) => {
    try {
      const response = await api.patch(`/companies/${id}/update-stats`);
      return response.data.data.company;
    } catch (error) {
      throw error;
    }
  }
};

// Requests API
const requestsService = {
   getAll: async (params?: any) => {
    try {
      const response = await api.get('/requests', { params });
      return {
        items: response.data.data.requests,
        total: response.data.data.pagination.total
      };
    } catch (error) {
      throw error;
    }
  },
  
  getUrgent: async () => {
    try {
      const response = await api.get('/requests/urgent');
      return response.data.data.requests;
    } catch (error) {
      throw error;
    }
  },
  
  getMy: async () => {
    try {
      const response = await api.get('/requests/my');
      return response.data.data.requests;
    } catch (error) {
      throw error;
    }
  },
  
  getById: async (id: string) => {
    try {
      const response = await api.get(`/requests/${id}`);
      return response.data.data.request;
    } catch (error) {
      throw error;
    }
  },
  
  create: async (requestData: FormData) => {
    try {
      const response = await api.post('/requests', requestData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data.data.request;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('Error creating request:', error.response?.data);
      } else {
        console.error('Error creating request:', error);
      }
      throw error;
    }
  },
  
  update: async (id: string, requestData: any) => {
    try {
      const response = await api.put(`/requests/${id}`, requestData);
      return response.data.data.request;
    } catch (error) {
      throw error;
    }
  },
  
  delete: async (id: string) => {
    try {
      const response = await api.delete(`/requests/${id}`);
      return response.data.success;
    } catch (error) {
      throw error;
    }
  },
  
  assign: async (id: string, technicianId: string) => {
    try {
      const response = await api.patch(`/requests/${id}/assign`, { technicianId });
      return response.data.data.request;
    } catch (error) {
      throw error;
    }
  },
  
  complete: async (id: string, actualDuration?: number) => {
    try {
      const response = await api.patch(`/requests/${id}/complete`, { actualDuration });
      return response.data.data.request;
    } catch (error) {
      throw error;
    }
  },
  
  getStats: async () => {
    try {
      const response = await api.get('/requests/stats/overview');
      console.log('Raw response data from /requests/stats/overview:', response.data);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }
};

// Quotes API
const quotesService = {
  getAll: async (params?: any) => {
    try {
      const response = await api.get('/quotes', { params });
      return { items: response.data.data.quotes, total: response.data.data.quotes.length };
    } catch (error) {
      throw error;
    }
  },
  
  getMy: async () => {
    try {
      const response = await api.get('/quotes/my');
      return response.data.data.quotes;
    } catch (error) {
      throw error;
    }
  },
  
  getById: async (id: string) => {
    try {
      const response = await api.get(`/quotes/${id}`);
      return response.data.data.quote;
    } catch (error) {
      throw error;
    }
  },
  
  create: async (quoteData: any) => {
    try {
      const response = await api.post('/quotes', quoteData);
      return response.data.data.quote;
    } catch (error) {
      throw error;
    }
  },
  
  update: async (id: string, quoteData: any) => {
    try {
      const response = await api.put(`/quotes/${id}`, quoteData);
      return response.data.data.quote;
    } catch (error) {
      throw error;
    }
  },
  
  send: async (id: string) => {
    try {
      const response = await api.post(`/quotes/${id}/send`);
      return response.data.data.quote;
    } catch (error) {
      throw error;
    }
  },
  
  respond: async (id: string, accepted: boolean, comments?: string) => {
    try {
      const response = await api.post(`/quotes/${id}/respond`, { accepted, comments });
      return response.data.data.quote;
    } catch (error) {
      throw error;
    }
  },
  delete: async (id: string) => {
    try {
      const response = await api.delete(`/quotes/${id}`);
      return response.data.success;
    } catch (error) {
      throw error;
    }
  },
  getStatsOverview: async () => {
    try {
      const response = await api.get('/quotes/stats/overview');
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },
  downloadPdf: async (id: string) => {
    try {
      const response = await api.get(`/quotes/${id}/pdf`, { responseType: 'blob' });
      return response;
    } catch (error) {
      throw error;
    }
  }
};

// Missions API
const missionsService = {
  getAll: async (params?: any) => {
    try {
      const response = await api.get('/missions', { params });
      return { items: response.data.data.missions, total: response.data.data.pagination.total };
    } catch (error) {
      throw error;
    }
  },

  getById: async (id: string) => {
    try {
      const response = await api.get(`/missions/${id}`);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  create: async (missionData: any) => {
    try {
      const response = await api.post('/missions', missionData);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  update: async (id: string, missionData: any) => {
    try {
      const response = await api.put(`/missions/${id}`, missionData);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  delete: async (id: string) => {
    try {
      const response = await api.delete(`/missions/${id}`);
      return response.data.success;
    } catch (error) {
      throw error;
    }
  },

  getStatsOverview: async () => {
    try {
      const response = await api.get('/missions/stats/overview');
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }
};

// Payments API
const paymentsService = {
  getAll: async (params?: any) => {
    try {
      const response = await api.get('/payments', { params });
      const payments = response.data.data?.payments || [];
      const total = response.data.data.pagination?.total !== undefined
                    ? response.data.data.pagination.total
                    : payments.length;
      return { items: payments, total: total };
    } catch (error) {
      throw error;
    }
  },
  
  getMy: async () => {
    try {
      const response = await api.get('/payments/my');
      return response.data.data.payments;
    } catch (error) {
      throw error;
    }
  },
  
  getById: async (id: string) => {
    try {
      const response = await api.get(`/payments/${id}`);
      return response.data.data.payment;
    } catch (error) {
      throw error;
    }
  },
  
  createPaymentIntent: async (quoteId: string, paymentType: string, amount: number) => {
    try {
      const response = await api.post('/payments/create-payment-intent', { quoteId, paymentType, amount });
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },
  
  confirmPayment: async (paymentIntentId: string) => {
    try {
      const response = await api.post('/payments/confirm', { paymentIntentId });
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },
  
  getInvoice: async (id: string) => {
    try {
      const response = await api.get(`/payments/${id}/invoice`, { responseType: 'blob' });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  getReceipt: async (id: string) => {
    try {
      const response = await api.get(`/payments/${id}/receipt`, { responseType: 'blob' });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  getStats: async () => {
    try {
      const response = await api.get('/payments/stats/overview');
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }
};

// Reports API
const reportsService = {
  getAll: async (params?: any) => {
    try {
      const response = await api.get('/reports', { params });
      const reportsArray = response.data.data?.reports || response.data.reports || response.data;
      const total = response.data.pagination?.total !== undefined
                    ? response.data.pagination.total
                    : reportsArray.length;
      return { items: reportsArray, total: total };
    } catch (error) {
      throw error;
    }
  },
  
  getMy: async () => {
    try {
      const response = await api.get('/reports/my');
      const reports = response.data.data.reports;
      return { items: reports, total: reports.length };
    } catch (error) {
      throw error;
    }
  },
  
  getById: async (id: string) => {
    try {
      const response = await api.get(`/reports/${id}`);
      return response.data.data.report;
    } catch (error) {
      throw error;
    }
  },
  
  create: async (reportData: FormData) => {
    try {
      const response = await api.post('/reports', reportData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data.data.report;
    } catch (error) {
      throw error;
    }
  },
  
  update: async (id: string, reportData: FormData) => {
    try {
      const response = await api.put(`/reports/${id}`, reportData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data.data.report;
    } catch (error) {
      throw error;
    }
  },
  delete: async (id: string) => {
    try {
      const response = await api.delete(`/reports/${id}`);
      return response.data.success;
    } catch (error) {
      throw error;
    }
  },
  
  uploadPhotos: async (id: string, photos: File[], coordinates?: any) => {
    try {
      const formData = new FormData();
      
      if (coordinates) {
        formData.append('coordinates', JSON.stringify(coordinates));
      }
      
      photos.forEach(photo => {
        formData.append('photos', photo);
      });
      
      const response = await api.post(`/reports/${id}/photos`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data.data.photos;
    } catch (error) {
      throw error;
    }
  },
  
  generatePDF: async (id: string) => {
    try {
      const response = await api.post(`/reports/${id}/generate-pdf`);
      return response.data.data.pdfUrl;
    } catch (error) {
      throw error;
    }
  },
  
  sendToClient: async (id: string) => {
    try {
      const response = await api.post(`/reports/${id}/send-to-client`);
      return response.data.success;
    } catch (error) {
      throw error;
    }
  },
  
  sendToBatuta: async (id: string) => {
    try {
      const response = await api.post(`/reports/${id}/send-to-batuta`);
      return response.data.success;
    } catch (error) {
      throw error;
    }
  },
  
  downloadPdf: async (id: string) => {
    try {
      const response = await api.get(`/reports/${id}/pdf`, { responseType: 'blob' });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  generateCertificate: async (id: string) => {
    try {
      const response = await api.post(`/reports/${id}/generate-certificate`);
      return response.data.data.certificateNumber;
    } catch (error) {
      throw error;
    }
  }
};

// Messages API
const messagesService = {
  getConversations: async () => {
    try {
      const response = await api.get('/messages/conversations');
      return response.data.data.conversations;
    } catch (error) {
      throw error;
    }
  },
  
  getConversation: async (id: string) => {
    try {
      const response = await api.get(`/messages/conversations/${id}`);
      return response.data.data.conversation;
    } catch (error) {
      throw error;
    }
  },

  getMy: async () => {
    try {
      const response = await api.get('/messages/my');
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },
  
  createConversation: async (conversationData: any) => {
    try {
      const response = await api.post('/messages/conversations', conversationData);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },
  
  sendMessage: async (conversationId: string, content: string, attachments?: File[]) => {
    try {
      const formData = new FormData();
      formData.append('content', content);
      
      if (attachments && attachments.length > 0) {
        attachments.forEach(file => {
          formData.append('attachments', file);
        });
      }
      
      const response = await api.post(`/messages/conversations/${conversationId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data.data.message;
    } catch (error) {
      throw error;
    }
  },
  
  markAsRead: async (conversationId: string) => {
    try {
      const response = await api.patch(`/messages/conversations/${conversationId}/read`);
      return response.data.success;
    } catch (error) {
      throw error;
    }
  }
};

// Site Customization API
const siteCustomizationService = {
  getAll: async () => {
    try {
      const response = await api.get('/site-customization');
      return response.data.data.customization;
    } catch (error) {
      throw error;
    }
  },
  
  update: async (customizationData: any) => {
    try {
      const response = await api.put('/site-customization', customizationData);
      return response.data.data.customization;
    } catch (error) {
      throw error;
    }
  },
  
  uploadImage: async (formData: FormData) => {
    try {
      const response = await api.post('/site-customization/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },
  
  deleteImage: async (publicId: string) => {
    try {
      const response = await api.delete(`/site-customization/image/${publicId}`);
      return response.data.success;
    } catch (error) {
      throw error;
    }
  },
  
  reset: async () => {
    try {
      const response = await api.get('/site-customization/reset');
      return response.data.data.customization;
    } catch (error) {
      throw error;
    }
  },
  
  // Services
  getServiceTypes: async (params?: any) => {
    try {
      const response = await api.get('/service-types', { params });
      return { items: response.data.data, total: response.data.data.length };
    } catch (error) {
      throw error;
    }
  },
  
  getServiceTypeById: async (id: string) => {
    try {
      const response = await api.get(`/service-types/${id}`);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  createServiceType: async (serviceTypeData: FormData) => {
    try {
      const response = await api.post('/service-types', serviceTypeData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },
  
  updateServiceType: async (id: string, serviceTypeData: FormData) => {
    try {
      const response = await api.put(`/service-types/${id}`, serviceTypeData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },
  
  deleteServiceType: async (id: string) => {
    try {
      const response = await api.delete(`/service-types/${id}`);
      return response.data.success;
    } catch (error) {
      throw error;
    }
  },
  
  // Blog Posts
  getBlogPosts: async () => {
    try {
      const response = await api.get('/site-customization/blog');
      return response.data.data.blogPosts;
    } catch (error) {
      throw error;
    }
  },
  
  getBlogPost: async (id: string) => {
    try {
      const response = await api.get(`/site-customization/blog/${id}`);
      return response.data.data.blogPost;
    } catch (error) {
      throw error;
    }
  },
  
  addBlogPost: async (postData: any) => {
    try {
      const response = await api.post('/site-customization/blog', postData);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },
  
  updateBlogPost: async (id: string, postData: any) => {
    try {
      const response = await api.put(`/site-customization/blog/${id}`, postData);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },
  
  deleteBlogPost: async (id: string) => {
    try {
      const response = await api.delete(`/site-customization/blog/${id}`);
      return response.data.success;
    } catch (error) {
      throw error;
    }
  },
  
  // Vehicle Brands
  getVehicleBrands: async () => {
    try {
      const response = await api.get('/site-customization/simulator/vehicles');
      return response.data.data.vehicleBrands;
    } catch (error) {
      throw error;
    }
  },
  
  addVehicleBrand: async (brandData: any) => {
    try {
      const response = await api.post('/site-customization/simulator/vehicles', brandData);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },
  
  updateVehicleBrand: async (id: string, brandData: any) => {
    try {
      const response = await api.put(`/site-customization/simulator/vehicles/${id}`, brandData);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },
  
  deleteVehicleBrand: async (id: string) => {
    try {
      const response = await api.delete(`/site-customization/simulator/vehicles/${id}`);
      return response.data.success;
    } catch (error) {
      throw error;
    }
  },
  
  // Simulator Savings Info
  getSimulatorSavingsInfo: async () => {
    try {
      const response = await api.get('/site-customization/simulator/savings');
      return response.data.data.savingsInfo;
    } catch (error) {
      throw error;
    }
  },
  
  addSimulatorSavingsInfo: async (savingsData: any) => {
    try {
      const response = await api.post('/site-customization/simulator/savings', savingsData);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },
  
  updateSimulatorSavingsInfo: async (id: string, savingsData: any) => {
    try {
      const response = await api.put(`/site-customization/simulator/savings/${id}`, savingsData);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },
  
  deleteSimulatorSavingsInfo: async (id: string) => {
    try {
      const response = await api.delete(`/site-customization/simulator/savings/${id}`);
      return response.data.success;
    } catch (error) {
      throw error;
    }
  }
};

// Dashboard API
const dashboardService = {
  getTechnicianDashboard: async () => {
    try {
      const response = await api.get('/dashboard/technician');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Equipments API
const equipmentsService = {
  getAll: async (params?: any) => {
    try {
      const response = await api.get('/equipments', { params });
      return { items: response.data.data.equipments, total: response.data.data.pagination.total };
    } catch (error) {
      throw error;
    }
  },
  getById: async (id: string) => {
    try {
      const response = await api.get(`/equipments/${id}`);
      return response.data.data.equipment;
    } catch (error) {
      throw error;
    }
  },
  create: async (equipmentData: any) => {
    try {
      const response = await api.post('/equipments', equipmentData);
      return response.data.data.equipment;
    } catch (error) {
      throw error;
    }
  },
  update: async (id: string, equipmentData: any) => {
    try {
      const response = await api.put(`/equipments/${id}`, equipmentData);
      return response.data.data.equipment;
    } catch (error) {
      throw error;
    }
  },
  delete: async (id: string) => {
    try {
      const response = await api.delete(`/equipments/${id}`);
      return response.data.success;
    } catch (error) {
      throw error;
    }
  },
};

// Invoices API
const invoicesService = {
  getAll: async (params?: any) => {
    try {
      const response = await api.get('/invoices', { params });
      const total = response.data.data.pagination?.total !== undefined
                    ? response.data.data.pagination.total
                    : response.data.data.invoices.length;
      return { items: response.data.data.invoices, total: total };
    } catch (error) {
      throw error;
    }
  },
  getById: async (id: string) => {
    try {
      const response = await api.get(`/invoices/${id}`);
      return response.data.data.invoice;
    } catch (error) {
      throw error;
    }
  },
  create: async (invoiceData: any) => {
    try {
      const response = await api.post('/invoices', invoiceData);
      return response.data.data.invoice;
    } catch (error) {
      throw error;
    }
  },
  update: async (id: string, invoiceData: any) => {
    try {
      const response = await api.put(`/invoices/${id}`, invoiceData);
      return response.data.data.invoice;
    } catch (error) {
      throw error;
    }
  },
  delete: async (id: string) => {
    try {
      const response = await api.delete(`/invoices/${id}`);
      return response.data.success;
    } catch (error) {
      throw error;
    }
  },
  downloadPdf: async (id: string) => {
    try {
      const response = await api.get(`/invoices/${id}/pdf`, { responseType: 'blob' });
      return response;
    } catch (error) {
      throw error;
    }
  }
};

// Products API
const productsService = {
  getAll: async (params?: any) => {
    try {
      const response = await api.get('/products', { params });
      return { items: response.data.data.products, total: response.data.data.pagination.total };
    } catch (error) {
      throw error;
    }
  },
  getById: async (id: string) => {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data.data.product;
    } catch (error) {
      throw error;
    }
  },
  create: async (productData: any) => {
    try {
      const response = await api.post('/products', productData);
      return response.data.data.product;
    } catch (error) {
      throw error;
    }
  },
  update: async (id: string, productData: any) => {
    try {
      const response = await api.put(`/products/${id}`, productData);
      return response.data.data.product;
    } catch (error) {
      throw error;
    }
  },
  delete: async (id: string) => {
    try {
      const response = await api.delete(`/products/${id}`);
      return response.data.success;
    } catch (error) {
      throw error;
    }
  },
};

// Notifications API
const notificationsService = {
  getMy: async () => {
    try {
      const response = await api.get('/notifications/my');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  markAsRead: async (id: string) => {
    try {
      const response = await api.patch(`/notifications/${id}/read`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  markAllAsRead: async () => {
    try {
      const response = await api.post('/notifications/mark-all-read');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  delete: async (id: string) => {
    try {
      const response = await api.delete(`/notifications/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

const apiService = {
  auth: authService,
  users: usersService,
  companies: companiesService,
  requests: requestsService,
  quotes: quotesService,
  payments: paymentsService,
  reports: reportsService,
  messages: messagesService,
  siteCustomization: siteCustomizationService,
  missions: missionsService,
  dashboard: dashboardService,
  equipments: equipmentsService,
  invoices: invoicesService,
  products: productsService,
  notifications: notificationsService,
};

export default apiService;