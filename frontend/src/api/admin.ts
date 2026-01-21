import { http } from "./http";
import { Item, CreateItemPayload } from "../types/item";
import { Customer, CreateCustomerPayload } from "../types/customer";
import { Task, CreateTaskPayload } from "../types/task";

export const fetchUsers = async () => {
  const response = await http.get("/users");
  return response.data;
};

export const updateUserRole = async (userId: number, role: string) => {
  const response = await http.put(`/users/${userId}/role`, { role });
  return response.data;
};

export const updateUserStatus = async (userId: number, status: string) => {
  const response = await http.put(`/users/${userId}/status`, { status });
  return response.data;
};

export const fetchCustomers = async (search?: string) => {
  const response = await http.get("/customers", { params: { search } });
  return response.data;
};

export const createCustomer = async (data: CreateCustomerPayload) => {
  const response = await http.post("/customers", data);
  return response.data;
};

export const updateCustomer = async (id: number, data: any) => {
  const response = await http.put(`/customers/${id}`, data);
  return response.data;
};

export const fetchCustomer = async (id: number) => {
  const response = await http.get(`/customers/${id}`);
  return response.data;
};

export const fetchTasks = async (params?: { 
  assignedTo?: number; 
  status?: string;
  sortBy?: 'deadline' | 'created_at';
  sortOrder?: 'ASC' | 'DESC';
  paymentStatus?: 'paid' | 'unpaid';
  minDate?: string;
  maxDate?: string;
}) => {
  const response = await http.get("/tasks", { params });
  return response.data;
};

export const createTask = async (data: CreateTaskPayload) => {
  const response = await http.post("/tasks", data);
  return response.data;
};

export const updateTask = async (id: number, data: any) => {
  const response = await http.put(`/tasks/${id}`, data);
  return response.data;
};
