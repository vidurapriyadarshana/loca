import { User } from "../models/user.model";
import { IUser, ILocation } from "../types/user.types";
import { BadRequestError, NotFoundError } from "../utils/ApiError";

/**
 * Profile update data interface
 */
export interface IProfileUpdateData {
  photos?: string[];
  name?: string;
  age?: number;
  gender?: string;
  bio?: string;
  interests?: string[];
  location?: ILocation;
}

/**
 * Get user profile by ID
 */
export const getUserProfile = async (userId: string) => {
  const user = await User.findById(userId).select('-password -refreshTokens');
  
  if (!user) {
    throw new NotFoundError('User not found.');
  }
  
  // Check if profile is complete
  const isProfileComplete = !!(user.age && user.gender);
  
  return {
    user,
    isProfileComplete
  };
};

/**
 * Validate photos array
 */
const validatePhotos = (photos: any) => {
  if (!Array.isArray(photos)) {
    throw new BadRequestError('Photos must be an array of URLs');
  }
  
  for (const photo of photos) {
    if (typeof photo !== 'string' || !photo.trim()) {
      throw new BadRequestError('Each photo must be a valid URL string');
    }
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (
  userId: string,
  profileData: IProfileUpdateData
) => {
  const { photos, name, age, gender, bio, interests, location } = profileData;

  // Validate photos if provided
  if (photos !== undefined) {
    validatePhotos(photos);
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

  // Check if profile is complete
  const isProfileComplete = !!(user.age && user.gender);

  return {
    user,
    isProfileComplete
  };
};

/**
 * Validate coordinates
 */
const validateCoordinates = (longitude: any, latitude: any) => {
  if (longitude === undefined || latitude === undefined) {
    throw new BadRequestError('Both longitude and latitude are required');
  }

  const lng = parseFloat(longitude);
  const lat = parseFloat(latitude);

  if (isNaN(lng) || isNaN(lat)) {
    throw new BadRequestError('Longitude and latitude must be valid numbers');
  }

  if (lng < -180 || lng > 180) {
    throw new BadRequestError('Longitude must be between -180 and 180');
  }

  if (lat < -90 || lat > 90) {
    throw new BadRequestError('Latitude must be between -90 and 90');
  }

  return { lng, lat };
};

/**
 * Update user location
 */
export const updateUserLocation = async (
  userId: string,
  longitude: any,
  latitude: any
) => {
  const { lng, lat } = validateCoordinates(longitude, latitude);

  const user = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        location: {
          type: 'Point',
          coordinates: [lng, lat]
        }
      }
    },
    { new: true, runValidators: true }
  ).select('-password -refreshTokens');

  if (!user) {
    throw new NotFoundError('User not found.');
  }

  return {
    location: user.location,
    coordinates: {
      longitude: lng,
      latitude: lat
    }
  };
};

/**
 * Find nearby users using geospatial query
 * @param longitude - User's longitude
 * @param latitude - User's latitude
 * @param maxDistanceInMeters - Maximum distance in meters (default: 10000 = 10km)
 * @param limit - Maximum number of users to return (default: 20)
 */
export const findNearbyUsers = async (
  longitude: number,
  latitude: number,
  maxDistanceInMeters: number = 10000,
  limit: number = 20
) => {
  const { lng, lat } = validateCoordinates(longitude, latitude);

  // Use $geoNear aggregation for efficient geospatial queries
  const nearbyUsers = await User.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [lng, lat]
        },
        $maxDistance: maxDistanceInMeters
      }
    }
  })
  .select('-password -refreshTokens')
  .limit(limit);

  return nearbyUsers;
};

/**
 * Find users within a specific area (polygon)
 * @param coordinates - Array of [longitude, latitude] pairs forming a polygon
 */
export const findUsersInArea = async (
  coordinates: number[][],
  limit: number = 50
) => {
  const usersInArea = await User.find({
    location: {
      $geoWithin: {
        $geometry: {
          type: 'Polygon',
          coordinates: [coordinates]
        }
      }
    }
  })
  .select('-password -refreshTokens')
  .limit(limit);

  return usersInArea;
};
