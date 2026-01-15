import express, { Router } from "express";
import { createCheckoutSession, handleStripeWebhook, handlePaystackWebhook, verifyRequest } from "../controllers/paymentController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

// Webhook endpoints need raw body
router.post(
    "/webhook/stripe", 
    express.raw({ type: "application/json" }), 
    handleStripeWebhook
);

router.post(
    "/webhook/paystack", 
    express.json(), // Paystack usually sends JSON that's easily verified with raw string, but express.json() is fine if we use req.body
    handlePaystackWebhook
);

// Other routes need JSON parsing
router.use(express.json());

// Protected routes
router.use(authenticate);

router.post("/create-checkout-session", createCheckoutSession);
router.post("/verify", verifyRequest);

export { router as paymentRouter };
