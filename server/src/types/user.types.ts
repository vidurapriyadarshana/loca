import { Document, Types } from "mongoose";
import { Gender } from "../constants/user.constants";

/**
 * User preferences interface
 */
export interface IPreferences {
  notifications: boolean;
}

/**
 * User location interface (GeoJSON Point)
 */
export interface ILocation {
  type: "Point";
  coordinates: [number, number]; // [longitude, latitude]
}

/**
 * Main User interface extending Mongoose Document
 */
export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  age?: number;
  gender?: Gender | string;
  bio?: string;
  photos?: string[];
  interests?: string[];
  location?: ILocation;
  is_verified: boolean;
  last_active: Date;
  preferences: IPreferences;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  googleId?: string;
  refreshTokens?: string[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(password: string): Promise<boolean>;
}

/**
 * User registration input
 */
export interface IUserRegistration {
  email: string;
  password: string;
  name: string;
  age?: number;
  gender?: Gender | string;
  bio?: string;
  photos?: string[];
  interests?: string[];
  location?: ILocation;
  preferences?: IPreferences;
}

/**
 * User login input
 */
export interface IUserLogin {
  email: string;
  password: string;
}
