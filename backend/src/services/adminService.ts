import { pool } from "../database/pool.js";

export interface AdminStats {
  totalUsers: number;
  activeSessions: number;
  totalItems: number;
  totalTasks: number;
  totalCustomers: number;
  message: string;
}

export async function getDashboardStats(): Promise<AdminStats> {
  // Get total users
  const usersCount = await pool.query("SELECT COUNT(*) as count FROM users");
  
  // Get total items
  const itemsCount = await pool.query("SELECT COUNT(*) as count FROM items");
  
  // Get total tasks
  const tasksCount = await pool.query("SELECT COUNT(*) as count FROM tasks");

  // Get total customers
  const customersCount = await pool.query("SELECT COUNT(*) as count FROM customers");

  // Get active sessions (users with a non-null refresh_token)
  // This is a simple heuristic for "active" in this template
  const activeSessionsCount = await pool.query(
    "SELECT COUNT(*) as count FROM users WHERE refresh_token IS NOT NULL"
  );

  return {
    totalUsers: parseInt(usersCount.rows[0].count, 10),
    activeSessions: parseInt(activeSessionsCount.rows[0].count, 10),
    totalItems: parseInt(itemsCount.rows[0].count, 10),
    totalTasks: parseInt(tasksCount.rows[0].count, 10),
    totalCustomers: parseInt(customersCount.rows[0].count, 10),
    message: "Real-time administrative statistics retrieved successfully.",
  };
}
