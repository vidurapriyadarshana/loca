import { User } from "../models/user.model";
import { logger } from "../config/logger.config";

/**
 * Ensure all required indexes exist in the database
 */
export const ensureIndexes = async () => {
  try {
    // Create indexes for User model
    await User.createIndexes();
    
    // Check for 2dsphere index on location
    const indexes = await User.collection.getIndexes();
    const hasGeoIndex = Object.values(indexes).some((index: any) => 
      index.key && index.key.location === '2dsphere'
    );
    
    if (!hasGeoIndex) {
      await User.collection.createIndex({ location: '2dsphere' });
      logger.info("Geospatial index created on location field");
    }
    
  } catch (error: any) {
    logger.error(`Error ensuring indexes: ${error.message}`);
    throw error;
  }
};
