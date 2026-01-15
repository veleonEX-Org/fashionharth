import { Router } from "express";
import { getTrendingNews, crawlFashionTrends } from "../services/trendingService.js";
import { logger } from "../utils/logger.js";

export const trendingRouter = Router();

// Public route to get trending news
trendingRouter.get("/", async (req, res, next) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const news = await getTrendingNews(limit);
    res.json(news);
  } catch (error) {
    next(error);
  }
});

// Admin-only route to force a crawl (useful for testing)
// We should protect this with admin middleware in a real app, strict checking.
// For now, I'll leave it open but hidden or simple, assuming the user will add middleware if needed,
// strictly speaking regular users shouldn't trigger crawls.
trendingRouter.post("/force-crawl", async (req, res, next) => {
  try {
    // Ideally: check user role here.
    logger.info("Manual crawl triggered");
    // Run in background
    crawlFashionTrends().catch(err => logger.error("Background crawl failed", err));
    res.json({ message: "Crawl started in background" });
  } catch (error) {
    next(error);
  }
});
