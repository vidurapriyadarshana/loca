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

/**
 * Find nearby users based on current user's location or provided coordinates
 */
export const getNearbyUsers = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const { longitude, latitude, radius, limit, gender } = req.query;

    let lng: number;
    let lat: number;

    // Use provided coordinates or fetch from user's profile
    if (longitude && latitude) {
      lng = parseFloat(longitude as string);
      lat = parseFloat(latitude as string);
    } else {
      // Fetch user's current location
      const { user } = await userService.getUserProfile(userId);
      if (!user.location || !user.location.coordinates) {
        res.status(400).json(
          new ApiResponse(400, null, 'Location not set. Please provide coordinates or update your location.')
        );
        return;
      }
      lng = user.location.coordinates[0];
      lat = user.location.coordinates[1];
    }

    const maxDistance = radius ? parseInt(radius as string) : 10000; // Default 10km
    const maxLimit = limit ? parseInt(limit as string) : 20; // Default 20 users
    const genderFilter = gender as string | undefined;

    const nearbyUsers = await userService.findNearbyUsers(lng, lat, maxDistance, maxLimit, genderFilter);

    // Filter out the current user from results
    const filteredUsers = nearbyUsers.filter(
      (user: any) => user._id.toString() !== userId
    );

    res.status(200).json(
      new ApiResponse(
        200, 
        {
          users: filteredUsers,
          count: filteredUsers.length,
          searchParams: {
            longitude: lng,
            latitude: lat,
            radius: maxDistance,
            limit: maxLimit,
            gender: genderFilter
          }
        },
        'Nearby users retrieved successfully'
      )
    );
  }
);

/**
 * Find users within a specific area (polygon)
 * Accepts coordinates as JSON string in query parameter
 */
export const getUsersInArea = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { coordinates, limit, gender } = req.query;

    if (!coordinates) {
      res.status(400).json(
        new ApiResponse(400, null, 'Coordinates parameter is required')
      );
      return;
    }

    // Parse coordinates from JSON string
    let parsedCoordinates: number[][];
    try {
      parsedCoordinates = JSON.parse(coordinates as string);
      if (!Array.isArray(parsedCoordinates)) {
        throw new Error('Coordinates must be an array');
      }
    } catch (error) {
      res.status(400).json(
        new ApiResponse(400, null, 'Invalid coordinates format. Must be valid JSON array.')
      );
      return;
    }

    const maxLimit = limit ? parseInt(limit as string) : 50;
    const genderFilter = gender as string | undefined;
    const usersInArea = await userService.findUsersInArea(parsedCoordinates, maxLimit, genderFilter);

    res.status(200).json(
      new ApiResponse(
        200,
        {
          users: usersInArea,
          count: usersInArea.length,
          gender: genderFilter
        },
        'Users in area retrieved successfully'
      )
    );
  }
);