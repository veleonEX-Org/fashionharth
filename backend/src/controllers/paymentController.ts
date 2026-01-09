import { Request, Response, NextFunction } from "express";
import { paymentService } from "../services/paymentService.js";
import { logger } from "../utils/logger.js";

export const createCheckoutSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { amount, currency, type, planId, itemId, provider = 'paystack' } = req.body;
    const userId = (req as any).user.id;
    const email = (req as any).user.email;

    let session;
    if (type === 'installment') {
      session = await paymentService.createInstallmentPlan(
        userId, 
        amount, 
        3, // Default to 3 periods
        provider,
        itemId
      );
    } else {
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
  } catch (error) {
    next(error);
  }
};

export const handleStripeWebhook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sig = req.headers["stripe-signature"] as string;
    await paymentService.handleWebhook('stripe', req.body, sig);
    res.json({ received: true });
  } catch (error: any) {
    logger.error(`Stripe Webhook Error: ${error.message}`);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
};

export const handlePaystackWebhook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sig = req.headers["x-paystack-signature"] as string;
    await paymentService.handleWebhook('paystack', req.body, sig);
    res.json({ received: true });
  } catch (error: any) {
    logger.error(`Paystack Webhook Error: ${error.message}`);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
};
