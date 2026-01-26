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
        deliveryAddress: options.deliveryAddress,
        notes: options.notes,
        quantity: options.quantity,
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
    
    let metadata = data.metadata;
    if (typeof metadata === 'string') {
        try { metadata = JSON.parse(metadata); } catch(e) { 
            logger.warn(`[PAYSTACK CHARGE] Failed to parse metadata string: ${metadata}`);
        }
    }

    const userId = parseInt(metadata?.userId || "0");
    const type = metadata?.type;
    const isFirstInstallment = (type === "installment" || metadata?.isInstallment === 'true') && metadata?.currentInstallment === "1";
    const itemIdFromMeta = metadata?.itemId;
    
    logger.info(`[PAYSTACK CHARGE] Parsed metadata - userId: ${userId}, type: ${type}, itemId: ${itemIdFromMeta}, isFirstInstallment: ${isFirstInstallment}, metadata: ${JSON.stringify(metadata)}`);
    
    // 1. Record/Update transaction
    const transactionIdFromMeta = metadata?.transactionId;
    let transactionId: number;
    let description = "Fashion Purchase";

    // Try to get item title for description
    try {
        const itemId = metadata?.itemId || itemIdFromMeta;
        if (itemId) {
            const itemRes = await pool.query("SELECT title FROM items WHERE id = $1", [itemId]);
            if (itemRes.rows.length > 0) {
                const itemTitle = itemRes.rows[0].title;
                if (metadata?.isInstallment === 'true') {
                    description = `Installment ${metadata.currentInstallment} for ${itemTitle}`;
                } else {
                    description = `Payment for ${itemTitle}`;
                }
            }
        } else if (metadata?.isInstallment === 'true') {
             description = `Installment ${metadata.currentInstallment} Payment`;
        }
    } catch (descErr) {
        logger.warn(`Failed to generate description: ${descErr}`);
    }

    if (transactionIdFromMeta && metadata?.currentInstallment !== "1") {
        // Subsequent installment: INSERT NEW for history
        logger.info(`[PAYSTACK CHARGE] Subsequent installment. Inserting new transaction record for history.`);
        const txResult = await pool.query(
            "INSERT INTO transactions (user_id, amount, currency, status, type, provider, provider_payment_id, provider_checkout_id, description) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id",
            [
                userId,
                data.amount / 100,
                data.currency,
                "succeeded",
                "installment",
                "paystack",
                data.reference,
                data.reference,
                description
            ]
        );
        transactionId = txResult.rows[0]?.id;
    } else if (transactionIdFromMeta) {
        logger.info(`[PAYSTACK CHARGE] Updating existing transaction ${transactionIdFromMeta}`);
        await pool.query(
            "UPDATE transactions SET status = $1, provider_payment_id = $2, provider_checkout_id = $3, description = $4, updated_at = NOW() WHERE id = $5",
            ["succeeded", data.reference, data.reference, description, parseInt(transactionIdFromMeta)]
        );
        transactionId = parseInt(transactionIdFromMeta);
    } else {
        logger.info(`[PAYSTACK CHARGE] Attempting to insert new transaction into database...`);
        const txResult = await pool.query(
            "INSERT INTO transactions (user_id, amount, currency, status, type, provider, provider_payment_id, provider_checkout_id, description) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (provider_payment_id) DO UPDATE SET status = 'succeeded', description = $9, updated_at = NOW() RETURNING id",
            [
                userId,
                data.amount / 100,
                data.currency,
                "succeeded",
                type || "one-time",
                "paystack",
                data.reference,
                data.reference,
                description
            ]
        );
        transactionId = txResult.rows[0]?.id;
    }
    
    logger.info(`[PAYSTACK CHARGE] Transaction processed with ID: ${transactionId}`);

    // Update Installments Table if applicable
    if (metadata?.isInstallment === 'true' && metadata?.transactionId && metadata?.currentInstallment) {
        const parentTxId = parseInt(metadata.transactionId);
        const instNum = parseInt(metadata.currentInstallment);
        
        logger.info(`[PAYSTACK CHARGE] Updating installment ${instNum} for transaction ${parentTxId}`);
        await pool.query(
            "UPDATE installments SET status = 'paid', provider_payment_id = $1, updated_at = NOW() WHERE transaction_id = $2 AND installment_number = $3",
            [data.reference, parentTxId, instNum]
        );

        // If not the first installment, we need to find the associated task and update its amount_paid
        if (metadata.currentInstallment !== "1") {
            logger.info(`[PAYSTACK CHARGE] Subsequent installment payment. Updating task amount_paid...`);
            // Find task by checking notes for the parent transaction's original reference or just logic
            const taskRes = await pool.query(
                "SELECT id, amount_paid FROM tasks WHERE notes LIKE $1",
                [`%parent transaction ID: ${parentTxId}%`]
            );
            
            if (taskRes.rows.length > 0) {
                const task = taskRes.rows[0];
                const newAmountPaid = Number(task.amount_paid) + (data.amount / 100);
                logger.info(`[PAYSTACK CHARGE] Task found (ID: ${task.id}). Updating amount_paid from ${task.amount_paid} to ${newAmountPaid}`);
                await pool.query(
                    "UPDATE tasks SET amount_paid = $1, updated_at = NOW() WHERE id = $2",
                    [newAmountPaid, task.id]
                );
            } else {
                logger.warn(`[PAYSTACK CHARGE] Task with parent transaction ID ${parentTxId} not found in notes.`);
            }
        }
    }

    // 2. Handle Production Tasks
    logger.info(`[PAYSTACK CHARGE] Checking if task creation is needed - type: ${type}, itemIdFromMeta: ${itemIdFromMeta}, isFirstInstallment: ${isFirstInstallment}`);
    
    if ((type === "item" || isFirstInstallment) && itemIdFromMeta) {
      try {
        logger.info(`[PAYSTACK CHARGE] Task creation conditions met. Proceeding...`);
        
        const itemId = parseInt(itemIdFromMeta.toString());
        if (isNaN(itemId)) throw new Error(`Invalid itemId: ${itemIdFromMeta}`);
        
        const itemRes = await pool.query("SELECT title, category, price FROM items WHERE id = $1", [itemId]);
        const item = itemRes.rows[0];
        
        if (!item) {
          logger.warn(`[PAYSTACK CHARGE] Item ${itemId} not found in database. Skipping task creation.`);
          return;
        }
        
        logger.info(`[PAYSTACK CHARGE] Item found: ${item.title}, Category: ${item.category}, Price: ${item.price}`);

        const userRes = await pool.query("SELECT first_name, last_name, email FROM users WHERE id = $1", [userId]);
        const user = userRes.rows[0];
        
        if (!user) {
          logger.warn(`[PAYSTACK CHARGE] User ${userId} not found in database. Skipping task creation.`);
          return;
        }
        
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
        
        const taskCheck = await pool.query(
            `SELECT id FROM tasks WHERE customer_id = $1 AND notes LIKE $2`,
            [customerId, `%${data.reference}%`]
        );

        if (taskCheck.rows.length === 0) {
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 14); 
            const deadline = new Date(dueDate);
            deadline.setDate(deadline.getDate() - 3);

            const taskResult = await pool.query(
              `INSERT INTO tasks (customer_id, category, total_amount, amount_paid, due_date, deadline, status, notes, transaction_id, delivery_destination, quantity, production_notes)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id`,
              [
                customerId, 
                item.category || 'General', 
                parseFloat(item.price) * (metadata?.quantity || 1), 
                data.amount / 100,
                dueDate,
                deadline,
                'pending',
                `Order via Paystack for item: ${item.title}. Ref: ${data.reference}. parent transaction ID: ${transactionId}. ${isFirstInstallment ? 'Started via Installment Plan.' : 'Paid in Full.'}`,
                transactionId,
                metadata?.deliveryAddress,
                metadata?.quantity || 1,
                metadata?.notes
              ]
            );
            
            logger.info(`[PAYSTACK CHARGE] ✅ Production task created with ID: ${taskResult.rows[0]?.id}`);
        } else {
            logger.info(`[PAYSTACK CHARGE] Task already exists for reference ${data.reference}`);
        }
      } catch (taskErr: any) {
        logger.error(`[PAYSTACK CHARGE] Error in task creation process: ${taskErr.message}`);
        logger.error(taskErr.stack);
      }
    } else {
      logger.info(`[PAYSTACK CHARGE] Task creation skipped - conditions not met. Type: ${type}, ItemId: ${itemIdFromMeta}, isFirst: ${isFirstInstallment}`);
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
