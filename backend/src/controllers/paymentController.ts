import { Request, Response, NextFunction } from "express";
import { paymentService } from "../services/paymentService.js";
import { logger } from "../utils/logger.js";

import { pool } from "../database/pool.js";

export const createCheckoutSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { amount, currency, type, planId, itemId, provider = 'paystack' } = req.body;
    logger.info(`Payment Request Recieved: ${JSON.stringify(req.body)}`);
    const userId = (req as any).user.id;
    
    // Fetch user email from database
    const userResult = await pool.query("SELECT email FROM users WHERE id = $1", [userId]);
    const user = userResult.rows[0];
    
    if (!user || !user.email) {
      throw new Error("User or email not found");
    }
    
    const email = user.email;

    let session;
    if (type === 'installment') {
      session = await paymentService.createInstallmentPlan(
        userId, 
        email,
        amount, 
        currency || 'USD',
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
        successUrl: provider === 'paystack' 
          ? `${process.env.APP_URL}/payment/success?provider=paystack` 
          : `${process.env.APP_URL}/payment/success?provider=stripe&session_id={CHECKOUT_SESSION_ID}`,
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

export const verifyRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { provider = 'paystack', reference, sessionId } = req.body;
    const ref = reference || sessionId;
    
    logger.info(`[VERIFY REQUEST] Received verification request - Provider: ${provider}, Reference: ${ref}`);
    
    if (!ref) {
       logger.warn(`[VERIFY REQUEST] No reference provided in request`);
       res.status(400).json({ success: false, message: "Reference required" });
       return;
    }

    logger.info(`[VERIFY REQUEST] Calling paymentService.verifyTransaction...`);
    const success = await paymentService.verifyTransaction(provider, ref);
    
    logger.info(`[VERIFY REQUEST] Verification result: ${success ? 'SUCCESS' : 'FAILED'}`);
    res.json({ success });
  } catch (error) {
    logger.error(`[VERIFY REQUEST] Error during verification: ${error}`);
    next(error);
  }
};
