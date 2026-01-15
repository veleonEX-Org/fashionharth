import axios from "axios";
import * as cheerio from "cheerio";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { pool } from "../database/pool.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
// Using gemini-1.5-pro as it's the stable model for v1 API
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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

function toTrendingNews(row: any): TrendingNews {
  return {
    id: row.id,
    title: row.title,
    summary: row.summary,
    originalUrl: row.original_url,
    imageUrl: row.image_url,
    sourceName: row.source_name,
    isFeatured: row.is_featured,
    createdAt: row.created_at.toISOString(),
  };
}

export async function getTrendingNews(limit: number = 10): Promise<TrendingNews[]> {
  const result = await pool.query(
    `SELECT * FROM trending_news ORDER BY is_featured DESC, created_at DESC LIMIT $1`,
    [limit]
  );
  return result.rows.map(toTrendingNews);
}

async function rewriteSummary(title: string, originalExcerpt: string): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY not found, using original excerpt.");
    return originalExcerpt; // Fallback
  }

  // If excerpt is empty or too short, return as-is
  if (!originalExcerpt || originalExcerpt.length < 10) {
    return originalExcerpt || "No summary available.";
  }

  try {
    const prompt = `Rewrite the following fashion news excerpt into a 2-sentence summary for a premium fashion brand called "FashionHarth Clothing". 
    Focus on the style implications and trends, not the original brand mentioned if it's a competitor. Make it sound sophisticated, confident, and inspiring.
    
    Original Title: ${title}
    Original Excerpt: ${originalExcerpt}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const rewritten = response.text().trim();
    
    console.log(`✓ Successfully rewrote: "${title.substring(0, 50)}..."`);
    return rewritten;
  } catch (error: any) {
    // Log detailed error but continue gracefully
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED' || error.message?.includes('fetch failed')) {
      console.warn(`⚠ Network error calling Gemini API (using original excerpt): ${error.message}`);
    } else {
      console.error("Error generating summary with Gemini:", error.message || error);
    }
    return originalExcerpt;
  }
}

async function saveTrend(trend: Omit<TrendingNews, "id" | "createdAt" | "isFeatured">) {
  try {
    // Check if URL already exists to avoid duplicates
    const existing = await pool.query("SELECT id FROM trending_news WHERE original_url = $1", [trend.originalUrl]);
    if (existing.rows.length > 0) return;

    await pool.query(
      `INSERT INTO trending_news (title, summary, original_url, image_url, source_name)
       VALUES ($1, $2, $3, $4, $5)`,
       [trend.title, trend.summary, trend.originalUrl, trend.imageUrl, trend.sourceName]
    );
  } catch (err) {
    console.error("Failed to save trend:", trend.title, err);
  }
}

export async function crawlFashionTrends() {
  console.log("🔄 Starting fashion crawl...");
  
  const trendsFound: any[] = [];

  try {
    console.log("📡 Fetching from Vogue...");
    const { data } = await axios.get("https://www.vogue.com/fashion/trends", {
       headers: { 
         "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36" 
       },
       timeout: 10000 // 10 second timeout
    });
    
    const $ = cheerio.load(data);
    
    // Vogue's specific structure (may need adjustment if they change standard classes)
    $(".summary-item").each((i, el) => {
       if (i >= 5) return; // Limit to top 5 to be polite
       
       const title = $(el).find(".summary-item__hed").text().trim();
       const link = $(el).find("a.summary-item__hed-link").attr("href");
       const img = $(el).find("img").attr("src");
       const desc = $(el).find(".summary-item__dek").text().trim();
       
       if (title && link) {
         trendsFound.push({
           title,
           summary: desc || "Fashion trend update from Vogue.",
           originalUrl: link.startsWith("http") ? link : `https://www.vogue.com${link}`,
           imageUrl: img || null,
           sourceName: "Vogue"
         });
         console.log(`  ✓ Found: ${title.substring(0, 60)}...`);
       }
    });

    console.log(`📊 Scraped ${trendsFound.length} articles from Vogue`);

  } catch (error: any) {
    console.error("❌ Vogue crawl failed:", error.message);
  }
  
  // Logic to process the found trends
  console.log(`\n🤖 Processing ${trendsFound.length} trends...`);
  let saved = 0;
  let skipped = 0;
  
  for (const trend of trendsFound) {
    try {
      const rewrittenSummary = await rewriteSummary(trend.title, trend.summary);
      await saveTrend({
        ...trend,
        summary: rewrittenSummary
      });
      saved++;
      // Add a small delay to respect rate limits
      await new Promise(r => setTimeout(r, 1000));
    } catch (err) {
      console.error(`Failed to process trend: ${trend.title}`, err);
      skipped++;
    }
  }

  console.log(`\n✅ Crawl finished. Saved: ${saved}, Skipped: ${skipped}, Total: ${trendsFound.length}`);
}
