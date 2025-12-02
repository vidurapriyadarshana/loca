import { Swipe } from "../models/swipes.model";
import { Match } from "../models/matches.model";
import { ISwipe } from "../types/swipe.types";
import { SwipeDirection } from "../constants/swipe.constants";
import { logger } from "../config/logger.config";
import { BadRequestError } from "../utils/ApiError";
import { Types } from "mongoose";

/**
 * Batch swipe data from frontend
 */
interface ISwipeBatch {
  swiped_on: string;
  direction: SwipeDirection;
}

/**
 * Result of swipe batch operation
 */
interface ISwipeBatchResult {
  createdSwipes: ISwipe[];
  newMatches: any[];
  errors: any[];
}

/**
 * Create multiple swipes at once and check for mutual matches
 * Each swipe is saved separately in the database
 * If both users swiped right, create a match entry
 */
export const createSwipesBatch = async (
  swiperId: string,
  swipes: ISwipeBatch[]
): Promise<ISwipeBatchResult> => {
  logger.debug(`Swipe Service: createSwipesBatch - Processing ${swipes.length} swipes for user ${swiperId}`);

  if (!swipes || swipes.length === 0) {
    throw new BadRequestError("Swipes array cannot be empty");
  }

  // Validate swiper ID
  if (!Types.ObjectId.isValid(swiperId)) {
    throw new BadRequestError("Invalid swiper ID");
  }

  const createdSwipes: ISwipe[] = [];
  const newMatches: any[] = [];
  const errors: any[] = [];

  // Process each swipe separately
  for (const swipeData of swipes) {
    try {
      // Validate swiped_on ID
      if (!Types.ObjectId.isValid(swipeData.swiped_on)) {
        errors.push({
          swiped_on: swipeData.swiped_on,
          error: "Invalid user ID"
        });
        continue;
      }

      // Validate direction
      if (!Object.values(SwipeDirection).includes(swipeData.direction)) {
        errors.push({
          swiped_on: swipeData.swiped_on,
          error: "Invalid swipe direction"
        });
        continue;
      }

      // Check if user is trying to swipe on themselves
      if (swiperId === swipeData.swiped_on) {
        errors.push({
          swiped_on: swipeData.swiped_on,
          error: "Cannot swipe on yourself"
        });
        continue;
      }

      // Create and save the swipe
      const newSwipe = new Swipe({
        swiper: swiperId,
        swiped_on: swipeData.swiped_on,
        direction: swipeData.direction,
        created_at: new Date()
      });

      const savedSwipe = await newSwipe.save();
      createdSwipes.push(savedSwipe);
      
      logger.debug(`Swipe Service: Successfully created swipe: ${swiperId} -> ${swipeData.swiped_on} (${swipeData.direction})`);

      // Check for mutual match if the current swipe is RIGHT
      if (swipeData.direction === SwipeDirection.RIGHT) {
        logger.debug(`Swipe Service: Checking for mutual match between ${swiperId} and ${swipeData.swiped_on}`);
        
        // Check if the other user also swiped RIGHT on this user
        const reverseSwipe = await Swipe.findOne({
          swiper: swipeData.swiped_on,
          swiped_on: swiperId,
          direction: SwipeDirection.RIGHT
        });

        if (reverseSwipe) {
          logger.info(`Swipe Service: Mutual match found! Creating match between ${swiperId} and ${swipeData.swiped_on}`);
          
          // Create a match entry
          // Ensure consistent ordering (smaller ID first) to prevent duplicates
          const [user_id_1, user_id_2] = [swiperId, swipeData.swiped_on].sort();
          
          try {
            const newMatch = new Match({
              user_id_1,
              user_id_2,
              matched: true,
              created_at: new Date()
            });

            const savedMatch = await newMatch.save();
            newMatches.push(savedMatch);
            
            logger.info(`Swipe Service: Match created successfully with ID: ${savedMatch._id}`);
          } catch (matchError: any) {
            // Handle duplicate match error (might already exist)
            if (matchError.code === 11000) {
              logger.warn(`Swipe Service: Match already exists between ${user_id_1} and ${user_id_2}`);
            } else {
              logger.error(`Swipe Service: Error creating match: ${matchError.message}`);
            }
          }
        } else {
          logger.debug(`Swipe Service: No mutual match yet - other user has not swiped right`);
        }
      }
    } catch (error: any) {
      // Handle duplicate swipe error (unique constraint violation)
      if (error.code === 11000) {
        logger.warn(`Swipe Service: Duplicate swipe detected: ${swiperId} -> ${swipeData.swiped_on}`);
        errors.push({
          swiped_on: swipeData.swiped_on,
          error: "Already swiped on this user"
        });
      } else {
        logger.error(`Swipe Service: Error creating swipe: ${error.message}`);
        errors.push({
          swiped_on: swipeData.swiped_on,
          error: error.message || "Failed to create swipe"
        });
      }
    }
  }

  logger.info(`Swipe Service: Batch complete - Swipes: ${createdSwipes.length}, Matches: ${newMatches.length}, Errors: ${errors.length}`);

  // If no swipes were created successfully, throw an error
  if (createdSwipes.length === 0 && errors.length > 0) {
    throw new BadRequestError("Failed to create any swipes", errors);
  }

  return { createdSwipes, newMatches, errors };
};

/**
 * Get swipe history for a user with populated user profiles
 * Returns swipes sorted by most recent first
 */
export const getSwipeHistory = async (
  userId: string,
  direction?: SwipeDirection
): Promise<any[]> => {
  logger.debug(`Swipe Service: getSwipeHistory - Fetching swipe history for user ${userId}`);

  if (!Types.ObjectId.isValid(userId)) {
    throw new BadRequestError("Invalid user ID");
  }

  // Build query filter
  const filter: any = { swiper: userId };
  if (direction) {
    if (!Object.values(SwipeDirection).includes(direction)) {
      throw new BadRequestError("Invalid swipe direction");
    }
    filter.direction = direction;
  }

  // Find swipes and populate the swiped_on user profiles
  const swipes = await Swipe.find(filter)
    .populate({
      path: 'swiped_on',
      select: 'name email age gender bio photos interests location last_active is_verified'
    })
    .sort({ created_at: -1 }) // Most recent first
    .lean();

  logger.info(`Swipe Service: Retrieved ${swipes.length} swipe(s) for user ${userId}`);

  return swipes;
};
