import axios from "axios";
import crypto from "crypto";
import { env } from "../config/env.js";
import { CreateCheckoutSessionOptions, PaymentProvider } from "./payment/types.js";
import { pool } from "../database/pool.js";
import { logger } from "../utils/logger.js";

export class PaystackService implements PaymentProvider {
  private readonly baseUrl = "https://api.paystack.co";

  async createCustomer(email: string, metadata?: Record<string, any>): Promise<string> {
    const response = await axios.post(
      `${this.baseUrl}/customer`,
      { email, metadata },
      {
        headers: { Authorization: `Bearer ${env.paystack.secretKey}` },
      }
    );
    return response.data.data.customer_code;
  }

  async createCheckoutSession(options: CreateCheckoutSessionOptions): Promise<{ id: string; url: string | null }> {
    const { email, amount, currency, type, planId, successUrl, metadata } = options;

    const payload = {
      email,
      amount: Math.round(amount * 100), // convert to kobo/cents
      currency: currency.toUpperCase(),
      callback_url: successUrl,
      metadata: {
        ...metadata,
        type,
        planId,
        itemId: options.itemId,
        userId: options.userId,
      },
    };

    try {
      const response = await axios.post(`${this.baseUrl}/transaction/initialize`, payload, {
        headers: { Authorization: `Bearer ${env.paystack.secretKey}` },
      });

      return {
        id: response.data.data.reference,
        url: response.data.data.authorization_url,
      };
    } catch (error: any) {
      logger.error(`Paystack initialization failed: ${error.message}`);
      if (error.response) {
        logger.error(`Paystack response: ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  }

  async handleWebhook(payload: any, signature: string): Promise<void> {
    const hash = crypto
      .createHmac("sha512", env.paystack.webhookSecret)
      .update(JSON.stringify(payload))
      .digest("hex");

    if (hash !== signature) {
      throw new Error("Invalid signature");
    }

    const event = payload.event;
    logger.info(`Processing Paystack event: ${event}`);

    switch (event) {
      case "charge.success":
        await this.handleChargeSuccess(payload.data);
        break;
      case "subscription.create":
        await this.handleSubscriptionCreate(payload.data);
        break;
      case "subscription.disable":
        await this.handleSubscriptionDisable(payload.data);
        break;
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    await axios.post(
      `${this.baseUrl}/subscription/disable`,
      { code: subscriptionId, token: "..." }, // Requires token usually or just code
      {
        headers: { Authorization: `Bearer ${env.paystack.secretKey}` },
      }
    );
  }

  async getSubscription(subscriptionId: string): Promise<any> {
    const response = await axios.get(`${this.baseUrl}/subscription/${subscriptionId}`, {
      headers: { Authorization: `Bearer ${env.paystack.secretKey}` },
    });
    return response.data.data;
  }

  async verifyTransaction(reference: string): Promise<boolean> {
    try {
      logger.info(`[PAYSTACK VERIFY] Starting verification for reference: ${reference}`);
      
      const response = await axios.get(`${this.baseUrl}/transaction/verify/${reference}`, {
        headers: { Authorization: `Bearer ${env.paystack.secretKey}` },
      });

      const data = response.data.data;
      logger.info(`[PAYSTACK VERIFY] API Response - Status: ${data.status}, Amount: ${data.amount}, Currency: ${data.currency}`);
      logger.info(`[PAYSTACK VERIFY] Metadata: ${JSON.stringify(data.metadata)}`);
      
      if (data.status === 'success') {
        logger.info(`[PAYSTACK VERIFY] Transaction ${reference} verified successfully. Calling handleChargeSuccess...`);
        await this.handleChargeSuccess(data);
        logger.info(`[PAYSTACK VERIFY] handleChargeSuccess completed for ${reference}`);
        return true;
      } else {
        logger.warn(`[PAYSTACK VERIFY] Transaction ${reference} verification failed. Status: ${data.status}`);
        return false;
      }
    } catch (error: any) {
      logger.error(`[PAYSTACK VERIFY] Verification error for reference ${reference}: ${error.message}`);
      if (error.response) {
        logger.error(`[PAYSTACK VERIFY] Error response: ${JSON.stringify(error.response.data)}`);
      }
      return false;
    }
  }

  private async handleChargeSuccess(data: any) {
    logger.info(`[PAYSTACK CHARGE] Starting handleChargeSuccess for reference: ${data.reference}`);
    
    const metadata = data.metadata;
    const userId = parseInt(metadata?.userId || "0");
    const type = metadata?.type;
    const isFirstInstallment = type === "installment" && metadata?.currentInstallment === "1";
    const itemIdFromMeta = metadata?.itemId;
    
    logger.info(`[PAYSTACK CHARGE] Parsed metadata - userId: ${userId}, type: ${type}, itemId: ${itemIdFromMeta}, isFirstInstallment: ${isFirstInstallment}`);
    
    // 1. Record transaction
    logger.info(`[PAYSTACK CHARGE] Attempting to insert transaction into database...`);
    const txResult = await pool.query(
      "INSERT INTO transactions (user_id, amount, currency, status, type, provider, provider_payment_id, provider_checkout_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (provider_payment_id) DO UPDATE SET status = $4, updated_at = NOW() RETURNING id",
      [
        userId,
        data.amount / 100,
        data.currency,
        "succeeded",
        type || "one-time",
        "paystack",
        data.reference,
        data.reference
      ]
    );
    
    const transactionId = txResult.rows[0]?.id;
    logger.info(`[PAYSTACK CHARGE] Transaction inserted/updated with ID: ${transactionId}`);

    // 2. Handle Production Tasks
    logger.info(`[PAYSTACK CHARGE] Checking if task creation is needed - type: ${type}, itemIdFromMeta: ${itemIdFromMeta}`);
    
    if ((type === "item" || isFirstInstallment) && itemIdFromMeta) {
      logger.info(`[PAYSTACK CHARGE] Task creation conditions met. Proceeding...`);
      
      const itemId = parseInt(itemIdFromMeta);
      
      const itemRes = await pool.query("SELECT title, category, price FROM items WHERE id = $1", [itemId]);
      const item = itemRes.rows[0];
      
      if (!item) {
        logger.warn(`[PAYSTACK CHARGE] Item ${itemId} not found in database. Skipping task creation.`);
        return;
      }
      
      logger.info(`[PAYSTACK CHARGE] Item found: ${item.title}, Category: ${item.category}, Price: ${item.price}`);

      const userRes = await pool.query("SELECT first_name, last_name, email FROM users WHERE id = $1", [userId]);
      const user = userRes.rows[0];
      
      logger.info(`[PAYSTACK CHARGE] User found: ${user.first_name} ${user.last_name}, Email: ${user.email}`);
      
      let customerId: number;
      const existingCustomer = await pool.query("SELECT id FROM customers WHERE email = $1", [user.email]);
      
      if (existingCustomer.rows.length > 0) {
        customerId = existingCustomer.rows[0].id;
        logger.info(`[PAYSTACK CHARGE] Existing customer found with ID: ${customerId}`);
      } else {
        const newCustomer = await pool.query(
          "INSERT INTO customers (name, email) VALUES ($1, $2) RETURNING id",
          [`${user.first_name} ${user.last_name}`, user.email]
        );
        customerId = newCustomer.rows[0].id;
        logger.info(`[PAYSTACK CHARGE] New customer created with ID: ${customerId}`);
      }
      
      const taskCheck = await pool.query(
          `SELECT id FROM tasks WHERE customer_id = $1 AND notes LIKE $2`,
          [customerId, `%${data.reference}%`]
      );

      if (taskCheck.rows.length === 0) {
          logger.info(`[PAYSTACK CHARGE] No existing task found for this reference. Creating new task...`);
          
          const dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + 14); 
          const deadline = new Date(dueDate);
          deadline.setDate(deadline.getDate() - 3);

          const taskResult = await pool.query(
            `INSERT INTO tasks (customer_id, category, total_amount, amount_paid, due_date, deadline, status, notes)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
            [
              customerId, 
              item.category || 'General', 
              parseFloat(item.price), 
              data.amount / 100,
              dueDate,
              deadline,
              'pending',
              `Order via Paystack for item: ${item.title}. Ref: ${data.reference}. ${isFirstInstallment ? 'Started via Installment Plan.' : 'Paid in Full.'}`
            ]
          );
          
          const taskId = taskResult.rows[0]?.id;
          logger.info(`[PAYSTACK CHARGE] ✅ Production task created successfully with ID: ${taskId} for item ${itemId} from user ${userId}`);
      } else {
          logger.info(`[PAYSTACK CHARGE] Task already exists for reference ${data.reference}. Skipping creation.`);
      }
    } else {
      logger.info(`[PAYSTACK CHARGE] Task creation skipped - conditions not met.`);
    }
    
    logger.info(`[PAYSTACK CHARGE] handleChargeSuccess completed for reference: ${data.reference}`);
  }

  private async handleSubscriptionCreate(data: any) {
    // Similar to Stripe logic
  }

  private async handleSubscriptionDisable(data: any) {
    // Similar to Stripe logic
  }
}
