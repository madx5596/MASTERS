import { query, queryOne, transaction } from '../db/pool.js';
import type { Category, CategoryTreeNode } from '../../types/index.js';

/**
 * Get all categories as flat list
 */
export async function getAllCategories(): Promise<Category[]> {
  return query<Category>(
    `SELECT 
      c.*,
      COALESCE(child_count.count, 0) as children_count,
      COALESCE(service_count.count, 0) as services_count,
      COALESCE(provider_count.count, 0) as providers_count
    FROM categories c
    LEFT JOIN (
      SELECT parent_id, COUNT(*) as count 
      FROM categories 
      WHERE status != 'ARCHIVED'
      GROUP BY parent_id
    ) child_count ON c.id = child_count.parent_id
    LEFT JOIN (
      SELECT category_id_new, COUNT(*) as count 
      FROM services 
      WHERE status = 'ACTIVE' AND category_id_new IS NOT NULL
      GROUP BY category_id_new
    ) service_count ON c.id = service_count.category_id_new
    LEFT JOIN (
      SELECT category_id, COUNT(DISTINCT provider_id) as count 
      FROM provider_categories 
      GROUP BY category_id
    ) provider_count ON c.id = provider_count.category_id
    ORDER BY c.sort_order ASC, c.name ASC`
  );
}

/**
 * Get category tree (hierarchical structure)
 */
export async function getCategoryTree(): Promise<CategoryTreeNode[]> {
  const allCategories = await getAllCategories();
  return buildTree(allCategories);
}

/**
 * Build tree from flat list
 */
function buildTree(categories: Category[], parentId: string | null = null, level: number = 0): CategoryTreeNode[] {
  return categories
    .filter(cat => cat.parentId === parentId)
    .map(cat => ({
      category: cat,
      children: buildTree(categories, cat.id, level + 1),
      level
    }));
}

/**
 * Get category by ID
 */
export async function getCategoryById(id: string): Promise<Category | null> {
  return queryOne<Category>('SELECT * FROM categories WHERE id = $1', [id]);
}

/**
 * Get category by slug
 */
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  return queryOne<Category>('SELECT * FROM categories WHERE slug = $1', [slug]);
}

/**
 * Get children of a category
 */
export async function getCategoryChildren(parentId: string): Promise<Category[]> {
  return query<Category>(
    'SELECT * FROM categories WHERE parent_id = $1 ORDER BY sort_order ASC, name ASC',
    [parentId]
  );
}

/**
 * Create new category
 */
export async function createCategory(data: {
  parentId?: string | null;
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  image?: string;
  sortOrder?: number;
}): Promise<Category> {
  // Check for circular reference
  if (data.parentId) {
    const hasCycle = await checkCircularReference(data.parentId, null);
    if (hasCycle) {
      throw new Error('Circular reference detected');
    }
  }

  // Generate slug if not provided
  const slug = data.slug || generateSlug(data.name);

  // Check slug uniqueness
  const existingSlug = await getCategoryBySlug(slug);
  if (existingSlug) {
    throw new Error('Category with this slug already exists');
  }

  const result = await queryOne<Category>(
    `INSERT INTO categories (parent_id, name, slug, description, icon, image, sort_order, status, is_visible)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'ACTIVE', TRUE)
     RETURNING *`,
    [
      data.parentId || null,
      data.name,
      slug,
      data.description || null,
      data.icon || null,
      data.image || null,
      data.sortOrder || 0
    ]
  );

  if (!result) {
    throw new Error('Failed to create category');
  }

  return result;
}

/**
 * Update category
 */
