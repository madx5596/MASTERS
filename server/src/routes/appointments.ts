import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getAvailability, createAppointment, getAppointmentById, getProviderAppointments, getCustomerAppointments, getAllAppointments, updateAppointmentStatus } from '../services/appointments.js';
import { createAuditLog } from '../services/audit.js';
import { createNotification } from '../services/notifications.js';

export async function appointmentsRoutes(app: FastifyInstance) {
  // Get all appointments
  app.get('/', { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user;
    let appointments;
    if (user.role === 'PROVIDER') {
      const provider = await (await import('../db/pool.js')).queryOne('SELECT id FROM providers WHERE user_id = $1', [user.id]);
      appointments = provider ? await getProviderAppointments(provider.id) : [];
    } else if (user.role === 'CUSTOMER') {
      const customer = await (await import('../db/pool.js')).queryOne('SELECT id FROM customers WHERE user_id = $1', [user.id]);
      appointments = customer ? await getCustomerAppointments(customer.id) : [];
    } else {
      appointments = await getAllAppointments();
    }
    return reply.send({ success: true, data: appointments });
  });

  // Get appointment by ID
  app.get('/:id', { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const appointment = await getAppointmentById(id);
    if (!appointment) return reply.code(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Appointment not found' } });
    return reply.send({ success: true, data: appointment });
  });

  // Create appointment
  app.post('/', { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as any;
    const user = (request as any).user;

    const appointment = await createAppointment({
      organizationId: body.organizationId,
      customerId: body.customerId,
      providerId: body.providerId,
      serviceId: body.serviceId,
      startAt: body.startAt,
      endAt: body.endAt,
      price: body.price,
      notes: body.notes,
    });

    await createAuditLog({
      userId: user.id,
      userName: `${user.first_name || ''} ${user.last_name || ''}`,
      action: 'BOOKING_CREATED',
      entity: 'Appointment',
      entityId: appointment.id,
      newValue: body,
      ip: request.ip,
      userAgent: request.headers['user-agent'],
    });

    // Notify provider
    await createNotification({
      userId: body.providerId,
      type: 'BOOKING_CREATED',
      title: 'Новая запись',
      message: `Создана новая запись на ${body.startAt}`,
    });

    return reply.code(201).send({ success: true, data: appointment });
  });

  // Confirm appointment
  app.post('/:id/confirm', { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const appointment = await updateAppointmentStatus(id, 'CONFIRMED');
    if (!appointment) return reply.code(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Appointment not found' } });
    return reply.send({ success: true, data: appointment });
  });

  // Cancel appointment
  app.post('/:id/cancel', { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const user = (request as any).user;
    const appointment = await updateAppointmentStatus(id, 'CANCELLED');
    if (!appointment) return reply.code(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Appointment not found' } });

    await createAuditLog({
      userId: user.id,
      userName: `${user.first_name || ''} ${user.last_name || ''}`,
      action: 'BOOKING_CANCELLED',
      entity: 'Appointment',
      entityId: id,
      ip: request.ip,
      userAgent: request.headers['user-agent'],
    });

    return reply.send({ success: true, data: appointment });
  });

  // Complete appointment
  app.post('/:id/complete', { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const appointment = await updateAppointmentStatus(id, 'COMPLETED');
    if (!appointment) return reply.code(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Appointment not found' } });
    return reply.send({ success: true, data: appointment });
  });
}
