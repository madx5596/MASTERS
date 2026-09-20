import React, { useState } from 'react';
import { useDataStore, useAuthStore } from '../../store';
import { Card, Button, Badge, Avatar, StatCard, Modal, Tabs, Table, EmptyState } from '../../components/ui';
import { formatCurrency, formatTime, formatDate, formatDateTime, getTransactionTypeLabel, getTransactionTypeColor } from '../../utils/format';
import type { PremiumSubscription, Service } from '../../types';
import { ChatPage } from '../shared/ChatPage';
import { useCurrentProvider, useCurrentWallet } from '../../hooks/useCurrentUser';

// ============ PROVIDER TODAY ============
export function ProviderToday() {
  const { currentUser } = useAuthStore();
  const dataStore = useDataStore();
  const provider = useCurrentProvider();
  const wallet = useCurrentWallet();
  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = dataStore.appointments.filter(a => 
    a.providerId === provider?.id && a.startAt.startsWith(today)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Сегодня</h1>
          <p className="text-gray-500">{new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Записей сегодня" value={todayAppointments.length} icon="📅" />
        <StatCard title="Подтверждено" value={todayAppointments.filter(a => a.status === 'CONFIRMED').length} icon="✅" />
        <StatCard title="Выручка сегодня" value={formatCurrency(todayAppointments.reduce((s, a) => s + a.price, 0))} icon="💰" />
        <StatCard title="Баланс" value={formatCurrency(wallet?.balance || 0)} icon="💳" />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Записи на сегодня</h2>
        <div className="space-y-3">
          {todayAppointments.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="text-4xl mb-3">🎉</div>
              <p className="text-gray-500">На сегодня записей нет</p>
            </Card>
          ) : (
            todayAppointments.sort((a, b) => a.startAt.localeCompare(b.startAt)).map(apt => (
              <Card key={apt.id} className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-center min-w-[60px]">
                      <p className="text-lg font-bold text-violet-600">{formatTime(apt.startAt)}</p>
                      <p className="text-xs text-gray-400">60 мин</p>
                    </div>
                    <div className="h-12 w-px bg-gray-200"></div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{apt.serviceName}</h3>
                      <p className="text-sm text-gray-500">{apt.customerName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge status={apt.status} />
                    <span className="font-medium text-gray-900">{formatCurrency(apt.price)}</span>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ============ PROVIDER CALENDAR ============
export function ProviderCalendar() {
  const { appointments } = useDataStore();
  const provider = useCurrentProvider();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'day' | 'week'>('week');
  
  const providerAppts = appointments.filter(a => a.providerId === provider?.id);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - d.getDay() + i + 1);
    return d;
  });

  const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Календарь</h1>
        <div className="flex items-center gap-3">
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            <button onClick={() => setView('day')} className={`px-3 py-1.5 rounded text-sm ${view === 'day' ? 'bg-white shadow' : ''}`}>День</button>
            <button onClick={() => setView('week')} className={`px-3 py-1.5 rounded text-sm ${view === 'week' ? 'bg-white shadow' : ''}`}>Неделя</button>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { const d = new Date(currentDate); d.setDate(d.getDate() - 7); setCurrentDate(d); }} className="p-2 hover:bg-gray-100 rounded-lg">←</button>
            <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg">Сегодня</button>
            <button onClick={() => { const d = new Date(currentDate); d.setDate(d.getDate() + 7); setCurrentDate(d); }} className="p-2 hover:bg-gray-100 rounded-lg">→</button>
          </div>
        </div>
      </div>

      {view === 'week' ? (
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day, idx) => {
            const dayStr = day.toISOString().split('T')[0];
            const dayAppts = providerAppts.filter(a => a.startAt.startsWith(dayStr));
            const isToday = dayStr === new Date().toISOString().split('T')[0];
            return (
              <div key={idx} className={`rounded-xl border p-3 min-h-[200px] ${isToday ? 'border-violet-300 bg-violet-50' : 'border-gray-200 bg-white'}`}>
                <div className="text-center mb-3">
                  <p className="text-xs text-gray-500">{dayNames[idx]}</p>
                  <p className={`text-lg font-bold ${isToday ? 'text-violet-600' : 'text-gray-900'}`}>{day.getDate()}</p>
                </div>
                <div className="space-y-1.5">
                  {dayAppts.map(apt => (
                    <div key={apt.id} className="bg-violet-100 rounded-lg p-2 text-xs">
                      <p className="font-medium text-violet-800">{formatTime(apt.startAt)}</p>
                      <p className="text-violet-600 truncate">{apt.customerName}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">{currentDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</h3>
          <div className="space-y-3">
            {providerAppts
              .filter(a => a.startAt.startsWith(currentDate.toISOString().split('T')[0]))
              .sort((a, b) => a.startAt.localeCompare(b.startAt))
              .map(apt => (
                <div key={apt.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <span className="font-mono text-violet-600 font-medium">{formatTime(apt.startAt)}</span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{apt.serviceName}</p>
                    <p className="text-sm text-gray-500">{apt.customerName}</p>
                  </div>
                  <Badge status={apt.status} />
                </div>
              ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// ============ PROVIDER BOOKINGS ============
export function ProviderBookings() {
  const { appointments, updateAppointmentStatus } = useDataStore();
  const provider = useCurrentProvider();
  const [tab, setTab] = useState('all');
  const providerAppts = appointments.filter(a => a.providerId === provider?.id);

  const handleConfirm = (aptId: string) => {
    updateAppointmentStatus(aptId, 'CONFIRMED');
  };

  const handleCancel = (aptId: string) => {
    if (confirm('Отменить запись?')) {
      updateAppointmentStatus(aptId, 'CANCELLED');
    }
  };

  const handleComplete = (aptId: string) => {
    updateAppointmentStatus(aptId, 'COMPLETED');
  };
  
  const filtered = tab === 'all' ? providerAppts :
    tab === 'pending' ? providerAppts.filter(a => a.status === 'PENDING') :
    tab === 'confirmed' ? providerAppts.filter(a => a.status === 'CONFIRMED') :
    tab === 'completed' ? providerAppts.filter(a => a.status === 'COMPLETED') :
    providerAppts.filter(a => a.status === tab.toUpperCase());

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Записи</h1>
      
      <Tabs
        tabs={[
          { id: 'all', label: 'Все', count: providerAppts.length },
          { id: 'pending', label: 'Ожидают', count: providerAppts.filter(a => a.status === 'PENDING').length },
          { id: 'confirmed', label: 'Подтверждено', count: providerAppts.filter(a => a.status === 'CONFIRMED').length },
          { id: 'completed', label: 'Завершено', count: providerAppts.filter(a => a.status === 'COMPLETED').length },
        ]}
        activeTab={tab}
        onChange={setTab}
      />

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <EmptyState icon="📋" title="Нет записей" description="Записи появятся здесь" />
        ) : (
          filtered.map(apt => (
            <Card key={apt.id} className="p-5">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-4">
                  <div className="text-center min-w-[70px]">
                    <p className="text-sm font-bold text-violet-600">{formatTime(apt.startAt)}</p>
                    <p className="text-xs text-gray-400">{formatDate(apt.startAt)}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{apt.serviceName}</h3>
                    <p className="text-sm text-gray-500">{apt.customerName}</p>
                    {apt.notes && <p className="text-xs text-gray-400 mt-1">📝 {apt.notes}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium text-gray-900">{formatCurrency(apt.price)}</span>
                  <Badge status={apt.status} />
                  {apt.status === 'PENDING' && (
                    <div className="flex gap-1">
                      <Button size="sm" variant="primary" onClick={() => handleConfirm(apt.id)}>✓</Button>
                      <Button size="sm" variant="danger" onClick={() => handleCancel(apt.id)}>✕</Button>
                    </div>
                  )}
                  {apt.status === 'CONFIRMED' && (
                    <Button size="sm" variant="secondary" onClick={() => handleComplete(apt.id)}>Завершить</Button>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

// ============ PROVIDER CLIENTS ============
export function ProviderClients() {
  const { appointments } = useDataStore();
  const provider = useCurrentProvider();
  const providerAppts = appointments.filter(a => a.providerId === provider?.id);
  
  const clientMap = new Map<string, { name: string; count: number; totalSpent: number; lastVisit: string }>();
  providerAppts.forEach(apt => {
    const existing = clientMap.get(apt.customerId);
    if (existing) {
      existing.count++;
      existing.totalSpent += apt.price;
      if (apt.startAt > existing.lastVisit) existing.lastVisit = apt.startAt;
    } else {
      clientMap.set(apt.customerId, { name: apt.customerName, count: 1, totalSpent: apt.price, lastVisit: apt.startAt });
    }
  });

  const clients = Array.from(clientMap.entries()).map(([id, data]) => ({ id, ...data }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Клиенты</h1>
      <div className="space-y-3">
        {clients.map(client => (
          <Card key={client.id} className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar name={client.name} />
                <div>
                  <h3 className="font-semibold text-gray-900">{client.name}</h3>
                  <p className="text-sm text-gray-500">Посещений: {client.count} · Последний: {formatDate(client.lastVisit)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900">{formatCurrency(client.totalSpent)}</p>
                <p className="text-xs text-gray-400">Всего потрачено</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ============ PROVIDER SERVICES ============
export function ProviderServices() {
  const { services, addService, updateService, deleteService } = useDataStore();
  const provider = useCurrentProvider();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 1500,
    duration: 60,
    categoryId: 'cat-1',
  });
  const [formError, setFormError] = useState<string | null>(null);
  
  const providerServices = services.filter(s => s.providerId === provider?.id);

  const handleOpenAdd = () => {
    setEditingService(null);
    setFormData({ name: '', description: '', price: 1500, duration: 60, categoryId: 'cat-1' });
    setFormError(null);
    setShowAddModal(true);
  };

  const handleOpenEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || '',
      price: service.price / 100,
      duration: service.duration,
      categoryId: service.categoryId,
    });
    setFormError(null);
    setShowAddModal(true);
  };

  const handleSave = () => {
    if (!provider) return;
    
    // Validation
    if (!formData.name.trim()) {
      setFormError('Введите название услуги');
      return;
    }
    if (formData.price <= 0) {
      setFormError('Цена должна быть больше 0');
      return;
    }
    if (formData.duration <= 0) {
      setFormError('Длительность должна быть больше 0');
      return;
    }

    if (editingService) {
      updateService(editingService.id, {
        name: formData.name,
        description: formData.description,
        price: formData.price * 100,
        duration: formData.duration,
        categoryId: formData.categoryId,
      });
    } else {
      addService({
        organizationId: provider.organizationId,
        providerId: provider.id,
        name: formData.name,
        description: formData.description,
        price: formData.price * 100,
        duration: formData.duration,
        status: 'ACTIVE',
        categoryId: formData.categoryId,
      });
    }
    
    setShowAddModal(false);
    setFormError(null);
  };

  const handleDelete = (id: string) => {
    deleteService(id);
    setShowDeleteConfirm(null);
  };

  const handleToggleStatus = (service: Service) => {
    updateService(service.id, {
      status: service.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Услуги</h1>
        <Button onClick={handleOpenAdd}>+ Добавить услугу</Button>
      </div>

      {providerServices.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-4xl mb-3">📋</div>
          <h3 className="text-lg font-semibold text-gray-900">У вас пока нет услуг</h3>
          <p className="text-gray-500 mt-2">Добавьте первую услугу, чтобы клиенты могли записываться</p>
          <Button className="mt-4" onClick={handleOpenAdd}>Добавить услугу</Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {providerServices.map(service => (
            <Card key={service.id} className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{service.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{service.description}</p>
                  <p className="text-xs text-gray-400 mt-1">⏱ {service.duration} мин</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(service.price)}</p>
                  <Badge status={service.status} />
                </div>
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                <Button size="sm" variant="secondary" onClick={() => handleOpenEdit(service)}>Редактировать</Button>
                <Button size="sm" variant="ghost" onClick={() => handleToggleStatus(service)}>
                  {service.status === 'ACTIVE' ? 'Деактивировать' : 'Активировать'}
                </Button>
                <Button size="sm" variant="danger" onClick={() => setShowDeleteConfirm(service.id)}>Удалить</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
        title={editingService ? 'Редактировать услугу' : 'Добавить услугу'}
      >
        <div className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {formError}
            </div>
          )}
          
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Название *</label>
            <input 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              placeholder="Например: Маникюр классический"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Описание</label>
            <textarea 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              placeholder="Опишите услугу..."
              rows={3}
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Цена (₽) *</label>
              <input 
                type="number" 
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                placeholder="1500"
                value={formData.price}
                onChange={e => setFormData({...formData, price: Number(e.target.value)})}
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Длительность (мин) *</label>
              <input 
                type="number"
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                placeholder="60"
                value={formData.duration}
                onChange={e => setFormData({...formData, duration: Number(e.target.value)})}
              />
            </div>
          </div>
          
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Категория</label>
            <select 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              value={formData.categoryId}
              onChange={e => setFormData({...formData, categoryId: e.target.value})}
            >
              <option value="cat-1">💅 Маникюр</option>
              <option value="cat-2">🦶 Педикюр</option>
              <option value="cat-3">💇 Волосы</option>
              <option value="cat-4">✨ Косметология</option>
              <option value="cat-5">💆 Массаж</option>
              <option value="cat-6">👁 Брови и ресницы</option>
            </select>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowAddModal(false)} className="flex-1">
              Отмена
            </Button>
            <Button onClick={handleSave} className="flex-1">
              {editingService ? 'Сохранить' : 'Создать'}
            </Button>
          </div>
        </div>
      </Modal>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900">Удалить услугу?</h3>
            <p className="text-gray-500 mt-2">Это действие нельзя отменить. Услуга будет удалена навсегда.</p>
            <div className="flex gap-3 mt-6">
              <Button variant="secondary" onClick={() => setShowDeleteConfirm(null)} className="flex-1">
                Отмена
              </Button>
              <Button variant="danger" onClick={() => handleDelete(showDeleteConfirm)} className="flex-1">
                Удалить
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============ PROVIDER SCHEDULE ============
export function ProviderSchedule() {
  const dayNames = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
  const schedule = [
    { day: 1, name: 'Понедельник', start: '09:00', end: '18:00', active: true },
    { day: 2, name: 'Вторник', start: '09:00', end: '18:00', active: true },
    { day: 3, name: 'Среда', start: '09:00', end: '18:00', active: true },
    { day: 4, name: 'Четверг', start: '09:00', end: '18:00', active: true },
    { day: 5, name: 'Пятница', start: '09:00', end: '18:00', active: true },
    { day: 6, name: 'Суббота', start: '10:00', end: '16:00', active: true },
    { day: 0, name: 'Воскресенье', start: '', end: '', active: false },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Расписание</h1>
      
      <Card className="p-6">
        <div className="space-y-4">
          {schedule.map(day => (
            <div key={day.day} className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0">
              <div className="w-8">
                <input type="checkbox" checked={day.active} readOnly className="w-4 h-4 text-violet-600 rounded" />
              </div>
              <span className={`w-32 font-medium ${day.active ? 'text-gray-900' : 'text-gray-400'}`}>{day.name}</span>
              {day.active ? (
                <div className="flex items-center gap-2">
                  <input type="time" defaultValue={day.start} className="px-2 py-1 border border-gray-300 rounded text-sm" />
                  <span className="text-gray-400">—</span>
                  <input type="time" defaultValue={day.end} className="px-2 py-1 border border-gray-300 rounded text-sm" />
                </div>
              ) : (
                <span className="text-sm text-gray-400">Выходной</span>
              )}
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Интервал записи</h3>
        <select className="px-3 py-2 border border-gray-300 rounded-lg">
          <option>30 минут</option>
          <option>60 минут</option>
          <option>90 минут</option>
        </select>
      </Card>

      <Button className="w-full sm:w-auto" onClick={() => alert('Расписание сохранено (демо)')}>Сохранить расписание</Button>
    </div>
  );
}

// ============ PROVIDER ANALYTICS ============
export function ProviderAnalytics() {
  const { appointments } = useDataStore();
  const providerAppts = appointments.filter(a => a.providerId === 'prov-1');
  const completedAppts = providerAppts.filter(a => a.status === 'COMPLETED');
  const totalRevenue = completedAppts.reduce((s, a) => s + a.price, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Аналитика</h1>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Всего записей" value={providerAppts.length} icon="📅" />
        <StatCard title="Завершено" value={completedAppts.length} icon="✅" />
        <StatCard title="Выручка" value={formatCurrency(totalRevenue)} icon="💰" />
        <StatCard title="Средний чек" value={completedAppts.length > 0 ? formatCurrency(totalRevenue / completedAppts.length) : '0 ₽'} icon="📊" />
      </div>

      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Выручка по месяцам</h3>
        <div className="flex items-end gap-2 h-40">
          {[65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88, 92].map((val, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full bg-violet-200 rounded-t" style={{ height: `${val}%` }}></div>
              <span className="text-xs text-gray-400">{i + 1}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Популярные услуги</h3>
        <div className="space-y-3">
          {['Маникюр + покрытие', 'Маникюр классический', 'Педикюр', 'Дизайн ногтей'].map((name, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-gray-700">{name}</span>
              <div className="flex items-center gap-3">
                <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-violet-500 rounded-full" style={{ width: `${[85, 65, 45, 30][i]}%` }}></div>
                </div>
                <span className="text-sm text-gray-500 w-8">{[42, 28, 15, 8][i]}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ============ PROVIDER PROFILE CENTER ============
export function ProviderProfile() {
  const { currentUser } = useAuthStore();
  const { wallets, transactions, promotions, advertisements, premiumSubscriptions } = useDataStore();
  const provider = useCurrentProvider();
  const wallet = useCurrentWallet();
  const [activeTab, setActiveTab] = useState('profile');
  
  const walletTransactions = transactions.filter(t => t.walletId === wallet?.id);
  const providerPromotions = promotions.filter(p => p.providerId === provider?.id);
  const providerAds = advertisements.filter(a => a.providerId === provider?.id);
  const providerPremium = premiumSubscriptions.find((p: PremiumSubscription) => p.providerId === provider?.id);

  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState(5000);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Профиль</h1>

      <Tabs
        tabs={[
          { id: 'profile', label: 'Профиль' },
          { id: 'finance', label: 'Финансы' },
          { id: 'promotion', label: 'Продвижение' },
          { id: 'ads', label: 'Реклама' },
          { id: 'premium', label: 'Premium' },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <Avatar name={`${currentUser?.firstName} ${currentUser?.lastName}`} size="lg" />
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900">{currentUser?.firstName} {currentUser?.lastName}</h2>
                <p className="text-gray-500">Маникюр · Педикюр · Дизайн ногтей</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-sm text-yellow-500">★ 4.8 (124 отзыва)</span>
                  <Badge status="ACTIVE" />
                  {providerPremium && <span className="text-yellow-500 text-sm">⭐ Premium</span>}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">О себе</h3>
            <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg" rows={4} defaultValue="Мастер маникюра с опытом 5 лет. Работаю с гель-лаком, наращиванием и дизайном ногтей." />
            <Button className="mt-3">Сохранить</Button>
          </Card>
        </div>
      )}

      {/* Finance Tab */}
      {activeTab === 'finance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard title="Баланс" value={formatCurrency(wallet?.balance || 0)} icon="💰" />
            <StatCard title="Пополнено" value={formatCurrency(walletTransactions.filter(t => t.type === 'DEPOSIT').reduce((s, t) => s + t.amount, 0))} icon="📥" />
            <StatCard title="Потрачено" value={formatCurrency(Math.abs(walletTransactions.filter(t => t.type !== 'DEPOSIT').reduce((s, t) => s + t.amount, 0)))} icon="📤" />
          </div>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">История операций</h3>
              <Button onClick={() => setShowTopUpModal(true)}>Пополнить</Button>
            </div>
            <div className="space-y-3">
              {walletTransactions.slice().reverse().map(tx => (
                <div key={tx.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`text-lg ${tx.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {tx.amount > 0 ? '📥' : '📤'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{tx.description}</p>
                      <p className="text-xs text-gray-400">{formatDateTime(tx.createdAt)} · {getTransactionTypeLabel(tx.type)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${getTransactionTypeColor(tx.type)}`}>
                      {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
                    </p>
                    <p className="text-xs text-gray-400">Баланс: {formatCurrency(tx.balanceAfter)}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Modal isOpen={showTopUpModal} onClose={() => setShowTopUpModal(false)} title="Пополнение кошелька">
            <div className="space-y-4">
              <p className="text-gray-500">Текущий баланс: <span className="font-semibold text-gray-900">{formatCurrency(wallet?.balance || 0)}</span></p>
              <div className="grid grid-cols-2 gap-3">
                {[1000, 3000, 5000, 10000].map(amount => (
                  <button
                    key={amount}
                    onClick={() => setTopUpAmount(amount)}
                    className={`p-3 rounded-lg border-2 text-center font-medium transition-colors ${
                      topUpAmount === amount ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {amount.toLocaleString()} ₽
                  </button>
                ))}
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Или введите сумму</label>
                <input type="number" value={topUpAmount} onChange={e => setTopUpAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Сумма пополнения</span>
                  <span className="font-medium">{topUpAmount.toLocaleString()} ₽</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gray-500">Комиссия</span>
                  <span className="font-medium">0 ₽</span>
                </div>
                <div className="flex justify-between text-sm mt-2 pt-2 border-t border-gray-200">
                  <span className="font-medium text-gray-900">Итого</span>
                  <span className="font-bold text-gray-900">{topUpAmount.toLocaleString()} ₽</span>
                </div>
              </div>
              <p className="text-xs text-gray-400">Оплата через ЮKassa. После оплаты баланс будет обновлен автоматически.</p>
              <Button className="w-full" size="lg" onClick={() => setShowTopUpModal(false)}>Оплатить {topUpAmount.toLocaleString()} ₽</Button>
            </div>
          </Modal>
        </div>
      )}

      {/* Promotion Tab */}
      {activeTab === 'promotion' && (
        <PromotionTab 
          promotions={providerPromotions} 
          providerId={provider?.id || ''}
          organizationId={provider?.organizationId || ''}
        />
      )}

      {/* Ads Tab */}
      {activeTab === 'ads' && (
        <AdsTab 
          ads={providerAds} 
          providerId={provider?.id || ''}
          organizationId={provider?.organizationId || ''}
        />
      )}

      {/* Premium Tab */}
      {activeTab === 'premium' && (
        <div className="space-y-6">
          {providerPremium ? (
            <Card className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">⭐</span>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Premium активен</h3>
                  <p className="text-sm text-gray-500">Тариф: {providerPremium.plan}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Начало</p>
                  <p className="font-medium text-gray-900">{formatDate(providerPremium.startsAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Окончание</p>
                  <p className="font-medium text-gray-900">{formatDate(providerPremium.endsAt)}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-yellow-200">
                <p className="text-sm text-gray-600">Стоимость: {formatCurrency(providerPremium.price)} / мес</p>
              </div>
              <div className="flex gap-3 mt-4">
                <Button variant="secondary">Продлить</Button>
                <Button variant="ghost">Отменить подписку</Button>
              </div>
            </Card>
          ) : (
            <Card className="p-6 text-center">
              <div className="text-4xl mb-3">⭐</div>
              <h3 className="text-lg font-semibold text-gray-900">Подключите Premium</h3>
              <p className="text-gray-500 mt-2">Получите больше клиентов с Premium размещением</p>
              <Button className="mt-4">Подключить Premium — 1 500 ₽/мес</Button>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

// ============ PROMOTION TAB ============
function PromotionTab({ promotions, providerId, organizationId }: { promotions: any[]; providerId: string; organizationId: string }) {
  const { addPromotion, updatePromotion } = useDataStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState<{
    type: 'TOP_LISTING' | 'FEATURED' | 'DISCOUNT';
    budget: number;
    durationDays: number;
  }>({
    type: 'TOP_LISTING',
    budget: 3000,
    durationDays: 30,
  });
  const [formError, setFormError] = useState<string | null>(null);

  const handleCreate = () => {
    if (formData.budget < 500) {
      setFormError('Минимальный бюджет 500 ₽');
      return;
    }
    if (formData.durationDays < 1) {
      setFormError('Минимальный срок 1 день');
      return;
    }

    const startsAt = new Date();
    const endsAt = new Date();
    endsAt.setDate(endsAt.getDate() + formData.durationDays);

    const { providers } = useDataStore.getState();
    const provider = providers.find(p => p.id === providerId);
    
    addPromotion({
      organizationId,
      providerId,
      providerName: provider?.displayName || 'Мастер',
      type: formData.type,
      status: 'ACTIVE',
      budget: formData.budget * 100,
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
    });

    setShowCreateModal(false);
    setFormError(null);
    setFormData({ type: 'TOP_LISTING', budget: 3000, durationDays: 30 });
  };

  const handlePause = (id: string, currentStatus: string) => {
    updatePromotion(id, { status: currentStatus === 'PAUSED' ? 'ACTIVE' : 'PAUSED' });
  };

  const handleStop = (id: string) => {
    updatePromotion(id, { status: 'COMPLETED' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Продвижение</h3>
        <Button onClick={() => setShowCreateModal(true)}>Создать продвижение</Button>
      </div>
      
      {promotions.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-4xl mb-3">🚀</div>
          <h3 className="text-lg font-semibold text-gray-900">Нет продвижений</h3>
          <p className="text-gray-500 mt-2">Создайте продвижение для увеличения видимости вашего профиля</p>
          <Button className="mt-4" onClick={() => setShowCreateModal(true)}>Создать продвижение</Button>
        </Card>
      ) : (
        promotions.map(promo => (
          <Card key={promo.id} className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">
                  {promo.type === 'TOP_LISTING' ? '🏆 Топ размещение' : 
                   promo.type === 'FEATURED' ? '⭐ Выделение профиля' : 
                   '🎯 Продвижение услуги'}
                </h4>
                <p className="text-sm text-gray-500 mt-1">
                  {formatDate(promo.startsAt)} — {formatDate(promo.endsAt)}
                </p>
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Потрачено: {formatCurrency(promo.spent)}</span>
                    <span>Бюджет: {formatCurrency(promo.budget)}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div 
                      className="bg-violet-500 h-2 rounded-full transition-all" 
                      style={{ width: `${Math.min((promo.spent / promo.budget) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="ml-4 text-right">
                <Badge status={promo.status} />
              </div>
            </div>
            {(promo.status === 'ACTIVE' || promo.status === 'PAUSED') && (
              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                <Button size="sm" variant="secondary" onClick={() => handlePause(promo.id, promo.status)}>
                  {promo.status === 'PAUSED' ? 'Возобновить' : 'Приостановить'}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleStop(promo.id)}>
                  Завершить
                </Button>
              </div>
            )}
          </Card>
        ))
      )}

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Создать продвижение">
        <div className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {formError}
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Тип продвижения</label>
            <select 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              value={formData.type}
              onChange={e => setFormData({...formData, type: e.target.value as 'TOP_LISTING' | 'FEATURED' | 'DISCOUNT'})}
            >
              <option value="TOP_LISTING">🏆 Топ размещение — ваш профиль в начале списка</option>
              <option value="FEATURED">⭐ Выделение профиля — особая метка</option>
              <option value="DISCOUNT">🎯 Продвижение услуги</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Бюджет (₽)</label>
            <input 
              type="number"
              min="500"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              value={formData.budget}
              onChange={e => setFormData({...formData, budget: Number(e.target.value)})}
            />
            <p className="text-xs text-gray-400">Минимум 500 ₽</p>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Срок (дней)</label>
            <input 
              type="number"
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              value={formData.durationDays}
              onChange={e => setFormData({...formData, durationDays: Number(e.target.value)})}
            />
          </div>

          <div className="bg-violet-50 rounded-lg p-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Бюджет</span>
              <span className="font-medium">{formData.budget.toLocaleString()} ₽</span>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className="text-gray-600">Срок</span>
              <span className="font-medium">{formData.durationDays} дней</span>
            </div>
            <div className="flex justify-between text-sm mt-2 pt-2 border-t border-violet-200">
              <span className="font-medium text-gray-900">Итого</span>
              <span className="font-bold text-violet-700">{formData.budget.toLocaleString()} ₽</span>
            </div>
          </div>

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
    </div>
  );
}

// ============ ADS TAB ============
function AdsTab({ ads, providerId, organizationId }: { ads: any[]; providerId: string; organizationId: string }) {
  const { addAdvertisement, updateAdvertisement } = useDataStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: 1000,
    durationDays: 14,
  });
  const [formError, setFormError] = useState<string | null>(null);

  const handleCreate = () => {
    if (!formData.title.trim()) {
      setFormError('Введите название рекламы');
      return;
    }
    if (formData.budget < 100) {
      setFormError('Минимальный бюджет 100 ₽');
      return;
    }

    const startsAt = new Date();
    const endsAt = new Date();
    endsAt.setDate(endsAt.getDate() + formData.durationDays);

    const { providers } = useDataStore.getState();
    const provider = providers.find(p => p.id === providerId);

    addAdvertisement({
      organizationId,
      providerId,
      providerName: provider?.displayName || 'Мастер',
      title: formData.title,
      description: formData.description,
      status: 'DRAFT',
      budget: formData.budget * 100,
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
    });

    setShowCreateModal(false);
    setFormError(null);
    setFormData({ title: '', description: '', budget: 1000, durationDays: 14 });
  };

  const handleActivate = (id: string) => {
    updateAdvertisement(id, { status: 'ACTIVE' });
  };

  const handlePause = (id: string, currentStatus: string) => {
    updateAdvertisement(id, { status: currentStatus === 'PAUSED' ? 'ACTIVE' : 'PAUSED' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Реклама</h3>
        <Button onClick={() => setShowCreateModal(true)}>Создать рекламу</Button>
      </div>
      
      {ads.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-4xl mb-3">📢</div>
          <h3 className="text-lg font-semibold text-gray-900">Нет рекламных кампаний</h3>
          <p className="text-gray-500 mt-2">Создайте рекламную кампанию для привлечения клиентов</p>
          <Button className="mt-4" onClick={() => setShowCreateModal(true)}>Создать рекламу</Button>
        </Card>
      ) : (
        ads.map(ad => (
          <Card key={ad.id} className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{ad.title}</h4>
                <p className="text-sm text-gray-500 mt-1">{ad.description}</p>
                <p className="text-xs text-gray-400 mt-2">
                  {formatDate(ad.startsAt)} — {formatDate(ad.endsAt)}
                </p>
              </div>
              <div className="ml-4 text-right">
                <Badge status={ad.status} />
                <p className="text-sm text-gray-500 mt-1">
                  {formatCurrency(ad.spent)} / {formatCurrency(ad.budget)}
                </p>
              </div>
            </div>
            {ad.status === 'DRAFT' && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <Button size="sm" onClick={() => handleActivate(ad.id)}>Активировать</Button>
              </div>
            )}
            {(ad.status === 'ACTIVE' || ad.status === 'PAUSED') && (
              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                <Button size="sm" variant="secondary" onClick={() => handlePause(ad.id, ad.status)}>
                  {ad.status === 'PAUSED' ? 'Возобновить' : 'Приостановить'}
                </Button>
              </div>
            )}
          </Card>
        ))
      )}

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Создать рекламу">
        <div className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {formError}
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Название *</label>
            <input 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Например: Весенняя акция -20%"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Описание</label>
            <textarea 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Опишите вашу акцию..."
              rows={3}
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Бюджет (₽)</label>
            <input 
              type="number"
              min="100"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              value={formData.budget}
              onChange={e => setFormData({...formData, budget: Number(e.target.value)})}
            />
            <p className="text-xs text-gray-400">Минимум 100 ₽</p>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Срок (дней)</label>
            <input 
              type="number"
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              value={formData.durationDays}
              onChange={e => setFormData({...formData, durationDays: Number(e.target.value)})}
            />
          </div>

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
    </div>
  );
}

// ============ PROVIDER MESSAGES ============
export function ProviderMessages() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Сообщения</h1>
      <ChatPage />
    </div>
  );
}
