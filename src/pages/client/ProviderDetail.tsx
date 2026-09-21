import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDataStore } from '../../store';
import { Card, Button, Avatar, Badge, EmptyState } from '../../components/ui';
import { formatCurrency } from '../../utils/format';

export function ProviderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { providers, services } = useDataStore();

  const provider = providers.find(p => p.id === id);
  const providerServices = services.filter(s => s.providerId === id && s.status === 'ACTIVE');

  if (!provider) {
    return <EmptyState icon="👤" title="Мастер не найден" description="Выберите другого мастера" action={<Button onClick={() => navigate('/client/masters')}>К мастерам</Button>} />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Provider Header */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <Avatar name={provider.displayName} size="lg" className="!w-20 !h-20 !text-2xl" />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">{provider.displayName}</h1>
              {provider.isPremium && <span className="text-yellow-500 text-xl">⭐</span>}
            </div>
            <p className="text-gray-500 mb-3">{provider.specializations.join(' · ')}</p>
            <p className="text-gray-600 text-sm mb-4">{provider.description}</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <span className="text-yellow-500 text-lg">★</span>
                <span className="font-bold text-gray-900">{provider.rating}</span>
                <span className="text-sm text-gray-400">({provider.reviewCount} отзывов)</span>
              </div>
              <Badge status={provider.status} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="lg" onClick={() => navigate(`/client/booking/${provider.id}`)}>
              Записаться
            </Button>
            <Button size="lg" variant="secondary" onClick={() => navigate(`/client/messages?provider=${provider.id}`)}>
              💬 Написать
            </Button>
          </div>
        </div>
      </Card>

      {/* Services */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Услуги</h2>
        {providerServices.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="text-4xl mb-3">📋</div>
            <p className="text-gray-500">У этого мастера пока нет активных услуг</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {providerServices.map(service => (
              <Card key={service.id} className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{service.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{service.description}</p>
                    <p className="text-xs text-gray-400 mt-2">⏱ {service.duration} мин</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-lg font-bold text-gray-900">{formatCurrency(service.price)}</p>
                    <button 
                      onClick={() => navigate(`/client/booking/${provider.id}`)}
                      className="text-sm text-violet-600 font-medium hover:underline mt-1"
                    >
                      Записаться →
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
