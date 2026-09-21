# MASTERS KRK — BeautyKRK

Универсальная CRM / Marketplace для сферы услуг (Beauty, Auto, Barbershop, Repair, Cleaning, Education).

## 📋 Содержание

- [Архитектура](#архитектура)
- [Технологии](#технологии)
- [Структура проекта](#структура-проекта)
- [Установка и запуск](#установка-и-запуск)
- [База данных](#база-данных)
- [Аутентификация](#аутентификация)
- [Платежи и ЮKassa](#платежи-и-yookassa)
- [API](#api)
- [Роли и права](#роли-и-права)
- [Development](#development)

---

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
                    API (REST)
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
- Zustand (client state)
- API Client (fetch-based)

### Backend
- Node.js + TypeScript
- Fastify
- PostgreSQL
- JWT Authentication
- Zod (validation)
- bcryptjs (password hashing)

### Payments
- ЮKassa (production)
- Mock Provider (development)

---

## Структура проекта

```
MASTERS-KRK/
│
├── src/                     # Frontend (React)
│   ├── api/                 # API клиент
│   │   ├── client.ts        # Базовый HTTP клиент
│   │   └── index.ts         # API модули
│   ├── components/
│   │   ├── ui/              # Переиспользуемые компоненты
│   │   └── layouts/         # Layouts (Client/Provider/Admin)
│   ├── data/
│   │   └── mockData.ts      # Мок-данные (fallback)
│   ├── pages/
│   │   ├── auth/            # Страницы авторизации
│   │   ├── client/          # Клиентский кабинет
│   │   ├── provider/        # Кабинет мастера
│   │   └── admin/           # Админ-панель
│   ├── store/               # Zustand store
│   ├── types/               # TypeScript типы
│   └── utils/               # Утилиты
│
├── server/                  # Backend (Fastify)
│   ├── src/
│   │   ├── config/          # Конфигурация
│   │   ├── db/              # Database (pool, migrate, seed)
│   │   ├── middleware/      # Auth middleware
│   │   ├── routes/          # API маршруты
│   │   ├── services/        # Бизнес-логика
│   │   └── index.ts         # Точка входа
│   └── package.json
│
├── database/
│   └── schema.sql           # Полная схема БД
│
├── .env.example             # Пример конфигурации
└── README.md
```

---

## Установка и запуск

### 1. Клонирование и зависимости

```bash
# Frontend
npm install

# Backend
cd server && npm install
```

### 2. Конфигурация

```bash
cp .env.example .env
# Отредактируйте .env, укажите DATABASE_URL, JWT_SECRET и т.д.
```

### 3. PostgreSQL

```bash
# Создайте базу данных
createdb beautykrk

# Или через psql
psql -c "CREATE DATABASE beautykrk;"
```

### 4. Миграции

```bash
cd server
npm run migrate
```

### 5. Seed (тестовые данные)

```bash
cd server
npm run seed
```

### 6. Запуск

```bash
# Backend (порт 4000)
cd server && npm run dev

# Frontend (порт 3000)
npm run dev
```

---

## База данных

### Основные таблицы

| Таблица | Описание |
|---------|----------|
| `users` | Пользователи системы |
| `organizations` | Организации/бизнесы |
| `providers` | Мастера/поставщики услуг |
| `customers` | Клиенты |
| `services` | Услуги |
| `service_categories` | Категории услуг |
| `appointments` | Записи/бронирования |
| `schedules` | Расписание мастеров |
| `schedule_exceptions` | Исключения (выходные, отпуск) |
| `wallets` | Внутренние кошельки |
| `transactions` | История транзакций |
| `payments` | Внешние платежи |
| `payment_events` | Webhook события (идемпотентность) |
| `promotions` | Продвижение |
| `advertisements` | Реклама |
| `premium_subscriptions` | Premium подписки |
| `notifications` | Уведомления |
| `reviews` | Отзывы |
| `audit_logs` | Журнал аудита |
| `system_settings` | Системные настройки |
| `refresh_tokens` | Refresh tokens |

### Финансовые гарантии

- Все суммы хранятся в копейках (integer)
- Транзакции неизменяемы
- Баланс изменяется только через атомарные операции
- Row-level locking для защиты от race conditions
- Exclusion constraint для защиты от double booking

---

## Аутентификация

### Flow

```
POST /api/auth/register → создание пользователя
POST /api/auth/login → получение JWT token
GET /api/auth/me → проверка токена
POST /api/auth/logout → выход
```

### Безопасность

- Пароли хранятся только в виде bcrypt hash (12 rounds)
- JWT access token (15 мин)
- Refresh tokens в базе данных
- Middleware `authenticate` проверяет каждый защищенный запрос
- Middleware `requireRole` проверяет права доступа

---

## Платежи и ЮKassa

### Архитектура

```
Frontend
   ↓
POST /api/payments/create
   ↓
Backend создает Payment (CREATED)
   ↓
Запрос к ЮKassa
   ↓
Получение confirmationUrl
   ↓
Frontend перенаправляет пользователя
   ↓
ЮKassa → webhook → Backend
   ↓
Проверка идемпотентности (payment_events)
   ↓
Payment = SUCCEEDED
   ↓
WalletService.credit() (в DB transaction)
   ↓
Transaction создана
   ↓
Notification отправлена
```

### Идеммотентность

- Каждый webhook обрабатывается только один раз
- Таблица `payment_events` хранит все полученные события
- `UNIQUE(provider_event_id)` предотвращает дублирование
- Баланс изменяется только после подтверждения

### Безопасность

- Secret Key ЮKassa хранится ТОЛЬКО на сервере
- Frontend никогда не получает секретный ключ
- Настройки платежей маскируются в API ответах
- Все финансовые операции записываются в Audit Log

---

## API

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`

### Users
- `GET /api/users`
- `GET /api/users/:id`
- `PATCH /api/users/:id`

### Providers
- `GET /api/providers`
- `GET /api/providers/:id`
- `POST /api/providers`
- `PATCH /api/providers/:id`

### Services
- `GET /api/services?providerId=&categoryId=&status=`
- `GET /api/services/:id`
- `POST /api/services`
- `PATCH /api/services/:id`
- `DELETE /api/services/:id`

### Appointments
- `GET /api/appointments`
- `GET /api/appointments/:id`
- `POST /api/appointments`
- `POST /api/appointments/:id/confirm`
- `POST /api/appointments/:id/cancel`
- `POST /api/appointments/:id/complete`

### Availability
- `GET /api/availability?providerId=&date=&duration=`

### Wallets
- `GET /api/wallets`
- `GET /api/wallets/me`
- `GET /api/wallets/:id`
- `GET /api/wallets/:id/transactions`
- `POST /api/wallets/:id/adjust` (admin)

### Payments
- `POST /api/payments/create`
- `GET /api/payments/:id`
- `GET /api/payments/my`
- `GET /api/payments/all` (admin)
- `POST /api/payments/yookassa/webhook`
- `POST /api/payments/mock/confirm/:id` (development only)

### Promotions
- `GET /api/promotions`
- `POST /api/promotions`
- `PATCH /api/promotions/:id`

### Notifications
- `GET /api/notifications`
- `POST /api/notifications/:id/read`
- `POST /api/notifications/read-all`

### Admin
- `GET /api/admin/dashboard`
- `GET /api/admin/settings`
- `PATCH /api/admin/settings`

### Audit
- `GET /api/audit`

---

## Роли и права

| Роль | Описание | Доступ |
|------|----------|--------|
| SUPER_ADMIN | Полный доступ | Все |
| FINANCE_ADMIN | Финансы | Payments, Wallets, Transactions |
| SUPPORT_ADMIN | Поддержка | Users, Customers, Bookings |
| CONTENT_ADMIN | Контент | Services, Promotions, Ads |
| ANALYST | Аналитика | Read-only dashboard |
| PROVIDER | Мастер | Свой профиль, записи, кошелек |
| CUSTOMER | Клиент | Записи, мастера, услуги |

---

## Development

### Demo аккаунты

| Роль | Email | Пароль |
|------|-------|--------|
| Admin | admin@beautykrk.ru | password123 |
| Provider | anna@beautykrk.ru | password123 |
| Customer | client@mail.ru | password123 |

### Режимы работы

**Mock mode (по умолчанию):**
- Frontend работает с локальными данными
- Не требует backend
- Подходит для UI разработки

**API mode:**
- Frontend обращается к backend
- Требует запущенный сервер и БД
- Установите `VITE_USE_API=true`

### Проверка

```bash
# Frontend
npm run typecheck
npm run build

# Backend
cd server
npm run typecheck
npm run build
```

---

## Production

### Checklist

- [ ] Установить `NODE_ENV=production`
- [ ] Сменить `JWT_SECRET` на случайную строку
- [ ] Настроить `DATABASE_URL` для production PostgreSQL
- [ ] Настроить ЮKassa через Admin UI (не через ENV)
- [ ] Настроить HTTPS
- [ ] Настроить CORS для production домена
- [ ] Настроить rate limiting
- [ ] Настроить webhook URL для ЮKassa
- [ ] Выполнить backup strategy

---

## Этап 2 — Стабилизация ядра ✅

Проведена полная стабилизация ядра системы:

### Что исправлено:

1. **Payment Provider Abstraction**
   - Создан интерфейс `PaymentProvider`
   - Реализованы `MockPaymentProvider` и `YooKassaProvider`
   - Бизнес-логика не зависит от конкретного провайдера

2. **Payment Settings Service**
   - Настройки ЮKassa хранятся в PostgreSQL
   - Админ может изменять настройки через UI
   - Secret Key маскируется в API ответах
   - Защита от перезаписи маскированного ключа

3. **Authorization & Security**
   - Правильные связи User → Provider → Customer через `user_id`
   - Backend вычисляет критические данные (price, duration, endAt)
   - Authorization checks на всех endpoints
   - Пользователь видит только свои данные

4. **Database Improvements**
   - Добавлены CHECK constraints
   - Система версионирования миграций
   - Улучшены индексы и foreign keys

5. **Seed Data**
   - Правильные связи между сущностями
   - Все foreign keys корректны
   - Пароли захешированы

Подробный отчёт: [STABILIZATION_REPORT.md](./STABILIZATION_REPORT.md)

---

## Лицензия

Private — MASTERS KRK / BeautyKRK
