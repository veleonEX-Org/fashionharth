

export interface Item {
  id: number;
  title: string;
  description: string | null;
  status: "active" | "inactive" | "archived";
  created_by: number;
  metadata: Record<string, unknown> | null;
  created_at: Date;
  updated_at: Date;
  price: number;
  category: string;
  story: string | null;
  is_trending: boolean;
  image_url: string | null;
  inspired_image_url: string | null;
}

export interface PublicItem {
  id: number;
  title: string;
  description: string | null;
  status: "active" | "inactive" | "archived";
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
  discountPercentage: number;
  installmentDuration: number | null;
  reviews: any[];
}

export function toPublicItem(row: Item): PublicItem {
  const metadata = row.metadata as Record<string, any> || {};
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    createdBy: row.created_by,
    metadata: row.metadata,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
    price: Number(row.price),
    category: row.category,
    story: row.story,
    isTrending: row.is_trending,
    imageUrl: row.image_url,
    inspiredImageUrl: row.inspired_image_url,
    discountPercentage: Number(metadata.discount_percentage) || 0,
    installmentDuration: metadata.installment_duration ? Number(metadata.installment_duration) : null,
    reviews: (metadata.reviews as any[]) || [],
  };
}
