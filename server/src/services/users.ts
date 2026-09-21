import bcrypt from 'bcryptjs';
import { query, queryOne, pool } from '../db/pool.js';

export interface User {
  id: string;
  email: string;
  phone: string | null;
  first_name: string;
  last_name: string;
  password_hash: string;
  avatar: string | null;
  role: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export async function createUser(data: {
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  password: string;
  role?: string;
}): Promise<User> {
  const passwordHash = await bcrypt.hash(data.password, 12);
  const result = await queryOne<User>(
    `INSERT INTO users (email, phone, first_name, last_name, password_hash, role)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [data.email, data.phone || null, data.firstName, data.lastName, passwordHash, data.role || 'CUSTOMER']
  );
  if (!result) throw new Error('Failed to create user');
  return result;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  return queryOne<User>('SELECT * FROM users WHERE email = $1', [email]);
}

export async function findUserById(id: string): Promise<User | null> {
  return queryOne<User>('SELECT * FROM users WHERE id = $1', [id]);
}

export async function getAllUsers(): Promise<User[]> {
  return query<User>('SELECT * FROM users ORDER BY created_at DESC');
}

export async function updateUser(id: string, data: Partial<{
  firstName: string;
  lastName: string;
  phone: string;
  avatar: string;
  role: string;
  status: string;
}>): Promise<User | null> {
  const fields: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (data.firstName) { fields.push(`first_name = $${paramCount++}`); values.push(data.firstName); }
  if (data.lastName) { fields.push(`last_name = $${paramCount++}`); values.push(data.lastName); }
  if (data.phone !== undefined) { fields.push(`phone = $${paramCount++}`); values.push(data.phone); }
  if (data.avatar !== undefined) { fields.push(`avatar = $${paramCount++}`); values.push(data.avatar); }
  if (data.role) { fields.push(`role = $${paramCount++}`); values.push(data.role); }
  if (data.status) { fields.push(`status = $${paramCount++}`); values.push(data.status); }

  if (fields.length === 0) return findUserById(id);

  fields.push(`updated_at = NOW()`);
  values.push(id);

  return queryOne<User>(
    `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
    values
  );
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
