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

  async verifyTransaction(provider: 'stripe' | 'paystack', reference: string) {
    logger.info(`[PAYMENT SERVICE] verifyTransaction called - Provider: ${provider}, Reference: ${reference}`);
    
    if (provider === 'paystack') {
      logger.info(`[PAYMENT SERVICE] Delegating to PaystackService.verifyTransaction`);
      return await this.paystackProvider.verifyTransaction(reference);
    } else if (provider === 'stripe') {
      // Stripe doesn't need manual verification in the same way
      logger.info(`[PAYMENT SERVICE] Stripe verification not implemented for reference: ${reference}`);
      return false;
    }
    throw new Error(`Provider ${provider} not supported`);
  }

  async initiateInstallmentPayment(userId: number, email: string, transactionId: number, installmentNumber: number, provider: 'stripe' | 'paystack' = 'paystack') {
    logger.info(`Initiating payment for installment ${installmentNumber} of transaction ${transactionId} for user ${userId}`);

    // 1. Fetch transaction and installment details
    const txRes = await pool.query("SELECT * FROM transactions WHERE id = $1 AND user_id = $2", [transactionId, userId]);
    const transaction = txRes.rows[0];

    if (!transaction) {
        throw new Error("Transaction not found or unauthorized");
    }

    const instRes = await pool.query(
        "SELECT * FROM installments WHERE transaction_id = $1 AND installment_number = $2",
        [transactionId, installmentNumber]
    );
    const installment = instRes.rows[0];

    if (!installment) {
        throw new Error("Installment not found");
    }

    if (installment.status === 'paid' || installment.status === 'succeeded') {
        throw new Error("Installment already paid");
    }

    const activeProvider = this.getProvider(provider);
    return await activeProvider.createCheckoutSession({
        userId,
        email,
        amount: parseFloat(installment.amount),
        currency: transaction.currency,
        type: 'installment',
        successUrl: provider === 'paystack'
            ? `${process.env.APP_URL}/payment/success?provider=paystack`
            : `${process.env.APP_URL}/payment/success?provider=stripe&session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${process.env.APP_URL}/payment/cancel`,
        metadata: {
            userId: userId.toString(),
            transactionId: transactionId.toString(),
            isInstallment: 'true',
            currentInstallment: installmentNumber.toString(),
        }
    });
  }

  async createInstallmentPlan(userId: number, email: string, totalAmount: number, currency: string, periods: number, provider: 'stripe' | 'paystack' = 'stripe', itemId?: number, deliveryAddress?: string, productionNotes?: string, quantity?: number) {
    logger.info(`Creating installment plan for user ${userId}: ${totalAmount} ${currency} over ${periods} months ${itemId ? `for item ${itemId}` : ''}`);
    
    // 1. Calculate installment amount
    const installmentAmount = totalAmount / periods;

    // 2. Create the initial transaction record in pending state
    const transactionResult = await pool.query(
        "INSERT INTO transactions (user_id, amount, currency, status, type, provider) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
        [userId, totalAmount, currency, 'pending', 'installment', provider]
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
        email, // Use the passed email
        amount: installmentAmount,
        currency: currency,
        type: 'installment',
        itemId,
        deliveryAddress,
        notes: productionNotes,
        quantity,
        successUrl: provider === 'paystack'
            ? `${process.env.APP_URL}/payment/success?provider=paystack`
            : `${process.env.APP_URL}/payment/success?provider=stripe&session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${process.env.APP_URL}/payment/cancel`,
        metadata: {
            userId: userId.toString(),
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
