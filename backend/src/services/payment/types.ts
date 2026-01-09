export interface CreateCheckoutSessionOptions {
  userId: number;
  email: string;
  amount: number;
  currency: string;
  type: 'one-time' | 'subscription' | 'installment' | 'item';
  planId?: number;
  itemId?: number;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, any>;
}

export interface PaymentProvider {
  createCustomer(email: string, metadata?: Record<string, any>): Promise<string>;
  
  createCheckoutSession(options: CreateCheckoutSessionOptions): Promise<{
    id: string;
    url: string | null;
  }>;

  handleWebhook(payload: any, signature: string): Promise<void>;
  
  cancelSubscription(subscriptionId: string): Promise<void>;
  
  getSubscription(subscriptionId: string): Promise<any>;
}
