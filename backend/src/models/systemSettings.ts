export interface SystemSetting {
  key: string;
  value: string;
  description: string | null;
  updatedAt: string;
}

export interface UpdateSystemSettingPayload {
  value: string;
  description?: string;
}
