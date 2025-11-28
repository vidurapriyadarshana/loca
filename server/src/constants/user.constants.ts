/**
 * User-related constants and enums
 */

export enum Gender {
  MALE = "male",
  FEMALE = "female",
  OTHER = "other"
}

export enum LocationType {
  POINT = "Point"
}

export const GENDERS = Object.values(Gender);
export const LOCATION_TYPES = Object.values(LocationType);

// Default values
export const DEFAULT_NOTIFICATIONS_ENABLED = true;
export const DEFAULT_IS_VERIFIED = false;
export const BIO_MAX_LENGTH = 300;
export const PASSWORD_RESET_EXPIRY_MINUTES = 10;
