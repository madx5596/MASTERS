import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDataStore, useAuthStore } from '../../store';
import { Card, Button, Badge, Avatar, Modal, StatCard } from '../../components/ui';
import { formatCurrency, formatTime, formatDate } from '../../utils/format';
import { serviceCategories } from '../../data/mockData';

// ============ CLIENT HOME ============
export function ClientHome() {
  const { providers, services } = useDataStore();
  const topProviders = providers.filter(p => p.isPremium || p.rating >= 4.8);

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="bg-gradient-to-r from-violet-600 to-pink-500 rounded-2xl p-8 text-white">
        <h1 className="text-2xl lg:text-3xl font-bold">Найдите своего мастера</h1>
        <p className="mt-2 text-white/80">Лучшие мастера красоты в Красноярске</p>
        <div className="mt-6 flex gap-3">
          <Link to="/client/search" className="bg-white text-violet-700 px-5 py-2.5 rounded-lg font-medium hover:bg-white/90 transition-colors">
            🔍 Найти мастера
          </Link>
        </div>
      </div>

      {/* Categories */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Категории</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {serviceCategories.map(cat => (
            <Link key={cat.id} to="/client/search" className="bg-white rounded-xl p-4 text-center border border-gray-200 hover:border-violet-300 hover:shadow-md transition-all">
              <div className="text-3xl mb-2">{cat.icon}</div>
              <p className="text-sm font-medium text-gray-700">{cat.name}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Top Masters */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Топ мастера</h2>
          <Link to="/client/masters" className="text-sm text-violet-600 font-medium hover:underline">Все →</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {topProviders.map(provider => (
            <Link key={provider.id} to={`/client/masters`}>
              <Card className="p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <Avatar name={provider.displayName} size="lg" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 truncate">{provider.displayName}</h3>
                      {provider.isPremium && <span className="text-yellow-500">⭐</span>}
                    </div>
                    <p className="text-sm text-gray-500">{provider.specializations.join(', ')}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-yellow-500">★ {provider.rating}</span>
                      <span className="text-xs text-gray-400">({provider.reviewCount} отзывов)</span>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Popular Services */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Популярные услуги</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {services.filter(s => s.status === 'ACTIVE').slice(0, 6).map(service => {
            const provider = providers.find(p => p.id === service.providerId);
            return (
              <Card key={service.id} className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{service.name}</h3>
                  <p className="text-sm text-gray-500">{provider?.displayName}</p>
                  <p className="text-xs text-gray-400 mt-1">{service.duration} мин</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{formatCurrency(service.price)}</p>
                  <Link to="/client/search" className="text-xs text-violet-600 font-medium">Записаться →</Link>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============ CLIENT SEARCH ============
export function ClientSearch() {
  const { providers, services } = useDataStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const filteredServices = services.filter(s => {
    const matchesQuery = !searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || s.categoryId === selectedCategory;
    return s.status === 'ACTIVE' && matchesQuery && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Поиск мастеров и услуг</h1>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Поиск услуг..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
        >
          <option value="">Все категории</option>
          {serviceCategories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredServices.map(service => {
          const provider = providers.find(p => p.id === service.providerId);
          return (
            <Card key={service.id} className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{service.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{provider?.displayName}</p>
                </div>
                {provider?.isPremium && <span className="text-yellow-500">⭐</span>}
              </div>
              <p className="text-sm text-gray-400 mt-2">{service.description}</p>
              <div className="flex items-center justify-between mt-4">
                <div>
                  <span className="text-lg font-bold text-gray-900">{formatCurrency(service.price)}</span>
                  <span className="text-sm text-gray-400 ml-2">{service.duration} мин</span>
                </div>
                <Button size="sm">Записаться</Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ============ CLIENT BOOKINGS ============
export function ClientBookings() {
  const { appointments } = useDataStore();
  const { currentUser } = useAuthStore();
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  
  const customerAppointments = appointments.filter(a => a.customerId === 'cust-1');
  const today = new Date().toISOString().split('T')[0];
  const upcoming = customerAppointments.filter(a => a.startAt >= today && a.status !== 'CANCELLED');
  const past = customerAppointments.filter(a => a.startAt < today || a.status === 'COMPLETED' || a.status === 'CANCELLED');

  const displayAppointments = tab === 'upcoming' ? upcoming : past;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Мои записи</h1>
      
      <div className="flex gap-2">
        <button onClick={() => setTab('upcoming')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'upcoming' ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 text-gray-600'}`}>
          Предстоящие ({upcoming.length})
        </button>
        <button onClick={() => setTab('past')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'past' ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 text-gray-600'}`}>
          Прошедшие ({past.length})
        </button>
      </div>

      <div className="space-y-3">
        {displayAppointments.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="text-4xl mb-3">📅</div>
            <p className="text-gray-500">Нет записей</p>
          </Card>
        ) : (
          displayAppointments.map(apt => (
            <Card key={apt.id} className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{apt.serviceName}</h3>
                  <p className="text-sm text-gray-500 mt-1">{apt.providerName}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                    <span>📅 {formatDate(apt.startAt)}</span>
                    <span>🕐 {formatTime(apt.startAt)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <Badge status={apt.status} />
                  <p className="text-sm font-medium text-gray-900 mt-2">{formatCurrency(apt.price)}</p>
                </div>
              </div>
              {tab === 'upcoming' && apt.status !== 'CANCELLED' && (
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                  <Button variant="secondary" size="sm">Перенести</Button>
                  <Button variant="ghost" size="sm">Отменить</Button>
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

// ============ CLIENT MASTERS ============
export function ClientMasters() {
  const { providers } = useDataStore();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Мастера</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {providers.map(provider => (
          <Card key={provider.id} className="p-6">
            <div className="text-center">
              <Avatar name={provider.displayName} size="lg" className="mx-auto" />
              <div className="mt-3">
                <div className="flex items-center justify-center gap-2">
                  <h3 className="font-semibold text-gray-900">{provider.displayName}</h3>
                  {provider.isPremium && <span className="text-yellow-500">⭐</span>}
                </div>
                <p className="text-sm text-gray-500 mt-1">{provider.specializations.join(', ')}</p>
              </div>
              <div className="flex items-center justify-center gap-4 mt-3">
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">★ {provider.rating}</p>
                  <p className="text-xs text-gray-400">{provider.reviewCount} отзывов</p>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-3 line-clamp-2">{provider.description}</p>
              <Button className="w-full mt-4" size="sm">Записаться</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ============ CLIENT PROMOTIONS ============
export function ClientPromotions() {
  const { advertisements } = useDataStore();
  const activeAds = advertisements.filter(a => a.status === 'ACTIVE');

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Акции и скидки</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {activeAds.map(ad => (
          <Card key={ad.id} className="p-6 bg-gradient-to-br from-violet-50 to-pink-50 border-violet-200">
            <div className="flex items-start gap-3">
              <div className="text-3xl">🎁</div>
              <div>
                <h3 className="font-semibold text-gray-900">{ad.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{ad.description}</p>
                <p className="text-xs text-gray-400 mt-2">До {formatDate(ad.endsAt)}</p>
              </div>
            </div>
          </Card>
        ))}
        {activeAds.length === 0 && (
          <Card className="p-8 text-center col-span-2">
            <div className="text-4xl mb-3">🎁</div>
            <p className="text-gray-500">Сейчас нет активных акций</p>
          </Card>
        )}
      </div>
    </div>
  );
}

// ============ CLIENT PROFILE ============
export function ClientProfile() {
  const { currentUser } = useAuthStore();
  const { appointments } = useDataStore();
  const customerAppointments = appointments.filter(a => a.customerId === 'cust-1');

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Профиль</h1>
      
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <Avatar name={`${currentUser?.firstName} ${currentUser?.lastName}`} size="lg" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{currentUser?.firstName} {currentUser?.lastName}</h2>
            <p className="text-gray-500">{currentUser?.email}</p>
            <p className="text-gray-500">{currentUser?.phone}</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Всего записей" value={customerAppointments.length} icon="📅" />
        <StatCard title="Завершённых" value={customerAppointments.filter(a => a.status === 'COMPLETED').length} icon="✅" />
        <StatCard title="Предстоящих" value={customerAppointments.filter(a => a.status === 'CONFIRMED' || a.status === 'PENDING').length} icon="⏳" />
      </div>

      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Настройки</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <span className="text-gray-600">Уведомления</span>
            <div className="w-10 h-6 bg-violet-600 rounded-full relative cursor-pointer">
              <div className="absolute right-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow"></div>
            </div>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <span className="text-gray-600">Изменить пароль</span>
            <span className="text-violet-600 text-sm font-medium cursor-pointer">Изменить →</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-gray-600">Язык</span>
            <span className="text-gray-900 font-medium">Русский</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
