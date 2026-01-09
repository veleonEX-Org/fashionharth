import { http } from "./http";
import type { Item, PaginatedItems, CreateItemPayload, UpdateItemPayload } from "../types/item";

export const fetchPublicItems = async (params: {
  page?: number;
  limit?: number;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  isTrending?: boolean;
  search?: string;
}) => {
  const { data } = await http.get<PaginatedItems>("/items/public", { params });
  return data;
};

export const fetchItemById = async (id: number) => {
  const { data } = await http.get<Item>(`/items/${id}`);
  return data;
};

// ... add other admin/protected API calls here as needed
