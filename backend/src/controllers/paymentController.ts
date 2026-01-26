import { Request, Response, NextFunction } from "express";
import { paymentService } from "../services/paymentService.js";
import { getUserById } from "../services/authService.js";
import { logger } from "../utils/logger.js";
import { pool } from "../database/pool.js";

export const createCheckoutSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { 
      amount, 
      currency, 
      type, 
      planId, 
      itemId, 
      provider = 'paystack', 
      transactionId, 
      installmentNumber,
      deliveryAddress,
      notes: productionNotes,
      quantity = 1
    } = req.body;
    logger.info(`Payment Request Received: ${JSON.stringify(req.body)}`);
    const userId = (req as any).user.id;
    
    const user = await getUserById(userId);
    
    if (!user || !user.email) {
      throw new Error("User or email not found");
    }
    
    const email = user.email;

    let session;
    if (type === 'installment' && !transactionId) {
      // Calculate periods dynamically
      let periods = 3;
      
      // Check if student
      if (user.isStudent) {
        periods = 6;
      }

      // Check item category logic if item exists
      if (itemId) {
        const itemRes = await pool.query("SELECT category FROM items WHERE id = $1", [itemId]);
        const itemData = itemRes.rows[0];
        // If suit, strict 2 months
        if (itemData && itemData.category && itemData.category.toLowerCase() === 'suit') {
          periods = 2;
        }
      }

      if (periods < 1) {
        throw new Error("Installment plan not available for this item/user configuration");
      }

      session = await paymentService.createInstallmentPlan(
        userId, 
        email,
        amount, 
        currency || 'USD',
        periods, 
        provider,
        itemId,
        deliveryAddress,
        productionNotes,
        quantity
      );
    } else if (transactionId && installmentNumber) {
        // Paying an EXACT existing installment
        session = await paymentService.initiateInstallmentPayment(
            userId,
            email,
            transactionId,
            installmentNumber,
            provider
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
        deliveryAddress,
        notes: productionNotes,
        quantity,
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
