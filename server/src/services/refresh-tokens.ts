import { query, queryOne } from '../db/pool.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const REFRESH_TOKEN_TTL_DAYS = 7;

/**
 * Create a refresh token for a user
 */
export async function createRefreshToken(userId: string): Promise<string> {
  const rawToken = uuidv4();
  const tokenHash = await bcrypt.hash(rawToken, 10);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_TTL_DAYS);

  await query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)`,
    [userId, tokenHash, expiresAt]
  );

  // Return raw token to client (only time it's visible)
  return rawToken;
}

/**
 * Verify and consume a refresh token
 * Returns user_id if valid, null otherwise
 */
export async function verifyRefreshToken(rawToken: string): Promise<string | null> {
  // Get all non-revoked, non-expired tokens
  const tokens = await query<{ id: string; user_id: string; token_hash: string; expires_at: string }>(
    `SELECT id, user_id, token_hash, expires_at FROM refresh_tokens
     WHERE revoked = FALSE AND expires_at > NOW()
     ORDER BY created_at DESC LIMIT 10`
  );

  // Find matching token
  for (const token of tokens) {
    const matches = await bcrypt.compare(rawToken, token.token_hash);
    if (matches) {
      // Revoke the used token (rotation)
      await query('UPDATE refresh_tokens SET revoked = TRUE WHERE id = $1', [token.id]);
      return token.user_id;
    }
  }

  return null;
}

/**
 * Revoke all refresh tokens for a user (logout from all devices)
 */
export async function revokeAllUserTokens(userId: string): Promise<void> {
  await query('UPDATE refresh_tokens SET revoked = TRUE WHERE user_id = $1', [userId]);
}

/**
 * Clean up expired tokens (can be run periodically)
 */
export async function cleanupExpiredTokens(): Promise<number> {
  const result = await query(
    `DELETE FROM refresh_tokens WHERE expires_at < NOW() OR revoked = TRUE`
  );
  return (result as any)?.rowCount || 0;
}
