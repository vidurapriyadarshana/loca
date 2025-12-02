import { Types } from "mongoose";
import { SwipeDirection } from "../constants/swipe.constants";

/**
 * Swipe interface
 */
export interface ISwipe {
  _id: Types.ObjectId;
  swiper: Types.ObjectId;        // User who performed the swipe
  swiped_on: Types.ObjectId;     // User who was swiped on
  direction: SwipeDirection;     // LEFT or RIGHT
  created_at: Date;              // When the swipe occurred
}

/**
 * Swipe creation data
 */
export interface ISwipeCreate {
  swiper: string | Types.ObjectId;
  swiped_on: string | Types.ObjectId;
  direction: SwipeDirection;
}

/**
 * Match interface (when both users swipe right on each other)
 */
export interface IMatch {
  _id: Types.ObjectId;
  user_id_1: Types.ObjectId;  // First user in the match
  user_id_2: Types.ObjectId;  // Second user in the match
  matched: boolean;            // Match status (true for active match)
  created_at: Date;            // When the match was created
}
