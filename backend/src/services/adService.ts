
import { z } from "zod";
import { pool } from "../database/pool.js";
import type { Ad, PublicAd } from "../models/ad.js";
import { toPublicAd } from "../models/ad.js";

const adSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().nullable().optional(),
  imageUrl: z.string().url("Valid image URL is required"),
  linkUrl: z.string().url("Valid link URL is required").nullable().optional(),
  badgeText: z.string().max(100).nullable().optional(),
  offerText: z.string().max(100).nullable().optional(),
  offerSubtext: z.string().max(100).nullable().optional(),
  status: z.enum(["active", "inactive"]).default("active"),
});

export async function createAd(input: unknown): Promise<PublicAd> {
  const data = adSchema.parse(input);

  const result = await pool.query<Ad>(
    `
    INSERT INTO ads (
      title, description, image_url, link_url, badge_text, offer_text, offer_subtext, status
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
    `,
    [
      data.title,
      data.description || null,
      data.imageUrl,
      data.linkUrl || null,
      data.badgeText || null,
      data.offerText || null,
      data.offerSubtext || null,
      data.status,
    ]
  );

  return toPublicAd(result.rows[0]);
}

export async function getAds(isAdmin: boolean = false): Promise<PublicAd[]> {
  const query = isAdmin 
    ? "SELECT * FROM ads ORDER BY created_at DESC"
    : "SELECT * FROM ads WHERE status = 'active' ORDER BY created_at DESC";
  
  const result = await pool.query<Ad>(query);
  return result.rows.map(toPublicAd);
}

export async function updateAd(id: number, input: unknown): Promise<PublicAd> {
  const data = adSchema.partial().parse(input);
  
  const existing = await pool.query<Ad>("SELECT * FROM ads WHERE id = $1", [id]);
  if (existing.rows.length === 0) {
    throw new Error("Ad not found");
  }

  const updates: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;

  const mapping: Record<string, string> = {
    title: "title",
    description: "description",
    imageUrl: "image_url",
    linkUrl: "link_url",
    badgeText: "badge_text",
    offerText: "offer_text",
    offerSubtext: "offer_subtext",
    status: "status",
  };

  for (const [key, dbCol] of Object.entries(mapping)) {
    if ((data as any)[key] !== undefined) {
      updates.push(`${dbCol} = $${paramIndex}`);
      params.push((data as any)[key]);
      paramIndex++;
    }
  }

  if (updates.length === 0) {
    return toPublicAd(existing.rows[0]);
  }

  updates.push(`updated_at = NOW()`);
  params.push(id);

  const result = await pool.query<Ad>(
    `
    UPDATE ads
    SET ${updates.join(", ")}
    WHERE id = $${paramIndex}
    RETURNING *
    `,
    params
  );

  return toPublicAd(result.rows[0]);
}

export async function deleteAd(id: number): Promise<void> {
  const result = await pool.query("DELETE FROM ads WHERE id = $1", [id]);
  if (result.rowCount === 0) {
    throw new Error("Ad not found");
  }
}
