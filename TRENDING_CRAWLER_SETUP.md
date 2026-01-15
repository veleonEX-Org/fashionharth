# Trending Fashion Crawler - Setup & Usage Guide

## Overview
The trending fashion crawler automatically fetches the latest fashion news from major fashion websites (currently Vogue), rewrites the summaries using Google's Gemini AI to match FashionHarth Clothing's brand voice, and displays them alongside your own trending items.

## Architecture

### Backend Components
1. **Database Table**: `trending_news` - Stores scraped articles
2. **Service**: `trendingService.ts` - Handles crawling, AI rewriting, and data storage
3. **Routes**: `trendingRoutes.ts` - API endpoints for fetching news and manual crawling
4. **Scheduler**: Automated weekly crawl every Sunday at midnight (via `node-cron`)

### Frontend Components
1. **API Client**: `trending.ts` - Functions to fetch news and trigger crawls
2. **Trending Page**: `TrendingPage.tsx` - Displays mixed feed of products + news
3. **Admin Dashboard**: `AdminDashboardPage.tsx` - Manual crawler trigger button

## Database Schema

```sql
CREATE TABLE trending_news (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  original_url TEXT NOT NULL UNIQUE,
  image_url TEXT,
  source_name TEXT NOT NULL,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## Environment Variables

Add to your `.env` file:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

## Manual Trigger

### From Admin Dashboard
1. Navigate to `/admin` (Admin Dashboard)
2. Scroll to the "Trend Crawler" section
3. Click "Sync Now" button

### Via API
```bash
POST http://localhost:5000/api/trending/force-crawl
```

## How It Works

1. **Crawling**: Fetches HTML from Vogue's trends page using axios + cheerio
2. **Parsing**: Extracts title, description, link, and image from each article
3. **AI Rewriting**: Sends each summary to Gemini AI with a custom prompt
4. **Storage**: Saves unique articles to the database (checks for duplicates)
5. **Display**: Frontend mixes trending items and news, sorted by date

## Known Issues & Solutions

### Issue 1: Gemini API Network Error
**Error**: `TypeError: fetch failed` when calling Gemini API

**Cause**: Network restrictions, firewall, or proxy blocking outbound HTTPS to Google's API

**Solution**: The crawler now gracefully falls back to using the original excerpt if Gemini fails. Articles will still be saved and displayed, just without AI rewriting.

**To Fix Permanently**:
- Check firewall settings
- Configure proxy if needed
- Verify network allows HTTPS to `generativelanguage.googleapis.com`

### Issue 2: Database Table Not Found
**Error**: `relation "trending_news" does not exist`

**Solution**: Run the migration:
```bash
psql -U postgres -d fashion -f sql/trending_news.sql
```

Or manually:
```bash
psql -U postgres -d fashion -c "CREATE TABLE IF NOT EXISTS trending_news (id SERIAL PRIMARY KEY, title TEXT NOT NULL, summary TEXT NOT NULL, original_url TEXT NOT NULL UNIQUE, image_url TEXT, source_name TEXT NOT NULL, is_featured BOOLEAN DEFAULT false, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());"
```

### Issue 3: Scraper Finds No Articles
**Cause**: Vogue changed their HTML structure/CSS classes

**Solution**: Update the selectors in `trendingService.ts`:
- `.summary-item` - Main article container
- `.summary-item__hed` - Title
- `.summary-item__dek` - Description
- `a.summary-item__hed-link` - Link

## Adding More Sources

To add additional fashion websites (e.g., Elle, Hypebeast):

1. Open `trendingService.ts`
2. Add a new try/catch block in `crawlFashionTrends()`
3. Follow the same pattern as Vogue:
   - Fetch HTML with axios
   - Parse with cheerio
   - Extract title, summary, link, image
   - Push to `trendsFound` array

Example:
```typescript
try {
  const { data } = await axios.get("https://www.elle.com/fashion/trend-reports/", {
    headers: { "User-Agent": "Mozilla/5.0..." },
    timeout: 10000
  });
  
  const $ = cheerio.load(data);
  
  $(".article-card").each((i, el) => {
    if (i >= 5) return;
    
    const title = $(el).find(".title").text().trim();
    const link = $(el).find("a").attr("href");
    // ... etc
  });
} catch (error) {
  console.error("Elle crawl failed:", error);
}
```

## Legal Compliance

✅ **What We Do Right**:
- Link to original articles (attribution)
- Rewrite summaries (transformative use)
- Limit to 5 articles per source (fair use)
- Add delays between requests (respectful)
- Display source name clearly

⚠️ **Important**:
- Do NOT copy full articles
- Do NOT download and host their images (use embeds or original URLs)
- Always provide clear attribution
- Respect robots.txt

## Monitoring

Check backend logs for:
- `🔄 Starting fashion crawl...` - Crawl initiated
- `📡 Fetching from Vogue...` - Source being scraped
- `✓ Found: [title]` - Article discovered
- `✓ Successfully rewrote: [title]` - AI rewrite succeeded
- `⚠ Network error calling Gemini API` - AI failed (using original)
- `✅ Crawl finished. Saved: X` - Summary

## Troubleshooting

### No articles appearing on Trending page?
1. Check if crawler ran successfully (backend logs)
2. Verify database has data: `SELECT * FROM trending_news;`
3. Check frontend console for API errors
4. Ensure frontend is calling `/api/trending`

### Crawler button not working?
1. Check browser console for errors
2. Verify backend is running on port 5000
3. Check CORS settings in `server.ts`

### AI summaries are identical to originals?
1. Verify `GEMINI_API_KEY` is set in `.env`
2. Check backend logs for Gemini errors
3. Test network connectivity to Google's API

## Future Enhancements

- [ ] Add more fashion sources (Elle, Hypebeast, WWD)
- [ ] Implement image caching/CDN
- [ ] Add admin UI to manage featured articles
- [ ] Create category filtering for news
- [ ] Add search functionality
- [ ] Implement RSS feed support
- [ ] Add sentiment analysis
- [ ] Create email digest of weekly trends
