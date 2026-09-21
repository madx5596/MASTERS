import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getAvailability, createAppointment, getAppointmentById, getProviderAppointments, getCustomerAppointments, getAllAppointments, updateAppointmentStatus, getProviderByUserId, getCustomerByUserId } from '../services/appointments.js';
import { createAuditLog } from '../services/audit.js';
import { createNotification } from '../services/notifications.js';
import { queryOne } from '../db/pool.js';

export async function appointmentsRoutes(app: FastifyInstance) {
  // Get appointments - filtered by role
  app.get('/', { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user;
    let appointments;

    if (user.role === 'PROVIDER') {
      const provider = await getProviderByUserId(user.id);
      appointments = provider ? await getProviderAppointments(provider.id) : [];
    } else if (user.role === 'CUSTOMER') {
      const customer = await getCustomerByUserId(user.id);
      appointments = customer ? await getCustomerAppointments(customer.id) : [];
    } else {
      // Admin roles
      appointments = await getAllAppointments();
    }

    return reply.send({ success: true, data: appointments });
  });

  // Get appointment by ID - with authorization check
  app.get('/:id', { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const user = (request as any).user;
    const appointment = await getAppointmentById(id);

    if (!appointment) {
      return reply.code(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Appointment not found' } });
    }

    // Authorization check
    const isAdmin = ['SUPER_ADMIN', 'FINANCE_ADMIN', 'SUPPORT_ADMIN', 'CONTENT_ADMIN', 'ANALYST'].includes(user.role);

    if (!isAdmin) {
      if (user.role === 'PROVIDER') {
        const provider = await getProviderByUserId(user.id);
        if (!provider || appointment.provider_id !== provider.id) {
          return reply.code(403).send({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } });
        }
      } else if (user.role === 'CUSTOMER') {
        const customer = await getCustomerByUserId(user.id);
        if (!customer || appointment.customer_id !== customer.id) {
          return reply.code(403).send({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } });
        }
      }
    }

    return reply.send({ success: true, data: appointment });
  });

  // Create appointment - customer only
  app.post('/', { preHandler: [app.authenticate, app.requireRole('CUSTOMER')] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as { providerId: string; serviceId: string; startAt: string; notes?: string };
    const user = (request as any).user;

    // Validate required fields
    if (!body.providerId || !body.serviceId || !body.startAt) {
      return reply.code(400).send({
        success: false,
        error: { code: 'MISSING_FIELDS', message: 'providerId, serviceId, and startAt are required' }
      });
    }

    const appointment = await createAppointment({
      userId: user.id,
      providerId: body.providerId,
      serviceId: body.serviceId,
      startAt: body.startAt,
      notes: body.notes,
    });

    await createAuditLog({
      userId: user.id,
      userName: `${user.first_name || ''} ${user.last_name || ''}`,
      action: 'BOOKING_CREATED',
      entity: 'Appointment',
      entityId: appointment.id,
      newValue: { providerId: body.providerId, serviceId: body.serviceId, startAt: body.startAt },
      ip: request.ip,
      userAgent: request.headers['user-agent'],
    });

    // Notify provider (use provider.user_id, not provider.id)
    const provider = await queryOne('SELECT user_id FROM providers WHERE id = $1', [body.providerId]);
    if (provider) {
      await createNotification({
        userId: provider.user_id,
        type: 'BOOKING_CREATED',
        title: 'Новая запись',
        message: `Создана новая запись на ${body.startAt}`,
      });
    }

    return reply.code(201).send({ success: true, data: appointment });
  });

  // Confirm appointment - provider only
  app.post('/:id/confirm', { preHandler: [app.authenticate, app.requireRole('PROVIDER')] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const user = (request as any).user;

    const appointment = await getAppointmentById(id);
    if (!appointment) {
      return reply.code(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Appointment not found' } });
    }

    // Check ownership
    const provider = await getProviderByUserId(user.id);
    if (!provider || appointment.provider_id !== provider.id) {
      return reply.code(403).send({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } });
    }

    const updated = await updateAppointmentStatus(id, 'CONFIRMED');

    // Notify customer
    const customer = await queryOne('SELECT user_id FROM customers WHERE id = $1', [appointment.customer_id]);
    if (customer) {
      await createNotification({
        userId: customer.user_id,
        type: 'BOOKING_CONFIRMED',
        title: 'Запись подтверждена',
        message: 'Ваша запись подтверждена мастером',
      });
    }

    return reply.send({ success: true, data: updated });
  });

  // Cancel appointment - customer or provider
  app.post('/:id/cancel', { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const user = (request as any).user;

    const appointment = await getAppointmentById(id);
    if (!appointment) {
      return reply.code(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Appointment not found' } });
    }

    // Authorization check
    let canCancel = false;

    if (user.role === 'CUSTOMER') {
      const customer = await getCustomerByUserId(user.id);
      canCancel = customer && appointment.customer_id === customer.id;
    } else if (user.role === 'PROVIDER') {
      const provider = await getProviderByUserId(user.id);
      canCancel = provider && appointment.provider_id === provider.id;
    } else if (['SUPER_ADMIN', 'SUPPORT_ADMIN'].includes(user.role)) {
      canCancel = true;
    }

    if (!canCancel) {
      return reply.code(403).send({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } });
    }

    const updated = await updateAppointmentStatus(id, 'CANCELLED');

    await createAuditLog({
      userId: user.id,
      userName: `${user.first_name || ''} ${user.last_name || ''}`,
      action: 'BOOKING_CANCELLED',
      entity: 'Appointment',
      entityId: id,
      ip: request.ip,
      userAgent: request.headers['user-agent'],
    });

    // Notify other party
    if (user.role === 'CUSTOMER') {
      const provider = await queryOne('SELECT user_id FROM providers WHERE id = $1', [appointment.provider_id]);
      if (provider) {
        await createNotification({
          userId: provider.user_id,
          type: 'BOOKING_CANCELLED',
          title: 'Запись отменена',
          message: 'Клиент отменил запись',
        });
      }
    } else if (user.role === 'PROVIDER') {
      const customer = await queryOne('SELECT user_id FROM customers WHERE id = $1', [appointment.customer_id]);
      if (customer) {
        await createNotification({
          userId: customer.user_id,
          type: 'BOOKING_CANCELLED',
          title: 'Запись отменена',
          message: 'Мастер отменил запись',
        });
      }
    }

    return reply.send({ success: true, data: updated });
  });

  // Complete appointment - provider only
  app.post('/:id/complete', { preHandler: [app.authenticate, app.requireRole('PROVIDER')] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const user = (request as any).user;

    const appointment = await getAppointmentById(id);
    if (!appointment) {
      return reply.code(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Appointment not found' } });
    }

    // Check ownership
    const provider = await getProviderByUserId(user.id);
    if (!provider || appointment.provider_id !== provider.id) {
      return reply.code(403).send({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } });
    }

    const updated = await updateAppointmentStatus(id, 'COMPLETED');
    return reply.send({ success: true, data: updated });
  });
}
