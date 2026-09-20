import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { createPayment, getPaymentById, getUserPayments, getAllPayments, processWebhookEvent } from '../services/payments.js';
import { getPaymentSettings } from '../services/payment-settings.js';
import { createAuditLog } from '../services/audit.js';
import { createNotification } from '../services/notifications.js';

export async function paymentsRoutes(app: FastifyInstance) {
  // Create payment
  app.post('/create', { preHandler: [app.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const body = request.body as { amount: number; purpose: string };
      const user = (request as any).user;

      const settings = await getPaymentSettings();

      if (!body.amount || body.amount < settings.minTopUp) {
        return reply.code(400).send({
          success: false,
          error: { code: 'INVALID_AMOUNT', message: `Minimum amount is ${settings.minTopUp / 100} RUB` }
        });
      }
      if (body.amount > settings.maxTopUp) {
        return reply.code(400).send({
          success: false,
          error: { code: 'INVALID_AMOUNT', message: `Maximum amount is ${settings.maxTopUp / 100} RUB` }
        });
      }

      const { payment, confirmationUrl } = await createPayment({
        userId: user.id,
        purpose: body.purpose || 'WALLET_TOPUP',
        amount: body.amount,
      });

      await createAuditLog({
        userId: user.id,
        userName: `${user.first_name || ''} ${user.last_name || ''}`,
        action: 'PAYMENT_CREATED',
        entity: 'Payment',
        entityId: payment.id,
        newValue: { amount: body.amount, purpose: body.purpose },
        ip: request.ip,
        userAgent: request.headers['user-agent'],
      });

      return reply.send({
        success: true,
        data: {
          paymentId: payment.id,
          status: payment.status,
          confirmationUrl,
        },
      });
    }
  );

  // Get payment by ID - with authorization check
  app.get('/:id', { preHandler: [app.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string };
      const user = (request as any).user;
      const payment = await getPaymentById(id);

      if (!payment) {
        return reply.code(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Payment not found' } });
      }

      // Authorization check
      const isAdmin = ['SUPER_ADMIN', 'FINANCE_ADMIN'].includes(user.role);
      if (!isAdmin && payment.user_id !== user.id) {
        return reply.code(403).send({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } });
      }

      return reply.send({ success: true, data: payment });
    }
  );

  // Get my payments
  app.get('/my', { preHandler: [app.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const user = (request as any).user;
      const payments = await getUserPayments(user.id);
      return reply.send({ success: true, data: payments });
    }
  );

  // Get all payments (admin)
  app.get('/all', { preHandler: [app.authenticate, app.requireRole('SUPER_ADMIN', 'FINANCE_ADMIN')] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const payments = await getAllPayments();
      return reply.send({ success: true, data: payments });
    }
  );

  // YooKassa Webhook
  app.post('/yookassa/webhook', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const event = request.body as any;

      await processWebhookEvent({
        type: event.type,
        event: event.event,
        object: event.object,
      });

      await createAuditLog({
        action: 'WEBHOOK_RECEIVED',
        entity: 'Payment',
        entityId: event.object?.id,
        newValue: { event: event.event },
      });

      // Notify user about successful payment
      if (event.event === 'payment.succeeded') {
        const payment = await getPaymentById(event.object?.metadata?.payment_id);
        if (payment) {
          await createNotification({
            userId: payment.user_id,
            type: 'WALLET_TOPUP_SUCCEEDED',
            title: 'Кошелек пополнен',
            message: `Ваш кошелек пополнен на ${(payment.amount / 100).toFixed(0)} ₽`,
          });
        }
      }

      return reply.send({ success: true });
    } catch (error: any) {
      request.log.error(error, 'Webhook processing error');
      // Still return 200 to prevent retries for processed events
      if (error.message?.includes('already processed')) {
        return reply.send({ success: true });
      }
      return reply.code(500).send({ success: false, error: { code: 'WEBHOOK_ERROR', message: error.message } });
    }
  });

  // Mock payment confirmation (for development only)
  app.post('/mock/confirm/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    if (process.env.NODE_ENV === 'production') {
      return reply.code(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Not found' } });
    }

    const { id } = request.params as { id: string };
    const payment = await getPaymentById(id);
    if (!payment) return reply.code(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Payment not found' } });

    // Simulate webhook
    await processWebhookEvent({
      type: 'notification',
      event: 'payment.succeeded',
      object: {
        id: payment.provider_payment_id,
        status: 'succeeded',
        amount: { value: (payment.amount / 100).toFixed(2), currency: 'RUB' },
        metadata: { payment_id: payment.id, user_id: payment.user_id, purpose: payment.purpose },
      },
    });

    return reply.send({ success: true, data: { message: 'Mock payment confirmed' } });
  });
}
