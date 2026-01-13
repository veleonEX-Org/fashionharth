import { pool } from "../database/pool.js";
import { toPublicUser } from "../models/user.js";
export async function getAllUsers() {
    const result = await pool.query("SELECT * FROM users ORDER BY created_at DESC");
    return result.rows.map(toPublicUser);
}
export async function updateUserRole(id, role) {
    const allowedRoles = ["admin", "staff", "user"];
    if (!allowedRoles.includes(role)) {
        const error = new Error("Invalid role.");
        error.statusCode = 400;
        throw error;
    }
    const result = await pool.query(`
      UPDATE users
      SET role = $1,
          updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `, [role, id]);
    const user = result.rows[0];
    if (!user) {
        const error = new Error("User not found.");
        error.statusCode = 404;
        throw error;
    }
    return toPublicUser(user);
}
