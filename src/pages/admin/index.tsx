import React, { useState } from 'react';
import { useDataStore } from '../../store';
import { Card, Button, Badge, Avatar, StatCard, Tabs, Table, Modal, EmptyState, Input, Select } from '../../components/ui';
import { formatCurrency, formatDate, formatDateTime, getStatusColor, getTransactionTypeLabel, getTransactionTypeColor } from '../../utils/format';
import { users, organizations, paymentSettings, systemHealth, reviews } from '../../data/mockData';
import { AdminCategories } from './CategoriesPage';

// Re-export AdminCategories
export { AdminCategories };

// ============ ADMIN DASHBOARD ============
export function AdminDashboard() {
  const { providers, appointments, payments, wallets, transactions, promotions, advertisements } = useDataStore();
  
  const totalRevenue = payments.filter(p => p.status === 'SUCCEEDED').reduce((s, p) => s + p.amount, 0);
  const totalWalletDeposits = transactions.filter(t => t.type === 'DEPOSIT').reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex items-center gap-2">
          {Object.entries(systemHealth).map(([key, value]) => (
            <div key={key} className={`w-3 h-3 rounded-full ${value === 'ONLINE' ? 'bg-green-500' : value === 'WARNING' ? 'bg-yellow-500' : 'bg-red-500'}`} title={`${key}: ${value}`} />
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Пользователи" value={users.length} icon="👤" trend="+12%" trendUp={true} />
        <StatCard title="Мастера" value={providers.length} icon="💅" />
        <StatCard title="Записи" value={appointments.length} icon="📅" trend="+8%" trendUp={true} />
        <StatCard title="Выручка" value={formatCurrency(totalRevenue)} icon="💰" trend="+23%" trendUp={true} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Платежи" value={payments.length} icon="💳" />
        <StatCard title="Пополнения" value={formatCurrency(totalWalletDeposits)} icon="📥" />
        <StatCard title="Продвижения" value={promotions.filter(p => p.status === 'ACTIVE').length} icon="🚀" />
        <StatCard title="Реклама" value={advertisements.filter(a => a.status === 'ACTIVE').length} icon="📢" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Платежи по дням</h3>
          <div className="flex items-end gap-1.5 h-32">
            {[30, 45, 60, 40, 75, 55, 80, 65, 90, 70, 85, 95, 50, 72].map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-violet-400 rounded-t hover:bg-violet-500 transition-colors" style={{ height: `${val}%` }}></div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-400">
            <span>1</span><span>7</span><span>14</span>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Регистрации</h3>
          <div className="flex items-end gap-1.5 h-32">
            {[20, 35, 25, 50, 40, 60, 45, 70, 55, 80, 65, 75, 85, 90].map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-green-400 rounded-t hover:bg-green-500 transition-colors" style={{ height: `${val}%` }}></div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-400">
            <span>1</span><span>7</span><span>14</span>
          </div>
        </Card>
      </div>

      {/* System Health */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Системный статус</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {Object.entries(systemHealth).map(([key, value]) => (
            <div key={key} className="text-center p-3 rounded-lg bg-gray-50">
              <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${value === 'ONLINE' ? 'bg-green-500' : value === 'WARNING' ? 'bg-yellow-500' : 'bg-red-500'}`} />
              <p className="text-sm font-medium text-gray-900 capitalize">{key}</p>
              <p className={`text-xs font-medium ${value === 'ONLINE' ? 'text-green-600' : value === 'WARNING' ? 'text-yellow-600' : 'text-red-600'}`}>{value}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Activity */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Последняя активность</h3>
        <div className="space-y-3">
          {payments.slice(-5).reverse().map(p => (
            <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <div className="flex items-center gap-3">
                <span className="text-lg">{p.purpose === 'WALLET_TOPUP' ? '💰' : '💳'}</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">{p.userName}</p>
                  <p className="text-xs text-gray-400">{p.purpose === 'WALLET_TOPUP' ? 'Пополнение кошелька' : p.purpose}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{formatCurrency(p.amount)}</p>
                <Badge status={p.status} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ============ ADMIN USERS ============
export function AdminUsers() {
  const [search, setSearch] = useState('');
  const filtered = users.filter(u => 
    u.firstName.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Пользователи</h1>
        <Button>+ Добавить</Button>
      </div>
      <input type="text" placeholder="Поиск..." value={search} onChange={e => setSearch(e.target.value)}
        className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-lg" />
      <Card>
        <Table headers={['Пользователь', 'Email', 'Роль', 'Статус', 'Дата регистрации']}>
          {filtered.map(user => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Avatar name={`${user.firstName} ${user.lastName}`} size="sm" />
                  <span className="font-medium text-gray-900">{user.firstName} {user.lastName}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-gray-500">{user.email}</td>
              <td className="px-4 py-3"><Badge status={user.role} /></td>
              <td className="px-4 py-3"><Badge status={user.status} /></td>
              <td className="px-4 py-3 text-gray-500 text-sm">{formatDate(user.createdAt)}</td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}

// ============ ADMIN PROVIDERS ============
export function AdminProviders() {
  const { providers, wallets } = useDataStore();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Мастера</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {providers.map(provider => {
          const wallet = wallets.find(w => w.ownerId === provider.id);
          return (
            <Card key={provider.id} className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <Avatar name={provider.displayName} size="lg" />
                <div>
                  <h3 className="font-semibold text-gray-900">{provider.displayName}</h3>
                  <p className="text-sm text-gray-500">{provider.specializations.join(', ')}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-sm font-bold text-gray-900">★ {provider.rating}</p>
                  <p className="text-xs text-gray-400">Рейтинг</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-sm font-bold text-gray-900">{provider.reviewCount}</p>
                  <p className="text-xs text-gray-400">Отзывы</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-sm font-bold text-gray-900">{formatCurrency(wallet?.balance || 0)}</p>
                  <p className="text-xs text-gray-400">Баланс</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3">
                <Badge status={provider.status} />
                {provider.isPremium && <span className="text-yellow-500 text-sm">⭐ Premium</span>}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ============ ADMIN CUSTOMERS ============
export function AdminCustomers() {
  const { appointments } = useDataStore();
  const customerMap = new Map<string, { name: string; email: string; phone: string; visits: number; totalSpent: number }>();
  
  appointments.forEach(apt => {
    const existing = customerMap.get(apt.customerId);
    if (existing) {
      existing.visits++;
      existing.totalSpent += apt.price;
    } else {
      customerMap.set(apt.customerId, { name: apt.customerName, email: '', phone: '', visits: 1, totalSpent: apt.price });
    }
  });

  const customers = Array.from(customerMap.entries()).map(([id, data]) => ({ id, ...data }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Клиенты</h1>
      <Card>
        <Table headers={['Клиент', 'Посещений', 'Потрачено', 'Средний чек']}>
          {customers.map(c => (
            <tr key={c.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Avatar name={c.name} size="sm" />
                  <span className="font-medium text-gray-900">{c.name}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-gray-700">{c.visits}</td>
              <td className="px-4 py-3 font-medium text-gray-900">{formatCurrency(c.totalSpent)}</td>
              <td className="px-4 py-3 text-gray-500">{formatCurrency(c.visits > 0 ? c.totalSpent / c.visits : 0)}</td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}

// ============ ADMIN SERVICES ============
export function AdminServices() {
  const { services, providers } = useDataStore();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Услуги</h1>
      <Card>
        <Table headers={['Услуга', 'Мастер', 'Цена', 'Длительность', 'Статус']}>
          {services.map(svc => {
            const provider = providers.find(p => p.id === svc.providerId);
            return (
              <tr key={svc.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{svc.name}</td>
                <td className="px-4 py-3 text-gray-500">{provider?.displayName}</td>
                <td className="px-4 py-3 font-medium">{formatCurrency(svc.price)}</td>
                <td className="px-4 py-3 text-gray-500">{svc.duration} мин</td>
                <td className="px-4 py-3"><Badge status={svc.status} /></td>
              </tr>
            );
          })}
        </Table>
      </Card>
    </div>
  );
}

// ============ ADMIN APPOINTMENTS ============
export function AdminAppointments() {
  const { appointments } = useDataStore();
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter.toUpperCase());

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Записи</h1>
      <Tabs
        tabs={[
          { id: 'all', label: 'Все', count: appointments.length },
          { id: 'pending', label: 'Ожидают', count: appointments.filter(a => a.status === 'PENDING').length },
          { id: 'confirmed', label: 'Подтверждено', count: appointments.filter(a => a.status === 'CONFIRMED').length },
          { id: 'completed', label: 'Завершено', count: appointments.filter(a => a.status === 'COMPLETED').length },
          { id: 'cancelled', label: 'Отменено', count: appointments.filter(a => a.status === 'CANCELLED').length },
        ]}
        activeTab={filter}
        onChange={setFilter}
      />
      <Card>
        <Table headers={['Клиент', 'Мастер', 'Услуга', 'Дата', 'Статус', 'Цена']}>
          {filtered.map(apt => (
            <tr key={apt.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-gray-900">{apt.customerName}</td>
              <td className="px-4 py-3 text-gray-500">{apt.providerName}</td>
              <td className="px-4 py-3 text-gray-700">{apt.serviceName}</td>
              <td className="px-4 py-3 text-gray-500 text-sm">{formatDateTime(apt.startAt)}</td>
              <td className="px-4 py-3"><Badge status={apt.status} /></td>
              <td className="px-4 py-3 font-medium">{formatCurrency(apt.price)}</td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}

// ============ ADMIN PAYMENTS ============
export function AdminPayments() {
  const { payments } = useDataStore();
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = statusFilter === 'all' ? payments : payments.filter(p => p.status === statusFilter.toUpperCase());
  const totalSucceeded = payments.filter(p => p.status === 'SUCCEEDED').reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Платежи</h1>
        <div className="text-right">
          <p className="text-sm text-gray-500">Всего получено</p>
          <p className="text-xl font-bold text-green-600">{formatCurrency(totalSucceeded)}</p>
        </div>
      </div>

      <Tabs
        tabs={[
          { id: 'all', label: 'Все', count: payments.length },
          { id: 'succeeded', label: 'Успешные', count: payments.filter(p => p.status === 'SUCCEEDED').length },
          { id: 'pending', label: 'Ожидают', count: payments.filter(p => p.status === 'PENDING').length },
          { id: 'failed', label: 'Ошибки', count: payments.filter(p => p.status === 'FAILED').length },
        ]}
        activeTab={statusFilter}
        onChange={setStatusFilter}
      />

      <Card>
        <Table headers={['ID', 'Пользователь', 'Назначение', 'Сумма', 'Провайдер', 'Статус', 'Дата']}>
          {filtered.map(p => (
            <tr key={p.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-xs font-mono text-gray-400">{p.id.slice(0, 8)}</td>
              <td className="px-4 py-3 text-gray-900">{p.userName}</td>
              <td className="px-4 py-3 text-gray-500 text-sm">{p.purpose === 'WALLET_TOPUP' ? 'Пополнение' : p.purpose}</td>
              <td className="px-4 py-3 font-medium">{formatCurrency(p.amount)}</td>
              <td className="px-4 py-3 text-gray-500 text-sm">{p.provider}</td>
              <td className="px-4 py-3"><Badge status={p.status} /></td>
              <td className="px-4 py-3 text-gray-500 text-sm">{formatDateTime(p.createdAt)}</td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}

// ============ ADMIN WALLETS ============
export function AdminWallets() {
  const { wallets, transactions } = useDataStore();
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [showAdjustModal, setShowAdjustModal] = useState(false);

  const selectedWalletData = wallets.find(w => w.id === selectedWallet);
  const walletTransactions = transactions.filter(t => t.walletId === selectedWallet);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Кошельки</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {wallets.map(wallet => (
          <Card key={wallet.id} className="p-5 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedWallet(wallet.id)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar name={wallet.ownerName} />
                <div>
                  <h3 className="font-semibold text-gray-900">{wallet.ownerName}</h3>
                  <p className="text-sm text-gray-500">ID: {wallet.id}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-gray-900">{formatCurrency(wallet.balance)}</p>
                <Badge status={wallet.status} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {selectedWallet && selectedWalletData && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Кошелек: {selectedWalletData.ownerName}</h3>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => setShowAdjustModal(true)}>Корректировка</Button>
              <Button size="sm" variant="secondary" onClick={() => setSelectedWallet(null)}>Закрыть</Button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-green-700">{formatCurrency(walletTransactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0))}</p>
              <p className="text-xs text-green-600">Пополнения</p>
            </div>
            <div className="bg-red-50 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-red-700">{formatCurrency(Math.abs(walletTransactions.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0)))}</p>
              <p className="text-xs text-red-600">Списания</p>
            </div>
            <div className="bg-violet-50 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-violet-700">{formatCurrency(selectedWalletData.balance)}</p>
              <p className="text-xs text-violet-600">Баланс</p>
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-gray-700 mb-2">Транзакции</h4>
            {walletTransactions.slice().reverse().map(tx => (
              <div key={tx.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                <div>
                  <p className="text-sm font-medium text-gray-900">{tx.description}</p>
                  <p className="text-xs text-gray-400">{formatDateTime(tx.createdAt)} · {getTransactionTypeLabel(tx.type)}</p>
                </div>
                <p className={`font-medium ${getTransactionTypeColor(tx.type)}`}>{tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Modal isOpen={showAdjustModal} onClose={() => setShowAdjustModal(false)} title="Ручная корректировка">
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Баланс: {formatCurrency(selectedWalletData?.balance || 0)}</p>
          <Input label="Сумма (₽)" type="number" placeholder="1000" />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Тип</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
              <option value="credit">Пополнение (+)</option>
              <option value="debit">Списание (-)</option>
            </select>
          </div>
          <Input label="Комментарий" placeholder="Причина корректировки" />
          <p className="text-xs text-gray-400">Будет создана транзакция типа ADJUSTMENT. Все действия записываются в Audit Log.</p>
          <Button className="w-full" onClick={() => setShowAdjustModal(false)}>Применить</Button>
        </div>
      </Modal>
    </div>
  );
}

// ============ ADMIN TRANSACTIONS ============
export function AdminTransactions() {
  const { transactions } = useDataStore();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Транзакции</h1>
      <Card>
        <Table headers={['ID', 'Тип', 'Описание', 'Сумма', 'Баланс до', 'Баланс после', 'Дата']}>
          {transactions.slice().reverse().map(tx => (
            <tr key={tx.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-xs font-mono text-gray-400">{tx.id.slice(0, 8)}</td>
              <td className="px-4 py-3"><Badge status={tx.type} /></td>
              <td className="px-4 py-3 text-gray-700 text-sm">{tx.description}</td>
              <td className={`px-4 py-3 font-medium ${getTransactionTypeColor(tx.type)}`}>{tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}</td>
              <td className="px-4 py-3 text-gray-500 text-sm">{formatCurrency(tx.balanceBefore)}</td>
              <td className="px-4 py-3 text-gray-500 text-sm">{formatCurrency(tx.balanceAfter)}</td>
              <td className="px-4 py-3 text-gray-500 text-sm">{formatDateTime(tx.createdAt)}</td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}

// ============ ADMIN PROMOTIONS ============
export function AdminPromotions() {
  const { promotions } = useDataStore();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Продвижение</h1>
      <Card>
        <Table headers={['Мастер', 'Тип', 'Бюджет', 'Потрачено', 'Период', 'Статус']}>
          {promotions.map(p => (
            <tr key={p.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-medium text-gray-900">{p.providerName}</td>
              <td className="px-4 py-3 text-gray-700">{p.type === 'TOP_LISTING' ? 'Топ размещение' : p.type}</td>
              <td className="px-4 py-3">{formatCurrency(p.budget)}</td>
              <td className="px-4 py-3">{formatCurrency(p.spent)}</td>
              <td className="px-4 py-3 text-gray-500 text-sm">{formatDate(p.startsAt)} — {formatDate(p.endsAt)}</td>
              <td className="px-4 py-3"><Badge status={p.status} /></td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}

// ============ ADMIN ADVERTISEMENTS ============
export function AdminAdvertisements() {
  const { advertisements } = useDataStore();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Реклама</h1>
      <Card>
        <Table headers={['Мастер', 'Название', 'Бюджет', 'Потрачено', 'Статус']}>
          {advertisements.map(ad => (
            <tr key={ad.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-medium text-gray-900">{ad.providerName}</td>
              <td className="px-4 py-3 text-gray-700">{ad.title}</td>
              <td className="px-4 py-3">{formatCurrency(ad.budget)}</td>
              <td className="px-4 py-3">{formatCurrency(ad.spent)}</td>
              <td className="px-4 py-3"><Badge status={ad.status} /></td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}

// ============ ADMIN PREMIUM ============
export function AdminPremium() {
  const { premiumSubscriptions } = useDataStore();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Premium подписки</h1>
      <Card>
        <Table headers={['Мастер', 'Тариф', 'Цена', 'Начало', 'Окончание', 'Статус']}>
          {premiumSubscriptions.map(p => (
            <tr key={p.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-medium text-gray-900">{p.providerName}</td>
              <td className="px-4 py-3 text-gray-700">{p.plan}</td>
              <td className="px-4 py-3">{formatCurrency(p.price)}/мес</td>
              <td className="px-4 py-3 text-gray-500 text-sm">{formatDate(p.startsAt)}</td>
              <td className="px-4 py-3 text-gray-500 text-sm">{formatDate(p.endsAt)}</td>
              <td className="px-4 py-3"><Badge status={p.status} /></td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}

// ============ ADMIN NOTIFICATIONS ============
export function AdminNotifications() {
  const { notifications } = useDataStore();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Уведомления</h1>
      <div className="space-y-2">
        {notifications.slice().reverse().map(n => (
          <Card key={n.id} className="p-4">
            <div className="flex items-start gap-3">
              <div className={`w-2 h-2 rounded-full mt-2 ${n.isRead ? 'bg-gray-300' : 'bg-violet-500'}`} />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-900">{n.title}</p>
                  <Badge status={n.type} />
                </div>
                <p className="text-sm text-gray-500 mt-1">{n.message}</p>
                <p className="text-xs text-gray-400 mt-1">{formatDateTime(n.createdAt)} · User: {n.userId}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ============ ADMIN AUDIT LOG ============
export function AdminAudit() {
  const { auditLogs } = useDataStore();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>
      <Card>
        <Table headers={['Дата', 'Пользователь', 'Действие', 'Сущность', 'Entity ID', 'IP']}>
          {auditLogs.slice().reverse().map(log => (
            <tr key={log.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-gray-500 text-sm">{formatDateTime(log.createdAt)}</td>
              <td className="px-4 py-3 text-gray-900">{log.userName}</td>
              <td className="px-4 py-3"><Badge status={log.action} /></td>
              <td className="px-4 py-3 text-gray-700">{log.entity}</td>
              <td className="px-4 py-3 text-xs font-mono text-gray-400">{log.entityId.slice(0, 12)}</td>
              <td className="px-4 py-3 text-gray-500 text-sm">{log.ip}</td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}

// ============ ADMIN SETTINGS ============
export function AdminSettings() {
  const [activeTab, setActiveTab] = useState('payments');

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Настройки</h1>

      <Tabs
        tabs={[
          { id: 'payments', label: 'Платежи' },
          { id: 'security', label: 'Безопасность' },
          { id: 'roles', label: 'Роли' },
          { id: 'system', label: 'Система' },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === 'payments' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Настройки платежей</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <p className="font-medium text-gray-900">Прием платежей</p>
                  <p className="text-sm text-gray-500">Включить/выключить прием платежей</p>
                </div>
                <div className="w-12 h-6 bg-green-500 rounded-full relative cursor-pointer">
                  <div className="absolute right-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow"></div>
                </div>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <p className="font-medium text-gray-900">Провайдер</p>
                  <p className="text-sm text-gray-500">Текущий платежный провайдер</p>
                </div>
                <span className="font-medium text-gray-900">{paymentSettings.provider}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <p className="font-medium text-gray-900">Shop ID</p>
                  <p className="text-sm text-gray-500">Идентификатор магазина в ЮKassa</p>
                </div>
                <span className="font-mono text-sm text-gray-700">{paymentSettings.yooKassaShopId}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <p className="font-medium text-gray-900">Secret Key</p>
                  <p className="text-sm text-gray-500">Секретный ключ (хранится только на сервере)</p>
                </div>
                <span className="font-mono text-sm text-gray-700">{paymentSettings.yooKassaSecretKey}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <p className="font-medium text-gray-900">Return URL</p>
                  <p className="text-sm text-gray-500">URL возврата после оплаты</p>
                </div>
                <span className="text-sm text-gray-700">{paymentSettings.returnUrl}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <p className="font-medium text-gray-900">Мин. пополнение</p>
                  <p className="text-sm text-gray-500">Минимальная сумма пополнения</p>
                </div>
                <span className="font-medium text-gray-900">{formatCurrency(paymentSettings.minTopUp)}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <p className="font-medium text-gray-900">Макс. пополнение</p>
                  <p className="text-sm text-gray-500">Максимальная сумма пополнения</p>
                </div>
                <span className="font-medium text-gray-900">{formatCurrency(paymentSettings.maxTopUp)}</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-gray-900">Webhook статус</p>
                  <p className="text-sm text-gray-500">Статус подключения webhook</p>
                </div>
                <Badge status={paymentSettings.webhookStatus} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button>Сохранить</Button>
              <Button variant="secondary">Проверить подключение</Button>
              <Button variant="ghost">Тестовый платеж</Button>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Webhook мониторинг</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Последнее событие</p>
                <p className="font-medium text-gray-900">{paymentSettings.lastWebhookEvent ? formatDateTime(paymentSettings.lastWebhookEvent) : 'Нет данных'}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Статус</p>
                <Badge status={paymentSettings.webhookStatus} />
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'security' && (
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Настройки безопасности</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <p className="font-medium text-gray-900">Rate Limiting</p>
                <p className="text-sm text-gray-500">Ограничение запросов</p>
              </div>
              <span className="text-gray-700">100 req/min</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <p className="font-medium text-gray-900">JWT Token TTL</p>
                <p className="text-sm text-gray-500">Время жизни access token</p>
              </div>
              <span className="text-gray-700">15 мин</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-gray-900">Refresh Token TTL</p>
                <p className="text-sm text-gray-500">Время жизни refresh token</p>
              </div>
              <span className="text-gray-700">7 дней</span>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'roles' && (
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Роли и права</h3>
          <div className="space-y-3">
            {[
              { role: 'SUPER_ADMIN', desc: 'Полный доступ ко всем функциям', count: users.filter(u => u.role === 'SUPER_ADMIN').length },
              { role: 'FINANCE_ADMIN', desc: 'Платежи, кошельки, транзакции, возвраты', count: users.filter(u => u.role === 'FINANCE_ADMIN').length },
              { role: 'SUPPORT_ADMIN', desc: 'Пользователи, клиенты, записи', count: users.filter(u => u.role === 'SUPPORT_ADMIN').length },
              { role: 'CONTENT_ADMIN', desc: 'Услуги, продвижение, реклама', count: users.filter(u => u.role === 'CONTENT_ADMIN').length },
              { role: 'ANALYST', desc: 'Аналитика и отчеты (только чтение)', count: users.filter(u => u.role === 'ANALYST').length },
              { role: 'PROVIDER', desc: 'Мастер / поставщик услуг', count: users.filter(u => u.role === 'PROVIDER').length },
              { role: 'CUSTOMER', desc: 'Клиент', count: users.filter(u => u.role === 'CUSTOMER').length },
            ].map(r => (
              <div key={r.role} className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <p className="font-medium text-gray-900">{r.role}</p>
                  <p className="text-sm text-gray-500">{r.desc}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-gray-700">{r.count} польз.</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === 'system' && (
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Системная информация</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-gray-600">Версия</span>
              <span className="font-medium">1.0.0</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-gray-600">Backend</span>
              <Badge status={systemHealth.backend} />
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-gray-600">Database</span>
              <Badge status={systemHealth.database} />
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-gray-600">Payments</span>
              <Badge status={systemHealth.payments} />
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-gray-600">Режим</span>
              <Badge status="DEVELOPMENT" />
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
