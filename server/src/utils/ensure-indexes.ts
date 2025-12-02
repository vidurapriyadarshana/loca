import { User } from "../models/user.model";
import { logger } from "../config/logger.config";

/**
 * Ensure all required indexes exist in the database
 */
export const ensureIndexes = async () => {
  try {
    logger.info("Ensuring database indexes...");
    
    // Create indexes for User model
    await User.createIndexes();
    
    // List all indexes to verify
    const indexes = await User.collection.getIndexes();
    logger.info("User collection indexes:", indexes);
    
    // Check for 2dsphere index on location
    const hasGeoIndex = Object.values(indexes).some((index: any) => 
      index.key && index.key.location === '2dsphere'
    );
    
    if (hasGeoIndex) {
      logger.info("✓ Geospatial index on 'location' field exists");
    } else {
      logger.warn("⚠ Geospatial index on 'location' field NOT found. Creating manually...");
      await User.collection.createIndex({ location: '2dsphere' });
      logger.info("✓ Geospatial index created successfully");
    }
    
  } catch (error: any) {
    logger.error(`Error ensuring indexes: ${error.message}`);
    throw error;
  }
};
