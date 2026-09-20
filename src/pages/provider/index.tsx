import React, { useState } from 'react';
import { useDataStore, useAuthStore } from '../../store';
import { Card, Button, Badge, Avatar, StatCard, Modal, Tabs, Table, EmptyState } from '../../components/ui';
import { formatCurrency, formatTime, formatDate, formatDateTime, getTransactionTypeLabel, getTransactionTypeColor } from '../../utils/format';
import type { PremiumSubscription } from '../../types';
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
  const { services } = useDataStore();
  const provider = useCurrentProvider();
  const [showAddModal, setShowAddModal] = useState(false);
  const providerServices = services.filter(s => s.providerId === provider?.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Услуги</h1>
        <Button onClick={() => setShowAddModal(true)}>+ Добавить услугу</Button>
      </div>

      <div className="space-y-3">
        {providerServices.map(service => (
          <Card key={service.id} className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{service.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{service.description}</p>
                <p className="text-xs text-gray-400 mt-1">⏱ {service.duration} мин</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">{formatCurrency(service.price)}</p>
                <Badge status={service.status} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Добавить услугу">
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Название</label>
            <input className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Название услуги" />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Описание</label>
            <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Описание" rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Цена (₽)</label>
              <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="1500" />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Длительность (мин)</label>
              <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="60" />
            </div>
          </div>
          <Button className="w-full" onClick={() => setShowAddModal(false)}>Сохранить</Button>
        </div>
      </Modal>
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
  const [activeTab, setActiveTab] = useState('profile');
  
  const wallet = wallets.find(w => w.ownerId === 'prov-1');
  const walletTransactions = transactions.filter(t => t.walletId === 'wallet-1');
  const providerPromotions = promotions.filter(p => p.providerId === 'prov-1');
  const providerAds = advertisements.filter(a => a.providerId === 'prov-1');
  const providerPremium = premiumSubscriptions.find((p: PremiumSubscription) => p.providerId === 'prov-1');

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
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Продвижение</h3>
            <Button>Создать продвижение</Button>
          </div>
          
          {providerPromotions.length === 0 ? (
            <EmptyState icon="🚀" title="Нет продвижений" description="Создайте продвижение для увеличения видимости" />
          ) : (
            providerPromotions.map(promo => (
              <Card key={promo.id} className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900">{promo.type === 'TOP_LISTING' ? 'Топ размещение' : promo.type}</h4>
                    <p className="text-sm text-gray-500">{formatDate(promo.startsAt)} — {formatDate(promo.endsAt)}</p>
                  </div>
                  <div className="text-right">
                    <Badge status={promo.status} />
                    <p className="text-sm text-gray-500 mt-1">Потрачено: {formatCurrency(promo.spent)} из {formatCurrency(promo.budget)}</p>
                  </div>
                </div>
                <div className="mt-3 w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-violet-500 h-2 rounded-full" style={{ width: `${(promo.spent / promo.budget) * 100}%` }}></div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Ads Tab */}
      {activeTab === 'ads' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Реклама</h3>
            <Button>Создать рекламу</Button>
          </div>
          
          {providerAds.length === 0 ? (
            <EmptyState icon="📢" title="Нет рекламных кампаний" />
          ) : (
            providerAds.map(ad => (
              <Card key={ad.id} className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900">{ad.title}</h4>
                    <p className="text-sm text-gray-500">{ad.description}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatDate(ad.startsAt)} — {formatDate(ad.endsAt)}</p>
                  </div>
                  <div className="text-right">
                    <Badge status={ad.status} />
                    <p className="text-sm text-gray-500 mt-1">{formatCurrency(ad.spent)} / {formatCurrency(ad.budget)}</p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
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

// ============ PROVIDER MESSAGES ============
export function ProviderMessages() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Сообщения</h1>
      <ChatPage />
    </div>
  );
}
