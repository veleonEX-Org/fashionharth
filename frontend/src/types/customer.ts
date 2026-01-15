export interface Customer {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  userId: number | null;
  measurements: Record<string, any>;
  dob: string | null;
  anniversaryDate: string | null;
  createdAt: string;
  updatedAt: string;
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
