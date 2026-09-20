import bcrypt from 'bcryptjs';
import { pool } from './pool.js';

async function seed() {
  console.log('🌱 Starting seed...');

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Create users with hashed passwords
    const passwordHash = await bcrypt.hash('password123', 12);

    const users = [
      { email: 'admin@beautykrk.ru', firstName: 'Александр', lastName: 'Админов', role: 'SUPER_ADMIN', phone: '+79001111111' },
      { email: 'finance@beautykrk.ru', firstName: 'Финанс', lastName: 'Админов', role: 'FINANCE_ADMIN', phone: '+79002222222' },
      { email: 'anna@beautykrk.ru', firstName: 'Анна', lastName: 'Иванова', role: 'PROVIDER', phone: '+79003333333' },
      { email: 'maria@beautykrk.ru', firstName: 'Мария', lastName: 'Петрова', role: 'PROVIDER', phone: '+79004444444' },
      { email: 'client@mail.ru', firstName: 'Елена', lastName: 'Смирнова', role: 'CUSTOMER', phone: '+79005555555' },
      { email: 'olga@mail.ru', firstName: 'Ольга', lastName: 'Козлова', role: 'CUSTOMER', phone: '+79006666666' },
    ];

    const userIds: Record<string, string> = {};

    for (const user of users) {
      const result = await client.query(
        `INSERT INTO users (email, phone, first_name, last_name, password_hash, role, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'ACTIVE')
         ON CONFLICT (email) DO UPDATE SET role = EXCLUDED.role
         RETURNING id`,
        [user.email, user.phone, user.firstName, user.lastName, passwordHash, user.role]
      );
      userIds[user.email] = result.rows[0].id;
    }

    console.log('✅ Users created');

    // Create organization
    const orgResult = await client.query(
      `INSERT INTO organizations (name, slug, business_type, owner_id, status)
       VALUES ('Beauty Studio KRK', 'beauty-studio-krk', 'BEAUTY', $1, 'ACTIVE')
       ON CONFLICT (slug) DO UPDATE SET owner_id = EXCLUDED.owner_id
       RETURNING id`,
      [userIds['admin@beautykrk.ru']]
    );
    const orgId = orgResult.rows[0].id;

    console.log('✅ Organization created');

    // Create providers (linked to users via user_id)
    const providers = [
      { userId: userIds['anna@beautykrk.ru'], firstName: 'Анна', lastName: 'Иванова', displayName: 'Анна Иванова', description: 'Мастер маникюра с опытом 5 лет', specializations: ['Маникюр', 'Педикюр', 'Дизайн ногтей'] },
      { userId: userIds['maria@beautykrk.ru'], firstName: 'Мария', lastName: 'Петрова', displayName: 'Мария Петрова', description: 'Парикмахер-стилист', specializations: ['Стрижки', 'Окрашивание', 'Укладки'] },
    ];

    const providerIds: string[] = [];
    for (const p of providers) {
      const result = await client.query(
        `INSERT INTO providers (user_id, organization_id, first_name, last_name, display_name, description, specializations, rating, review_count, is_premium)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 4.8, 124, TRUE)
         RETURNING id`,
        [p.userId, orgId, p.firstName, p.lastName, p.displayName, p.description, p.specializations]
      );
      providerIds.push(result.rows[0].id);
    }

    console.log('✅ Providers created');

    // Create customers (linked to users via user_id)
    const customers = [
      { userId: userIds['client@mail.ru'], firstName: 'Елена', lastName: 'Смирнова', phone: '+79005555555', email: 'client@mail.ru' },
      { userId: userIds['olga@mail.ru'], firstName: 'Ольга', lastName: 'Козлова', phone: '+79006666666', email: 'olga@mail.ru' },
    ];

    const customerIds: string[] = [];
    for (const c of customers) {
      const result = await client.query(
        `INSERT INTO customers (user_id, organization_id, first_name, last_name, phone, email)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [c.userId, orgId, c.firstName, c.lastName, c.phone, c.email]
      );
      customerIds.push(result.rows[0].id);
    }

    console.log('✅ Customers created');

    // Create service categories
    const categories = [
      { name: 'Маникюр', icon: '💅' },
      { name: 'Педикюр', icon: '🦶' },
      { name: 'Волосы', icon: '💇' },
      { name: 'Косметология', icon: '✨' },
    ];

    const categoryIds: string[] = [];
    for (const cat of categories) {
      const result = await client.query(
        `INSERT INTO service_categories (name, icon, business_type) VALUES ($1, $2, 'BEAUTY') RETURNING id`,
        [cat.name, cat.icon]
      );
      categoryIds.push(result.rows[0].id);
    }

    console.log('✅ Service categories created');

    // Create services
    const services = [
      { providerId: providerIds[0], name: 'Маникюр классический', description: 'Классический маникюр', price: 150000, duration: 60, categoryId: categoryIds[0] },
      { providerId: providerIds[0], name: 'Маникюр + покрытие гель-лак', description: 'Маникюр с покрытием', price: 250000, duration: 90, categoryId: categoryIds[0] },
      { providerId: providerIds[0], name: 'Снятие покрытия', description: 'Снятие гель-лака', price: 50000, duration: 30, categoryId: categoryIds[0] },
      { providerId: providerIds[0], name: 'Педикюр классический', description: 'Классический педикюр', price: 200000, duration: 75, categoryId: categoryIds[1] },
      { providerId: providerIds[1], name: 'Женская стрижка', description: 'Стрижка с укладкой', price: 200000, duration: 60, categoryId: categoryIds[2] },
      { providerId: providerIds[1], name: 'Окрашивание', description: 'Однотонное окрашивание', price: 450000, duration: 120, categoryId: categoryIds[2] },
    ];

    for (const s of services) {
      await client.query(
        `INSERT INTO services (organization_id, provider_id, name, description, price, duration, category_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [orgId, s.providerId, s.name, s.description, s.price, s.duration, s.categoryId]
      );
    }

    console.log('✅ Services created');

    // Create schedules for providers
    for (const providerId of providerIds) {
      for (let day = 1; day <= 5; day++) {
        await client.query(
          `INSERT INTO schedules (provider_id, day_of_week, start_time, end_time, is_active)
           VALUES ($1, $2, '09:00', '18:00', TRUE)
           ON CONFLICT (provider_id, day_of_week) DO NOTHING`,
          [providerId, day]
        );
      }
      await client.query(
        `INSERT INTO schedules (provider_id, day_of_week, start_time, end_time, is_active)
         VALUES ($1, 6, '10:00', '16:00', TRUE)
         ON CONFLICT (provider_id, day_of_week) DO NOTHING`,
        [providerId]
      );
      await client.query(
        `INSERT INTO schedules (provider_id, day_of_week, start_time, end_time, is_active)
         VALUES ($1, 0, '00:00', '00:00', FALSE)
         ON CONFLICT (provider_id, day_of_week) DO NOTHING`,
        [providerId]
      );
    }

    console.log('✅ Schedules created');

    // Create wallets for providers
    for (let i = 0; i < providerIds.length; i++) {
      await client.query(
        `INSERT INTO wallets (owner_id, organization_id, balance, currency)
         VALUES ($1, $2, $3, 'RUB')
         ON CONFLICT (owner_id) DO NOTHING`,
        [providerIds[i], orgId, i === 0 ? 1500000 : 350000]
      );
    }

    console.log('✅ Wallets created');

    // Create sample appointments
    const today = new Date().toISOString().split('T')[0];
    const appointments = [
      { customerId: customerIds[0], providerId: providerIds[0], startAt: `${today}T10:00:00`, endAt: `${today}T11:30:00`, price: 250000, status: 'CONFIRMED' },
      { customerId: customerIds[1], providerId: providerIds[0], startAt: `${today}T12:00:00`, endAt: `${today}T13:00:00`, price: 150000, status: 'CONFIRMED' },
    ];

    for (const apt of appointments) {
      await client.query(
        `INSERT INTO appointments (organization_id, customer_id, provider_id, service_id, start_at, end_at, status, price)
         VALUES ($1, $2, $3, (SELECT id FROM services WHERE provider_id = $3 LIMIT 1), $4, $5, $6, $7)`,
        [orgId, apt.customerId, apt.providerId, apt.startAt, apt.endAt, apt.status, apt.price]
      );
    }

    console.log('✅ Appointments created');

    // Create system settings
    await client.query(
      `INSERT INTO system_settings (key, value) VALUES ('payment', $1)
       ON CONFLICT (key) DO UPDATE SET value = $1`,
      [JSON.stringify({
        enabled: false,
        provider: 'mock',
        yooKassaShopId: '',
        yooKassaSecretKey: '',
        returnUrl: 'http://localhost:3000/payment/return',
        minTopUp: 50000,
        maxTopUp: 50000000,
        webhookStatus: 'inactive',
        lastWebhookAt: null,
      })]
    );

    console.log('✅ System settings created');

    await client.query('COMMIT');
    console.log('🎉 Seed completed successfully!');
    console.log('\n📋 Demo accounts:');
    console.log('  Admin: admin@beautykrk.ru / password123');
    console.log('  Finance: finance@beautykrk.ru / password123');
    console.log('  Provider: anna@beautykrk.ru / password123');
    console.log('  Provider: maria@beautykrk.ru / password123');
    console.log('  Customer: client@mail.ru / password123');
    console.log('  Customer: olga@mail.ru / password123');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch(console.error);
