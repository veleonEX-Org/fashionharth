import { StripeService } from "./stripeService.js";
import { PaystackService } from "./paystackService.js";
import { CreateCheckoutSessionOptions, PaymentProvider } from "./payment/types.js";
import { pool } from "../database/pool.js";
import { logger } from "../utils/logger.js";

export class PaymentService {
  private stripeProvider: StripeService;
  private paystackProvider: PaystackService;

  constructor() {
    this.stripeProvider = new StripeService();
    this.paystackProvider = new PaystackService();
  }

  async initiateCheckout(options: CreateCheckoutSessionOptions, provider: 'stripe' | 'paystack' = 'stripe') {
    const activeProvider = this.getProvider(provider);
    return await activeProvider.createCheckoutSession(options);
  }

  async handleWebhook(provider: 'stripe' | 'paystack', payload: any, signature: string) {
    const activeProvider = this.getProvider(provider);
    return await activeProvider.handleWebhook(payload, signature);
  }

  async createInstallmentPlan(userId: number, totalAmount: number, periods: number, provider: 'stripe' | 'paystack' = 'stripe', itemId?: number) {
    logger.info(`Creating installment plan for user ${userId}: ${totalAmount} over ${periods} months ${itemId ? `for item ${itemId}` : ''}`);
    
    // 1. Calculate installment amount
    const installmentAmount = totalAmount / periods;

    // 2. Create the initial transaction record in pending state
    const transactionResult = await pool.query(
        "INSERT INTO transactions (user_id, amount, currency, status, type, provider) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
        [userId, totalAmount, 'USD', 'pending', 'installment', provider]
    );
    const transactionId = transactionResult.rows[0].id;

    // 3. Create the installment schedule in the DB
    for (let i = 1; i <= periods; i++) {
        const dueDate = new Date();
        dueDate.setMonth(dueDate.getMonth() + (i - 1)); // i-1 because first payment is immediate

        await pool.query(
            "INSERT INTO installments (transaction_id, installment_number, total_installments, amount, due_date, status) VALUES ($1, $2, $3, $4, $5, $6)",
            [transactionId, i, periods, installmentAmount, dueDate, 'pending']
        );
    }
    
    const activeProvider = this.getProvider(provider);
    return await activeProvider.createCheckoutSession({
        userId,
        email: '', // In a real app, fetch user email from DB or pass it
        amount: installmentAmount,
        currency: 'USD',
        type: 'installment',
        successUrl: `${process.env.APP_URL}/success`,
        cancelUrl: `${process.env.APP_URL}/cancel`,
        metadata: {
            transactionId: transactionId.toString(),
            isInstallment: 'true',
            currentInstallment: '1',
            itemId: itemId?.toString() || ""
        }
    });
  }

  private getProvider(provider: 'stripe' | 'paystack'): PaymentProvider {
    if (provider === 'stripe') return this.stripeProvider;
    if (provider === 'paystack') return this.paystackProvider;
    throw new Error(`Provider ${provider} not implemented`);
  }
}

export const paymentService = new PaymentService();
