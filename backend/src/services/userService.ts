import { pool } from "../database/pool.js";
import { PublicUser, User } from "../models/user.js";
import { toPublicUser } from "../models/user.js";

export async function getAllUsers(): Promise<PublicUser[]> {
  const result = await pool.query<User>("SELECT * FROM users ORDER BY created_at DESC");
  return result.rows.map(toPublicUser);
}

export async function updateUserRole(id: number, role: string): Promise<PublicUser> {
  const allowedRoles = ["admin", "staff", "user"];
  if (!allowedRoles.includes(role)) {
    const error = new Error("Invalid role.");
    (error as any).statusCode = 400;
    throw error;
  }

  const result = await pool.query<User>(
    `
      UPDATE users
      SET role = $1,
          updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `,
    [role, id]
  );

  const user = result.rows[0];
  if (!user) {
    const error = new Error("User not found.");
    (error as any).statusCode = 404;
    throw error;
  }

  return toPublicUser(user);
}

export async function updateUserStatus(id: number, status: string): Promise<PublicUser> {
  const allowedStatuses = ["active", "disabled"];
  if (!allowedStatuses.includes(status)) {
    const error = new Error("Invalid status.");
    (error as any).statusCode = 400;
    throw error;
  }

  const result = await pool.query<User>(
    `
      UPDATE users
      SET status = $1,
          updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `,
    [status, id]
  );

  const user = result.rows[0];
  if (!user) {
    const error = new Error("User not found.");
    (error as any).statusCode = 404;
    throw error;
  }

  return toPublicUser(user);
}
