import { z } from "zod";
import { pool } from "../database/pool.js";
import { subDays } from "date-fns";
const createTaskSchema = z.object({
    customerId: z.number(),
    category: z.string(),
    totalAmount: z.number().min(0),
    amountPaid: z.number().min(0).default(0),
    productionCost: z.number().min(0).default(0),
    assignedTo: z.number().optional().nullable(),
    startDate: z.string().optional().nullable(),
    dueDate: z.string(), // ISO Date
    status: z.enum(['pending', 'in_progress', 'completed']).default('pending'),
    notes: z.string().optional(),
});
function toTask(row) {
    return {
        id: row.id,
        customerId: row.customer_id,
        category: row.category,
        totalAmount: parseFloat(row.total_amount),
        amountPaid: parseFloat(row.amount_paid),
        productionCost: parseFloat(row.production_cost),
        assignedTo: row.assigned_to,
        startDate: row.start_date,
        dueDate: row.due_date,
        deadline: row.deadline,
        status: row.status,
        notes: row.notes,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        customerName: row.customer_name,
        customerPhone: row.customer_phone,
        assigneeName: row.username, // Join from users
    };
}
export async function createTask(input) {
    const data = createTaskSchema.parse(input);
    // Calculate deadline: 3 days before due date
    // Assuming dueDate is YYYY-MM-DD or ISO
    const due = new Date(data.dueDate);
    const deadline = subDays(due, 3);
    const result = await pool.query(`
    INSERT INTO tasks (
      customer_id, category, total_amount, amount_paid, production_cost, 
      assigned_to, start_date, due_date, deadline, status, notes
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *
    `, [
        data.customerId,
        data.category,
        data.totalAmount,
        data.amountPaid,
        data.productionCost,
        data.assignedTo || null,
        data.startDate || null,
        data.dueDate,
        deadline.toISOString(),
        data.status,
        data.notes || null,
    ]);
    return toTask(result.rows[0]);
}
export async function getTasks(assignedTo, status) {
    let query = `
    SELECT t.*, c.name as customer_name, c.phone as customer_phone, (u.first_name || ' ' || u.last_name) as username
    FROM tasks t
    LEFT JOIN customers c ON t.customer_id = c.id
    LEFT JOIN users u ON t.assigned_to = u.id
  `;
    const conditions = [];
    const params = [];
    let idx = 1;
    if (assignedTo) {
        conditions.push(`t.assigned_to = $${idx++}`);
        params.push(assignedTo);
    }
    if (status) { // 'completed' or 'pending' (everything else)
        if (status === 'completed') {
            conditions.push(`t.status = 'completed'`);
        }
        else if (status === 'ongoing') {
            conditions.push(`t.status != 'completed'`);
        }
        else {
            conditions.push(`t.status = $${idx++}`);
            params.push(status);
        }
    }
    if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(" AND ")}`;
    }
    // "tasks are sorted by deadlines"
    query += ` ORDER BY t.deadline ASC`;
    const result = await pool.query(query, params);
    return result.rows.map(toTask);
}
export async function updateTask(id, input) {
    // If dueDate changes, recalculate deadline
    let deadlineStr = undefined;
    if (input.dueDate) {
        const due = new Date(input.dueDate);
        deadlineStr = subDays(due, 3).toISOString();
    }
    const updates = [];
    const params = [];
    let idx = 1;
    if (input.customerId !== undefined) {
        updates.push(`customer_id = $${idx++}`);
        params.push(input.customerId);
    }
    if (input.category !== undefined) {
        updates.push(`category = $${idx++}`);
        params.push(input.category);
    }
    if (input.totalAmount !== undefined) {
        updates.push(`total_amount = $${idx++}`);
        params.push(input.totalAmount);
    }
    if (input.amountPaid !== undefined) {
        updates.push(`amount_paid = $${idx++}`);
        params.push(input.amountPaid);
    }
    if (input.productionCost !== undefined) {
        updates.push(`production_cost = $${idx++}`);
        params.push(input.productionCost);
    }
    if (input.assignedTo !== undefined) {
        updates.push(`assigned_to = $${idx++}`);
        params.push(input.assignedTo);
    }
    if (input.startDate !== undefined) {
        updates.push(`start_date = $${idx++}`);
        params.push(input.startDate);
    }
    if (input.dueDate !== undefined) {
        updates.push(`due_date = $${idx++}`);
        params.push(input.dueDate);
    }
    if (input.status !== undefined) {
        updates.push(`status = $${idx++}`);
        params.push(input.status);
    }
    if (input.notes !== undefined) {
        updates.push(`notes = $${idx++}`);
        params.push(input.notes);
    }
    if (deadlineStr) {
        updates.push(`deadline = $${idx++}`);
        params.push(deadlineStr);
    }
    updates.push(`updated_at = NOW()`);
    params.push(id);
    const query = `
    UPDATE tasks
    SET ${updates.join(", ")}
    WHERE id = $${idx}
    RETURNING *
  `;
    const result = await pool.query(query, params);
    return toTask(result.rows[0]);
}
export async function deleteTask(id) {
    await pool.query(`DELETE FROM tasks WHERE id = $1`, [id]);
}
