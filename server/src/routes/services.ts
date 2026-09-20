import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { query, queryOne } from '../db/pool.js';

export async function servicesRoutes(app: FastifyInstance) {
  app.get('/', { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { providerId, categoryId, status } = request.query as any;
    let sql = 'SELECT * FROM services WHERE 1=1';
    const params: any[] = [];
    let paramCount = 1;

    if (providerId) { sql += ` AND provider_id = $${paramCount++}`; params.push(providerId); }
    if (categoryId) { sql += ` AND category_id = $${paramCount++}`; params.push(categoryId); }
    if (status) { sql += ` AND status = $${paramCount++}`; params.push(status); }

    sql += ' ORDER BY created_at DESC';
    const services = await query(sql, params);
    return reply.send({ success: true, data: services });
  });

  app.get('/:id', { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const service = await queryOne('SELECT * FROM services WHERE id = $1', [id]);
    if (!service) return reply.code(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Service not found' } });
    return reply.send({ success: true, data: service });
  });

  app.post('/', { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as any;
    const service = await queryOne(
      `INSERT INTO services (organization_id, provider_id, name, description, price, duration, category_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [body.organizationId, body.providerId, body.name, body.description, body.price, body.duration, body.categoryId]
    );
    return reply.code(201).send({ success: true, data: service });
  });

  app.patch('/:id', { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const body = request.body as any;
    const service = await queryOne(
      `UPDATE services SET name = COALESCE($1, name), description = COALESCE($2, description),
       price = COALESCE($3, price), duration = COALESCE($4, duration), status = COALESCE($5, status), updated_at = NOW()
       WHERE id = $6 RETURNING *`,
      [body.name, body.description, body.price, body.duration, body.status, id]
    );
    if (!service) return reply.code(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Service not found' } });
    return reply.send({ success: true, data: service });
  });

  app.delete('/:id', { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    await query(`UPDATE services SET status = 'ARCHIVED', updated_at = NOW() WHERE id = $1`, [id]);
    return reply.send({ success: true, data: { message: 'Service archived' } });
  });
}
