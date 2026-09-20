export function formatCurrency(amountInKopecks: number): string {
  const rubles = amountInKopecks / 100;
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(rubles);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-800',
    INACTIVE: 'bg-gray-100 text-gray-800',
    BLOCKED: 'bg-red-100 text-red-800',
    PENDING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-blue-100 text-blue-800',
    COMPLETED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
    NO_SHOW: 'bg-orange-100 text-orange-800',
    SUCCEEDED: 'bg-green-100 text-green-800',
    FAILED: 'bg-red-100 text-red-800',
    CREATED: 'bg-gray-100 text-gray-800',
    EXPIRED: 'bg-gray-100 text-gray-800',
    DRAFT: 'bg-gray-100 text-gray-800',
    PAUSED: 'bg-yellow-100 text-yellow-800',
    REJECTED: 'bg-red-100 text-red-800',
    ARCHIVED: 'bg-gray-100 text-gray-800',
    APPROVED: 'bg-green-100 text-green-800',
    ONLINE: 'bg-green-100 text-green-800',
    WARNING: 'bg-yellow-100 text-yellow-800',
    ERROR: 'bg-red-100 text-red-800',
    EXPIRED_PREMIUM: 'bg-gray-100 text-gray-800',
    CANCELED: 'bg-red-100 text-red-800',
    REFUNDED: 'bg-orange-100 text-orange-800',
    REFUND_PENDING: 'bg-yellow-100 text-yellow-800',
    PARTIALLY_REFUNDED: 'bg-yellow-100 text-yellow-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

export function getTransactionTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    DEPOSIT: 'Пополнение',
    PROMOTION: 'Продвижение',
    ADVERTISEMENT: 'Реклама',
    PREMIUM: 'Premium',
    REFUND: 'Возврат',
    BONUS: 'Бонус',
    ADJUSTMENT: 'Корректировка',
  };
  return labels[type] || type;
}

export function getTransactionTypeColor(type: string): string {
  if (type === 'DEPOSIT' || type === 'REFUND' || type === 'BONUS' || type === 'ADJUSTMENT') {
    return 'text-green-600';
  }
  return 'text-red-600';
}

export function getNotificationIcon(type: string): string {
  const icons: Record<string, string> = {
    BOOKING_CREATED: '📅',
    BOOKING_CONFIRMED: '✅',
    BOOKING_CANCELLED: '❌',
    PAYMENT_CREATED: '💳',
    PAYMENT_PENDING: '⏳',
    PAYMENT_SUCCEEDED: '💰',
    PAYMENT_FAILED: '❌',
    PAYMENT_CANCELED: '🚫',
    WALLET_TOPUP_SUCCEEDED: '💰',
    WALLET_DEBIT: '💸',
    WALLET_REFUND: '↩️',
    WALLET_MANUAL_ADJUSTMENT: '🔧',
    PROMOTION_STARTED: '🚀',
    PROMOTION_ENDED: '🏁',
    ADVERTISEMENT_APPROVED: '✅',
    ADVERTISEMENT_REJECTED: '❌',
    PREMIUM_STARTED: '⭐',
    PREMIUM_EXPIRED: '⏰',
  };
  return icons[type] || '🔔';
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