export async function updateCategory(id: string, data: {
  name?: string;
  slug?: string;
  description?: string;
  icon?: string;
  image?: string;
  sortOrder?: number;
  status?: 'ACTIVE' | 'HIDDEN' | 'ARCHIVED';
  isVisible?: boolean;
}): Promise<Category | null> {
  const fields: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (data.name !== undefined) {
    fields.push(`name = $${paramCount++}`);
    values.push(data.name);
  }
  if (data.slug !== undefined) {
    fields.push(`slug = $${paramCount++}`);
    values.push(data.slug);
  }
  if (data.description !== undefined) {
    fields.push(`description = $${paramCount++}`);
    values.push(data.description);
  }
  if (data.icon !== undefined) {
    fields.push(`icon = $${paramCount++}`);
    values.push(data.icon);
  }
  if (data.image !== undefined) {
    fields.push(`image = $${paramCount++}`);
    values.push(data.image);
  }
  if (data.sortOrder !== undefined) {
    fields.push(`sort_order = $${paramCount++}`);
    values.push(data.sortOrder);
  }
  if (data.status !== undefined) {
    fields.push(`status = $${paramCount++}`);
    values.push(data.status);
  }
  if (data.isVisible !== undefined) {
    fields.push(`is_visible = $${paramCount++}`);
    values.push(data.isVisible);
  }

  if (fields.length === 0) {
    return getCategoryById(id);
  }

  fields.push('updated_at = NOW()');
  values.push(id);

  return queryOne<Category>(
    `UPDATE categories SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
    values
  );
}

/**
 * Move category to new parent
 */
export async function moveCategory(id: string, newParentId: string | null): Promise<Category | null> {
  // Check for circular reference
  if (newParentId) {
    const hasCycle = await checkCircularReference(newParentId, id);
    if (hasCycle) {
      throw new Error('Cannot move category: would create circular reference');
    }
  }

  return queryOne<Category>(
    'UPDATE categories SET parent_id = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
    [newParentId, id]
  );
}

/**
 * Delete category (soft delete - archive)
 */
export async function deleteCategory(id: string): Promise<boolean> {
  // Check if category has services
  const servicesCount = await queryOne<{ count: string }>(
    'SELECT COUNT(*) as count FROM services WHERE category_id_new = $1',
    [id]
  );

  if (servicesCount && parseInt(servicesCount.count) > 0) {
    throw new Error(`Cannot delete category: it has ${servicesCount.count} services. Archive it instead.`);
  }

  // Check if category has providers
  const providersCount = await queryOne<{ count: string }>(
    'SELECT COUNT(*) as count FROM provider_categories WHERE category_id = $1',
    [id]
  );

  if (providersCount && parseInt(providersCount.count) > 0) {
    throw new Error(`Cannot delete category: it has ${providersCount.count} providers. Archive it instead.`);
  }

  // Check if category has children
  const childrenCount = await queryOne<{ count: string }>(
    'SELECT COUNT(*) as count FROM categories WHERE parent_id = $1',
    [id]
  );

  if (childrenCount && parseInt(childrenCount.count) > 0) {
    throw new Error(`Cannot delete category: it has ${childrenCount.count} child categories. Archive it instead.`);
  }

  // Hard delete only if no dependencies
  const result = await query('DELETE FROM categories WHERE id = $1', [id]);
  return (result as any).rowCount > 0;
}

/**
 * Archive category (soft delete)
 */
export async function archiveCategory(id: string): Promise<Category | null> {
  return updateCategory(id, { status: 'ARCHIVED' });
}

/**
 * Check for circular reference
 */
async function checkCircularReference(parentId: string, excludeId: string | null): Promise<boolean> {
  let currentId: string | null = parentId;
  const visited = new Set<string>();
  const maxDepth = 100;
  let depth = 0;

  while (currentId && depth < maxDepth) {
    if (excludeId && currentId === excludeId) {
      return true; // Circular reference detected
    }
    if (visited.has(currentId)) {
      return true; // Circular reference detected
    }
    
    visited.add(currentId);
    const parent = await queryOne<{ parent_id: string | null }>(
      'SELECT parent_id FROM categories WHERE id = $1',
      [currentId]
    );
    
    currentId = parent?.parent_id || null;
    depth++;
  }

  return depth >= maxDepth;
}

/**
 * Generate slug from name
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\wа-яё\s-]/g, '')
    .replace(/[\s]+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/**
 * Get category path (breadcrumbs)
 */
export async function getCategoryPath(id: string): Promise<Category[]> {
  const path: Category[] = [];
  let currentId: string | null = id;
  const maxDepth = 100;
  let depth = 0;

  while (currentId && depth < maxDepth) {
    const category = await getCategoryById(currentId);
    if (!category) break;
    
    path.unshift(category);
    currentId = category.parentId;
    depth++;
  }

  return path;
}

/**
 * Search categories by name
 */
export async function searchCategories(query: string): Promise<Category[]> {
  return query<Category>(
    `SELECT * FROM categories 
     WHERE name ILIKE $1 OR description ILIKE $1
     AND status != 'ARCHIVED'
     ORDER BY sort_order ASC, name ASC
     LIMIT 50`,
    [`%${query}%`]
  );
}

/**
 * Get root categories (top level)
 */
export async function getRootCategories(): Promise<Category[]> {
  return query<Category>(
    `SELECT * FROM categories 
     WHERE parent_id IS NULL AND status = 'ACTIVE' AND is_visible = TRUE
     ORDER BY sort_order ASC, name ASC`
  );
}

/**
 * Assign provider to category
 */
export async function assignProviderToCategory(providerId: string, categoryId: string): Promise<void> {
  await query(
    `INSERT INTO provider_categories (provider_id, category_id)
     VALUES ($1, $2)
     ON CONFLICT (provider_id, category_id) DO NOTHING`,
    [providerId, categoryId]
  );
}

/**
 * Remove provider from category
 */
export async function removeProviderFromCategory(providerId: string, categoryId: string): Promise<void> {
  await query(
    'DELETE FROM provider_categories WHERE provider_id = $1 AND category_id = $2',
    [providerId, categoryId]
  );
}

/**
 * Get provider categories
 */
export async function getProviderCategories(providerId: string): Promise<Category[]> {
  return query<Category>(
    `SELECT c.* FROM categories c
     INNER JOIN provider_categories pc ON c.id = pc.category_id
     WHERE pc.provider_id = $1 AND c.status = 'ACTIVE'
     ORDER BY c.sort_order ASC, c.name ASC`,
    [providerId]
  );
}
