import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

cloudinary.config({
  cloud_name: env.cloudinary.cloudName,
  api_key: env.cloudinary.apiKey,
  api_secret: env.cloudinary.apiSecret,
});

export async function uploadToCloudinary(
  fileBuffer: Buffer,
  folder: string = "fashion"
): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) {
          logger.error("Cloudinary upload failed:", error);
          return reject(new Error("Failed to upload image to Cloudinary"));
        }
        if (!result) {
          return reject(new Error("Cloudinary upload returned no result"));
        }
        resolve(result.secure_url);
      }
    );

    uploadStream.end(fileBuffer);
  });
}

export { cloudinary };
