import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT || 5000),
  nodeEnv: process.env.NODE_ENV || "development",
  db: {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "veleonEX.10",
    database: process.env.DB_NAME || "fullstack_template",
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || "change-me-access",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "change-me-refresh",
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  },
  appUrl: process.env.APP_URL || "http://localhost:5173",
  googleClientId: process.env.GOOGLE_CLIENT_ID || "",
  email: {
    brevoApiKey: process.env.BREVO_API_KEY || "",
    smtp: {
      host: process.env.SMTP_HOST || "smtp-relay.brevo.com",
      port: Number(process.env.SMTP_PORT || 587),
      user: process.env.SMTP_USER || "",
      pass: process.env.SMTP_PASS || "",
    },
    from: process.env.EMAIL_FROM || "noreply@example.com",
    fromName: process.env.EMAIL_FROM_NAME || "App",
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || "",
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || "",
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
  },
  paystack: {
    secretKey: process.env.PAYSTACK_SECRET_KEY || "",
    publicKey: process.env.PAYSTACK_PUBLIC_KEY || "",
    webhookSecret: process.env.PAYSTACK_WEBHOOK_SECRET || "",
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
    apiKey: process.env.CLOUDINARY_API_KEY || "",
    apiSecret: process.env.CLOUDINARY_API_SECRET || "",
  },
  r2: {
    accountId: process.env.R2_ACCOUNT_ID || "",
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
    bucketName: process.env.R2_BUCKET_NAME || "",
    publicDomain: process.env.R2_PUBLIC_DOMAIN || "",
  },
  storageProvider: process.env.STORAGE_PROVIDER || "cloudinary",
};

