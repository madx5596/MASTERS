import type { PaymentProvider, CreatePaymentRequest, CreatePaymentResponse, PaymentProviderConfig } from './payment-provider.js';

/**
 * YooKassa Payment Provider
 * Real payment processing via YooKassa API
 */
export class YooKassaProvider implements PaymentProvider {
  private config: PaymentProviderConfig;
  private baseUrl = 'https://api.yookassa.ru/v3';

  constructor(config: PaymentProviderConfig) {
    this.config = config;
  }

  private getAuthHeader(): string {
    const credentials = Buffer.from(`${this.config.shopId}:${this.config.secretKey}`).toString('base64');
    return `Basic ${credentials}`;
  }

  async createPayment(request: CreatePaymentRequest): Promise<CreatePaymentResponse> {
    const response = await fetch(`${this.baseUrl}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.getAuthHeader(),
        'Idempotence-Key': request.idempotencyKey,
      },
      body: JSON.stringify({
        amount: {
          value: (request.amount / 100).toFixed(2),
          currency: request.currency,
        },
        capture: true,
        confirmation: {
          type: 'redirect',
          return_url: this.config.returnUrl,
        },
        description: request.description,
        metadata: request.metadata,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`YooKassa API error: ${response.status} - ${error}`);
    }

    const data = await response.json();

    return {
      providerPaymentId: data.id,
      confirmationUrl: data.confirmation.confirmation_url,
    };
  }

  async getPayment(providerPaymentId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/payments/${providerPaymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': this.getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error(`YooKassa API error: ${response.status}`);
    }

    return response.json();
  }

  async cancelPayment(providerPaymentId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/payments/${providerPaymentId}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.getAuthHeader(),
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      throw new Error(`YooKassa API error: ${response.status}`);
    }
  }
}
