import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getAvailability } from '../services/appointments.js';

export async function availabilityRoutes(app: FastifyInstance) {
  app.get('/', { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { providerId, date, duration } = request.query as any;
    if (!providerId || !date || !duration) {
      return reply.code(400).send({ success: false, error: { code: 'MISSING_PARAMS', message: 'providerId, date, and duration are required' } });
    }
    const slots = await getAvailability(providerId, date, parseInt(duration, 10));
    return reply.send({ success: true, data: { slots } });
  });
}
