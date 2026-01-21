
export interface Ad {
  id: number;
  title: string;
  description: string | null;
  image_url: string;
  link_url: string | null;
  badge_text: string | null;
  offer_text: string | null;
  offer_subtext: string | null;
  status: "active" | "inactive";
  created_at: Date;
  updated_at: Date;
}

export interface PublicAd {
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

export function toPublicAd(row: Ad): PublicAd {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    imageUrl: row.image_url,
    linkUrl: row.link_url,
    badgeText: row.badge_text,
    offerText: row.offer_text,
    offerSubtext: row.offer_subtext,
    status: row.status,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}
