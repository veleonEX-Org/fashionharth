export interface Task {
  id: number;
  customerId: number;
  category: string;
  totalAmount: number;
  amountPaid: number;
  productionCost: number;
  assignedTo: number | null; // User ID of staff
  startDate: string | null;
  dueDate: string;
  deadline: string | null;
  status: 'pending' | 'in_progress' | 'completed';
  notes: string | null;
  productionNotes: string | null;
  quantity: number | null;
  deliveryDestination: string | null;
  createdAt: string;
  updatedAt: string;
  transactionId: number | null;
  
  // Joins
  customerName?: string;
  customerPhone?: string;
  assigneeName?: string;
}

export interface CreateTaskPayload {
  customerId: number;
  category: string;
  totalAmount: number;
  amountPaid: number;
  productionCost: number;
  assignedTo?: number;
  startDate?: string;
  dueDate: string;
  status?: 'pending' | 'in_progress' | 'completed';
  notes?: string;
  productionNotes?: string;
  quantity?: number;
  deliveryDestination?: string;
  transactionId?: number;
}

export interface UpdateTaskPayload {
  customerId?: number;
  category?: string;
  totalAmount?: number;
  amountPaid?: number;
  productionCost?: number;
  assignedTo?: number;
  startDate?: string;
  dueDate?: string;
  status?: 'pending' | 'in_progress' | 'completed';
  notes?: string;
  productionNotes?: string;
  quantity?: number;
  deliveryDestination?: string;
  transactionId?: number;
}
