import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { query, queryOne } from '../db/pool.js';

export async function promotionsRoutes(app: FastifyInstance) {
  app.get('/', { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const promotions = await query('SELECT * FROM promotions ORDER BY created_at DESC');
    return reply.send({ success: true, data: promotions });
  });

  app.post('/', { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as any;
    const promotion = await queryOne(
      `INSERT INTO promotions (organization_id, provider_id, type, status, budget, starts_at, ends_at)
       VALUES ($1, $2, $3, 'DRAFT', $4, $5, $6) RETURNING *`,
      [body.organizationId, body.providerId, body.type, body.budget, body.startsAt, body.endsAt]
    );
    return reply.code(201).send({ success: true, data: promotion });
  });

  app.patch('/:id', { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const body = request.body as any;
    const promotion = await queryOne(
      `UPDATE promotions SET status = COALESCE($1, status), budget = COALESCE($2, budget) WHERE id = $3 RETURNING *`,
      [body.status, body.budget, id]
    );
    if (!promotion) return reply.code(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Not found' } });
    return reply.send({ success: true, data: promotion });
  });
}
