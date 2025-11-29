import { Request, Response, NextFunction } from "express";
import { logger } from "../config/logger.config";
import * as swipeService from "../services/swipe.service";
import { ApiResponse } from "../utils/ApiResponse";
import { BadRequestError } from "../utils/ApiError";

const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

/**
 * Create multiple swipes in batch
 * POST /api/swipes
 * Body: [{ swiped_on: string, direction: "LEFT" | "RIGHT" }]
 */
export const createSwipes = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const swipes = req.body;
    const userId = req.user?.id;

    if (!userId) {
      throw new BadRequestError("User ID not found in request");
    }

    if (!Array.isArray(swipes)) {
      throw new BadRequestError("Request body must be an array of swipes");
    }

    logger.debug(`Swipe Controller: createSwipes - Received ${swipes.length} swipes from user ${userId}`);

    const createdSwipes = await swipeService.createSwipesBatch(
      userId,
      swipes
    );

    res
      .status(201)
      .json(
        new ApiResponse(
          201,
          { 
            created: createdSwipes.length,
            swipes: createdSwipes 
          },
          `Successfully created ${createdSwipes.length} swipe(s)`
        )
      );
  }
);
