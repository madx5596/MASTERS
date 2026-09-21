import type { PaymentProvider, CreatePaymentRequest, CreatePaymentResponse } from './payment-provider.js';
import { config } from '../config/index.js';

/**
 * Mock Payment Provider for development/testing
 * Simulates payment flow without real payment processing
 */
export class MockPaymentProvider implements PaymentProvider {
  async createPayment(request: CreatePaymentRequest): Promise<CreatePaymentResponse> {
    // Simulate payment creation
    const providerPaymentId = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const confirmationUrl = `${config.app.url}/payment/mock/${providerPaymentId}`;

    console.log('[MockPayment] Created payment:', {
      providerPaymentId,
      amount: request.amount,
      description: request.description,
    });

    return {
      providerPaymentId,
      confirmationUrl,
    };
  }

  async getPayment(providerPaymentId: string): Promise<any> {
    // Mock always returns succeeded for testing
    return {
      id: providerPaymentId,
      status: 'succeeded',
      amount: { value: '1000.00', currency: 'RUB' },
    };
  }

  async cancelPayment(providerPaymentId: string): Promise<void> {
    console.log('[MockPayment] Cancelled payment:', providerPaymentId);
  }
}
