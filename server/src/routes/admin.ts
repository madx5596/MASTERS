import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { query, queryOne } from '../db/pool.js';
import { getPaymentSettings, updatePaymentSettings, maskPaymentSettings, validateSettingsUpdate } from '../services/payment-settings.js';
import { createAuditLog } from '../services/audit.js';

export async function adminRoutes(app: FastifyInstance) {
  // Dashboard stats
  app.get('/dashboard', { preHandler: [app.authenticate, app.requireRole('SUPER_ADMIN', 'FINANCE_ADMIN', 'SUPPORT_ADMIN', 'CONTENT_ADMIN', 'ANALYST')] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const users = await queryOne('SELECT COUNT(*) as count FROM users');
      const providers = await queryOne('SELECT COUNT(*) as count FROM providers');
      const customers = await queryOne('SELECT COUNT(*) as count FROM customers');
      const appointments = await queryOne('SELECT COUNT(*) as count FROM appointments');
      const payments = await queryOne('SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total FROM payments WHERE status = $1', ['SUCCEEDED']);
      const activePromotions = await queryOne("SELECT COUNT(*) as count FROM promotions WHERE status = 'ACTIVE'");
      const activeAdvertisements = await queryOne("SELECT COUNT(*) as count FROM advertisements WHERE status = 'ACTIVE'");

      return reply.send({
        success: true,
        data: {
          users: parseInt(users?.count || '0'),
          providers: parseInt(providers?.count || '0'),
          customers: parseInt(customers?.count || '0'),
          appointments: parseInt(appointments?.count || '0'),
          revenue: parseInt(payments?.total || '0'),
          payments: parseInt(payments?.count || '0'),
          activePromotions: parseInt(activePromotions?.count || '0'),
          activeAdvertisements: parseInt(activeAdvertisements?.count || '0'),
        },
      });
    }
  );

  // System settings
  app.get('/settings', { preHandler: [app.authenticate, app.requireRole('SUPER_ADMIN')] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const settings = await query('SELECT key, value FROM system_settings');
      const settingsMap: Record<string, any> = {};
      settings.forEach(s => { settingsMap[s.key] = s.value; });

      // Mask payment settings
      if (settingsMap.payment) {
        settingsMap.payment = maskPaymentSettings(settingsMap.payment);
      }

      return reply.send({ success: true, data: settingsMap });
    }
  );

  // Update system settings
  app.patch('/settings', { preHandler: [app.authenticate, app.requireRole('SUPER_ADMIN')] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const body = request.body as Record<string, any>;
      const user = (request as any).user;

      // Handle payment settings specially
      if (body.payment) {
        const current = await getPaymentSettings();
        const validated = validateSettingsUpdate(current, body.payment);
        await updatePaymentSettings(validated, user.id);

        await createAuditLog({
          userId: user.id,
          userName: `${user.first_name || ''} ${user.last_name || ''}`,
          action: 'PAYMENT_SETTINGS_UPDATED',
          entity: 'SystemSettings',
          entityId: 'payment',
          newValue: { ...validated, yooKassaSecretKey: '••••••••' },
          ip: request.ip,
          userAgent: request.headers['user-agent'],
        });

        delete body.payment;
      }

      // Handle other settings
      for (const [key, value] of Object.entries(body)) {
        await query(
          `INSERT INTO system_settings (key, value, updated_by) VALUES ($1, $2, $3)
           ON CONFLICT (key) DO UPDATE SET value = $2, updated_by = $3, updated_at = NOW()`,
          [key, JSON.stringify(value), user.id]
        );
      }

      return reply.send({ success: true, data: { message: 'Settings updated' } });
    }
  );
}
