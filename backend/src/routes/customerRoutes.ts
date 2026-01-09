import { Router } from "express";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import {
  getCustomers,
  createCustomer,
  updateCustomer,
} from "../controllers/customerController.js";

export const customerRouter = Router();

customerRouter.use(authenticate);

// Only admin and staff can access customer data
customerRouter.use(authorize(["admin", "staff"]));

customerRouter.get("/", getCustomers);
customerRouter.post("/", createCustomer);
customerRouter.put("/:id", updateCustomer);
