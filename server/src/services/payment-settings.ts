import { queryOne, query } from '../db/pool.js';
import type { PaymentProviderConfig } from './payment-provider.js';

/**
 * Payment Settings Service
 * Manages payment configuration stored in database
 */

export interface PaymentSettings {
  enabled: boolean;
  provider: 'yookassa' | 'mock';
  yooKassaShopId: string;
  yooKassaSecretKey: string;
  returnUrl: string;
  minTopUp: number; // in kopecks
  maxTopUp: number; // in kopecks
  webhookStatus: 'active' | 'error' | 'inactive';
  lastWebhookAt: string | null;
}

const DEFAULT_SETTINGS: PaymentSettings = {
  enabled: false,
  provider: 'mock',
  yooKassaShopId: '',
  yooKassaSecretKey: '',
  returnUrl: 'http://localhost:3000/payment/return',
  minTopUp: 50000, // 500 RUB
  maxTopUp: 50000000, // 500,000 RUB
  webhookStatus: 'inactive',
  lastWebhookAt: null,
};

/**
 * Get payment settings from database
 */
export async function getPaymentSettings(): Promise<PaymentSettings> {
  const row = await queryOne<{ value: any }>(
    "SELECT value FROM system_settings WHERE key = 'payment'",
    []
  );

  if (!row) {
    return DEFAULT_SETTINGS;
  }

  return { ...DEFAULT_SETTINGS, ...row.value };
}

/**
 * Update payment settings in database
 */
export async function updatePaymentSettings(settings: Partial<PaymentSettings>, updatedBy: string): Promise<void> {
  const current = await getPaymentSettings();
  const updated = { ...current, ...settings };

  await query(
    `INSERT INTO system_settings (key, value, updated_at, updated_by)
     VALUES ('payment', $1, NOW(), $2)
     ON CONFLICT (key) DO UPDATE SET value = $1, updated_at = NOW(), updated_by = $2`,
    [JSON.stringify(updated), updatedBy]
  );
}

/**
 * Get YooKassa config for payment provider
 * Returns null if YooKassa is not configured
 */
export async function getYooKassaConfig(): Promise<PaymentProviderConfig | null> {
  const settings = await getPaymentSettings();

  if (!settings.enabled || settings.provider !== 'yookassa') {
    return null;
  }

  if (!settings.yooKassaShopId || !settings.yooKassaSecretKey) {
    return null;
  }

  // Don't return masked key
  if (settings.yooKassaSecretKey.includes('•')) {
    return null;
  }

  return {
    shopId: settings.yooKassaShopId,
    secretKey: settings.yooKassaSecretKey,
    returnUrl: settings.returnUrl,
  };
}

/**
 * Mask sensitive data for API response
 */
export function maskPaymentSettings(settings: PaymentSettings): any {
  return {
    ...settings,
    yooKassaSecretKey: settings.yooKassaSecretKey
      ? settings.yooKassaSecretKey.substring(0, 4) + '••••••••'
      : '',
  };
}

/**
 * Validate payment settings update
 * Don't overwrite secret key with masked value
 */
export function validateSettingsUpdate(current: PaymentSettings, updates: Partial<PaymentSettings>): Partial<PaymentSettings> {
  const validated = { ...updates };

  // If secret key is masked, don't update it
  if (validated.yooKassaSecretKey && validated.yooKassaSecretKey.includes('•')) {
    delete validated.yooKassaSecretKey;
  }

  return validated;
}
