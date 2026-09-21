import api from './client';

export const usersApi = {
  getAll: () => api.get('/api/users'),
  getById: (id: string) => api.get(`/api/users/${id}`),
  update: (id: string, data: any) => api.patch(`/api/users/${id}`, data),
};

export const providersApi = {
  getAll: () => api.get('/api/providers'),
  getById: (id: string) => api.get(`/api/providers/${id}`),
  create: (data: any) => api.post('/api/providers', data),
  update: (id: string, data: any) => api.patch(`/api/providers/${id}`, data),
};

export const customersApi = {
  getAll: () => api.get('/api/customers'),
  getById: (id: string) => api.get(`/api/customers/${id}`),
  create: (data: any) => api.post('/api/customers', data),
};

export const servicesApi = {
  getAll: (params?: { providerId?: string; categoryId?: string; status?: string }) => {
    const query = new URLSearchParams();
    if (params?.providerId) query.set('providerId', params.providerId);
    if (params?.categoryId) query.set('categoryId', params.categoryId);
    if (params?.status) query.set('status', params.status);
    return api.get(`/api/services?${query.toString()}`);
  },
  getById: (id: string) => api.get(`/api/services/${id}`),
  create: (data: any) => api.post('/api/services', data),
  update: (id: string, data: any) => api.patch(`/api/services/${id}`, data),
  archive: (id: string) => api.delete(`/api/services/${id}`),
};

export const appointmentsApi = {
  getAll: () => api.get('/api/appointments'),
  getById: (id: string) => api.get(`/api/appointments/${id}`),
  create: (data: any) => api.post('/api/appointments', data),
  confirm: (id: string) => api.post(`/api/appointments/${id}/confirm`),
  cancel: (id: string) => api.post(`/api/appointments/${id}/cancel`),
  complete: (id: string) => api.post(`/api/appointments/${id}/complete`),
};

export const availabilityApi = {
  getSlots: (providerId: string, date: string, duration: number) =>
    api.get(`/api/availability?providerId=${providerId}&date=${date}&duration=${duration}`),
};

export const walletsApi = {
  getAll: () => api.get('/api/wallets'),
  getMy: () => api.get('/api/wallets/me'),
  getById: (id: string) => api.get(`/api/wallets/${id}`),
  getTransactions: (walletId: string) => api.get(`/api/wallets/${walletId}/transactions`),
  adjust: (walletId: string, data: { amount: number; type: 'credit' | 'debit'; description: string }) =>
    api.post(`/api/wallets/${walletId}/adjust`, data),
};

export const paymentsApi = {
  create: (data: { amount: number; purpose: string }) => api.post('/api/payments/create', data),
  getById: (id: string) => api.get(`/api/payments/${id}`),
  getMy: () => api.get('/api/payments/my'),
  getAll: () => api.get('/api/payments/all'),
  confirmMock: (id: string) => api.post(`/api/payments/mock/confirm/${id}`),
};

export const promotionsApi = {
  getAll: () => api.get('/api/promotions'),
  create: (data: any) => api.post('/api/promotions', data),
  update: (id: string, data: any) => api.patch(`/api/promotions/${id}`, data),
};

export const notificationsApi = {
  getAll: () => api.get('/api/notifications'),
  markRead: (id: string) => api.post(`/api/notifications/${id}/read`),
  markAllRead: () => api.post('/api/notifications/read-all'),
};

export const adminApi = {
  getDashboard: () => api.get('/api/admin/dashboard'),
  getSettings: () => api.get('/api/admin/settings'),
  updateSettings: (data: any) => api.patch('/api/admin/settings', data),
};

export const auditApi = {
  getAll: (limit?: number) => api.get(`/api/audit?limit=${limit || 100}`),
};
