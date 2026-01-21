import { http } from "./http";

export interface Ad {
  id: number;
  title: string;
  description: string | null;
  imageUrl: string;
  linkUrl: string | null;
  badgeText: string | null;
  offerText: string | null;
  offerSubtext: string | null;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

export const fetchAds = async (): Promise<Ad[]> => {
  const response = await http.get(`/ads`);
  return response.data;
};

export const createAd = async (data: Partial<Ad>): Promise<Ad> => {
  const response = await http.post(`/ads`, data);
  return response.data;
};

export const updateAd = async (id: number, data: Partial<Ad>): Promise<Ad> => {
  const response = await http.put(`/ads/${id}`, data);
  return response.data;
};

export const deleteAd = async (id: number): Promise<void> => {
  await http.delete(`/ads/${id}`);
};
