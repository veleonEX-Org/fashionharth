import { z } from "zod";
import { pool } from "../database/pool.js";
import { Customer, CreateCustomerPayload, UpdateCustomerPayload } from "../models/customer.js";

const customerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  measurements: z.record(z.any()).optional().default({}),
  dob: z.string().optional().nullable(), // ISO Date string
  anniversaryDate: z.string().optional().nullable(),
});

function toCustomer(row: any): Customer {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    measurements: row.measurements,
    dob: row.dob,
    anniversaryDate: row.anniversary_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createCustomer(input: CreateCustomerPayload): Promise<Customer> {
  const data = customerSchema.parse(input);

  const result = await pool.query(
    `
    INSERT INTO customers (name, email, phone, measurements, dob, anniversary_date)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
    `,
    [
      data.name,
      data.email || null,
      data.phone || null,
      JSON.stringify(data.measurements),
      data.dob || null,
      data.anniversaryDate || null,
    ]
  );

  return toCustomer(result.rows[0]);
}

export async function getCustomers(search?: string): Promise<Customer[]> {
  let query = `SELECT * FROM customers`;
  const params: any[] = [];

  if (search) {
    query += ` WHERE name ILIKE $1 OR email ILIKE $1 OR phone ILIKE $1`;
    params.push(`%${search}%`);
  }

  query += ` ORDER BY created_at DESC`;

  const result = await pool.query(query, params);
  return result.rows.map(toCustomer);
}

export async function getCustomerById(id: number): Promise<Customer | null> {
  const result = await pool.query(`SELECT * FROM customers WHERE id = $1`, [id]);
  if (result.rows.length === 0) return null;
  return toCustomer(result.rows[0]);
}

export async function updateCustomer(id: number, input: UpdateCustomerPayload): Promise<Customer> {
  const current = await getCustomerById(id);
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
  params.push(id);

  if (updates.length > 1) { // >1 because updated_at is always there? No, updated_at is hardcoded string, params has id.
     // logic: updates array holds string parts. params holds values.
     // current loop pushes column=$N.
     // params pushed value.
  }

  const query = `
    UPDATE customers 
    SET ${updates.join(", ")}
    WHERE id = $${idx}
    RETURNING *
  `;

  const result = await pool.query(query, params);
  return toCustomer(result.rows[0]);
}
