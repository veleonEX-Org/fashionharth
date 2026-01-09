import { http } from "./http";

export const fetchFavorites = async () => {
  const { data } = await http.get("/looks/favorites");
  return data;
};

export const toggleFavorite = async (itemId: number, action: 'add' | 'remove') => {
  const { data } = await http.post("/looks/favorites", { itemId, action });
  return data;
};

export const saveLook = async (look: { itemId: number, customColor: string, avatarUrl?: string }) => {
  const { data } = await http.post("/looks/saved", look);
  return data;
};

export const fetchSavedLooks = async () => {
  const { data } = await http.get("/looks/saved");
  return data;
};
