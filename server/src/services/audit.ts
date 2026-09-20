import { query, queryOne } from '../db/pool.js';

export interface AuditLog {
  id: string;
  user_id: string | null;
  user_name: string | null;
  action: string;
  entity: string;
  entity_id: string | null;
  old_value: any;
  new_value: any;
  ip: string | null;
  user_agent: string | null;
  created_at: string;
}

export async function createAuditLog(data: {
  userId?: string;
  userName?: string;
  action: string;
  entity: string;
  entityId?: string;
  oldValue?: any;
  newValue?: any;
  ip?: string;
  userAgent?: string;
}): Promise<void> {
  await query(
    `INSERT INTO audit_logs (user_id, user_name, action, entity, entity_id, old_value, new_value, ip, user_agent)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [data.userId || null, data.userName || null, data.action, data.entity, data.entityId || null,
     data.oldValue ? JSON.stringify(data.oldValue) : null,
     data.newValue ? JSON.stringify(data.newValue) : null,
     data.ip || null, data.userAgent || null]
  );
}

export async function getAuditLogs(limit = 100): Promise<AuditLog[]> {
  return query<AuditLog>('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT $1', [limit]);
}
