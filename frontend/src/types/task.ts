export interface Task {
  id: number;
  customerId: number;
  category: string;
  totalAmount: number;
  amountPaid: number;
  productionCost: number;
  assignedTo: number | null;
  startDate: string | null;
  dueDate: string;
  deadline: string | null;
  status: 'pending' | 'in_progress' | 'completed';
  notes: string | null;
  deliveryDestination: string | null;
  createdAt: string;
  updatedAt: string;
  
  customerName?: string;
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
  status?: string;
  notes?: string;
  deliveryDestination?: string;
}
