
export type ItemStatus = "active" | "inactive" | "archived";

export interface Review {
  name: string;
  rating: number;
  text: string;
  role?: string;
  avatar?: string;
}

export interface Item {
  id: number;
  title: string;
  description: string | null;
  status: ItemStatus;
  createdBy: number;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  price: number;
  category: string;
  story: string | null;
  isTrending: boolean;
  imageUrl: string | null;
  inspiredImageUrl: string | null;
  discountPercentage?: number;
  installmentDuration?: number | null;
  reviews?: Review[];
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

  metadata?: Record<string, unknown> | null;
  price?: number;
  category?: string;
  story?: string | null;
  isTrending?: boolean;
  imageUrl?: string | null;
  inspiredImageUrl?: string | null;
  discountPercentage?: number;
  installmentDuration?: number | null;
  reviews?: Review[];
}

export interface UpdateItemPayload {
  title?: string;
  description?: string | null;
  status?: ItemStatus;

  metadata?: Record<string, unknown> | null;
  price?: number;
  category?: string;
  story?: string | null;
  isTrending?: boolean;
  imageUrl?: string | null;
  inspiredImageUrl?: string | null;
  discountPercentage?: number;
  installmentDuration?: number | null;
  reviews?: Review[];
}
