import type { UserRole } from "./auth";

export type ItemStatus = "active" | "inactive" | "archived";

export interface Item {
  id: number;
  title: string;
  description: string | null;
  status: ItemStatus;
  createdBy: number;
  roleAccess: UserRole[];
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  price: number;
  category: string;
  story: string | null;
  isTrending: boolean;
  imageUrl: string | null;
}

export interface PaginatedItems {
  items: Item[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateItemPayload {
  title: string;
  description?: string | null;
  status?: ItemStatus;
  roleAccess: UserRole[];
  metadata?: Record<string, unknown> | null;
  price?: number;
  category?: string;
  story?: string | null;
  isTrending?: boolean;
  imageUrl?: string | null;
}

export interface UpdateItemPayload {
  title?: string;
  description?: string | null;
  status?: ItemStatus;
  roleAccess?: UserRole[];
  metadata?: Record<string, unknown> | null;
  price?: number;
  category?: string;
  story?: string | null;
  isTrending?: boolean;
  imageUrl?: string | null;
}




