import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getAuditLogs } from '../services/audit.js';

export async function auditRoutes(app: FastifyInstance) {
  app.get('/', { preHandler: [app.authenticate, app.requireRole('SUPER_ADMIN', 'FINANCE_ADMIN')] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { limit } = request.query as any;
      const logs = await getAuditLogs(parseInt(limit || '100', 10));
      return reply.send({ success: true, data: logs });
    }
  );
}
