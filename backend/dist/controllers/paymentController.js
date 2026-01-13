import { paymentService } from "../services/paymentService.js";
import { logger } from "../utils/logger.js";
export const createCheckoutSession = async (req, res, next) => {
    try {
        const { amount, currency, type, planId, itemId, provider = 'paystack' } = req.body;
        const userId = req.user.id;
        const email = req.user.email;
        let session;
        if (type === 'installment') {
            session = await paymentService.createInstallmentPlan(userId, amount, 3, // Default to 3 periods
            provider, itemId);
        }
        else {
            session = await paymentService.initiateCheckout({
                userId,
                email,
                amount,
                currency,
                type,
                planId,
                itemId,
                successUrl: `${process.env.APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
                cancelUrl: `${process.env.APP_URL}/payment/cancel`,
            }, provider);
        }
        res.json({ url: session.url, sessionId: session.id });
    }
    catch (error) {
        next(error);
    }
};
export const handleStripeWebhook = async (req, res, next) => {
    try {
        const sig = req.headers["stripe-signature"];
        await paymentService.handleWebhook('stripe', req.body, sig);
        res.json({ received: true });
    }
    catch (error) {
        logger.error(`Stripe Webhook Error: ${error.message}`);
        res.status(400).send(`Webhook Error: ${error.message}`);
    }
};
export const handlePaystackWebhook = async (req, res, next) => {
    try {
        const sig = req.headers["x-paystack-signature"];
        await paymentService.handleWebhook('paystack', req.body, sig);
        res.json({ received: true });
    }
    catch (error) {
        logger.error(`Paystack Webhook Error: ${error.message}`);
        res.status(400).send(`Webhook Error: ${error.message}`);
    }
};
