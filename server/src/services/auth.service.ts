import { User } from "../models/user.model";
import { IUser, IUserRegistration, ILocation, IPreferences } from "../types/user.types";
import { Gender, DEFAULT_NOTIFICATIONS_ENABLED, DEFAULT_IS_VERIFIED } from "../constants/user.constants";
import { logger } from "../config/logger.config";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/token.utils";
import {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
} from "../utils/ApiError";

/**
 * Handles user registration
 */
export const registerUser = async (
  email: string,
  password: string,
  name: string,
  age?: number,
  gender?: Gender | string,
  bio?: string,
  photos?: string[],
  interests?: string[],
  location?: ILocation,
  is_verified?: boolean,
  last_active?: Date,
  preferences?: IPreferences,
): Promise<IUser> => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new BadRequestError("Email already in use.");
  }

  // Create the new user with all fields
  const newUser = new User({
    email,
    password,
    name,
    age,
    gender,
    bio,
    photos,
    interests,
    location,
    is_verified: is_verified ?? DEFAULT_IS_VERIFIED,
    last_active: last_active || new Date(),
    preferences: preferences || {
      notifications: DEFAULT_NOTIFICATIONS_ENABLED,
    },
    refreshTokens: [],
  });

  await newUser.save();
  return newUser;
};

/**
 * Handles user login (email/password)
 */
export const loginUser = async (email: string, password: string) => {
  logger.info(`Auth Service: loginUser - Attempting to log in user with email: ${email}`);
  const user = await User.findOne({ email }).select("+password +refreshTokens");
  if (!user) throw new UnauthorizedError("Invalid credentials.");
  if (!user.password) throw new UnauthorizedError("Please log in with Google.");

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new UnauthorizedError("Invalid credentials.");

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshTokens = [...(user.refreshTokens || []), refreshToken];
  await user.save();
  return { accessToken, refreshToken };
};

/**
 * Generates and stores tokens for OAuth users
 */
export const generateAndStoreTokens = async (user: IUser) => {
  logger.info(`Auth Service: generateAndStoreTokens - Generating and storing tokens for user ID: ${user._id}`);
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  const userDoc = await User.findById(user._id).select("+refreshTokens");
  if (userDoc) {
    userDoc.refreshTokens = [...(userDoc.refreshTokens || []), refreshToken];
    await userDoc.save();
    logger.info(`Auth Service: generateAndStoreTokens - Tokens stored for user ID: ${user._id}`);
  }
  return { accessToken, refreshToken };
};

/**
 * Handles refreshing an access token
 */
export const refreshUserToken = async (token: string): Promise<string> => {
  logger.info("Auth Service: refreshUserToken - Attempting to refresh user token.");
  const payload = verifyRefreshToken(token);
  if (!payload) {
    logger.warn("Auth Service: refreshUserToken - Invalid or expired refresh token provided.");
    throw new UnauthorizedError("Invalid or expired refresh token.");
  }

  const user = await User.findById(payload.id).select("+refreshTokens");
  if (!user) {
    throw new NotFoundError("User not found.");
  }

  if (!user.refreshTokens || !user.refreshTokens.includes(token)) {
    throw new UnauthorizedError("Refresh token is not active.");
  }

  const newAccessToken = generateAccessToken(user);
  logger.info(`Auth Service: refreshUserToken - New access token generated for user ID: ${user._id}`);
  return newAccessToken;
};

/**
 * Handles user logout
 */
export const logoutUser = async (token: string): Promise<void> => {
  logger.info("Auth Service: logoutUser - Attempting to log out user.");
  const payload = verifyRefreshToken(token);
  if (!payload) {
    logger.warn("Auth Service: logoutUser - Invalid refresh token provided for logout.");
    return;
  }

  const user = await User.findById(payload.id).select("+refreshTokens");
  if (!user || !user.refreshTokens) return;

  user.refreshTokens = user.refreshTokens.filter((rt) => rt !== token);
  await user.save();
  logger.info(`Auth Service: logoutUser - User logged out successfully, token removed for user ID: ${user._id}`);
};

/**
 * Handles password change for authenticated user
 */
export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  logger.info(`Auth Service: changePassword - Attempting to change password for user ID: ${userId}`);
  
  const user = await User.findById(userId).select("+password");
  if (!user) {
    throw new NotFoundError("User not found.");
  }

  if (!user.password) {
    throw new BadRequestError("Cannot change password for Google OAuth accounts.");
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new UnauthorizedError("Current password is incorrect.");
  }

  user.password = newPassword;
  await user.save();
  
  logger.info(`Auth Service: changePassword - Password changed successfully for user ID: ${userId}`);
};