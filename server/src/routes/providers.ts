import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { query, queryOne } from '../db/pool.js';

export async function providersRoutes(app: FastifyInstance) {
  app.get('/', { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const providers = await query('SELECT * FROM providers ORDER BY rating DESC');
    return reply.send({ success: true, data: providers });
  });

  app.get('/:id', { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const provider = await queryOne('SELECT * FROM providers WHERE id = $1', [id]);
    if (!provider) return reply.code(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Provider not found' } });
    return reply.send({ success: true, data: provider });
  });

  app.post('/', { preHandler: [app.authenticate, app.requireRole('SUPER_ADMIN', 'CONTENT_ADMIN')] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const body = request.body as any;
      const provider = await queryOne(
        `INSERT INTO providers (user_id, organization_id, first_name, last_name, display_name, description, specializations)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [body.userId, body.organizationId, body.firstName, body.lastName, body.displayName, body.description, body.specializations || []]
      );
      return reply.code(201).send({ success: true, data: provider });
    }
  );

  app.patch('/:id', { preHandler: [app.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string };
      const body = request.body as any;
      const provider = await queryOne(
        `UPDATE providers SET display_name = COALESCE($1, display_name), description = COALESCE($2, description),
         specializations = COALESCE($3, specializations), updated_at = NOW() WHERE id = $4 RETURNING *`,
        [body.displayName, body.description, body.specializations, id]
      );
      if (!provider) return reply.code(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Provider not found' } });
      return reply.send({ success: true, data: provider });
    }
  );
}
