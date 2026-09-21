/**
 * Payment Provider Interface
 * Abstract interface for payment providers (YooKassa, Mock, etc.)
 */

export interface PaymentProviderConfig {
  shopId: string;
  secretKey: string;
  returnUrl: string;
}

export interface CreatePaymentRequest {
  amount: number; // in kopecks
  currency: string;
  description: string;
  metadata: Record<string, any>;
  idempotencyKey: string;
}

export interface CreatePaymentResponse {
  providerPaymentId: string;
  confirmationUrl: string;
}

export interface PaymentProvider {
  createPayment(request: CreatePaymentRequest): Promise<CreatePaymentResponse>;
  getPayment(providerPaymentId: string): Promise<any>;
  cancelPayment(providerPaymentId: string): Promise<void>;
}
