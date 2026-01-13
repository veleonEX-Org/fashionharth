import { Request, Response, NextFunction } from "express";
import * as customerService from "../services/customerService.js";

export async function getCustomers(req: Request, res: Response, next: NextFunction) {
  try {
    const search = req.query.search as string;
    const customers = await customerService.getCustomers(search);
    res.json(customers);
  } catch (err) {
    next(err);
  }
}

export async function createCustomer(req: Request, res: Response, next: NextFunction) {
  try {
    const customer = await customerService.createCustomer(req.body);
    res.status(201).json(customer);
  } catch (err) {
    next(err);
  }
}

export async function updateCustomer(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const customer = await customerService.updateCustomer(id, req.body);
    res.json(customer);
  } catch (err) {
    next(err);
  }
}

export async function getCustomer(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const customer = await customerService.getCustomerById(id);
    if (!customer) {
      res.status(404).json({ message: "Customer not found" });
      return;
    }
    res.json(customer);
  } catch (err) {
    next(err);
  }
}
