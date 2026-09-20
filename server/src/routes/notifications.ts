import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getUserNotifications, markNotificationRead, markAllNotificationsRead } from '../services/notifications.js';

export async function notificationsRoutes(app: FastifyInstance) {
  app.get('/', { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user;
    const notifications = await getUserNotifications(user.id);
    return reply.send({ success: true, data: notifications });
  });

  app.post('/:id/read', { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const user = (request as any).user;
    await markNotificationRead(id, user.id);
    return reply.send({ success: true });
  });

  app.post('/read-all', { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user;
    await markAllNotificationsRead(user.id);
    return reply.send({ success: true });
  });
}
