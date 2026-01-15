import { env } from "../config/env.js";
import { uploadToCloudinary } from "./cloudinaryService.js";
import { uploadToR2 } from "./r2Service.js";

export async function uploadImage(
  fileBuffer: Buffer,
  folder: string = "fashion",
  fileName?: string,
  contentType?: string
): Promise<string> {
  const provider = env.storageProvider;

  if (provider === "r2") {
    return uploadToR2(fileBuffer, folder, fileName, contentType);
  }

  // Default to cloudinary
  return uploadToCloudinary(fileBuffer, folder);
}
