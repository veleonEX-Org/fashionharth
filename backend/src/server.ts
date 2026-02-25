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
import { systemSettingsRouter } from "./routes/systemSettingsRoutes.js";
import { crawlFashionTrends } from "./services/trendingService.js";
import adRouter from "./routes/adRoutes.js";
import { keepAliveRouter } from "./routes/keepAliveRoutes.js";


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

  const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://fashionharth.vercel.app",
    env.appUrl
  ].filter(Boolean);

  // 1. Logging and debugging
  app.use((req, res, next) => {
    logger.debug(`[Request] ${req.method} ${req.url} | Origin: ${req.headers.origin}`);
    next();
  });

  // 2. CORS - Move to the top and improve logic
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl) 
        if (!origin) return callback(null, true);
        
        // Check if origin matches exactly or without trailing slash
        const sanitizedOrigin = origin.replace(/\/$/, "");
        const isAllowed = allowedOrigins.some(ao => ao?.replace(/\/$/, "") === sanitizedOrigin);

        if (isAllowed) {
          callback(null, true);
        } else {
          logger.warn(`[CORS] Rejected origin: ${origin}`);
          callback(null, false); // Important: pass false, not an error object
        }
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
    })
  );

  // morgan should come after CORS if you want to log the response headers correctly
  app.use(
    morgan(":method :url :status :res[content-length] - :response-time ms", {
      stream: {
        write: (message) => logger.http(message.trim()),
      },
    })
  );

  // Stripe webhook route must come BEFORE express.json() to get raw body
  app.use("/api/payments", paymentRouter);

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  app.use(cookieParser());

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

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
  app.use("/api/settings", systemSettingsRouter);
  app.use("/api/ads", adRouter);
  app.use("/api", categoryRouter);
  app.use("/api/keep-alive", keepAliveRouter);


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
