import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { createUser, findUserByEmail, verifyPassword } from '../services/users.js';
import { createAuditLog } from '../services/audit.js';
import { config } from '../config/index.js';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function authRoutes(app: FastifyInstance) {
  // Register
  app.post('/register', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = registerSchema.parse(request.body);

    const existing = await findUserByEmail(body.email);
    if (existing) {
      return reply.code(400).send({ success: false, error: { code: 'EMAIL_EXISTS', message: 'Email already registered' } });
    }

    const user = await createUser({
      email: body.email,
      password: body.password,
      firstName: body.firstName,
      lastName: body.lastName,
      phone: body.phone,
    });

    await createAuditLog({
      userId: user.id,
      userName: `${user.first_name} ${user.last_name}`,
      action: 'USER_REGISTERED',
      entity: 'User',
      entityId: user.id,
      ip: request.ip,
      userAgent: request.headers['user-agent'],
    });

    const token = app.jwt.sign({ id: user.id, email: user.email, role: user.role }, { expiresIn: config.jwt.accessTtl });

    return reply.send({
      success: true,
      data: {
        token,
        user: { id: user.id, email: user.email, firstName: user.first_name, lastName: user.last_name, role: user.role },
      },
    });
  });

  // Login
  app.post('/login', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = loginSchema.parse(request.body);

    const user = await findUserByEmail(body.email);
    if (!user) {
      return reply.code(401).send({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } });
    }

    const valid = await verifyPassword(body.password, user.password_hash);
    if (!valid) {
      return reply.code(401).send({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } });
    }

    if (user.status !== 'ACTIVE') {
      return reply.code(403).send({ success: false, error: { code: 'ACCOUNT_BLOCKED', message: 'Account is blocked' } });
    }

    const token = app.jwt.sign({ id: user.id, email: user.email, role: user.role }, { expiresIn: config.jwt.accessTtl });

    await createAuditLog({
      userId: user.id,
      userName: `${user.first_name} ${user.last_name}`,
      action: 'LOGIN',
      entity: 'Auth',
      entityId: user.id,
      ip: request.ip,
      userAgent: request.headers['user-agent'],
    });

    return reply.send({
      success: true,
      data: {
        token,
        user: { id: user.id, email: user.email, firstName: user.first_name, lastName: user.last_name, role: user.role, phone: user.phone, avatar: user.avatar },
      },
    });
  });

  // Me
  app.get('/me', { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user;
    return reply.send({ success: true, data: user });
  });

  // Logout
  app.post('/logout', { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user;
    await createAuditLog({
      userId: user.id,
      userName: `${user.first_name || ''} ${user.last_name || ''}`,
      action: 'LOGOUT',
      entity: 'Auth',
      entityId: user.id,
      ip: request.ip,
      userAgent: request.headers['user-agent'],
    });
    return reply.send({ success: true, data: { message: 'Logged out' } });
  });
}
