import Fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';
import { config } from './config/index.js';
import { checkConnection } from './db/pool.js';
import { authRoutes } from './routes/auth.js';
import { usersRoutes } from './routes/users.js';
import { providersRoutes } from './routes/providers.js';
import { customersRoutes } from './routes/customers.js';
import { servicesRoutes } from './routes/services.js';
import { appointmentsRoutes } from './routes/appointments.js';
import { availabilityRoutes } from './routes/availability.js';
import { walletsRoutes } from './routes/wallets.js';
import { paymentsRoutes } from './routes/payments.js';
import { promotionsRoutes } from './routes/promotions.js';
import { notificationsRoutes } from './routes/notifications.js';
import { adminRoutes } from './routes/admin.js';
import { auditRoutes } from './routes/audit.js';

const app = Fastify({
  logger: {
    transport: config.env === 'development' ? { target: 'pino-pretty' } : undefined,
  },
});

// ============ PLUGINS ============
await app.register(cors, {
  origin: config.app.url,
  credentials: true,
});

await app.register(cookie);

await app.register(jwt, {
  secret: config.jwt.secret,
  sign: { expiresIn: config.jwt.accessTtl },
});

await app.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute',
});

// ============ DECORATORS ============
app.decorate('authenticate', async function (request: any, reply: any) {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.code(401).send({ success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } });
  }
});

app.decorate('requireRole', function (...roles: string[]) {
  return async function (request: any, reply: any) {
    const userRole = request.user?.role;
    if (!roles.includes(userRole)) {
      reply.code(403).send({ success: false, error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } });
    }
  };
});

// ============ ROUTES ============
app.get('/health', async () => {
  const dbOk = await checkConnection();
  return {
    status: dbOk ? 'healthy' : 'degraded',
    database: dbOk ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  };
});

await app.register(authRoutes, { prefix: '/api/auth' });
await app.register(usersRoutes, { prefix: '/api/users' });
await app.register(providersRoutes, { prefix: '/api/providers' });
await app.register(customersRoutes, { prefix: '/api/customers' });
await app.register(servicesRoutes, { prefix: '/api/services' });
await app.register(appointmentsRoutes, { prefix: '/api/appointments' });
await app.register(availabilityRoutes, { prefix: '/api/availability' });
await app.register(walletsRoutes, { prefix: '/api/wallets' });
await app.register(paymentsRoutes, { prefix: '/api/payments' });
await app.register(promotionsRoutes, { prefix: '/api/promotions' });
await app.register(notificationsRoutes, { prefix: '/api/notifications' });
await app.register(adminRoutes, { prefix: '/api/admin' });
await app.register(auditRoutes, { prefix: '/api/audit' });

// ============ ERROR HANDLING ============
app.setErrorHandler((error, request, reply) => {
  request.log.error(error);
  const statusCode = error.statusCode ?? 500;
  reply.status(statusCode).send({
    success: false,
    error: {
      code: error.code || 'INTERNAL_ERROR',
      message: error.message || 'Internal server error',
    },
  });
});

// ============ START ============
try {
  await app.listen({ port: config.port, host: config.host });
  console.log(`🚀 Server running on http://${config.host}:${config.port}`);
  console.log(`📋 Environment: ${config.env}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
