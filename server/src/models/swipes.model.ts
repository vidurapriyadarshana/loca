import { Schema, model } from "mongoose";
import { ISwipe } from "../types/swipe.types";
import { SwipeDirection } from "../constants/swipe.constants";

/**
 * Swipe schema
 */
const swipeSchema = new Schema<ISwipe>(
  {
    swiper: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true  // Index for efficient queries by swiper
    },
    swiped_on: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true  // Index for efficient queries by swiped_on
    },
    direction: {
      type: String,
      enum: Object.values(SwipeDirection),
      required: true
    },
    created_at: {
      type: Date,
      default: Date.now,
      index: true  // Index for sorting by time
    }
  },
  {
    timestamps: false  // We're using custom created_at field
  }
);

// Compound index to prevent duplicate swipes (one user can only swipe another user once)
swipeSchema.index({ swiper: 1, swiped_on: 1 }, { unique: true });

// Compound index for finding mutual matches (both users swiped right)
swipeSchema.index({ swiper: 1, swiped_on: 1, direction: 1 });

export const Swipe = model<ISwipe>("Swipe", swipeSchema);
