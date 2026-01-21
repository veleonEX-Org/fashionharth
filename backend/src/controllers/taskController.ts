import { Request, Response, NextFunction } from "express";
import * as taskService from "../services/taskService.js";

export async function getTasks(req: Request, res: Response, next: NextFunction) {
  try {
    const assignedTo = req.query.assignedTo ? Number(req.query.assignedTo) : undefined;
    const status = req.query.status as string;
    const sortBy = (req.query.sortBy === 'created_at' || req.query.sortBy === 'deadline') ? req.query.sortBy : undefined;
    const sortOrder = (req.query.sortOrder === 'ASC' || req.query.sortOrder === 'DESC') ? req.query.sortOrder : undefined;
    const paymentStatus = (req.query.paymentStatus === 'paid' || req.query.paymentStatus === 'unpaid') ? req.query.paymentStatus : undefined;
    const minDate = req.query.minDate as string;
    const maxDate = req.query.maxDate as string;

    const tasks = await taskService.getTasks(assignedTo, status, sortBy, sortOrder, paymentStatus, minDate, maxDate);
    res.json(tasks);
  } catch (err) {
    next(err);
  }
}

export async function createTask(req: Request, res: Response, next: NextFunction) {
  try {
    const task = await taskService.createTask(req.body);
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
}

export async function updateTask(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const task = await taskService.updateTask(id, req.body);
    res.json(task);
  } catch (err) {
    next(err);
  }
}

export async function deleteTask(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    await taskService.deleteTask(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
