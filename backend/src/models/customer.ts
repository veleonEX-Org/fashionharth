export interface Customer {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  userId: number | null; // Mapped from user_id
  measurements: Record<string, any>; // { kaftan: {...}, suit: {...} }
  dob: string | null;
  anniversaryDate: string | null; // Mapped from anniversary_date
  createdAt: string;
  updatedAt: string;
  totalTasks?: number;
}

export interface CreateCustomerPayload {
  name: string;
  email?: string;
  phone?: string;
  userId?: number;
  measurements?: Record<string, any>;
  dob?: string;
  anniversaryDate?: string;
}

export interface UpdateCustomerPayload {
  name?: string;
  email?: string;
  phone?: string;
  userId?: number;
  measurements?: Record<string, any>;
  dob?: string;
  anniversaryDate?: string;
}
