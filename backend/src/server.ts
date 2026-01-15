import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { createServer } from "http";
import { env } from "./config/env.js";
import { authRouter } from "./routes/authRoutes.js";
import { userRouter } from "./routes/userRoutes.js";
import { adminRouter } from "./routes/adminRoutes.js";
import { staffRouter } from "./routes/staffRoutes.js";
import { itemRouter } from "./routes/itemRoutes.js";
import { paymentRouter } from "./routes/paymentRoutes.js";
import { chatRouter } from "./routes/chatRoutes.js";
import { customerRouter } from "./routes/customerRoutes.js";
import { taskRouter } from "./routes/taskRoutes.js";
import { lookRouter } from "./routes/lookRoutes.js";
import categoryRouter from "./routes/categoryRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { pingDatabase } from "./database/pool.js";
import { logger } from "./utils/logger.js";
import { rateLimiter, authRateLimiter } from "./middleware/rateLimiter.js";
import { SocketService } from "./services/socketService.js";
import cron from "node-cron";
import { trendingRouter } from "./routes/trendingRoutes.js";
import { uploadRouter } from "./routes/uploadRoutes.js";
import { crawlFashionTrends } from "./services/trendingService.js";

async function bootstrap(): Promise<void> {
  // ... (retry logic omitted for brevity, keeping it as is)
  const maxRetries = 5;
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      await pingDatabase();
      logger.info("Database connection established successfully");
      break;
    } catch (err: any) {
      retries++;
      const isLastRetry = retries >= maxRetries;
      
      if (err.code === 'EAI_AGAIN' || err.code === 'ENOTFOUND') {
        if (isLastRetry) {
          logger.error(`DNS resolution failed after ${maxRetries} attempts`, err);
          throw err;
        }
        const waitTime = Math.min(1000 * Math.pow(2, retries), 10000); // Exponential backoff, max 10s
        logger.warn(`DNS resolution failed (attempt ${retries}/${maxRetries}), retrying in ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } else {
        logger.error("Database connection failed", err);
        throw err;
      }
    }
  }

  const app = express();
  const httpServer = createServer(app);

  // Initialize Socket.io
  const socketService = SocketService.getInstance();
  socketService.initialize(httpServer, env.appUrl);

  app.use(
    morgan(":method :url :status :res[content-length] - :response-time ms", {
      stream: {
        write: (message) => logger.http(message.trim()),
      },
    })
  );

  app.use(
    cors({
      origin: env.appUrl,
      credentials: true,
    })
  );

  // Stripe webhook route must come BEFORE express.json() to get raw body
  app.use("/api/payments", paymentRouter);

  app.use(express.json());
  app.use(cookieParser());

  app.use("/api", rateLimiter);

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/auth", authRateLimiter, authRouter);
  app.use("/api/users", userRouter);
  app.use("/api/admin", adminRouter);
  app.use("/api/staff", staffRouter);
  app.use("/api/items", itemRouter);
  app.use("/api/chat", chatRouter);
  app.use("/api/customers", customerRouter);
  app.use("/api/tasks", taskRouter);
  app.use("/api/looks", lookRouter);
  app.use("/api/trending", trendingRouter);
  app.use("/api/upload", uploadRouter);
  app.use("/api", categoryRouter);

  app.use(errorHandler);

  // Schedule weekly fashion crawl (Every Sunday at midnight)
  cron.schedule("0 0 * * 0", async () => {
    logger.info("Running weekly fashion crawl...");
    try {
      await crawlFashionTrends();
    } catch (err) {
      logger.error("Weekly fashion crawl failed", err);
    }
  });

  httpServer.listen(env.port, () => {
    logger.info(`API server with Socket.io listening on http://localhost:${env.port}`);
  });
}

bootstrap().catch((err) => {
  logger.error("Failed to start server", err);
  process.exit(1);
});
