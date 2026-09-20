import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDataStore, useAuthStore } from '../../store';
import { Card, Button, Avatar, LoadingState, EmptyState } from '../../components/ui';
import { formatCurrency, formatDate } from '../../utils/format';
import { availabilityApi, appointmentsApi } from '../../api';

type Step = 'provider' | 'service' | 'date' | 'time' | 'confirm';

export function BookingFlow() {
  const { providerId } = useParams<{ providerId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  const { providers, services } = useDataStore();

  const [step, setStep] = useState<Step>(providerId ? 'service' : 'provider');
  const [selectedProvider, setSelectedProvider] = useState<string | null>(providerId || null);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const provider = providers.find(p => p.id === selectedProvider);
  const providerServices = services.filter(s => s.providerId === selectedProvider && s.status === 'ACTIVE');
  const service = services.find(s => s.id === selectedService);

  // Fetch available slots when date changes
  useEffect(() => {
    if (selectedProvider && selectedService && selectedDate && service) {
      fetchAvailableSlots();
    }
  }, [selectedProvider, selectedService, selectedDate]);

  const fetchAvailableSlots = async () => {
    if (!selectedProvider || !selectedDate || !service) return;
    
    setLoadingSlots(true);
    setError(null);
    
    const response = await availabilityApi.getSlots(selectedProvider, selectedDate, service.duration);
    
    if (response.success && response.data) {
      setAvailableSlots((response.data as any).slots || []);
    } else {
      setError(response.error?.message || 'Не удалось загрузить доступное время');
      setAvailableSlots([]);
    }
    
    setLoadingSlots(false);
  };

  const handleSubmit = async () => {
    if (!selectedProvider || !selectedService || !selectedTime || !currentUser) return;

    setSubmitting(true);
    setError(null);

    const response = await appointmentsApi.create({
      providerId: selectedProvider,
      serviceId: selectedService,
      startAt: selectedTime,
    });

    if (response.success) {
      setSuccess(true);
      setTimeout(() => {
        navigate('/client/bookings');
      }, 2000);
    } else {
      setError(response.error?.message || 'Не удалось создать запись');
    }

    setSubmitting(false);
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="p-8 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Запись создана!</h2>
          <p className="text-gray-500">Вы будете перенаправлены на страницу записей...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {(['provider', 'service', 'date', 'time', 'confirm'] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === s ? 'bg-violet-600 text-white' :
                ['provider', 'service', 'date', 'time', 'confirm'].indexOf(step) > i ? 'bg-green-500 text-white' :
                'bg-gray-200 text-gray-500'
              }`}>
                {i + 1}
              </div>
              {i < 4 && <div className={`w-12 sm:w-24 h-1 mx-2 ${
                ['provider', 'service', 'date', 'time', 'confirm'].indexOf(step) > i ? 'bg-green-500' : 'bg-gray-200'
              }`} />}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>Мастер</span>
          <span>Услуга</span>
          <span>Дата</span>
          <span>Время</span>
          <span>Подтверждение</span>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Step 1: Select Provider */}
      {step === 'provider' && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Выберите мастера</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {providers.map(p => (
              <Card key={p.id} className="p-5 cursor-pointer hover:shadow-md transition-shadow" onClick={() => { setSelectedProvider(p.id); setStep('service'); }}>
                <div className="flex items-center gap-4">
                  <Avatar name={p.displayName} size="lg" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{p.displayName}</h3>
                    <p className="text-sm text-gray-500">{p.specializations.join(', ')}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-yellow-500">★ {p.rating}</span>
                      <span className="text-xs text-gray-400">({p.reviewCount} отзывов)</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Select Service */}
      {step === 'service' && provider && (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => setStep('provider')} className="text-gray-400 hover:text-gray-600">←</button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Выберите услугу</h2>
              <p className="text-gray-500">Мастер: {provider.displayName}</p>
            </div>
          </div>
          <div className="space-y-3">
            {providerServices.map(s => (
              <Card key={s.id} className="p-5 cursor-pointer hover:shadow-md transition-shadow" onClick={() => { setSelectedService(s.id); setStep('date'); }}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{s.name}</h3>
                    <p className="text-sm text-gray-500">{s.description}</p>
                    <p className="text-xs text-gray-400 mt-1">⏱ {s.duration} мин</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{formatCurrency(s.price)}</p>
                  </div>
                </div>
              </Card>
            ))}
            {providerServices.length === 0 && (
              <EmptyState icon="📋" title="Нет доступных услуг" description="У этого мастера пока нет активных услуг" />
            )}
          </div>
        </div>
      )}

      {/* Step 3: Select Date */}
      {step === 'date' && provider && service && (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => setStep('service')} className="text-gray-400 hover:text-gray-600">←</button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Выберите дату</h2>
              <p className="text-gray-500">{service.name} · {service.duration} мин</p>
            </div>
          </div>
          <Card className="p-6">
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 14 }, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() + i);
                const dateStr = date.toISOString().split('T')[0];
                const isToday = i === 0;
                const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
                
                return (
                  <button
                    key={dateStr}
                    onClick={() => { setSelectedDate(dateStr); setStep('time'); }}
                    className={`p-3 rounded-lg text-center transition-colors ${
                      selectedDate === dateStr ? 'bg-violet-600 text-white' : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="text-xs text-gray-500">{dayNames[date.getDay()]}</div>
                    <div className="text-lg font-bold">{date.getDate()}</div>
                    {isToday && <div className="text-xs mt-1">Сегодня</div>}
                  </button>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* Step 4: Select Time */}
      {step === 'time' && provider && service && selectedDate && (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => setStep('date')} className="text-gray-400 hover:text-gray-600">←</button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Выберите время</h2>
              <p className="text-gray-500">{formatDate(selectedDate)}</p>
            </div>
          </div>
          <Card className="p-6">
            {loadingSlots ? (
              <LoadingState />
            ) : availableSlots.length === 0 ? (
              <EmptyState icon="📅" title="Нет доступного времени" description="На выбранную дату нет свободных слотов. Попробуйте другую дату." />
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {availableSlots.map(slot => {
                  const time = new Date(slot).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
                  return (
                    <button
                      key={slot}
                      onClick={() => { setSelectedTime(slot); setStep('confirm'); }}
                      className={`p-3 rounded-lg text-center font-medium transition-colors ${
                        selectedTime === slot ? 'bg-violet-600 text-white' : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Step 5: Confirm */}
      {step === 'confirm' && provider && service && selectedDate && selectedTime && (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => setStep('time')} className="text-gray-400 hover:text-gray-600">←</button>
            <h2 className="text-2xl font-bold text-gray-900">Подтверждение записи</h2>
          </div>
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
                <Avatar name={provider.displayName} size="lg" />
                <div>
                  <h3 className="font-semibold text-gray-900">{provider.displayName}</h3>
                  <p className="text-sm text-gray-500">{provider.specializations.join(', ')}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Услуга:</span>
                  <span className="font-medium text-gray-900">{service.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Дата:</span>
                  <span className="font-medium text-gray-900">{formatDate(selectedDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Время:</span>
                  <span className="font-medium text-gray-900">{new Date(selectedTime).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Длительность:</span>
                  <span className="font-medium text-gray-900">{service.duration} мин</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-gray-200">
                  <span className="text-lg font-semibold text-gray-900">Итого:</span>
                  <span className="text-lg font-bold text-violet-600">{formatCurrency(service.price)}</span>
                </div>
              </div>

              <Button className="w-full" size="lg" onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Создание записи...' : 'Подтвердить запись'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
