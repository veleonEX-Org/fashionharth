import axios from "axios";
import crypto from "crypto";
import { env } from "../config/env.js";
import { pool } from "../database/pool.js";
import { logger } from "../utils/logger.js";
export class PaystackService {
    constructor() {
        this.baseUrl = "https://api.paystack.co";
    }
    async createCustomer(email, metadata) {
        const response = await axios.post(`${this.baseUrl}/customer`, { email, metadata }, {
            headers: { Authorization: `Bearer ${env.paystack.secretKey}` },
        });
        return response.data.data.customer_code;
    }
    async createCheckoutSession(options) {
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
        const response = await axios.post(`${this.baseUrl}/transaction/initialize`, payload, {
            headers: { Authorization: `Bearer ${env.paystack.secretKey}` },
        });
        return {
            id: response.data.data.reference,
            url: response.data.data.authorization_url,
        };
    }
    async handleWebhook(payload, signature) {
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
    async cancelSubscription(subscriptionId) {
        await axios.post(`${this.baseUrl}/subscription/disable`, { code: subscriptionId, token: "..." }, // Requires token usually or just code
        {
            headers: { Authorization: `Bearer ${env.paystack.secretKey}` },
        });
    }
    async getSubscription(subscriptionId) {
        const response = await axios.get(`${this.baseUrl}/subscription/${subscriptionId}`, {
            headers: { Authorization: `Bearer ${env.paystack.secretKey}` },
        });
        return response.data.data;
    }
    async handleChargeSuccess(data) {
        const metadata = data.metadata;
        const userId = parseInt(metadata?.userId || "0");
        const type = metadata?.type;
        const isFirstInstallment = type === "installment" && metadata?.currentInstallment === "1";
        const itemIdFromMeta = metadata?.itemId;
        // 1. Record transaction
        await pool.query("INSERT INTO transactions (user_id, amount, currency, status, type, provider, provider_payment_id, provider_checkout_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (provider_payment_id) DO UPDATE SET status = $4, updated_at = NOW()", [
            userId,
            data.amount / 100,
            data.currency,
            "succeeded",
            type || "one-time",
            "paystack",
            data.reference,
            data.reference // Paystack uses reference as both
        ]);
        // 2. Handle Production Tasks
        if ((type === "item" || isFirstInstallment) && itemIdFromMeta) {
            const itemId = parseInt(itemIdFromMeta);
            const itemRes = await pool.query("SELECT title, category, price FROM items WHERE id = $1", [itemId]);
            const item = itemRes.rows[0];
            if (!item)
                return;
            const userRes = await pool.query("SELECT first_name, last_name, email FROM users WHERE id = $1", [userId]);
            const user = userRes.rows[0];
            let customerId;
            const existingCustomer = await pool.query("SELECT id FROM customers WHERE email = $1", [user.email]);
            if (existingCustomer.rows.length > 0) {
                customerId = existingCustomer.rows[0].id;
            }
            else {
                const newCustomer = await pool.query("INSERT INTO customers (name, email) VALUES ($1, $2) RETURNING id", [`${user.first_name} ${user.last_name}`, user.email]);
                customerId = newCustomer.rows[0].id;
            }
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 14);
            const deadline = new Date(dueDate);
            deadline.setDate(deadline.getDate() - 3);
            await pool.query(`INSERT INTO tasks (customer_id, category, total_amount, amount_paid, due_date, deadline, status, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`, [
                customerId,
                item.category || 'General',
                parseFloat(item.price),
                data.amount / 100,
                dueDate,
                deadline,
                'pending',
                `Order via Paystack for item: ${item.title}. ${isFirstInstallment ? 'Started via Installment Plan.' : 'Paid in Full.'}`
            ]);
            logger.info(`Production task created via Paystack for item ${itemId} from user ${userId}`);
        }
    }
    async handleSubscriptionCreate(data) {
        // Similar to Stripe logic
    }
    async handleSubscriptionDisable(data) {
        // Similar to Stripe logic
    }
}
