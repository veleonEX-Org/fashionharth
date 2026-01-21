import { pool } from "../database/pool.js";
import { PublicUser, User } from "../models/user.js";
import { toPublicUser } from "../models/user.js";

export async function getAllUsers(): Promise<PublicUser[]> {
  const result = await pool.query<User>(`
    SELECT 
      u.*,
      COUNT(t.id) as tasks_assigned,
      COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as tasks_completed
    FROM users u
    LEFT JOIN tasks t ON u.id = t.assigned_to
    GROUP BY u.id
    ORDER BY u.created_at DESC
  `);
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

export async function getUserTransactions(userId: number) {
  const result = await pool.query(
    `
    SELECT 
      id, amount, currency, status, type, provider, created_at, description
    FROM transactions
    WHERE user_id = $1 AND status = 'succeeded'
    ORDER BY created_at DESC
    `,
    [userId]
  );
  return result.rows;
}

export async function getUserTasks(userId: number) {
  // Link User -> Customer (via email) -> Tasks
  const result = await pool.query(
    `
    SELECT 
      t.*, 
      c.name as customer_name,
      (
        SELECT json_agg(
          json_build_object(
            'installment_number', i.installment_number,
            'amount', i.amount,
            'due_date', i.due_date,
            'status', i.status
          ) ORDER BY i.installment_number
        )
        FROM installments i
        WHERE i.transaction_id = t.transaction_id
      ) as installments
    FROM tasks t
    JOIN customers c ON t.customer_id = c.id
    JOIN users u ON c.email = u.email
    WHERE u.id = $1
    ORDER BY t.created_at DESC
    `,
    [userId]
  );
  
  return result.rows.map(row => ({
    id: row.id,
    category: row.category,
    status: row.status,
    totalAmount: row.total_amount,
    amountPaid: row.amount_paid,
    startDate: row.start_date,
    deadline: row.deadline,
    dueDate: row.due_date,
    notes: row.notes,
    deliveryDestination: row.delivery_destination,
    createdAt: row.created_at,
    transactionId: row.transaction_id,
    installments: row.installments || []
  }));
}
