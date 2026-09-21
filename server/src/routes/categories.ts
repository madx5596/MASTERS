import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import {
  getAllCategories,
  getCategoryTree,
  getCategoryById,
  getCategoryBySlug,
  getCategoryChildren,
  createCategory,
  updateCategory,
  moveCategory,
  deleteCategory,
  archiveCategory,
  getCategoryPath,
  searchCategories,
  getRootCategories,
  assignProviderToCategory,
  removeProviderFromCategory,
  getProviderCategories
} from '../services/categories.js';
import { createAuditLog } from '../services/audit.js';

export async function categoriesRoutes(app: FastifyInstance) {
  // Get all categories (flat list)
  app.get('/', { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const categories = await getAllCategories();
    return reply.send({ success: true, data: categories });
  });

  // Get category tree (hierarchical)
  app.get('/tree', { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const tree = await getCategoryTree();
    return reply.send({ success: true, data: tree });
  });

  // Get root categories
  app.get('/roots', { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const roots = await getRootCategories();
    return reply.send({ success: true, data: roots });
  });

  // Search categories
  app.get('/search', { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { q } = request.query as { q: string };
    if (!q) {
      return reply.code(400).send({ success: false, error: { code: 'MISSING_QUERY', message: 'Query parameter "q" is required' } });
    }
    const results = await searchCategories(q);
    return reply.send({ success: true, data: results });
  });

  // Get category by slug
  app.get('/slug/:slug', { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { slug } = request.params as { slug: string };
    const category = await getCategoryBySlug(slug);
    if (!category) {
      return reply.code(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Category not found' } });
    }
    return reply.send({ success: true, data: category });
  });

  // Get category by ID
  app.get('/:id', { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const category = await getCategoryById(id);
    if (!category) {
      return reply.code(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Category not found' } });
    }
    return reply.send({ success: true, data: category });
  });

  // Get category children
  app.get('/:id/children', { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const children = await getCategoryChildren(id);
    return reply.send({ success: true, data: children });
  });

  // Get category path (breadcrumbs)
  app.get('/:id/path', { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const path = await getCategoryPath(id);
    return reply.send({ success: true, data: path });
  });

  // Create category
  app.post('/', { preHandler: [app.authenticate, app.requireRole('SUPER_ADMIN', 'CONTENT_ADMIN')] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const body = request.body as any;
      const user = (request as any).user;

      if (!body.name) {
        return reply.code(400).send({ success: false, error: { code: 'MISSING_NAME', message: 'Category name is required' } });
      }

      try {
        const category = await createCategory({
          parentId: body.parentId,
          name: body.name,
          slug: body.slug,
          description: body.description,
          icon: body.icon,
          image: body.image,
          sortOrder: body.sortOrder
        });

        await createAuditLog({
          userId: user.id,
          userName: `${user.first_name} ${user.last_name}`,
          action: 'CATEGORY_CREATED',
          entity: 'Category',
          entityId: category.id,
          newValue: category,
          ip: request.ip,
          userAgent: request.headers['user-agent']
        });

        return reply.code(201).send({ success: true, data: category });
      } catch (error: any) {
        return reply.code(400).send({ success: false, error: { code: 'CREATION_FAILED', message: error.message } });
      }
    }
  );

  // Update category
  app.patch('/:id', { preHandler: [app.authenticate, app.requireRole('SUPER_ADMIN', 'CONTENT_ADMIN')] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string };
      const body = request.body as any;
      const user = (request as any).user;

      const oldCategory = await getCategoryById(id);
      if (!oldCategory) {
        return reply.code(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Category not found' } });
      }

      const category = await updateCategory(id, body);
      if (!category) {
        return reply.code(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Category not found' } });
      }

      await createAuditLog({
        userId: user.id,
        userName: `${user.first_name} ${user.last_name}`,
        action: 'CATEGORY_UPDATED',
        entity: 'Category',
        entityId: id,
        oldValue: oldCategory,
        newValue: category,
        ip: request.ip,
        userAgent: request.headers['user-agent']
      });

      return reply.send({ success: true, data: category });
    }
  );

  // Move category
  app.patch('/:id/move', { preHandler: [app.authenticate, app.requireRole('SUPER_ADMIN', 'CONTENT_ADMIN')] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string };
      const { parentId } = request.body as { parentId: string | null };
      const user = (request as any).user;

      const oldCategory = await getCategoryById(id);
      if (!oldCategory) {
        return reply.code(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Category not found' } });
      }

      try {
        const category = await moveCategory(id, parentId);
        if (!category) {
          return reply.code(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Category not found' } });
        }

        await createAuditLog({
          userId: user.id,
          userName: `${user.first_name} ${user.last_name}`,
          action: 'CATEGORY_MOVED',
          entity: 'Category',
          entityId: id,
          oldValue: { parentId: oldCategory.parentId },
          newValue: { parentId: category.parentId },
          ip: request.ip,
          userAgent: request.headers['user-agent']
        });

        return reply.send({ success: true, data: category });
      } catch (error: any) {
        return reply.code(400).send({ success: false, error: { code: 'MOVE_FAILED', message: error.message } });
      }
    }
  );

  // Archive category
  app.patch('/:id/archive', { preHandler: [app.authenticate, app.requireRole('SUPER_ADMIN', 'CONTENT_ADMIN')] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string };
      const user = (request as any).user;

      const category = await archiveCategory(id);
      if (!category) {
        return reply.code(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Category not found' } });
      }

      await createAuditLog({
        userId: user.id,
        userName: `${user.first_name} ${user.last_name}`,
        action: 'CATEGORY_ARCHIVED',
        entity: 'Category',
        entityId: id,
        ip: request.ip,
        userAgent: request.headers['user-agent']
      });

      return reply.send({ success: true, data: category });
    }
  );

  // Delete category
  app.delete('/:id', { preHandler: [app.authenticate, app.requireRole('SUPER_ADMIN')] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string };
      const user = (request as any).user;

      try {
        const deleted = await deleteCategory(id);
        if (!deleted) {
          return reply.code(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Category not found' } });
        }

        await createAuditLog({
          userId: user.id,
          userName: `${user.first_name} ${user.last_name}`,
          action: 'CATEGORY_DELETED',
          entity: 'Category',
          entityId: id,
          ip: request.ip,
          userAgent: request.headers['user-agent']
        });

        return reply.send({ success: true, data: { message: 'Category deleted' } });
      } catch (error: any) {
        return reply.code(400).send({ success: false, error: { code: 'DELETION_FAILED', message: error.message } });
      }
    }
  );

  // Assign provider to category
  app.post('/:id/providers/:providerId', { preHandler: [app.authenticate, app.requireRole('SUPER_ADMIN', 'CONTENT_ADMIN')] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id, providerId } = request.params as { id: string; providerId: string };

      await assignProviderToCategory(providerId, id);
      return reply.send({ success: true, data: { message: 'Provider assigned to category' } });
    }
  );

  // Remove provider from category
  app.delete('/:id/providers/:providerId', { preHandler: [app.authenticate, app.requireRole('SUPER_ADMIN', 'CONTENT_ADMIN')] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id, providerId } = request.params as { id: string; providerId: string };

      await removeProviderFromCategory(providerId, id);
      return reply.send({ success: true, data: { message: 'Provider removed from category' } });
    }
  );

  // Get provider categories
  app.get('/providers/:providerId/categories', { preHandler: [app.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { providerId } = request.params as { providerId: string };
      const categories = await getProviderCategories(providerId);
      return reply.send({ success: true, data: categories });
    }
  );
}
