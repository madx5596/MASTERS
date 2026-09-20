import { create } from 'zustand';
import { User, Appointment, Notification, Wallet, Transaction, Payment, Provider, Service, Promotion, Advertisement, PremiumSubscription, AuditLog } from '../types';
import * as mockData from '../data/mockData';
import api from '../api/client';

// Check if backend is available
const API_AVAILABLE = import.meta.env.VITE_USE_API === 'true';

interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: User['role']) => void;
  checkAuth: () => Promise<void>;
}

interface DataState {
  providers: Provider[];
  services: Service[];
  appointments: Appointment[];
  wallets: Wallet[];
  transactions: Transaction[];
  payments: Payment[];
  promotions: Promotion[];
  advertisements: Advertisement[];
  premiumSubscriptions: PremiumSubscription[];
  notifications: Notification[];
  auditLogs: AuditLog[];
  isLoading: boolean;
  error: string | null;
  
  fetchData: () => Promise<void>;
  addAppointment: (apt: Appointment) => void;
  updateAppointmentStatus: (id: string, status: Appointment['status']) => void;
  addTransaction: (tx: Transaction) => void;
  addPayment: (payment: Payment) => void;
  updateWalletBalance: (walletId: string, newBalance: number) => void;
  markNotificationRead: (id: string) => void;
  addAuditLog: (log: AuditLog) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  currentUser: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email: string, password: string) => {
    if (API_AVAILABLE) {
      try {
        const response = await api.post<{ token: string; user: any }>('/api/auth/login', { email, password });
        if (response.success && response.data) {
          api.setToken(response.data.token);
          const user = {
            id: response.data.user.id,
            email: response.data.user.email,
            phone: response.data.user.phone || '',
            firstName: response.data.user.firstName,
            lastName: response.data.user.lastName,
            avatar: response.data.user.avatar || '',
            role: response.data.user.role as User['role'],
            status: 'ACTIVE' as const,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          set({ currentUser: user, isAuthenticated: true, isLoading: false });
          return true;
        }
        return false;
      } catch {
        // Fallback to mock
      }
    }

    // Mock login (development fallback)
    const user = mockData.users.find(u => u.email === email);
    if (user) {
      set({ currentUser: user, isAuthenticated: true, isLoading: false });
      return true;
    }
    return false;
  },

  logout: async () => {
    if (API_AVAILABLE) {
      try { await api.post('/api/auth/logout'); } catch {}
    }
    api.setToken(null);
    set({ currentUser: null, isAuthenticated: false });
  },

  switchRole: (role: User['role']) => {
    const user = mockData.users.find(u => u.role === role);
    if (user) {
      set({ currentUser: user, isAuthenticated: true });
    }
  },

  checkAuth: async () => {
    const token = api.getToken();
    if (token && API_AVAILABLE) {
      try {
        const response = await api.get<any>('/api/auth/me');
        if (response.success && response.data) {
          const user = {
            id: response.data.id,
            email: response.data.email,
            phone: response.data.phone || '',
            firstName: response.data.first_name || response.data.firstName,
            lastName: response.data.last_name || response.data.lastName,
            avatar: response.data.avatar || '',
            role: response.data.role as User['role'],
            status: 'ACTIVE' as const,
            createdAt: response.data.created_at || new Date().toISOString(),
            updatedAt: response.data.updated_at || new Date().toISOString(),
          };
          set({ currentUser: user, isAuthenticated: true, isLoading: false });
          return;
        }
      } catch {}
    }
    
    // Check localStorage for mock auth
    const savedUser = localStorage.getItem('demo_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        set({ currentUser: user, isAuthenticated: true, isLoading: false });
        return;
      } catch {}
    }
    
    set({ isLoading: false });
  },
}));

export const useDataStore = create<DataState>((set, get) => ({
  providers: mockData.providers,
  services: mockData.services,
  appointments: mockData.appointments,
  wallets: mockData.wallets,
  transactions: mockData.transactions,
  payments: mockData.payments,
  promotions: mockData.promotions,
  advertisements: mockData.advertisements,
  premiumSubscriptions: mockData.premiumSubscriptions,
  notifications: mockData.notifications,
  auditLogs: mockData.auditLogs,
  isLoading: false,
  error: null,

  fetchData: async () => {
    if (!API_AVAILABLE) return;
    
    set({ isLoading: true, error: null });
    try {
      const [providersRes, servicesRes, appointmentsRes, walletsRes, paymentsRes, notificationsRes] = await Promise.all([
        api.get<Provider[]>('/api/providers'),
        api.get<Service[]>('/api/services'),
        api.get<Appointment[]>('/api/appointments'),
        api.get<Wallet[]>('/api/wallets'),
        api.get<Payment[]>('/api/payments/all'),
        api.get<Notification[]>('/api/notifications'),
      ]);

      set({
        providers: providersRes.data || mockData.providers,
        services: servicesRes.data || mockData.services,
        appointments: appointmentsRes.data || mockData.appointments,
        wallets: walletsRes.data || mockData.wallets,
        payments: paymentsRes.data || mockData.payments,
        notifications: notificationsRes.data || mockData.notifications,
        isLoading: false,
      });
    } catch (error) {
      set({ error: 'Failed to fetch data', isLoading: false });
    }
  },

  addAppointment: (apt) => set(state => ({ appointments: [...state.appointments, apt] })),
  updateAppointmentStatus: (id, status) => set(state => ({
    appointments: state.appointments.map(a => a.id === id ? { ...a, status, updatedAt: new Date().toISOString() } : a)
  })),
  addTransaction: (tx) => set(state => ({ transactions: [...state.transactions, tx] })),
  addPayment: (payment) => set(state => ({ payments: [...state.payments, payment] })),
  updateWalletBalance: (walletId, newBalance) => set(state => ({
    wallets: state.wallets.map(w => w.id === walletId ? { ...w, balance: newBalance, updatedAt: new Date().toISOString() } : w)
  })),
  markNotificationRead: (id) => set(state => ({
    notifications: state.notifications.map(n => n.id === id ? { ...n, isRead: true } : n)
  })),
  addAuditLog: (log) => set(state => ({ auditLogs: [...state.auditLogs, log] })),
}));
