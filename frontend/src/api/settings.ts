import { http } from "./http";

export interface SystemSetting {
  key: string;
  value: string;
  description: string | null;
  updatedAt: string;
}

export const getAllSettings = async () => {
  const { data } = await http.get<SystemSetting[]>("/settings");
  return data;
};

export const getSetting = async (key: string) => {
  const { data } = await http.get<SystemSetting>(`/settings/${key}`);
  return data;
};

export const updateSetting = async (key: string, value: string, description?: string) => {
  const { data } = await http.put<SystemSetting>(`/settings/${key}`, { value, description });
  return data;
};
