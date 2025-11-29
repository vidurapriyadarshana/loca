import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/ApiResponse';
import * as userService from '../services/user.service';

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
    
    const { user, isProfileComplete } = await userService.getUserProfile(userId);
    
    res.status(200).json(
      new ApiResponse(
        200, 
        { ...user.toObject(), isProfileComplete }, 
        'Profile retrieved successfully'
      )
    );
  }
);

/**
 * Update the profile of the currently logged-in user
 */
export const updateProfile = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const { photos, name, age, gender, bio, interests, location } = req.body;

    const { user, isProfileComplete } = await userService.updateUserProfile(
      userId,
      { photos, name, age, gender, bio, interests, location }
    );

    res.status(200).json(
      new ApiResponse(
        200, 
        { ...user.toObject(), isProfileComplete }, 
        'Profile updated successfully'
      )
    );
  }
);

/**
 * Update the location of the currently logged-in user
 */
export const updateLocation = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const { longitude, latitude } = req.body;

    const result = await userService.updateUserLocation(userId, longitude, latitude);

    res.status(200).json(
      new ApiResponse(200, result, 'Location updated successfully')
    );
  }
);