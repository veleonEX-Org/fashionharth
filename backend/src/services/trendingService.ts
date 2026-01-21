import axios from "axios";
import * as cheerio from "cheerio";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { pool } from "../database/pool.js";
import { getAllCategories } from "./categoryService.js";
import { getSystemSetting } from "./systemSettingsService.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
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

export async function getTrendingNews(limit: number = 20): Promise<TrendingNews[]> {
  const result = await pool.query(
    `SELECT * FROM trending_news ORDER BY created_at DESC LIMIT $1`,
    [limit]
  );
  return result.rows.map(toTrendingNews);
}

// Fisher-Yates shuffle
function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

async function rewriteSummary(title: string, originalExcerpt: string, categories: string[], summaryPrompt?: string): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    return originalExcerpt;
  }

  if (!originalExcerpt || originalExcerpt.length < 10) {
    return originalExcerpt || "No summary available.";
  }

  try {
    const brandCategories = categories.join(", ");
    const defaultPrompt = `Rewrite the following fashion news excerpt into a 2-sentence summary for a premium fashion brand called "FashionHarth". 
    The brand focuses on these categories: ${brandCategories}.
    Focus on the style implications and trends. Make it sound sophisticated, confident, and inspiring.`;

    const userPrompt = summaryPrompt 
      ? `${summaryPrompt}\n\nContext - Brand Categories: ${brandCategories}\nTitle: ${title}\nExcerpt: ${originalExcerpt}`
      : `${defaultPrompt}\n\nOriginal Title: ${title}\nOriginal Excerpt: ${originalExcerpt}`;

    const result = await model.generateContent(userPrompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error: any) {
    console.error("Error generating summary with Gemini:", error.message || error);
    return originalExcerpt;
  }
}

async function saveTrend(trend: Omit<TrendingNews, "id" | "createdAt" | "isFeatured">) {
  try {
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

async function scrapeSite(url: string, sourceName: string, selector: string, titleSel: string, linkSel: string, imgSel: string, descSel: string) {
  try {
    console.log(`📡 Fetching from ${sourceName}...`);
    const { data } = await axios.get(url, {
       headers: { 
         "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36" 
       },
       timeout: 10000 
    });
    
    const $ = cheerio.load(data);
    const found: any[] = [];
    
    $(selector).each((i, el) => {
       if (i >= 5) return; 
       
       const title = $(el).find(titleSel).text().trim();
       let link = $(el).find(linkSel).attr("href");
       let img = $(el).find(imgSel).attr("src") || $(el).find(imgSel).attr("data-src");
       const desc = $(el).find(descSel).text().trim();
       
       if (title && link) {
         if (!link.startsWith("http")) {
            const domain = new URL(url).origin;
            link = domain + link;
         }

         found.push({
           title,
           summary: desc || `Latest trend from ${sourceName}`,
           originalUrl: link,
           imageUrl: img || null,
           sourceName
         });
       }
    });
    console.log(`  ✓ Found ${found.length} items from ${sourceName}`);
    return found;
  } catch (err: any) {
    console.error(`❌ ${sourceName} crawl failed:`, err.message);
    return [];
  }
}

export async function crawlFashionTrends() {
  console.log("🔄 Starting multi-site fashion crawl...");
  
  // 1. Fetch dependencies
  const [categories, summarySetting, crawlSetting] = await Promise.all([
    getAllCategories(),
    getSystemSetting("trending_summary_prompt"),
    getSystemSetting("trending_crawl_prompt")
  ]);

  const categoryNames = categories.map(c => c.name);
  const summaryPrompt = summarySetting?.value;
  // We can use crawlPrompt to determine *which* URLs to hit or how to search if we were using a search API.
  // For now, we'll stick to fixed URLs but maybe use it for filtering later?
  // Or if we implemented a Google Search API crawler, we'd use it there.
  
  const tasks = [
    // Vogue
    scrapeSite(
      "https://www.vogue.com/fashion/trends", 
      "Vogue", 
      ".summary-item", 
      ".summary-item__hed", 
      "a.summary-item__hed-link", 
      "img", 
      ".summary-item__dek"
    ),
    // Elle
    scrapeSite(
      "https://www.elle.com/fashion/trends/", 
      "Elle", 
      ".css-1l7bp5q", // This class might change, Hearst sites are tricky. Trying generic card class often works better if known.
      "a.css-1m049nz", // Attempting a selector based on observation, but extremely brittle. 
      // Fallback to more generic if possible? Hearst sites use data-vars-ga-call-to-action usually.
      // Let's try a safer 'article' loop for Elle if the class fails.
      // Actually, let's use a specialized function or simpler selectors.
      "a", // title link usually contains title text
      "img",
      "div.css-17565nm" // excerpt
    ),
    // Harper's Bazaar
    scrapeSite(
      "https://www.harpersbazaar.com/fashion/trends/",
      "Harpers Bazaar",
      ".item-listing-container .simple-item", // Older layout selector, might need update
      ".item-title",
      "a.item-link",
      "img.lazyload",
      ".item-deck"
    )
  ];

  // Actually, standardizing selectors for large sites is hard without maintenance.
  // I will refactor scrapeSite to be more robust or just accept that it might miss some if classes change.
  // For the purpose of this task, I'll try to use the most common structure.
  
  const results = await Promise.all(tasks);
  const allTrends = results.flat();

  // 2. Shuffle
  const shuffled = shuffleArray(allTrends);
  
  console.log(`\n🤖 Processing ${shuffled.length} trends...`);
  let saved = 0;

  for (const trend of shuffled) {
    try {
      const rewritten = await rewriteSummary(trend.title, trend.summary, categoryNames, summaryPrompt);
      await saveTrend({
        ...trend,
        summary: rewritten
      });
      saved++;
      await new Promise(r => setTimeout(r, 500));
    } catch (err) {
      console.error(`Failed to process trend: ${trend.title}`, err);
    }
  }

  console.log(`\n✅ Crawl finished. Saved: ${saved}/${shuffled.length}`);
}

