import { query, queryOne } from '../db/pool.js';

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export async function createNotification(data: {
  userId: string;
  type: string;
  title: string;
  message: string;
}): Promise<Notification> {
  const result = await queryOne<Notification>(
    `INSERT INTO notifications (user_id, type, title, message)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [data.userId, data.type, data.title, data.message]
  );
  if (!result) throw new Error('Failed to create notification');
  return result;
}

export async function getUserNotifications(userId: string): Promise<Notification[]> {
  return query<Notification>(
    'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
}

export async function markNotificationRead(id: string, userId: string): Promise<void> {
  await query('UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2', [id, userId]);
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  await query('UPDATE notifications SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE', [userId]);
}
