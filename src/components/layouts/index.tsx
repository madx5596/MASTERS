import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore, useDataStore } from '../../store';
import { Avatar } from '../ui';
import { getNotificationIcon } from '../../utils/format';

// ============ SIDEBAR NAV ITEM ============
interface NavItem {
  path: string;
  label: string;
  icon: string;
}

function SidebarNav({ items, basePath }: { items: NavItem[]; basePath: string }) {
  const location = useLocation();
  return (
    <nav className="space-y-1">
      {items.map(item => {
        const isActive = location.pathname === `${basePath}${item.path}` || 
          (item.path === '/' && location.pathname === basePath);
        return (
          <Link
            key={item.path}
            to={`${basePath}${item.path}`}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive ? 'bg-violet-100 text-violet-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

// ============ PROVIDER LAYOUT ============
const providerNavItems: NavItem[] = [
  { path: '/today', label: 'Сегодня', icon: '📅' },
  { path: '/calendar', label: 'Календарь', icon: '🗓' },
  { path: '/bookings', label: 'Записи', icon: '📋' },
  { path: '/messages', label: 'Сообщения', icon: '💬' },
  { path: '/clients', label: 'Клиенты', icon: '👥' },
  { path: '/services', label: 'Услуги', icon: '💅' },
  { path: '/schedule', label: 'Расписание', icon: '⏰' },
  { path: '/analytics', label: 'Аналитика', icon: '📊' },
  { path: '/profile', label: 'Профиль', icon: '⚙️' },
];

export function ProviderLayout({ children }: { children: React.ReactNode }) {
  const { currentUser, logout } = useAuthStore();
  const { notifications } = useDataStore();
  const [showNotifs, setShowNotifs] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const unreadCount = notifications.filter(n => n.userId === currentUser?.id && !n.isRead).length;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-white border-r border-gray-200 fixed h-full">
        <div className="p-5 border-b border-gray-200">
          <Link to="/provider/today" className="flex items-center gap-2">
            <span className="text-2xl">💎</span>
            <span className="text-lg font-bold text-gray-900">BeautyKRK</span>
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <SidebarNav items={providerNavItems} basePath="/provider" />
        </div>
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <Avatar name={currentUser?.firstName + ' ' + currentUser?.lastName || ''} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{currentUser?.firstName} {currentUser?.lastName}</p>
              <p className="text-xs text-gray-500">Мастер</p>
            </div>
            <button onClick={() => { logout(); navigate('/'); }} className="text-gray-400 hover:text-gray-600" title="Выйти">
              🚪
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-600">
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
          <span className="font-bold text-gray-900">💎 BeautyKRK</span>
          <button onClick={() => setShowNotifs(!showNotifs)} className="relative text-gray-600">
            🔔
            {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">{unreadCount}</span>}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setMobileMenuOpen(false)}>
          <div className="w-72 h-full bg-white p-4 overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b">
              <Avatar name={currentUser?.firstName + ' ' + currentUser?.lastName || ''} />
              <div>
                <p className="font-medium text-gray-900">{currentUser?.firstName} {currentUser?.lastName}</p>
                <p className="text-xs text-gray-500">Мастер</p>
              </div>
            </div>
            <SidebarNav items={providerNavItems} basePath="/provider" />
            <div className="mt-6 pt-4 border-t">
              <button onClick={() => { logout(); navigate('/'); }} className="flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg w-full">
                <span>🚪</span> Выйти
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Panel */}
      {showNotifs && (
        <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setShowNotifs(false)}>
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-xl p-4 overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold text-gray-900 mb-4">Уведомления</h3>
            {notifications.filter(n => n.userId === currentUser?.id).map(n => (
              <div key={n.id} className={`p-3 rounded-lg mb-2 ${n.isRead ? 'bg-gray-50' : 'bg-violet-50'}`}>
                <div className="flex items-start gap-2">
                  <span>{getNotificationIcon(n.type)}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{n.title}</p>
                    <p className="text-xs text-gray-500">{n.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 pt-14 lg:pt-0">
        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

// ============ ADMIN LAYOUT ============
const adminNavItems: NavItem[] = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/users', label: 'Пользователи', icon: '👤' },
  { path: '/providers', label: 'Мастера', icon: '💅' },
  { path: '/customers', label: 'Клиенты', icon: '👥' },
  { path: '/services', label: 'Услуги', icon: '📋' },
  { path: '/appointments', label: 'Записи', icon: '📅' },
  { path: '/payments', label: 'Платежи', icon: '💳' },
  { path: '/wallets', label: 'Кошельки', icon: '💰' },
  { path: '/transactions', label: 'Транзакции', icon: '📝' },
  { path: '/promotions', label: 'Продвижение', icon: '🚀' },
  { path: '/advertisements', label: 'Реклама', icon: '📢' },
  { path: '/premium', label: 'Premium', icon: '⭐' },
  { path: '/notifications', label: 'Уведомления', icon: '🔔' },
  { path: '/audit', label: 'Audit Log', icon: '🔍' },
  { path: '/settings', label: 'Настройки', icon: '⚙️' },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { currentUser, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-gray-900 fixed h-full">
        <div className="p-5 border-b border-gray-800">
          <Link to="/admin" className="flex items-center gap-2">
            <span className="text-2xl">🛡</span>
            <span className="text-lg font-bold text-white">Admin Panel</span>
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <nav className="space-y-1">
            {adminNavItems.map(item => {
              const fullPath = item.path === '/' ? '/admin' : `/admin${item.path}`;
              const isActive = location.pathname === fullPath;
              return (
                <Link
                  key={item.path}
                  to={fullPath}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'bg-violet-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3">
            <Avatar name={currentUser?.firstName + ' ' + currentUser?.lastName || ''} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{currentUser?.firstName}</p>
              <p className="text-xs text-gray-400">Администратор</p>
            </div>
            <button onClick={() => { logout(); navigate('/'); }} className="text-gray-400 hover:text-white" title="Выйти">🚪</button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-gray-900 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white">
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
          <span className="font-bold text-white">🛡 Admin</span>
          <button onClick={() => { logout(); navigate('/'); }} className="text-gray-400">🚪</button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setMobileMenuOpen(false)}>
          <div className="w-72 h-full bg-gray-900 p-4 overflow-y-auto" onClick={e => e.stopPropagation()}>
            <nav className="space-y-1 mt-12">
              {adminNavItems.map(item => {
                const fullPath = item.path === '/' ? '/admin' : `/admin${item.path}`;
                return (
                  <Link key={item.path} to={fullPath} onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white">
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 pt-14 lg:pt-0">
        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

// ============ CLIENT LAYOUT ============
export function ClientLayout({ children }: { children: React.ReactNode }) {
  const { currentUser, logout } = useAuthStore();
  const { notifications } = useDataStore();
  const [showNotifs, setShowNotifs] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const unreadCount = notifications.filter(n => n.userId === currentUser?.id && !n.isRead).length;

  const clientNavItems: NavItem[] = [
    { path: '/', label: 'Главная', icon: '🏠' },
    { path: '/search', label: 'Поиск', icon: '🔍' },
    { path: '/bookings', label: 'Записи', icon: '📅' },
    { path: '/masters', label: 'Мастера', icon: '💅' },
    { path: '/messages', label: 'Сообщения', icon: '💬' },
    { path: '/promotions', label: 'Акции', icon: '🎁' },
    { path: '/profile', label: 'Профиль', icon: '👤' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden text-gray-600">
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
            <Link to="/client" className="flex items-center gap-2">
              <span className="text-2xl">💎</span>
              <span className="text-lg font-bold text-gray-900 hidden sm:block">BeautyKRK</span>
            </Link>
          </div>
          
          <nav className="hidden lg:flex items-center gap-1">
            {clientNavItems.map(item => (
              <Link key={item.path} to={`/client${item.path}`}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === `/client${item.path}` ? 'bg-violet-100 text-violet-700' : 'text-gray-600 hover:bg-gray-100'
                }`}>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button onClick={() => setShowNotifs(!showNotifs)} className="relative text-gray-600 hover:text-gray-900">
              🔔
              {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">{unreadCount}</span>}
            </button>
            <Link to="/client/profile" className="hidden sm:block">
              <Avatar name={currentUser?.firstName + ' ' + currentUser?.lastName || ''} size="sm" />
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setMobileMenuOpen(false)}>
          <div className="w-72 h-full bg-white p-4 overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b">
              <Avatar name={currentUser?.firstName + ' ' + currentUser?.lastName || ''} />
              <div>
                <p className="font-medium text-gray-900">{currentUser?.firstName} {currentUser?.lastName}</p>
                <p className="text-xs text-gray-500">Клиент</p>
              </div>
            </div>
            <nav className="space-y-1">
              {clientNavItems.map(item => (
                <Link key={item.path} to={`/client${item.path}`} onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100">
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
            <div className="mt-6 pt-4 border-t">
              <button onClick={() => { logout(); navigate('/'); }} className="flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg w-full">
                <span>🚪</span> Выйти
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications */}
      {showNotifs && (
        <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setShowNotifs(false)}>
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-xl p-4 overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold text-gray-900 mb-4">Уведомления</h3>
            {notifications.filter(n => n.userId === currentUser?.id).map(n => (
              <div key={n.id} className={`p-3 rounded-lg mb-2 ${n.isRead ? 'bg-gray-50' : 'bg-violet-50'}`}>
                <div className="flex items-start gap-2">
                  <span>{getNotificationIcon(n.type)}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{n.title}</p>
                    <p className="text-xs text-gray-500">{n.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Navigation - Mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
        <div className="flex items-center justify-around py-2">
          {clientNavItems.slice(0, 5).map(item => (
            <Link key={item.path} to={`/client${item.path}`}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 ${
                location.pathname === `/client${item.path}` ? 'text-violet-600' : 'text-gray-400'
              }`}>
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="pb-20 lg:pb-0">
        <div className="max-w-7xl mx-auto p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
