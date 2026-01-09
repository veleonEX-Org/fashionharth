export interface Favorite {
  id: number;
  userId: number;
  itemId: number;
  createdAt: string;
}

export interface CustomizedLook {
  id: number;
  userId: number;
  itemId: number;
  customColor: string;
  avatarUrl: string | null;
  createdAt: string;
  
  // Joins
  itemTitle?: string;
  itemImage?: string;
}
