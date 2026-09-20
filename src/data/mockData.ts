import { User, Provider, Customer, Service, Appointment, Wallet, Transaction, Payment, Promotion, Advertisement, PremiumSubscription, Notification, Review, AuditLog, Schedule, ServiceCategory, Organization, PaymentSettings, SystemHealth, Message, Conversation } from '../types';

export const organizations: Organization[] = [
  { id: 'org-1', name: 'Beauty Studio KRK', slug: 'beauty-studio-krk', businessType: 'BEAUTY', status: 'ACTIVE', ownerId: 'user-1', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
];

export const users: User[] = [
  { id: 'user-admin', email: 'admin@beautykrk.ru', phone: '+79001111111', firstName: 'Александр', lastName: 'Админов', avatar: '', role: 'SUPER_ADMIN', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'user-finance', email: 'finance@beautykrk.ru', phone: '+79002222222', firstName: 'Финанс', lastName: 'Админов', avatar: '', role: 'FINANCE_ADMIN', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'user-provider', email: 'anna@beautykrk.ru', phone: '+79003333333', firstName: 'Анна', lastName: 'Иванова', avatar: '', role: 'PROVIDER', status: 'ACTIVE', createdAt: '2024-01-15T00:00:00Z', updatedAt: '2024-01-15T00:00:00Z' },
  { id: 'user-provider2', email: 'maria@beautykrk.ru', phone: '+79004444444', firstName: 'Мария', lastName: 'Петрова', avatar: '', role: 'PROVIDER', status: 'ACTIVE', createdAt: '2024-02-01T00:00:00Z', updatedAt: '2024-02-01T00:00:00Z' },
  { id: 'user-customer', email: 'client@mail.ru', phone: '+79005555555', firstName: 'Елена', lastName: 'Смирнова', avatar: '', role: 'CUSTOMER', status: 'ACTIVE', createdAt: '2024-02-10T00:00:00Z', updatedAt: '2024-02-10T00:00:00Z' },
  { id: 'user-customer2', email: 'olga@mail.ru', phone: '+79006666666', firstName: 'Ольга', lastName: 'Козлова', avatar: '', role: 'CUSTOMER', status: 'ACTIVE', createdAt: '2024-03-01T00:00:00Z', updatedAt: '2024-03-01T00:00:00Z' },
];

export const providers: Provider[] = [
  { id: 'prov-1', userId: 'user-provider', organizationId: 'org-1', firstName: 'Анна', lastName: 'Иванова', displayName: 'Анна Иванова', description: 'Мастер маникюра с опытом 5 лет. Работаю с гель-лаком, наращиванием и дизайном ногтей.', avatar: '', specializations: ['Маникюр', 'Педикюр', 'Дизайн ногтей'], rating: 4.8, reviewCount: 124, status: 'ACTIVE', isPremium: true, createdAt: '2024-01-15T00:00:00Z' },
  { id: 'prov-2', userId: 'user-provider2', organizationId: 'org-1', firstName: 'Мария', lastName: 'Петрова', displayName: 'Мария Петрова', description: 'Парикмахер-стилист. Стрижки, окрашивание, укладки.', avatar: '', specializations: ['Стрижки', 'Окрашивание', 'Укладки'], rating: 4.9, reviewCount: 89, status: 'ACTIVE', isPremium: false, createdAt: '2024-02-01T00:00:00Z' },
];

export const customers: Customer[] = [
  { id: 'cust-1', userId: 'user-customer', organizationId: 'org-1', firstName: 'Елена', lastName: 'Смирнова', phone: '+79005555555', email: 'client@mail.ru', avatar: '', createdAt: '2024-02-10T00:00:00Z' },
  { id: 'cust-2', userId: 'user-customer2', organizationId: 'org-1', firstName: 'Ольга', lastName: 'Козлова', phone: '+79006666666', email: 'olga@mail.ru', avatar: '', createdAt: '2024-03-01T00:00:00Z' },
];

export const serviceCategories: ServiceCategory[] = [
  { id: 'cat-1', name: 'Маникюр', icon: '💅', businessType: 'BEAUTY' },
  { id: 'cat-2', name: 'Педикюр', icon: '🦶', businessType: 'BEAUTY' },
  { id: 'cat-3', name: 'Волосы', icon: '💇', businessType: 'BEAUTY' },
  { id: 'cat-4', name: 'Косметология', icon: '✨', businessType: 'BEAUTY' },
  { id: 'cat-5', name: 'Массаж', icon: '💆', businessType: 'BEAUTY' },
  { id: 'cat-6', name: 'Брови и ресницы', icon: '👁', businessType: 'BEAUTY' },
];

export const services: Service[] = [
  { id: 'svc-1', organizationId: 'org-1', providerId: 'prov-1', name: 'Маникюр классический', description: 'Классический маникюр с обработкой кутикулы', price: 150000, duration: 60, status: 'ACTIVE', categoryId: 'cat-1', createdAt: '2024-01-20T00:00:00Z', updatedAt: '2024-01-20T00:00:00Z' },
  { id: 'svc-2', organizationId: 'org-1', providerId: 'prov-1', name: 'Маникюр + покрытие гель-лак', description: 'Маникюр с покрытием гель-лаком', price: 250000, duration: 90, status: 'ACTIVE', categoryId: 'cat-1', createdAt: '2024-01-20T00:00:00Z', updatedAt: '2024-01-20T00:00:00Z' },
  { id: 'svc-3', organizationId: 'org-1', providerId: 'prov-1', name: 'Снятие покрытия', description: 'Снятие гель-лака', price: 50000, duration: 30, status: 'ACTIVE', categoryId: 'cat-1', createdAt: '2024-01-20T00:00:00Z', updatedAt: '2024-01-20T00:00:00Z' },
  { id: 'svc-4', organizationId: 'org-1', providerId: 'prov-1', name: 'Дизайн ногтей', description: 'Художественный дизайн (1 ноготь)', price: 20000, duration: 15, status: 'ACTIVE', categoryId: 'cat-1', createdAt: '2024-01-20T00:00:00Z', updatedAt: '2024-01-20T00:00:00Z' },
  { id: 'svc-5', organizationId: 'org-1', providerId: 'prov-1', name: 'Педикюр классический', description: 'Классический педикюр', price: 200000, duration: 75, status: 'ACTIVE', categoryId: 'cat-2', createdAt: '2024-01-20T00:00:00Z', updatedAt: '2024-01-20T00:00:00Z' },
  { id: 'svc-6', organizationId: 'org-1', providerId: 'prov-2', name: 'Женская стрижка', description: 'Стрижка с укладкой', price: 200000, duration: 60, status: 'ACTIVE', categoryId: 'cat-3', createdAt: '2024-02-05T00:00:00Z', updatedAt: '2024-02-05T00:00:00Z' },
  { id: 'svc-7', organizationId: 'org-1', providerId: 'prov-2', name: 'Окрашивание', description: 'Однотонное окрашивание', price: 450000, duration: 120, status: 'ACTIVE', categoryId: 'cat-3', createdAt: '2024-02-05T00:00:00Z', updatedAt: '2024-02-05T00:00:00Z' },
  { id: 'svc-8', organizationId: 'org-1', providerId: 'prov-2', name: 'Укладка', description: 'Профессиональная укладка', price: 150000, duration: 45, status: 'ACTIVE', categoryId: 'cat-3', createdAt: '2024-02-05T00:00:00Z', updatedAt: '2024-02-05T00:00:00Z' },
];

const today = new Date();
const todayStr = today.toISOString().split('T')[0];

export const appointments: Appointment[] = [
  { id: 'apt-1', organizationId: 'org-1', customerId: 'cust-1', customerName: 'Елена Смирнова', providerId: 'prov-1', providerName: 'Анна Иванова', serviceId: 'svc-2', serviceName: 'Маникюр + покрытие гель-лак', startAt: `${todayStr}T10:00:00`, endAt: `${todayStr}T11:30:00`, status: 'CONFIRMED', price: 250000, notes: '', createdAt: '2024-03-01T00:00:00Z', updatedAt: '2024-03-01T00:00:00Z' },
  { id: 'apt-2', organizationId: 'org-1', customerId: 'cust-2', customerName: 'Ольга Козлова', providerId: 'prov-1', providerName: 'Анна Иванова', serviceId: 'svc-1', serviceName: 'Маникюр классический', startAt: `${todayStr}T12:00:00`, endAt: `${todayStr}T13:00:00`, status: 'CONFIRMED', price: 150000, notes: '', createdAt: '2024-03-02T00:00:00Z', updatedAt: '2024-03-02T00:00:00Z' },
  { id: 'apt-3', organizationId: 'org-1', customerId: 'cust-1', customerName: 'Елена Смирнова', providerId: 'prov-2', providerName: 'Мария Петрова', serviceId: 'svc-6', serviceName: 'Женская стрижка', startAt: `${todayStr}T14:00:00`, endAt: `${todayStr}T15:00:00`, status: 'PENDING', price: 200000, notes: '', createdAt: '2024-03-03T00:00:00Z', updatedAt: '2024-03-03T00:00:00Z' },
  { id: 'apt-4', organizationId: 'org-1', customerId: 'cust-2', customerName: 'Ольга Козлова', providerId: 'prov-1', providerName: 'Анна Иванова', serviceId: 'svc-5', serviceName: 'Педикюр классический', startAt: '2024-12-20T10:00:00', endAt: '2024-12-20T11:15:00', status: 'COMPLETED', price: 200000, notes: '', createdAt: '2024-12-15T00:00:00Z', updatedAt: '2024-12-20T00:00:00Z' },
  { id: 'apt-5', organizationId: 'org-1', customerId: 'cust-1', customerName: 'Елена Смирнова', providerId: 'prov-2', providerName: 'Мария Петрова', serviceId: 'svc-7', serviceName: 'Окрашивание', startAt: '2024-12-18T09:00:00', endAt: '2024-12-18T11:00:00', status: 'COMPLETED', price: 450000, notes: '', createdAt: '2024-12-10T00:00:00Z', updatedAt: '2024-12-18T00:00:00Z' },
];

export const wallets: Wallet[] = [
  { id: 'wallet-1', ownerId: 'prov-1', ownerName: 'Анна Иванова', organizationId: 'org-1', balance: 1500000, currency: 'RUB', status: 'ACTIVE', createdAt: '2024-01-15T00:00:00Z', updatedAt: '2024-03-10T00:00:00Z' },
  { id: 'wallet-2', ownerId: 'prov-2', ownerName: 'Мария Петрова', organizationId: 'org-1', balance: 350000, currency: 'RUB', status: 'ACTIVE', createdAt: '2024-02-01T00:00:00Z', updatedAt: '2024-03-05T00:00:00Z' },
];

export const transactions: Transaction[] = [
  { id: 'tx-1', walletId: 'wallet-1', type: 'DEPOSIT', amount: 500000, balanceBefore: 0, balanceAfter: 500000, description: 'Пополнение кошелька', referenceId: 'pay-1', paymentId: 'pay-1', createdBy: 'user-provider', createdAt: '2024-02-01T10:00:00Z' },
  { id: 'tx-2', walletId: 'wallet-1', type: 'DEPOSIT', amount: 1000000, balanceBefore: 500000, balanceAfter: 1500000, description: 'Пополнение кошелька', referenceId: 'pay-2', paymentId: 'pay-2', createdBy: 'user-provider', createdAt: '2024-03-01T14:00:00Z' },
  { id: 'tx-3', walletId: 'wallet-1', type: 'PROMOTION', amount: -300000, balanceBefore: 1800000, balanceAfter: 1500000, description: 'Оплата продвижения "TOP_LISTING"', referenceId: 'promo-1', createdBy: 'user-provider', createdAt: '2024-03-05T09:00:00Z' },
  { id: 'tx-4', walletId: 'wallet-2', type: 'DEPOSIT', amount: 500000, balanceBefore: 0, balanceAfter: 500000, description: 'Пополнение кошелька', referenceId: 'pay-3', paymentId: 'pay-3', createdBy: 'user-provider2', createdAt: '2024-02-15T11:00:00Z' },
  { id: 'tx-5', walletId: 'wallet-2', type: 'PREMIUM', amount: -150000, balanceBefore: 500000, balanceAfter: 350000, description: 'Подписка Premium (1 месяц)', referenceId: 'prem-1', createdBy: 'user-provider2', createdAt: '2024-03-01T10:00:00Z' },
];

export const payments: Payment[] = [
  { id: 'pay-1', userId: 'user-provider', userName: 'Анна Иванова', organizationId: 'org-1', purpose: 'WALLET_TOPUP', amount: 500000, currency: 'RUB', provider: 'YooKassa', providerPaymentId: 'yk-001', status: 'SUCCEEDED', paymentUrl: '', createdAt: '2024-02-01T09:50:00Z', paidAt: '2024-02-01T10:00:00Z' },
  { id: 'pay-2', userId: 'user-provider', userName: 'Анна Иванова', organizationId: 'org-1', purpose: 'WALLET_TOPUP', amount: 1000000, currency: 'RUB', provider: 'YooKassa', providerPaymentId: 'yk-002', status: 'SUCCEEDED', paymentUrl: '', createdAt: '2024-03-01T13:50:00Z', paidAt: '2024-03-01T14:00:00Z' },
  { id: 'pay-3', userId: 'user-provider2', userName: 'Мария Петрова', organizationId: 'org-1', purpose: 'WALLET_TOPUP', amount: 500000, currency: 'RUB', provider: 'YooKassa', providerPaymentId: 'yk-003', status: 'SUCCEEDED', paymentUrl: '', createdAt: '2024-02-15T10:50:00Z', paidAt: '2024-02-15T11:00:00Z' },
  { id: 'pay-4', userId: 'user-provider', userName: 'Анна Иванова', organizationId: 'org-1', purpose: 'WALLET_TOPUP', amount: 300000, currency: 'RUB', provider: 'YooKassa', providerPaymentId: 'yk-004', status: 'PENDING', paymentUrl: 'https://yookassa.ru/pay/mock-004', createdAt: '2024-03-10T12:00:00Z' },
];

export const promotions: Promotion[] = [
  { id: 'promo-1', organizationId: 'org-1', providerId: 'prov-1', providerName: 'Анна Иванова', type: 'TOP_LISTING', status: 'ACTIVE', budget: 300000, spent: 150000, startsAt: '2024-03-05T00:00:00Z', endsAt: '2024-04-05T00:00:00Z', createdAt: '2024-03-05T09:00:00Z' },
];

export const advertisements: Advertisement[] = [
  { id: 'ad-1', organizationId: 'org-1', providerId: 'prov-1', providerName: 'Анна Иванова', title: 'Весенняя акция -20%', description: 'Скидка 20% на все услуги маникюра в марте', status: 'ACTIVE', budget: 100000, spent: 45000, startsAt: '2024-03-01T00:00:00Z', endsAt: '2024-03-31T00:00:00Z', createdAt: '2024-02-28T00:00:00Z' },
];

export const premiumSubscriptions: PremiumSubscription[] = [
  { id: 'prem-1', providerId: 'prov-1', providerName: 'Анна Иванова', status: 'ACTIVE', plan: 'Premium Monthly', price: 150000, startsAt: '2024-03-01T00:00:00Z', endsAt: '2024-04-01T00:00:00Z', createdAt: '2024-03-01T00:00:00Z' },
];

export const notifications: Notification[] = [
  { id: 'notif-1', userId: 'user-provider', type: 'BOOKING_CREATED', title: 'Новая запись', message: 'Елена Смирнова записалась на Маникюр + покрытие гель-лак', isRead: false, createdAt: new Date().toISOString() },
  { id: 'notif-2', userId: 'user-provider', type: 'PAYMENT_SUCCEEDED', title: 'Оплата прошла', message: 'Кошелек пополнен на 10 000 ₽', isRead: true, createdAt: '2024-03-01T14:00:00Z' },
  { id: 'notif-3', userId: 'user-provider', type: 'PROMOTION_STARTED', title: 'Продвижение активно', message: 'Ваше продвижение "TOP_LISTING" запущено', isRead: true, createdAt: '2024-03-05T09:00:00Z' },
  { id: 'notif-4', userId: 'user-customer', type: 'BOOKING_CONFIRMED', title: 'Запись подтверждена', message: 'Ваша запись к Анне Ивановой подтверждена', isRead: false, createdAt: new Date().toISOString() },
  { id: 'notif-5', userId: 'user-admin', type: 'PAYMENT_SUCCEEDED', title: 'Платеж получен', message: 'Анна Иванова: пополнение 10 000 ₽', isRead: false, createdAt: '2024-03-01T14:00:00Z' },
];

export const reviews: Review[] = [
  { id: 'rev-1', appointmentId: 'apt-4', customerId: 'cust-2', customerName: 'Ольга Козлова', providerId: 'prov-1', providerName: 'Анна Иванова', rating: 5, text: 'Отличный маникюр! Анна очень аккуратная и внимательная.', status: 'APPROVED', createdAt: '2024-12-20T15:00:00Z' },
  { id: 'rev-2', appointmentId: 'apt-5', customerId: 'cust-1', customerName: 'Елена Смирнова', providerId: 'prov-2', providerName: 'Мария Петрова', rating: 5, text: 'Прекрасное окрашивание! Цвет именно такой, как я хотела.', status: 'APPROVED', createdAt: '2024-12-18T16:00:00Z' },
  { id: 'rev-3', appointmentId: 'apt-4', customerId: 'cust-1', customerName: 'Елена Смирнова', providerId: 'prov-1', providerName: 'Анна Иванова', rating: 4, text: 'Хороший результат, но пришлось немного подождать.', status: 'APPROVED', createdAt: '2024-12-21T10:00:00Z' },
];

export const schedules: Schedule[] = [
  { id: 'sch-1', providerId: 'prov-1', dayOfWeek: 1, startTime: '09:00', endTime: '18:00', isActive: true },
  { id: 'sch-2', providerId: 'prov-1', dayOfWeek: 2, startTime: '09:00', endTime: '18:00', isActive: true },
  { id: 'sch-3', providerId: 'prov-1', dayOfWeek: 3, startTime: '09:00', endTime: '18:00', isActive: true },
  { id: 'sch-4', providerId: 'prov-1', dayOfWeek: 4, startTime: '09:00', endTime: '18:00', isActive: true },
  { id: 'sch-5', providerId: 'prov-1', dayOfWeek: 5, startTime: '09:00', endTime: '18:00', isActive: true },
  { id: 'sch-6', providerId: 'prov-1', dayOfWeek: 6, startTime: '10:00', endTime: '16:00', isActive: true },
  { id: 'sch-7', providerId: 'prov-1', dayOfWeek: 0, startTime: '00:00', endTime: '00:00', isActive: false },
];

export const auditLogs: AuditLog[] = [
  { id: 'audit-1', userId: 'user-provider', userName: 'Анна Иванова', action: 'WALLET_CREDITED', entity: 'Wallet', entityId: 'wallet-1', oldValue: '500000', newValue: '1500000', ip: '192.168.1.1', userAgent: 'Mozilla/5.0', createdAt: '2024-03-01T14:00:00Z' },
  { id: 'audit-2', userId: 'user-admin', userName: 'Александр Админов', action: 'PROMOTION_CREATED', entity: 'Promotion', entityId: 'promo-1', newValue: '{"type":"TOP_LISTING","budget":300000}', ip: '192.168.1.1', userAgent: 'Mozilla/5.0', createdAt: '2024-03-05T09:00:00Z' },
  { id: 'audit-3', userId: 'user-admin', userName: 'Александр Админов', action: 'PAYMENT_SETTINGS_UPDATED', entity: 'SystemSettings', entityId: 'payment-settings', ip: '192.168.1.1', userAgent: 'Mozilla/5.0', createdAt: '2024-02-01T10:00:00Z' },
];

export const paymentSettings: PaymentSettings = {
  enabled: true,
  provider: 'YooKassa',
  yooKassaShopId: 'shop-123456',
  yooKassaSecretKey: '••••••••••••••ABCD',
  returnUrl: 'https://beautykrk.ru/payment/return',
  minTopUp: 50000,
  maxTopUp: 5000000,
  webhookStatus: 'ACTIVE',
  lastWebhookEvent: '2024-03-10T12:00:00Z',
};

export const systemHealth: SystemHealth = {
  backend: 'ONLINE',
  database: 'ONLINE',
  payments: 'ONLINE',
  webhook: 'ONLINE',
  notifications: 'ONLINE',
};

// ============ CHAT / MESSAGES ============

export const conversations: Conversation[] = [
  {
    id: 'conv-1',
    participantIds: ['user-provider', 'user-customer'],
    participantNames: ['Анна Иванова', 'Елена Смирнова'],
    lastMessage: 'Здравствуйте! Подтверждаю запись на завтра в 10:00',
    lastMessageAt: '2024-03-10T14:30:00Z',
    unreadCount: 1,
  },
  {
    id: 'conv-2',
    participantIds: ['user-provider', 'user-customer2'],
    participantNames: ['Анна Иванова', 'Ольга Козлова'],
    lastMessage: 'Спасибо за маникюр, всё отлично!',
    lastMessageAt: '2024-03-09T16:00:00Z',
    unreadCount: 0,
  },
  {
    id: 'conv-3',
    participantIds: ['user-provider2', 'user-customer'],
    participantNames: ['Мария Петрова', 'Елена Смирнова'],
    lastMessage: 'Какое время вам удобно для стрижки?',
    lastMessageAt: '2024-03-10T11:00:00Z',
    unreadCount: 2,
  },
];

export const messages: Message[] = [
  // Conversation 1: Анна <-> Елена
  {
    id: 'msg-1',
    conversationId: 'conv-1',
    senderId: 'user-customer',
    senderName: 'Елена Смирнова',
    receiverId: 'user-provider',
    text: 'Здравствуйте! Можно записаться на маникюр завтра?',
    isRead: true,
    createdAt: '2024-03-10T14:00:00Z',
  },
  {
    id: 'msg-2',
    conversationId: 'conv-1',
    senderId: 'user-provider',
    senderName: 'Анна Иванова',
    receiverId: 'user-customer',
    text: 'Здравствуйте! Да, конечно. Какое время вам удобно?',
    isRead: true,
    createdAt: '2024-03-10T14:10:00Z',
  },
  {
    id: 'msg-3',
    conversationId: 'conv-1',
    senderId: 'user-customer',
    senderName: 'Елена Смирнова',
    receiverId: 'user-provider',
    text: 'Можно на 10:00?',
    isRead: true,
    createdAt: '2024-03-10T14:15:00Z',
  },
  {
    id: 'msg-4',
    conversationId: 'conv-1',
    senderId: 'user-provider',
    senderName: 'Анна Иванова',
    receiverId: 'user-customer',
    text: 'Здравствуйте! Подтверждаю запись на завтра в 10:00',
    isRead: false,
    createdAt: '2024-03-10T14:30:00Z',
  },
  // Conversation 2: Анна <-> Ольга
  {
    id: 'msg-5',
    conversationId: 'conv-2',
    senderId: 'user-customer2',
    senderName: 'Ольга Козлова',
    receiverId: 'user-provider',
    text: 'Анна, спасибо за маникюр, всё отлично!',
    isRead: true,
    createdAt: '2024-03-09T15:50:00Z',
  },
  {
    id: 'msg-6',
    conversationId: 'conv-2',
    senderId: 'user-provider',
    senderName: 'Анна Иванова',
    receiverId: 'user-customer2',
    text: 'Спасибо за маникюр, всё отлично!',
    isRead: true,
    createdAt: '2024-03-09T16:00:00Z',
  },
  // Conversation 3: Мария <-> Елена
  {
    id: 'msg-7',
    conversationId: 'conv-3',
    senderId: 'user-customer',
    senderName: 'Елена Смирнова',
    receiverId: 'user-provider2',
    text: 'Мария, здравствуйте! Хочу записаться на стрижку',
    isRead: true,
    createdAt: '2024-03-10T10:30:00Z',
  },
  {
    id: 'msg-8',
    conversationId: 'conv-3',
    senderId: 'user-provider2',
    senderName: 'Мария Петрова',
    receiverId: 'user-customer',
    text: 'Здравствуйте, Елена! Конечно, когда вам удобно?',
    isRead: true,
    createdAt: '2024-03-10T10:45:00Z',
  },
  {
    id: 'msg-9',
    conversationId: 'conv-3',
    senderId: 'user-customer',
    senderName: 'Елена Смирнова',
    receiverId: 'user-provider2',
    text: 'Можно в эту субботу?',
    isRead: false,
    createdAt: '2024-03-10T10:50:00Z',
  },
  {
    id: 'msg-10',
    conversationId: 'conv-3',
    senderId: 'user-provider2',
    senderName: 'Мария Петрова',
    receiverId: 'user-customer',
    text: 'Какое время вам удобно для стрижки?',
    isRead: false,
    createdAt: '2024-03-10T11:00:00Z',
  },
];
