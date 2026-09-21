import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getAllUsers, findUserById, updateUser } from '../services/users.js';
import { createAuditLog } from '../services/audit.js';

export async function usersRoutes(app: FastifyInstance) {
  // Get all users (admin only)
  app.get('/', { preHandler: [app.authenticate, app.requireRole('SUPER_ADMIN', 'FINANCE_ADMIN', 'SUPPORT_ADMIN')] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const users = await getAllUsers();
      return reply.send({ success: true, data: users.map(u => ({ ...u, password_hash: undefined })) });
    }
  );

  // Get user by ID
  app.get('/:id', { preHandler: [app.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string };
      const user = await findUserById(id);
      if (!user) return reply.code(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });
      return reply.send({ success: true, data: { ...user, password_hash: undefined } });
    }
  );

  // Update user
  app.patch('/:id', { preHandler: [app.authenticate, app.requireRole('SUPER_ADMIN', 'SUPPORT_ADMIN')] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string };
      const body = request.body as any;
      const currentUser = (request as any).user;

      const user = await updateUser(id, {
        firstName: body.firstName,
        lastName: body.lastName,
        phone: body.phone,
        avatar: body.avatar,
        role: body.role,
        status: body.status,
      });

      if (!user) return reply.code(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });

      await createAuditLog({
        userId: currentUser.id,
        userName: `${currentUser.first_name || ''} ${currentUser.last_name || ''}`,
        action: 'USER_UPDATED',
        entity: 'User',
        entityId: id,
        newValue: body,
        ip: request.ip,
        userAgent: request.headers['user-agent'],
      });

      return reply.send({ success: true, data: { ...user, password_hash: undefined } });
    }
  );
}
