import { Request, Response, NextFunction } from 'express';
import { User } from '../models/user.model';
import { ApiResponse } from '../utils/ApiResponse';
import { BadRequestError, NotFoundError } from '../utils/ApiError';

const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

/**
 * Get the profile of the currently logged-in user
 */
export const getProfile = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id; 
    const user = await User.findById(userId).select('-password -refreshTokens');
    
    if (!user) {
      throw new NotFoundError('User not found.');
    }
    
    res.status(200).json(new ApiResponse(200, user, 'Profile retrieved successfully'));
  }
);

/**
 * Update the profile of the currently logged-in user
 */
export const updateProfile = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const { photos, name, age, gender, bio, interests, location } = req.body;

    // Validate photos array if provided
    if (photos !== undefined) {
      if (!Array.isArray(photos)) {
        throw new BadRequestError('Photos must be an array of URLs');
      }
      
      // Validate each photo URL
      for (const photo of photos) {
        if (typeof photo !== 'string' || !photo.trim()) {
          throw new BadRequestError('Each photo must be a valid URL string');
        }
      }
    }

    // Build update object with only provided fields
    const updateData: any = {};
    if (photos !== undefined) updateData.photos = photos;
    if (name !== undefined) updateData.name = name;
    if (age !== undefined) updateData.age = age;
    if (gender !== undefined) updateData.gender = gender;
    if (bio !== undefined) updateData.bio = bio;
    if (interests !== undefined) updateData.interests = interests;
    if (location !== undefined) updateData.location = location;

    // Update user
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password -refreshTokens');

    if (!user) {
      throw new NotFoundError('User not found.');
    }

    res.status(200).json(
      new ApiResponse(200, user, 'Profile updated successfully')
    );
  }
);