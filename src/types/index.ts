// ============ CORE ENTITIES ============

export type UserRole = 'SUPER_ADMIN' | 'FINANCE_ADMIN' | 'SUPPORT_ADMIN' | 'CONTENT_ADMIN' | 'ANALYST' | 'PROVIDER' | 'CUSTOMER';

export type BusinessType = 'BEAUTY' | 'AUTO' | 'BARBERSHOP' | 'REPAIR' | 'CLEANING' | 'EDUCATION' | 'OTHER';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED';

export interface User {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  avatar: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  businessType: BusinessType;
  status: 'ACTIVE' | 'INACTIVE';
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

// ============ PROVIDER / MASTER ============

export type ProviderStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED';

export interface Provider {
  id: string;
  userId: string;
  organizationId: string;
  firstName: string;
  lastName: string;
  displayName: string;
  description: string;
  avatar: string;
  specializations: string[];
  rating: number;
  reviewCount: number;
  status: ProviderStatus;
  isPremium: boolean;
  createdAt: string;
}

// ============ CUSTOMER ============

export interface Customer {
  id: string;
  userId: string;
  organizationId: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  avatar: string;
  createdAt: string;
}

// ============ SERVICE ============

export type ServiceStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

export interface Service {
  id: string;
  organizationId: string;
  providerId: string;
  name: string;
  description: string;
  price: number; // in kopecks
  duration: number; // in minutes
  status: ServiceStatus;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
  businessType: BusinessType;
}

// ============ HIERARCHICAL CATEGORY TREE ============

export type CategoryStatus = 'ACTIVE' | 'HIDDEN' | 'ARCHIVED';

export interface Category {
  id: string;
  parentId: string | null; // null = root category
  name: string;
  slug: string;
  description: string;
  icon: string;
  image: string;
  sortOrder: number;
  status: CategoryStatus;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
  
