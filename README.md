# MASTERS KRK — BeautyKRK

Универсальная CRM / Marketplace для сферы услуг (Beauty, Auto, Barbershop, Repair, Cleaning, Education).

## Архитектура

```
                    BEAUTYKRK
                       |
             SERVICE CRM CORE
                       |
        +--------------+--------------+
        |              |              |
      CLIENT         PROVIDER        ADMIN
        |              |              |
        +--------------+--------------+
                       |
                    API/BACKEND
                       |
      +----------------+----------------+
      |                |                |
     AUTH           BUSINESS          FINANCE
                       |                |
                  CRM CORE          PAYMENTS
                       |                |
                  BOOKINGS          WALLET
                       |                |
                  SERVICES        TRANSACTIONS
                       |
                PROMOTION / ADS
                       |
                    PREMIUM
                       |
                  NOTIFICATIONS
                       |
                   AUDIT LOG
                       |
                   PostgreSQL
                       |
                    ЮKassa
```

## Технологии

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS v4
- React Router v6
- Zustand (state management)
- Lucide React (icons)

### Backend (планируется)
- Node.js + TypeScript
- NestJS / Fastify
- PostgreSQL
- JWT Authentication
- ЮKassa Payment Provider

## Структура проекта

```
src/
├── App.tsx              # Главный компонент с роутингом
├── main.tsx             # Точка входа
├── index.css            # Глобальные стили
├── types/
│   └── index.ts         # Типы всех сущностей
├── data/
│   └── mockData.ts      # Мок-данные для разработки
├── store/
│   └── index.ts         # Zustand store
├── utils/
│   └── format.ts        # Утилиты форматирования
├── components/
│   ├── ui/
│   │   └── index.tsx    # Переиспользуемые UI компоненты
│   └── layouts/
│       └── index.tsx    # Layouts для Client/Provider/Admin
└── pages/
    ├── auth/
    │   └── LoginPage.tsx
    ├── client/
    │   └── index.tsx    # Страницы клиента
    ├── provider/
    │   └── index.tsx    # Страницы мастера
    └── admin/
        └── index.tsx    # Страницы администратора
```

## Основные сущности

### Core
- `User` — пользователь системы
- `Organization` — организация/бизнес
- `Provider` — мастер/поставщик услуг
- `Customer` — клиент
- `Service` — услуга
- `Appointment` — запись/бронирование
- `Schedule` — расписание

### Finance
- `Wallet` — внутренний кошелек
- `Transaction` — транзакция
- `Payment` — внешний платеж

### Business
- `Promotion` — продвижение
- `Advertisement` — реклама
- `PremiumSubscription` — Premium подписка
- `Notification` — уведомление
- `Review` — отзыв
- `AuditLog` — журнал аудита

## Роли

| Роль | Описание |
|------|----------|
| SUPER_ADMIN | Полный доступ |
| FINANCE_ADMIN | Платежи, кошельки, транзакции |
| SUPPORT_ADMIN | Пользователи, клиенты, записи |
| CONTENT_ADMIN | Услуги, продвижение, реклама |
| ANALYST | Аналитика (только чтение) |
| PROVIDER | Мастер |
| CUSTOMER | Клиент |

## Маршруты

### Клиент
- `/client/` — Главная
- `/client/search` — Поиск
- `/client/bookings` — Записи
- `/client/masters` — Мастера
- `/client/promotions` — Акции
- `/client/profile` — Профиль

### Мастер (Provider)
- `/provider/today` — Сегодня
- `/provider/calendar` — Календарь
- `/provider/bookings` — Записи
- `/provider/messages` — Сообщения
- `/provider/clients` — Клиенты
- `/provider/services` — Услуги
- `/provider/schedule` — Расписание
- `/provider/analytics` — Аналитика
- `/provider/profile` — Профиль (с финансами, продвижением, рекламой, Premium)

### Администратор
- `/admin/` — Dashboard
- `/admin/users` — Пользователи
- `/admin/providers` — Мастера
- `/admin/customers` — Клиенты
- `/admin/services` — Услуги
- `/admin/appointments` — Записи
- `/admin/payments` — Платежи
- `/admin/wallets` — Кошельки
- `/admin/transactions` — Транзакции
- `/admin/promotions` — Продвижение
- `/admin/advertisements` — Реклама
- `/admin/premium` — Premium
- `/admin/notifications` — Уведомления
- `/admin/audit` — Audit Log
- `/admin/settings` — Настройки

## Финансовая архитектура

### Принцип
- `Payment` — внешний платеж (ЮKassa)
- `Wallet` — внутренний баланс
- `Transaction` — история изменения баланса

### Flow пополнения
```
User → Backend → Create Payment → ЮKassa → User pays
→ Webhook → Backend verifies → Payment = SUCCEEDED
→ WalletService.credit() → Transaction → Wallet balance
→ Notification
```

### Идмпотентность
- Webhook может прийти 1 или 10 раз
- Баланс изменится только один раз
- Используется `payment_events` для отслеживания

### Безопасность
- Деньги хранятся в копейках (integer)
- Все финансовые операции через backend
- Frontend никогда не считает платеж успешным
- Transaction нельзя редактировать задним числом
- Параллельные списания защищены locking

## Демо-доступ

| Роль | Email | Пароль |
|------|-------|--------|
| Админ | admin@beautykrk.ru | любой |
| Мастер | anna@beautykrk.ru | любой |
| Клиент | client@mail.ru | любой |

## Установка

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Будущее развитие

### Модули
- Beauty (активен)
- Auto
- Barbershop
- Repair
- Cleaning
- Education

### Мобильные приложения
- Android (Kotlin + Jetpack Compose)
- iOS (SwiftUI)

### Платежные провайдеры
- ЮKassa (основной)
- T-Bank
- CloudPayments
- Robokassa
