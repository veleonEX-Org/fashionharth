import type { UserRole } from "../types/auth.js";

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  status: string; // 'active' or 'disabled'
  customer_id: number | null;
  is_email_verified: boolean;
  email_verification_token: string | null;
  reset_password_token: string | null;
  reset_password_expires_at: Date | null;
  refresh_token: string | null;
  created_at: Date;
  updated_at: Date;
  tasks_assigned?: number;
  tasks_completed?: number;
  metadata: Record<string, any> | null;
}

export interface PublicUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  status: string;
  customerId: number | null;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  tasksAssigned: number;
  tasksCompleted: number;
  isStudent: boolean;
  phone: string | null;
  dob: string | null;
}

import { formatDateOnly } from "../utils/dateUtils.js";

export function toPublicUser(row: User & { phone?: string | null; dob?: Date | string | null }): PublicUser {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    role: row.role,
    status: row.status || 'active',
    customerId: row.customer_id,
    isEmailVerified: row.is_email_verified,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
    tasksAssigned: row.tasks_assigned ? Number(row.tasks_assigned) : 0,
    tasksCompleted: row.tasks_completed ? Number(row.tasks_completed) : 0,
    isStudent: row.metadata?.is_student === true,
    phone: row.phone || null,
    dob: formatDateOnly(row.dob),
  };
}




