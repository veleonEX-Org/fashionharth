import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";
import crypto from "crypto";

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${env.r2.accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.r2.accessKeyId,
    secretAccessKey: env.r2.secretAccessKey,
  },
});

export async function uploadToR2(
  fileBuffer: Buffer,
  folder: string = "fashion",
  fileName?: string,
  contentType: string = "image/jpeg"
): Promise<string> {
  try {
    const key = `${folder}/${fileName || crypto.randomUUID()}`;
    
    await s3Client.send(
      new PutObjectCommand({
        Bucket: env.r2.bucketName,
        Key: key,
        Body: fileBuffer,
        ContentType: contentType,
      })
    );

    // If a public domain is configured, use it, otherwise return a placeholder or constructive URL
    const baseUrl = env.r2.publicDomain 
      ? (env.r2.publicDomain.startsWith('http') ? env.r2.publicDomain : `https://${env.r2.publicDomain}`)
      : `https://${env.r2.bucketName}.${env.r2.accountId}.r2.cloudflarestorage.com`;

    return `${baseUrl}/${key}`;
  } catch (error) {
    logger.error("R2 upload failed:", error);
    throw new Error("Failed to upload image to Cloudflare R2");
  }
}

export { s3Client };
