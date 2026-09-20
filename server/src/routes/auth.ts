import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { createUser, findUserByEmail, verifyPassword, findUserById } from '../services/users.js';
import { createAuditLog } from '../services/audit.js';
import { createRefreshToken, verifyRefreshToken, revokeAllUserTokens } from '../services/refresh-tokens.js';
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

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
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
    const refreshToken = await createRefreshToken(user.id);

    return reply.send({
      success: true,
      data: {
        token,
        refreshToken,
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
    const refreshToken = await createRefreshToken(user.id);

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
        refreshToken,
        user: { id: user.id, email: user.email, firstName: user.first_name, lastName: user.last_name, role: user.role, phone: user.phone, avatar: user.avatar },
      },
    });
  });

  // Refresh token
  app.post('/refresh', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = refreshSchema.parse(request.body);

    const userId = await verifyRefreshToken(body.refreshToken);
    if (!userId) {
      return reply.code(401).send({ success: false, error: { code: 'INVALID_REFRESH_TOKEN', message: 'Invalid or expired refresh token' } });
    }

    const user = await findUserById(userId);
    if (!user || user.status !== 'ACTIVE') {
      return reply.code(401).send({ success: false, error: { code: 'USER_INACTIVE', message: 'User account is not active' } });
    }

    const token = app.jwt.sign({ id: user.id, email: user.email, role: user.role }, { expiresIn: config.jwt.accessTtl });
    const refreshToken = await createRefreshToken(user.id);

    return reply.send({
      success: true,
      data: { token, refreshToken },
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
    
    // Revoke all tokens for this user
    await revokeAllUserTokens(user.id);

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
