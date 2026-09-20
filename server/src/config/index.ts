import dotenv from 'dotenv';
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),
  host: process.env.HOST || '0.0.0.0',

  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/beautykrk',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'dev-jwt-secret-change-in-production',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-jwt-refresh-secret-change-in-production',
    accessTtl: '15m',
    refreshTtl: '7d',
  },

  yooKassa: {
    shopId: process.env.YOOKASSA_SHOP_ID || '',
    secretKey: process.env.YOOKASSA_SECRET_KEY || '',
    returnUrl: process.env.YOOKASSA_RETURN_URL || 'http://localhost:3000/payment/return',
    enabled: process.env.YOOKASSA_ENABLED === 'true',
  },

  app: {
    url: process.env.APP_URL || 'http://localhost:3000',
    apiUrl: process.env.API_URL || 'http://localhost:4000',
  },

  paymentMode: process.env.PAYMENT_MODE || 'mock', // 'mock' | 'production'
};
