import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getAllWallets, getWalletByOwner, getWalletById, getTransactions, getAllTransactions, createWallet } from '../services/wallets.js';
import { transaction } from '../db/pool.js';
import { createAuditLog } from '../services/audit.js';
import { queryOne } from '../db/pool.js';

export async function walletsRoutes(app: FastifyInstance) {
  // Get all wallets (admin)
  app.get('/', { preHandler: [app.authenticate, app.requireRole('SUPER_ADMIN', 'FINANCE_ADMIN')] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const wallets = await getAllWallets();
      return reply.send({ success: true, data: wallets });
    }
  );

  // Get my wallet (provider)
  app.get('/me', { preHandler: [app.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const user = (request as any).user;
      const provider = await queryOne('SELECT id FROM providers WHERE user_id = $1', [user.id]);
      if (!provider) return reply.code(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Provider profile not found' } });
      const wallet = await getWalletByOwner(provider.id);
      if (!wallet) return reply.code(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Wallet not found' } });
      return reply.send({ success: true, data: wallet });
    }
  );

  // Get wallet by ID
  app.get('/:id', { preHandler: [app.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string };
      const wallet = await getWalletById(id);
      if (!wallet) return reply.code(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Wallet not found' } });
      return reply.send({ success: true, data: wallet });
    }
  );

  // Get wallet transactions
  app.get('/:id/transactions', { preHandler: [app.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string };
      const txs = await getTransactions(id);
      return reply.send({ success: true, data: txs });
    }
  );

  // Admin: manual wallet adjustment
  app.post('/:id/adjust', { preHandler: [app.authenticate, app.requireRole('SUPER_ADMIN', 'FINANCE_ADMIN')] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string };
      const body = request.body as { amount: number; type: 'credit' | 'debit'; description: string };
      const user = (request as any).user;

      if (!body.amount || body.amount <= 0) {
        return reply.code(400).send({ success: false, error: { code: 'INVALID_AMOUNT', message: 'Amount must be positive' } });
      }

      const wallet = await getWalletById(id);
      if (!wallet) return reply.code(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Wallet not found' } });

      const { creditWallet, debitWallet } = await import('../services/wallets.js');

      const tx = await transaction(async (client) => {
        if (body.type === 'credit') {
          return creditWallet(client, id, body.amount, 'ADJUSTMENT', body.description || 'Admin adjustment', `adj_${Date.now()}`, null, user.id);
        } else {
          return debitWallet(client, id, body.amount, 'ADJUSTMENT', body.description || 'Admin adjustment', `adj_${Date.now()}`, user.id);
        }
      });

      await createAuditLog({
        userId: user.id,
        userName: `${user.first_name || ''} ${user.last_name || ''}`,
        action: 'WALLET_ADJUSTMENT',
        entity: 'Wallet',
        entityId: id,
        newValue: { amount: body.amount, type: body.type, description: body.description },
        ip: request.ip,
        userAgent: request.headers['user-agent'],
      });

      return reply.send({ success: true, data: tx });
    }
  );

  // Get all transactions (admin)
  app.get('/transactions/all', { preHandler: [app.authenticate, app.requireRole('SUPER_ADMIN', 'FINANCE_ADMIN')] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const txs = await getAllTransactions();
      return reply.send({ success: true, data: txs });
    }
  );
}
