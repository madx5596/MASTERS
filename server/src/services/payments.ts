import { query, queryOne, transaction } from '../db/pool.js';
import { config } from '../config/index.js';
import { v4 as uuidv4 } from 'uuid';
import { creditWallet, getWalletByOwner } from './wallets.js';
import pg from 'pg';

export interface Payment {
  id: string;
  user_id: string;
  organization_id: string | null;
  purpose: string;
  amount: number;
  currency: string;
  provider: string;
  provider_payment_id: string | null;
  status: string;
  payment_url: string | null;
  idempotency_key: string | null;
  created_at: string;
  paid_at: string | null;
  expires_at: string | null;
  metadata: any;
}

export interface PaymentEvent {
  id: string;
  payment_id: string;
  provider_event_id: string;
  event_type: string;
  payload: any;
  processed: boolean;
  created_at: string;
  processed_at: string | null;
  error: string | null;
}

/**
 * Create payment — initiates payment process
 */
export async function createPayment(data: {
  userId: string;
  organizationId?: string;
  purpose: string;
  amount: number;
  description?: string;
}): Promise<{ payment: Payment; confirmationUrl: string }> {
  const idempotencyKey = uuidv4();

  // Create payment record
  const payment = await queryOne<Payment>(
    `INSERT INTO payments (user_id, organization_id, purpose, amount, currency, provider, status, idempotency_key, expires_at)
     VALUES ($1, $2, $3, $4, 'RUB', $5, 'CREATED', $6, NOW() + INTERVAL '30 minutes')
     RETURNING *`,
    [data.userId, data.organizationId || null, data.purpose, data.amount, 'YooKassa', idempotencyKey]
  );

  if (!payment) throw new Error('Failed to create payment');

  // Create payment in YooKassa or mock
  let confirmationUrl: string;
  let providerPaymentId: string;

  if (config.paymentMode === 'production' && config.yooKassa.enabled) {
    // Real YooKassa integration
    const result = await createYooKassaPayment(payment, data.description || 'Пополнение кошелька');
    confirmationUrl = result.confirmationUrl;
    providerPaymentId = result.paymentId;
  } else {
    // Mock payment for development
    providerPaymentId = `mock_${payment.id}`;
    confirmationUrl = `${config.app.url}/payment/mock/${payment.id}`;
  }

  // Update payment with provider data
  await query(
    `UPDATE payments SET provider_payment_id = $1, payment_url = $2, status = 'PENDING' WHERE id = $3`,
    [providerPaymentId, confirmationUrl, payment.id]
  );

  const updatedPayment = await queryOne<Payment>('SELECT * FROM payments WHERE id = $1', [payment.id]);
  if (!updatedPayment) throw new Error('Failed to update payment');

  return { payment: updatedPayment, confirmationUrl };
}

/**
 * Create real YooKassa payment
 */
async function createYooKassaPayment(payment: Payment, description: string): Promise<{ confirmationUrl: string; paymentId: string }> {
  const response = await fetch('https://api.yookassa.ru/v3/payments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotence-Key': payment.idempotency_key || uuidv4(),
      'Authorization': `Basic ${Buffer.from(`${config.yooKassa.shopId}:${config.yooKassa.secretKey}`).toString('base64')}`,
    },
    body: JSON.stringify({
      amount: {
        value: (payment.amount / 100).toFixed(2),
        currency: 'RUB',
      },
      confirmation: {
        type: 'redirect',
        return_url: config.yooKassa.returnUrl,
      },
      capture: true,
      description,
      metadata: {
        payment_id: payment.id,
        user_id: payment.user_id,
        purpose: payment.purpose,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`YooKassa error: ${error}`);
  }

  const data = await response.json();
  return {
    confirmationUrl: data.confirmation.confirmation_url,
    paymentId: data.id,
  };
}

/**
 * Process webhook event — handles idempotency
 */
export async function processWebhookEvent(event: {
  type: string;
  event: string;
  object: any;
}): Promise<void> {
  const providerEventId = event.object.id;
  const eventType = event.event;

  // Check if already processed (idempotency)
  const existingEvent = await queryOne<PaymentEvent>(
    'SELECT * FROM payment_events WHERE provider_event_id = $1',
    [providerEventId]
  );

  if (existingEvent?.processed) {
    console.log(`Event ${providerEventId} already processed, skipping`);
    return;
  }

  // Find payment
  const payment = await queryOne<Payment>(
    'SELECT * FROM payments WHERE provider_payment_id = $1',
    [providerEventId]
  );

  if (!payment) {
    throw new Error(`Payment not found for provider_payment_id: ${providerEventId}`);
  }

  // Process in transaction
  await transaction(async (client) => {
    // Record event
    await client.query(
      `INSERT INTO payment_events (payment_id, provider_event_id, event_type, payload, processed, processed_at)
       VALUES ($1, $2, $3, $4, TRUE, NOW())
       ON CONFLICT (provider_event_id) DO NOTHING`,
      [payment.id, providerEventId, eventType, event.object]
    );

    // Handle event
    if (eventType === 'payment.succeeded') {
      await handlePaymentSucceeded(client, payment);
    } else if (eventType === 'payment.canceled') {
      await handlePaymentCanceled(client, payment);
    }

    // Mark event as processed
    await client.query(
      'UPDATE payment_events SET processed = TRUE, processed_at = NOW() WHERE provider_event_id = $1',
      [providerEventId]
    );
  });
}

/**
 * Handle successful payment — credit wallet
 */
async function handlePaymentSucceeded(client: pg.PoolClient, payment: Payment): Promise<void> {
  // Check if already credited
  if (payment.status === 'SUCCEEDED') {
    console.log(`Payment ${payment.id} already succeeded, skipping`);
    return;
  }

  // Update payment status
  await client.query(
    `UPDATE payments SET status = 'SUCCEEDED', paid_at = NOW() WHERE id = $1`,
    [payment.id]
  );

  // Credit wallet if purpose is WALLET_TOPUP
  if (payment.purpose === 'WALLET_TOPUP') {
    const wallet = await getWalletByOwner(payment.user_id);
    if (wallet) {
      await creditWallet(
        client,
        wallet.id,
        payment.amount,
        'DEPOSIT',
        'Пополнение кошелька',
        payment.id,
        payment.id,
        payment.user_id
      );
    }
  }
}

/**
 * Handle canceled payment
 */
async function handlePaymentCanceled(client: pg.PoolClient, payment: Payment): Promise<void> {
  if (payment.status === 'CANCELED') {
    console.log(`Payment ${payment.id} already canceled, skipping`);
    return;
  }

  await client.query(
    `UPDATE payments SET status = 'CANCELED' WHERE id = $1`,
    [payment.id]
  );
}

export async function getPaymentById(id: string): Promise<Payment | null> {
  return queryOne<Payment>('SELECT * FROM payments WHERE id = $1', [id]);
}

export async function getUserPayments(userId: string): Promise<Payment[]> {
  return query<Payment>('SELECT * FROM payments WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
}

export async function getAllPayments(): Promise<Payment[]> {
  return query<Payment>('SELECT * FROM payments ORDER BY created_at DESC LIMIT 100');
}
