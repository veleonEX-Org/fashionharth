import Stripe from "stripe";
import { env } from "../config/env.js";
import { CreateCheckoutSessionOptions, PaymentProvider } from "./payment/types.js";
import { pool } from "../database/pool.js";
import { logger } from "../utils/logger.js";

export class StripeService implements PaymentProvider {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(env.stripe.secretKey, {
      apiVersion: "2024-12-18.acacia" as any,
    });
  }

  async createCustomer(email: string, metadata?: Record<string, any>): Promise<string> {
    const customer = await this.stripe.customers.create({
      email,
      metadata,
    });
    return customer.id;
  }

  async createCheckoutSession(options: CreateCheckoutSessionOptions): Promise<{ id: string; url: string | null }> {
    const { userId, email, amount, currency, type, planId, itemId, successUrl, cancelUrl, metadata } = options;

    // Get or create customer ID from database
    let customerId = await this.getCustomerId(userId);
    if (!customerId) {
      customerId = await this.createCustomer(email, { userId: userId.toString() });
      await this.saveCustomerId(userId, customerId);
    }

    const sessionOptions: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: type === "subscription" ? "Style Connoisseur Subscription" : 
                    type === "item" ? `Fashion Item Order: #${itemId}` :
                    "One-time Purchase",
            },
            unit_amount: Math.round(amount * 100), // convert to cents
            recurring: type === "subscription" ? { interval: "month" } : undefined,
          },
          quantity: 1,
        },
      ],
      mode: type === "subscription" ? "subscription" : "payment",
      allow_promotion_codes: true,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId: userId.toString(),
        type,
        planId: planId?.toString() || "",
        itemId: itemId?.toString() || "",
        ...metadata,
      },
    };

    const session = await this.stripe.checkout.sessions.create(sessionOptions);
    return { id: session.id, url: session.url };
  }

  async handleWebhook(payload: any, signature: string): Promise<void> {
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(payload, signature, env.stripe.webhookSecret);
    } catch (err: any) {
      logger.error(`Webhook signature verification failed: ${err.message}`);
      throw new Error(`Webhook Error: ${err.message}`);
    }

    logger.info(`Processing Stripe event: ${event.type}`);

    switch (event.type) {
      case "checkout.session.completed":
        await this.handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case "customer.subscription.deleted":
        await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      case "invoice.payment_succeeded":
        await this.handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      // Add more cases as needed
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    await this.stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true });
  }

  async getSubscription(subscriptionId: string): Promise<any> {
    return await this.stripe.subscriptions.retrieve(subscriptionId);
  }

  private async getCustomerId(userId: number): Promise<string | null> {
    const result = await pool.query(
      "SELECT customer_id FROM user_payment_profiles WHERE user_id = $1 AND provider = 'stripe'",
      [userId]
    );
    return result.rows[0]?.customer_id || null;
  }

  private async saveCustomerId(userId: number, customerId: string): Promise<void> {
    await pool.query(
      "INSERT INTO user_payment_profiles (user_id, provider, customer_id) VALUES ($1, 'stripe', $2) ON CONFLICT (user_id, provider) DO UPDATE SET customer_id = $2",
      [userId, customerId]
    );
  }

  private async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    const userId = parseInt(session.metadata?.userId || "0");
    const type = session.metadata?.type;
    const parentTxIdFromMeta = session.metadata?.transactionId ? parseInt(session.metadata.transactionId) : undefined;
    const providerPaymentId = session.payment_intent as string || session.subscription as string;
    const currentInstallment = session.metadata?.currentInstallment;
    
    let transactionId: number;
    let description = "Fashion Purchase";

    // Try to get item title for description
    try {
        const itemId = session.metadata?.itemId;
        if (itemId) {
            const itemRes = await pool.query("SELECT title FROM items WHERE id = $1", [itemId]);
            if (itemRes.rows.length > 0) {
                const itemTitle = itemRes.rows[0].title;
                if (type === 'installment') {
                    description = `Installment ${currentInstallment || '1'} for ${itemTitle}`;
                } else {
                    description = `Payment for ${itemTitle}`;
                }
            }
        } else if (type === 'installment') {
             description = `Installment ${currentInstallment || '1'} Payment`;
        }
    } catch (descErr) {
        logger.warn(`Failed to generate description for Stripe: ${descErr}`);
    }

    if (parentTxIdFromMeta && currentInstallment !== "1") {
        // Subsequent installment: INSERT NEW for history
        logger.info(`[STRIPE CHARGE] Subsequent installment. Inserting new transaction record for history.`);
        const txResult = await pool.query(
            "INSERT INTO transactions (user_id, amount, currency, status, type, provider, provider_payment_id, provider_checkout_id, description) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id",
            [
                userId,
                (session.amount_total || 0) / 100,
                session.currency || 'USD',
                "succeeded",
                "installment",
                "stripe",
                providerPaymentId || session.id,
                session.id,
                description
            ]
        );
        transactionId = txResult.rows[0]?.id;
    } else if (parentTxIdFromMeta) {
        // First installment or linked: Update existing parent
        logger.info(`[STRIPE CHARGE] Updating existing transaction ${parentTxIdFromMeta}`);
        await pool.query(
            "UPDATE transactions SET status = $1, provider_payment_id = $2, provider_checkout_id = $3, description = $4, updated_at = NOW() WHERE id = $5",
            ["succeeded", providerPaymentId || session.id, session.id, description, parentTxIdFromMeta]
        );
        transactionId = parentTxIdFromMeta;
    } else {
        // One-time or generic payment
        const txResult = await pool.query(
            "INSERT INTO transactions (user_id, amount, currency, status, type, provider, provider_checkout_id, provider_payment_id, description) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (provider_payment_id) DO UPDATE SET status = 'succeeded', description = $9, updated_at = NOW() RETURNING id",
            [
                userId,
                (session.amount_total || 0) / 100,
                session.currency || 'USD',
                "succeeded",
                type || "one-time",
                "stripe",
                session.id,
                providerPaymentId || session.id,
                description
            ]
        );
        transactionId = txResult.rows[0]?.id;
    }

    if (parentTxIdFromMeta && type === "installment") {
        const instNum = parseInt(currentInstallment || "1");
        // Mark the installment as paid
        await pool.query(
            "UPDATE installments SET status = 'paid', provider_payment_id = $1, updated_at = NOW() WHERE transaction_id = $2 AND installment_number = $3",
            [providerPaymentId || session.id, parentTxIdFromMeta, instNum]
        );

        // If not the first installment, find and update the associated task
        if (instNum > 1) {
            const taskRes = await pool.query(
                "SELECT id, amount_paid FROM tasks WHERE notes LIKE $1",
                [`%parent transaction ID: ${parentTxIdFromMeta}%`]
            );
            
            if (taskRes.rows.length > 0) {
                const task = taskRes.rows[0];
                const newAmountPaid = Number(task.amount_paid) + ((session.amount_total || 0) / 100);
                await pool.query(
                    "UPDATE tasks SET amount_paid = $1, updated_at = NOW() WHERE id = $2",
                    [newAmountPaid, task.id]
                );
            }
        }
    }

    if (type === "subscription" && session.subscription) {
      // ... handling existing subscription logic
      const subscription = await this.stripe.subscriptions.retrieve(session.subscription as string);
      await pool.query(
        "INSERT INTO subscriptions (user_id, plan_id, provider_subscription_id, status, current_period_start, current_period_end) VALUES ($1, $2, $3, $4, TO_TIMESTAMP($5), TO_TIMESTAMP($6)) ON CONFLICT (provider_subscription_id) DO UPDATE SET status = $4, current_period_end = TO_TIMESTAMP($6), updated_at = NOW()",
        [
          userId,
          parseInt(session.metadata?.planId || "1"),
          subscription.id,
          subscription.status,
          (subscription as any).current_period_start,
          (subscription as any).current_period_end
        ]
      );
    }

    const isFirstInstallment = type === "installment" && session.metadata?.currentInstallment === "1";
    const itemIdFromMeta = session.metadata?.itemId;

    if ((type === "item" || isFirstInstallment) && itemIdFromMeta) {
      const itemId = parseInt(itemIdFromMeta);
      
      // 1. Fetch item details
      const itemRes = await pool.query("SELECT title, category, price FROM items WHERE id = $1", [itemId]);
      const item = itemRes.rows[0];
      if (!item) return;

      // 2. Fetch or create a customer profile
      const userRes = await pool.query("SELECT first_name, last_name, email FROM users WHERE id = $1", [userId]);
      const user = userRes.rows[0];
      
      let customerId: number;
      const existingCustomer = await pool.query("SELECT id FROM customers WHERE email = $1", [user.email]);
      
      if (existingCustomer.rows.length > 0) {
        customerId = existingCustomer.rows[0].id;
      } else {
        const newCustomer = await pool.query(
          "INSERT INTO customers (name, email) VALUES ($1, $2) RETURNING id",
          [`${user.first_name} ${user.last_name}`, user.email]
        );
        customerId = newCustomer.rows[0].id;
      }
      
      // 3. Create a production task
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14); 
      const deadline = new Date(dueDate);
      deadline.setDate(deadline.getDate() - 3);

      const amountPaidResult = (session.amount_total || 0) / 100;
      const totalAmount = parseFloat(item.price);

      await pool.query(
        `INSERT INTO tasks (customer_id, category, total_amount, amount_paid, due_date, deadline, status, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          customerId, 
          item.category || 'General', 
          totalAmount, 
          amountPaidResult,
          dueDate,
          deadline,
          'pending',
          `Order from checkout for item: ${item.title}. parent transaction ID: ${transactionId}. ${isFirstInstallment ? 'Started via Installment Plan.' : 'Paid in Full.'}`
        ]
      );
      
      logger.info(`Production task created for item ${itemId} from user ${userId} (${type})`);
    }
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    await pool.query(
      "UPDATE subscriptions SET status = 'canceled', updated_at = NOW() WHERE provider_subscription_id = $1",
      [subscription.id]
    );
  }

  private async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
    if (!(invoice as any).subscription) return;
    
    await pool.query(
      "UPDATE subscriptions SET status = 'active', current_period_end = TO_TIMESTAMP($1), updated_at = NOW() WHERE provider_subscription_id = $2",
      [(invoice as any).period_end, (invoice as any).subscription as string]
    );
  }
}