  // Computed fields (not stored in DB)
  children?: Category[];
  children_count?: number;
  services_count?: number;
  providers_count?: number;
}

export interface CategoryTreeNode {
  category: Category;
  children: CategoryTreeNode[];
  level: number;
}

// ============ APPOINTMENT ============

export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export interface Appointment {
  id: string;
  organizationId: string;
  customerId: string;
  customerName: string;
  providerId: string;
  providerName: string;
  serviceId: string;
  serviceName: string;
  startAt: string;
  endAt: string;
  status: AppointmentStatus;
  price: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// ============ SCHEDULE ============

export interface Schedule {
  id: string;
  providerId: string;
  dayOfWeek: number; // 0-6
  startTime: string;
  endTime: string;
  breakStart?: string;
  breakEnd?: string;
  isActive: boolean;
}

export interface ScheduleException {
  id: string;
  providerId: string;
  date: string;
  type: 'DAY_OFF' | 'CUSTOM_HOURS' | 'VACATION';
  startTime?: string;
  endTime?: string;
  reason?: string;
}

// ============ WALLET & PAYMENTS ============

export type WalletStatus = 'ACTIVE' | 'BLOCKED';

export interface Wallet {
  id: string;
  ownerId: string;
  ownerName: string;
  organizationId: string;
  balance: number; // in kopecks
  currency: string;
  status: WalletStatus;
  createdAt: string;
  updatedAt: string;
}

export type TransactionType = 'DEPOSIT' | 'PROMOTION' | 'ADVERTISEMENT' | 'PREMIUM' | 'REFUND' | 'BONUS' | 'ADJUSTMENT';

export interface Transaction {
  id: string;
  walletId: string;
  type: TransactionType;
  amount: number; // in kopecks
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  referenceId: string;
  paymentId?: string;
  createdBy: string;
  createdAt: string;
}

export type PaymentPurpose = 'WALLET_TOPUP' | 'PROMOTION' | 'ADVERTISEMENT' | 'PREMIUM' | 'SERVICE' | 'SUBSCRIPTION';

export type PaymentStatus = 'CREATED' | 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'CANCELED' | 'EXPIRED' | 'REFUND_PENDING' | 'REFUNDED' | 'PARTIALLY_REFUNDED';

export interface Payment {
  id: string;
  userId: string;
  userName: string;
  organizationId: string;
  purpose: PaymentPurpose;
  amount: number; // in kopecks
  currency: string;
  provider: string;
  providerPaymentId: string;
  status: PaymentStatus;
  paymentUrl: string;
  createdAt: string;
  paidAt?: string;
  expiresAt?: string;
  metadata?: Record<string, string>;
}

// ============ PROMOTION ============

export type PromotionStatus = 'DRAFT' | 'PENDING' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'REJECTED' | 'ARCHIVED';

export interface Promotion {
  id: string;
  organizationId: string;
  providerId: string;
  providerName: string;
  type: 'TOP_LISTING' | 'FEATURED' | 'DISCOUNT';
  status: PromotionStatus;
  budget: number;
  spent: number;
  startsAt: string;
  endsAt: string;
  createdAt: string;
}

// ============ ADVERTISEMENT ============

export type AdvertisementStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'REJECTED' | 'ARCHIVED';

export interface Advertisement {
  id: string;
  organizationId: string;
  providerId: string;
  providerName: string;
  title: string;
  description: string;
  status: AdvertisementStatus;
  budget: number;
  spent: number;
  startsAt: string;
  endsAt: string;
  createdAt: string;
}

// ============ PREMIUM ============

export type PremiumStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELED';

export interface PremiumSubscription {
  id: string;
  providerId: string;
  providerName: string;
  status: PremiumStatus;
  plan: string;
  price: number;
  startsAt: string;
  endsAt: string;
  createdAt: string;
}

// ============ NOTIFICATION ============

export type NotificationType =
  | 'BOOKING_CREATED' | 'BOOKING_CONFIRMED' | 'BOOKING_CANCELLED'
  | 'PAYMENT_CREATED' | 'PAYMENT_PENDING' | 'PAYMENT_SUCCEEDED' | 'PAYMENT_FAILED' | 'PAYMENT_CANCELED'
  | 'WALLET_TOPUP_SUCCEEDED' | 'WALLET_DEBIT' | 'WALLET_REFUND' | 'WALLET_MANUAL_ADJUSTMENT'
  | 'PROMOTION_STARTED' | 'PROMOTION_ENDED'
  | 'ADVERTISEMENT_APPROVED' | 'ADVERTISEMENT_REJECTED'
  | 'PREMIUM_STARTED' | 'PREMIUM_EXPIRED';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// ============ REVIEW ============

export interface Review {
  id: string;
  appointmentId: string;
  customerId: string;
  customerName: string;
  providerId: string;
  providerName: string;
  rating: number;
  text: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

// ============ AUDIT LOG ============

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entity: string;
  entityId: string;
  oldValue?: string;
  newValue?: string;
  ip: string;
  userAgent: string;
  createdAt: string;
}

// ============ SYSTEM SETTINGS ============

export interface PaymentSettings {
  enabled: boolean;
  provider: string;
  yooKassaShopId: string;
  yooKassaSecretKey: string;
  returnUrl: string;
  minTopUp: number;
  maxTopUp: number;
  webhookStatus: 'ACTIVE' | 'ERROR' | 'INACTIVE';
  lastWebhookEvent?: string;
  lastWebhookError?: string;
}

export interface SystemHealth {
  backend: 'ONLINE' | 'WARNING' | 'ERROR';
  database: 'ONLINE' | 'WARNING' | 'ERROR';
  payments: 'ONLINE' | 'WARNING' | 'ERROR';
  webhook: 'ONLINE' | 'WARNING' | 'ERROR';
  notifications: 'ONLINE' | 'WARNING' | 'ERROR';
}

// ============ MESSAGES / CHAT ============

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  text: string;
  isRead: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  participantNames: string[];
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
}

// ============ API RESPONSE ============

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}
