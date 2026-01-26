import { http } from "./http";

export interface Transaction {
  id: number;
  amount: number;
  currency: string;
  status: string;
  type: string;
  provider: string;
  created_at: string;
  description?: string;
}

export interface UserTask {
  id: number;
  category: string;
  status: string;
  totalAmount: number;
  amountPaid: number;
  startDate: string | null;
  deadline: string;
  dueDate: string;
  notes: string | null;
  productionNotes: string | null;
  quantity: number | null;
  deliveryDestination: string | null;
  createdAt: string;
  transactionId?: number;
  installments?: Array<{
    installment_number: number;
    amount: number;
    due_date: string;
    status: string;
  }>;
}

export const fetchMyTransactions = async (): Promise<Transaction[]> => {
  const { data } = await http.get("/users/me/transactions");
  return data;
};

export const fetchMyTasks = async (): Promise<UserTask[]> => {
  const { data } = await http.get("/users/me/tasks");
  return data;
};
