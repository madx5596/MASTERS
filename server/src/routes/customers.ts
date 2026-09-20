import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { query, queryOne } from '../db/pool.js';

export async function customersRoutes(app: FastifyInstance) {
  app.get('/', { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const customers = await query('SELECT * FROM customers ORDER BY created_at DESC');
    return reply.send({ success: true, data: customers });
  });

  app.get('/:id', { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const customer = await queryOne('SELECT * FROM customers WHERE id = $1', [id]);
    if (!customer) return reply.code(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Customer not found' } });
    return reply.send({ success: true, data: customer });
  });

  app.post('/', { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as any;
    const customer = await queryOne(
      `INSERT INTO customers (user_id, organization_id, first_name, last_name, phone, email)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [body.userId, body.organizationId, body.firstName, body.lastName, body.phone, body.email]
    );
    return reply.code(201).send({ success: true, data: customer });
  });
}
