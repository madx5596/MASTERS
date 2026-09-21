import { query, queryOne, transaction } from '../db/pool.js';
import pg from 'pg';

export interface Wallet {
  id: string;
  owner_id: string;
  organization_id: string;
  balance: number;
  currency: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface TransactionRecord {
  id: string;
  wallet_id: string;
  type: string;
  amount: number;
  balance_before: number;
  balance_after: number;
  description: string | null;
  reference_id: string | null;
  payment_id: string | null;
  created_by: string | null;
  created_at: string;
}

export async function getWalletByOwner(ownerId: string): Promise<Wallet | null> {
  return queryOne<Wallet>('SELECT * FROM wallets WHERE owner_id = $1', [ownerId]);
}

export async function getWalletById(walletId: string): Promise<Wallet | null> {
  return queryOne<Wallet>('SELECT * FROM wallets WHERE id = $1', [walletId]);
}

export async function getAllWallets(): Promise<Wallet[]> {
  return query<Wallet>('SELECT * FROM wallets ORDER BY created_at DESC');
}

export async function createWallet(ownerId: string, organizationId: string): Promise<Wallet> {
  const result = await queryOne<Wallet>(
    `INSERT INTO wallets (owner_id, organization_id, balance, currency)
     VALUES ($1, $2, 0, 'RUB')
     RETURNING *`,
    [ownerId, organizationId]
  );
  if (!result) throw new Error('Failed to create wallet');
  return result;
}

/**
 * Credit wallet — only after confirmed payment
 * Uses row-level locking for concurrency safety
 */
export async function creditWallet(
  client: pg.PoolClient,
  walletId: string,
  amount: number,
  type: string,
  description: string,
  referenceId: string,
  paymentId: string | null,
  createdBy: string
): Promise<TransactionRecord> {
  if (amount <= 0) throw new Error('Credit amount must be positive');

  // Lock the wallet row
  const wallet = await client.query(
    'SELECT * FROM wallets WHERE id = $1 FOR UPDATE',
    [walletId]
  );

  if (wallet.rows.length === 0) throw new Error('Wallet not found');
  const currentWallet = wallet.rows[0];

  if (currentWallet.status !== 'ACTIVE') throw new Error('Wallet is blocked');

  const balanceBefore = currentWallet.balance;
  const balanceAfter = balanceBefore + amount;

  // Update wallet
  await client.query(
    'UPDATE wallets SET balance = $1, updated_at = NOW() WHERE id = $2',
    [balanceAfter, walletId]
  );

  // Create transaction
  const txResult = await client.query(
    `INSERT INTO transactions (wallet_id, type, amount, balance_before, balance_after, description, reference_id, payment_id, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [walletId, type, amount, balanceBefore, balanceAfter, description, referenceId, paymentId, createdBy]
  );

  return txResult.rows[0];
}

/**
 * Debit wallet — validates sufficient balance
 * Uses row-level locking for concurrency safety
 */
export async function debitWallet(
  client: pg.PoolClient,
  walletId: string,
  amount: number,
  type: string,
  description: string,
  referenceId: string,
  createdBy: string
): Promise<TransactionRecord> {
  if (amount <= 0) throw new Error('Debit amount must be positive');

  // Lock the wallet row
  const wallet = await client.query(
    'SELECT * FROM wallets WHERE id = $1 FOR UPDATE',
    [walletId]
  );

  if (wallet.rows.length === 0) throw new Error('Wallet not found');
  const currentWallet = wallet.rows[0];

  if (currentWallet.status !== 'ACTIVE') throw new Error('Wallet is blocked');
  if (currentWallet.balance < amount) {
    const error = new Error('Insufficient balance') as any;
    error.code = 'INSUFFICIENT_BALANCE';
    throw error;
  }

  const balanceBefore = currentWallet.balance;
  const balanceAfter = balanceBefore - amount;

  // Update wallet
  await client.query(
    'UPDATE wallets SET balance = $1, updated_at = NOW() WHERE id = $2',
    [balanceAfter, walletId]
  );

  // Create transaction
  const txResult = await client.query(
    `INSERT INTO transactions (wallet_id, type, amount, balance_before, balance_after, description, reference_id, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [walletId, type, -amount, balanceBefore, balanceAfter, description, referenceId, createdBy]
  );

  return txResult.rows[0];
}

export async function getTransactions(walletId: string): Promise<TransactionRecord[]> {
  return query<TransactionRecord>(
    'SELECT * FROM transactions WHERE wallet_id = $1 ORDER BY created_at DESC',
    [walletId]
  );
}

export async function getAllTransactions(): Promise<TransactionRecord[]> {
  return query<TransactionRecord>('SELECT * FROM transactions ORDER BY created_at DESC LIMIT 100');
}
