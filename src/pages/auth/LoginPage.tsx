import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store';
import { Button, Input } from '../../components/ui';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = login(email, password);
    if (success) {
      const user = useAuthStore.getState().currentUser;
      if (user?.role === 'SUPER_ADMIN' || user?.role === 'FINANCE_ADMIN' || user?.role === 'SUPPORT_ADMIN' || user?.role === 'CONTENT_ADMIN' || user?.role === 'ANALYST') {
        navigate('/admin');
      } else if (user?.role === 'PROVIDER') {
        navigate('/provider/today');
      } else {
        navigate('/client');
      }
    } else {
      setError('Неверный email или пароль');
    }
  };

  const quickLogin = (role: string) => {
    const emails: Record<string, string> = {
      admin: 'admin@beautykrk.ru',
      provider: 'anna@beautykrk.ru',
      customer: 'client@mail.ru',
    };
    login(emails[role], 'password');
    if (role === 'admin') navigate('/admin');
    else if (role === 'provider') navigate('/provider/today');
    else navigate('/client');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">💎</div>
          <h1 className="text-3xl font-bold text-gray-900">BeautyKRK</h1>
          <p className="text-gray-500 mt-2">Платформа для записи к мастерам красоты</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Вход в аккаунт</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Email" type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
            <Input label="Пароль" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" size="lg">Войти</Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center mb-3">Быстрый вход для демо:</p>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => quickLogin('admin')} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium text-gray-700 transition-colors">
                👑 Админ
              </button>
              <button onClick={() => quickLogin('provider')} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium text-gray-700 transition-colors">
                💅 Мастер
              </button>
              <button onClick={() => quickLogin('customer')} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium text-gray-700 transition-colors">
                👤 Клиент
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Нет аккаунта? <button className="text-violet-600 font-medium hover:underline">Регистрация</button>
        </p>
      </div>
    </div>
  );
}
