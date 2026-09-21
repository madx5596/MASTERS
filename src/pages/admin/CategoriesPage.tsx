import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Modal, Badge, EmptyState } from '../../components/ui';
import { categoriesApi } from '../../api/categories';
import type { Category, CategoryTreeNode } from '../../types';

export function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tree, setTree] = useState<CategoryTreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: '',
    parentId: null as string | null,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [categoriesRes, treeRes] = await Promise.all([
        categoriesApi.getAll(),
        categoriesApi.getTree(),
      ]);

      if (categoriesRes.success && categoriesRes.data) {
        setCategories(categoriesRes.data);
      }
      if (treeRes.success && treeRes.data) {
        setTree(treeRes.data);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleNode = (id: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedNodes(newExpanded);
  };

  const expandAll = () => {
    const allIds = new Set(categories.map(c => c.id));
    setExpandedNodes(allIds);
  };

  const collapseAll = () => {
    setExpandedNodes(new Set());
  };

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      alert('Введите название категории');
      return;
    }

    try {
      const response = await categoriesApi.create({
        name: formData.name,
        slug: formData.slug || undefined,
        description: formData.description || undefined,
        icon: formData.icon || undefined,
        parentId: formData.parentId,
      });

      if (response.success) {
        setShowCreateModal(false);
        setFormData({ name: '', slug: '', description: '', icon: '', parentId: null });
        await loadData();
      } else {
        alert(response.error?.message || 'Не удалось создать категорию');
      }
    } catch (error: any) {
      alert(error.message || 'Не удалось создать категорию');
    }
  };

  const handleUpdate = async () => {
    if (!selectedCategory) return;

    try {
      const response = await categoriesApi.update(selectedCategory.id, {
        name: formData.name,
        slug: formData.slug || undefined,
        description: formData.description || undefined,
        icon: formData.icon || undefined,
      });

      if (response.success) {
        setShowEditModal(false);
        setSelectedCategory(null);
        await loadData();
      } else {
        alert(response.error?.message || 'Не удалось обновить категорию');
      }
    } catch (error: any) {
      alert(error.message || 'Не удалось обновить категорию');
    }
  };

  const handleDelete = async () => {
    if (!selectedCategory) return;

    try {
      const response = await categoriesApi.delete(selectedCategory.id);

      if (response.success) {
        setShowDeleteModal(false);
        setSelectedCategory(null);
        await loadData();
      } else {
        alert(response.error?.message || 'Не удалось удалить категорию');
      }
    } catch (error: any) {
      alert(error.message || 'Не удалось удалить категорию');
    }
  };

  const handleArchive = async (category: Category) => {
    if (!confirm(`Архивировать категорию "${category.name}"?`)) return;

    try {
      const response = await categoriesApi.archive(category.id);
      if (response.success) {
        await loadData();
      } else {
        alert(response.error?.message || 'Не удалось архивировать категорию');
      }
    } catch (error: any) {
      alert(error.message || 'Не удалось архивировать категорию');
    }
  };

  const openEditModal = (category: Category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      icon: category.icon || '',
      parentId: category.parentId,
    });
    setShowEditModal(true);
  };

  const openCreateModal = (parentId: string | null = null) => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      icon: '',
      parentId,
    });
    setShowCreateModal(true);
  };

  const renderTreeNode = (node: CategoryTreeNode) => {
    const isExpanded = expandedNodes.has(node.category.id);
    const hasChildren = node.children.length > 0;

    return (
      <div key={node.category.id} style={{ marginLeft: `${node.level * 20}px` }}>
        <div className="flex items-center gap-2 py-2 px-3 hover:bg-gray-50 rounded-lg group">
          {/* Expand/Collapse button */}
          <button
            onClick={() => hasChildren && toggleNode(node.category.id)}
            className={`w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 ${
              !hasChildren && 'invisible'
            }`}
          >
            {isExpanded ? '▼' : '▶'}
          </button>

          {/* Icon */}
          {node.category.icon && <span className="text-xl">{node.category.icon}</span>}

          {/* Name */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900 truncate">{node.category.name}</span>
              <Badge status={node.category.status} />
            </div>
            <div className="text-xs text-gray-500">
              {node.category.children_count || 0} дочерних ·{' '}
              {node.category.services_count || 0} услуг ·{' '}
              {node.category.providers_count || 0} мастеров
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="sm" variant="ghost" onClick={() => openCreateModal(node.category.id)}>
              +
            </Button>
            <Button size="sm" variant="ghost" onClick={() => openEditModal(node.category)}>
              ✎
            </Button>
            <Button size="sm" variant="ghost" onClick={() => handleArchive(node.category)}>
              📦
            </Button>
            <Button size="sm" variant="ghost" onClick={() => {
              setSelectedCategory(node.category);
              setShowDeleteModal(true);
            }}>
              🗑
            </Button>
          </div>
        </div>

        {/* Children */}
        {isExpanded && hasChildren && (
          <div>
            {node.children.map(child => renderTreeNode(child))}
          </div>
        )}
      </div>
    );
  };

  const filteredTree = searchQuery
    ? tree.filter(node => 
        node.category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.category.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : tree;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Каталог услуг</h1>
          <p className="text-gray-500 mt-1">Управление иерархией категорий услуг</p>
        </div>
        <Button onClick={() => openCreateModal(null)}>+ Добавить сферу</Button>
      </div>

      {/* Controls */}
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <Input
            placeholder="Поиск категорий..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button variant="secondary" onClick={expandAll}>Развернуть все</Button>
          <Button variant="secondary" onClick={collapseAll}>Свернуть все</Button>
        </div>
      </Card>

      {/* Tree */}
      <Card className="p-4">
        {filteredTree.length === 0 ? (
          <EmptyState
            icon="📂"
            title="Нет категорий"
            description="Создайте первую категорию, чтобы начать"
            action={
              <Button onClick={() => openCreateModal(null)}>Создать категорию</Button>
            }
          />
        ) : (
          <div className="space-y-1">
            {filteredTree.map(node => renderTreeNode(node))}
          </div>
        )}
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-sm text-gray-500">Всего категорий</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{categories.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500">Активных</div>
          <div className="text-2xl font-bold text-green-600 mt-1">
            {categories.filter(c => c.status === 'ACTIVE').length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500">Архивных</div>
          <div className="text-2xl font-bold text-gray-400 mt-1">
            {categories.filter(c => c.status === 'ARCHIVED').length}
          </div>
        </Card>
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Создать категорию"
      >
        <div className="space-y-4">
          <Input
            label="Название *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Например: Маникюр"
          />
          <Input
            label="Slug (URL)"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            placeholder="Автоматически из названия"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              rows={3}
              placeholder="Описание категории"
            />
          </div>
          <Input
            label="Иконка (emoji)"
            value={formData.icon}
            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
            placeholder="💅"
          />
          {formData.parentId && (
            <div className="text-sm text-gray-500">
              Родительская категория:{' '}
              <span className="font-medium">
                {categories.find(c => c.id === formData.parentId)?.name}
              </span>
            </div>
          )}
          <div className="flex gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowCreateModal(false)} className="flex-1">
              Отмена
            </Button>
            <Button onClick={handleCreate} className="flex-1">
              Создать
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Редактировать категорию"
      >
        <div className="space-y-4">
          <Input
            label="Название"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Input
            label="Slug"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              rows={3}
            />
          </div>
          <Input
            label="Иконка"
            value={formData.icon}
            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
          />
          <div className="flex gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowEditModal(false)} className="flex-1">
              Отмена
            </Button>
            <Button onClick={handleUpdate} className="flex-1">
              Сохранить
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Удалить категорию?"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Вы уверены, что хотите удалить категорию{' '}
            <strong>{selectedCategory?.name}</strong>?
          </p>
          <p className="text-sm text-red-600">
            Это действие нельзя отменить. Если категория используется, удалите сначала все зависимости.
          </p>
          <div className="flex gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)} className="flex-1">
              Отмена
            </Button>
            <Button variant="danger" onClick={handleDelete} className="flex-1">
              Удалить
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
