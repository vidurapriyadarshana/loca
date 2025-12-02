import { Schema, model } from "mongoose";
import { IMatch } from "../types/swipe.types";

/**
 * Match schema
 * Represents a match between two users
 */
const matchSchema = new Schema<IMatch>(
  {
    user_id_1: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true  // Index for efficient queries by user_id_1
    },
    user_id_2: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true  // Index for efficient queries by user_id_2
    },
    matched: {
      type: Boolean,
      required: true,
      default: true,
      index: true  // Index for filtering active matches
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

// Compound index to prevent duplicate matches (ensure unique pair of users)
// This ensures that user_id_1 + user_id_2 combination is unique
matchSchema.index({ user_id_1: 1, user_id_2: 1 }, { unique: true });

// Compound index for finding active matches for a user
matchSchema.index({ user_id_1: 1, matched: 1 });
matchSchema.index({ user_id_2: 1, matched: 1 });

// Compound index for sorting matches by creation time
matchSchema.index({ created_at: -1 });

export const Match = model<IMatch>("Match", matchSchema);
