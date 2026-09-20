import { create } from 'zustand';
import { User, Appointment, Notification, Wallet, Transaction, Payment, Provider, Service, Promotion, Advertisement, PremiumSubscription, AuditLog } from '../types';
import * as mockData from '../data/mockData';

interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  switchRole: (role: User['role']) => void;
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
  
  addAppointment: (apt: Appointment) => void;
  updateAppointmentStatus: (id: string, status: Appointment['status']) => void;
  addTransaction: (tx: Transaction) => void;
  addPayment: (payment: Payment) => void;
  updateWalletBalance: (walletId: string, newBalance: number) => void;
  markNotificationRead: (id: string) => void;
  addAuditLog: (log: AuditLog) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  currentUser: null,
  isAuthenticated: false,
  login: (email: string, _password: string) => {
    const user = mockData.users.find(u => u.email === email);
    if (user) {
      set({ currentUser: user, isAuthenticated: true });
      return true;
    }
    return false;
  },
  logout: () => set({ currentUser: null, isAuthenticated: false }),
  switchRole: (role: User['role']) => {
    const user = mockData.users.find(u => u.role === role);
    if (user) {
      set({ currentUser: user, isAuthenticated: true });
    }
  },
}));

export const useDataStore = create<DataState>((set) => ({
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
