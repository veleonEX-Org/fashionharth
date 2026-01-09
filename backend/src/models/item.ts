import type { UserRole } from "../types/auth";

export interface Item {
  id: number;
  title: string;
  description: string | null;
  status: "active" | "inactive" | "archived";
  created_by: number;
  role_access: UserRole[];
  metadata: Record<string, unknown> | null;
  created_at: Date;
  updated_at: Date;
  price: number;
  category: string;
  story: string | null;
  is_trending: boolean;
  image_url: string | null;
}

export interface PublicItem {
  id: number;
  title: string;
  description: string | null;
  status: "active" | "inactive" | "archived";
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

export function toPublicItem(row: Item): PublicItem {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    createdBy: row.created_by,
    roleAccess: row.role_access,
    metadata: row.metadata,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
    price: Number(row.price),
    category: row.category,
    story: row.story,
    isTrending: row.is_trending,
    imageUrl: row.image_url,
  };
}




