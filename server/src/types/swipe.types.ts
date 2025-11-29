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
 * Match data (when both users swipe right on each other)
 */
export interface IMatch {
  user1: Types.ObjectId;
  user2: Types.ObjectId;
  matched_at: Date;
}
