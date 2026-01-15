import { http } from "./http";

export interface TrendingNews {
  id: number;
  title: string;
  summary: string;
  originalUrl: string;
  imageUrl: string | null;
  sourceName: string;
  isFeatured: boolean;
  createdAt: string;
}

export const fetchTrendingNews = async (limit: number = 10): Promise<TrendingNews[]> => {
  const response = await http.get(`/trending?limit=${limit}`);
  return response.data;
};

export const forceCrawl = async (): Promise<void> => {
  await http.post("/trending/force-crawl");
};
