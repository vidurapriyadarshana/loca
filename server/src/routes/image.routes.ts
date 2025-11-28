import { Router } from "express";
import multer from "multer";
import { authenticate } from "../middleware/auth.middleware";
import * as imageController from "../controllers/image.controller";

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!") as any, false);
    }
  },
});

// POST /api/images/upload - Upload single image
// 'image' is the field name in the form-data
router.post(
  "/image",
  upload.single("image"), // Multer middleware runs here
  imageController.saveImageAndGetUrl // Controller runs after
);

export default router;