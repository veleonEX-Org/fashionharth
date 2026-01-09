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
