import { Request, Response, NextFunction } from "express";
import * as userService from "../services/userService.js";

export async function getAllUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (err) {
    next(err);
  }
}

export async function updateUserRole(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const { role } = req.body;
    const user = await userService.updateUserRole(id, role);
    res.json(user);
  } catch (err) {
    next(err);
  }
}

export async function updateUserStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;
    const user = await userService.updateUserStatus(id, status);
    res.json(user);
  } catch (err) {
    next(err);
  }
}

export async function getMyTransactions(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.id;
    const transactions = await userService.getUserTransactions(userId);
    res.json(transactions);
  } catch (err) {
    next(err);
  }
}

export async function getMyTasks(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.id;
    const tasks = await userService.getUserTasks(userId);
    res.json(tasks);
  } catch (err) {
    next(err);
  }
}
