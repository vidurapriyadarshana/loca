import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";
import { IUser } from "../types/user.types";
import {
  GENDERS,
  LOCATION_TYPES,
  DEFAULT_NOTIFICATIONS_ENABLED,
  DEFAULT_IS_VERIFIED,
  BIO_MAX_LENGTH,
} from "../constants/user.constants";

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: false,
      select: false,
    },
    age: {
      type: Number,
      required: false,
    },
    gender: {
      type: String,
      enum: GENDERS,
      required: false,
    },
    bio: {
      type: String,
      required: false,
      maxlength: BIO_MAX_LENGTH,
    },
    photos: {
      type: [String],
      required: false,
    },
    interests: {
      type: [String],
      required: false,
    },
    location: {
      type: {
        type: String,
        enum: LOCATION_TYPES,
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: false,
        default: [0, 0],
      },
    },
    is_verified: {
      type: Boolean,
      default: DEFAULT_IS_VERIFIED,
    },
    last_active: {
      type: Date,
      default: Date.now,
    },
    preferences: {
      notifications: {
        type: Boolean,
        default: DEFAULT_NOTIFICATIONS_ENABLED,
      },
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
    googleId: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
    },
    refreshTokens: [
      {
        type: String,
        select: false,
      },
    ],
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare candidate password
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = model<IUser>("User", userSchema);
