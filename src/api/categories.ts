import api from './client';
import type { Category, CategoryTreeNode } from '../types';

export const categoriesApi = {
  // Get all categories (flat list)
  getAll: () => api.get<Category[]>('/api/categories'),

  // Get category tree (hierarchical)
  getTree: () => api.get<CategoryTreeNode[]>('/api/categories/tree'),

  // Get root categories
  getRoots: () => api.get<Category[]>('/api/categories/roots'),

  // Search categories
  search: (query: string) => api.get<Category[]>(`/api/categories/search?q=${encodeURIComponent(query)}`),

  // Get category by ID
  getById: (id: string) => api.get<Category>(`/api/categories/${id}`),

  // Get category by slug
  getBySlug: (slug: string) => api.get<Category>(`/api/categories/slug/${slug}`),

  // Get category children
  getChildren: (id: string) => api.get<Category[]>(`/api/categories/${id}/children`),

  // Get category path (breadcrumbs)
  getPath: (id: string) => api.get<Category[]>(`/api/categories/${id}/path`),

  // Create category
  create: (data: {
    parentId?: string | null;
    name: string;
    slug?: string;
    description?: string;
    icon?: string;
    image?: string;
    sortOrder?: number;
  }) => api.post<Category>('/api/categories', data),

  // Update category
  update: (id: string, data: {
    name?: string;
    slug?: string;
    description?: string;
    icon?: string;
    image?: string;
    sortOrder?: number;
    status?: 'ACTIVE' | 'HIDDEN' | 'ARCHIVED';
    isVisible?: boolean;
  }) => api.patch<Category>(`/api/categories/${id}`, data),

  // Move category
  move: (id: string, parentId: string | null) => 
    api.patch<Category>(`/api/categories/${id}/move`, { parentId }),

  // Archive category
  archive: (id: string) => api.patch<Category>(`/api/categories/${id}/archive`),

  // Delete category
  delete: (id: string) => api.delete<{ message: string }>(`/api/categories/${id}`),

  // Assign provider to category
  assignProvider: (categoryId: string, providerId: string) => 
    api.post<{ message: string }>(`/api/categories/${categoryId}/providers/${providerId}`),

  // Remove provider from category
  removeProvider: (categoryId: string, providerId: string) => 
    api.delete<{ message: string }>(`/api/categories/${categoryId}/providers/${providerId}`),

  // Get provider categories
  getProviderCategories: (providerId: string) => 
    api.get<Category[]>(`/api/categories/providers/${providerId}/categories`),
};
