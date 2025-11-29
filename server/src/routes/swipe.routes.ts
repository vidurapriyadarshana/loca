import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import * as swipeController from "../controllers/swipe.controller";

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * POST /api/swipes
 * Create multiple swipes in batch
 * Body: [{ swiped_on: string, direction: "LEFT" | "RIGHT" }]
 */
router.post("/", swipeController.createSwipes);

/**
 * GET /api/swipes/history?direction=LEFT|RIGHT
 * Get swipe history with populated user profiles
 * Query params:
 *   - direction (optional): Filter by swipe direction (LEFT or RIGHT)
 */
router.get("/history", swipeController.getSwipeHistory);

export default router;
