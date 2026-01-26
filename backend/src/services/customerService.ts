import { z } from "zod";
import { pool } from "../database/pool.js";
import { PoolClient } from "pg";
import { Customer, CreateCustomerPayload, UpdateCustomerPayload } from "../models/customer.js";

const customerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  userId: z.number().optional().nullable(),
  measurements: z.record(z.any()).optional().default({}),
  dob: z.string().optional().nullable(), // ISO Date string
  anniversaryDate: z.string().optional().nullable(),
});

import { formatDateOnly } from "../utils/dateUtils.js";

function toCustomer(row: any): Customer {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    userId: row.user_id,
    measurements: row.measurements,
    dob: formatDateOnly(row.dob),
    anniversaryDate: formatDateOnly(row.anniversary_date),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    totalTasks: row.total_tasks ? Number(row.total_tasks) : 0,
  };
}

export async function createCustomer(input: CreateCustomerPayload, tx?: PoolClient): Promise<Customer> {
  const data = customerSchema.parse(input);
  const client = tx || await pool.connect();
  const shouldManageTx = !tx;

  try {
    if (shouldManageTx) await client.query("BEGIN");

    const result = await client.query(
      `
      INSERT INTO customers (name, email, phone, user_id, measurements, dob, anniversary_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
      `,
      [
        data.name,
        data.email || null,
        data.phone || null,
        data.userId || null,
        JSON.stringify(data.measurements),
        data.dob || null,
        data.anniversaryDate || null,
      ]
    );

    const customer = toCustomer(result.rows[0]);

    if (data.userId) {
      await client.query(
        "UPDATE users SET customer_id = $1 WHERE id = $2",
        [customer.id, data.userId]
      );
    }

    if (shouldManageTx) await client.query("COMMIT");
    return customer;
  } catch (error) {
    if (shouldManageTx) await client.query("ROLLBACK");
    throw error;
  } finally {
    if (shouldManageTx) client.release();
  }
}

export async function getCustomers(search?: string): Promise<Customer[]> {
  let query = `
    SELECT c.*, COUNT(t.id) as total_tasks 
    FROM customers c
    LEFT JOIN tasks t ON c.id = t.customer_id
  `;
  const params: any[] = [];

  if (search) {
    query += ` WHERE c.name ILIKE $1 OR c.email ILIKE $1 OR c.phone ILIKE $1`;
    params.push(`%${search}%`);
  }

  query += ` GROUP BY c.id ORDER BY c.created_at DESC`;

  const result = await pool.query(query, params);
  return result.rows.map(toCustomer);
}

export async function getCustomerById(id: number, tx?: PoolClient): Promise<Customer | null> {
  const client = tx || pool;
  const result = await client.query(`SELECT * FROM customers WHERE id = $1`, [id]);
  if (result.rows.length === 0) return null;
  return toCustomer(result.rows[0]);
}

export async function updateCustomer(id: number, input: UpdateCustomerPayload, tx?: PoolClient): Promise<Customer> {
  const current = await getCustomerById(id, tx);
  if (!current) throw new Error("Customer not found");

  const updates: string[] = [];
  const params: any[] = [];
  let idx = 1;

  if (input.name !== undefined) {
    updates.push(`name = $${idx++}`);
    params.push(input.name);
  }
  if (input.email !== undefined) {
    updates.push(`email = $${idx++}`);
    params.push(input.email);
  }
  if (input.phone !== undefined) {
    updates.push(`phone = $${idx++}`);
    params.push(input.phone);
  }
  if (input.userId !== undefined) {
    updates.push(`user_id = $${idx++}`);
    params.push(input.userId);
  }
  if (input.measurements !== undefined) {
    updates.push(`measurements = $${idx++}`);
    params.push(JSON.stringify(input.measurements));
  }
  if (input.dob !== undefined) {
    updates.push(`dob = $${idx++}`);
    params.push(input.dob);
  }
  if (input.anniversaryDate !== undefined) {
    updates.push(`anniversary_date = $${idx++}`);
    params.push(input.anniversaryDate);
  }

  updates.push(`updated_at = NOW()`);
  
  const query = `
    UPDATE customers 
    SET ${updates.join(", ")}
    WHERE id = $${idx}
    RETURNING *
  `;
  params.push(id);

  const client = tx || await pool.connect();
  const shouldManageTx = !tx;

  try {
    if (shouldManageTx) await client.query("BEGIN");
    
    const result = await client.query(query, params);
    const updated = toCustomer(result.rows[0]);

    // Handle user link change
    if (input.userId !== undefined) {
      // Clear old user link if any
      if (current.userId && current.userId !== input.userId) {
        await client.query("UPDATE users SET customer_id = NULL WHERE id = $1", [current.userId]);
      }
      // Set new user link if provided
      if (input.userId) {
        await client.query("UPDATE users SET customer_id = $1 WHERE id = $2", [id, input.userId]);
      }
    }

    if (shouldManageTx) await client.query("COMMIT");
    return updated;
  } catch (error) {
    if (shouldManageTx) await client.query("ROLLBACK");
    throw error;
  } finally {
    if (shouldManageTx) client.release();
  }
}
