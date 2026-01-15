import { Router } from "express";
import multer from "multer";
import { authenticate } from "../middleware/authMiddleware.js";
import { uploadImage } from "../controllers/uploadController.js";

const uploadRouter = Router();
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Require authentication for uploads
uploadRouter.post("/", authenticate, upload.single("image"), uploadImage);

export { uploadRouter };
