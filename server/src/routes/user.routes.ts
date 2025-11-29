import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get user profile
router.get('/profile', userController.getProfile);

// Update user profile (including photos)
router.put('/profile', userController.updateProfile);

// Update user location
router.put('/location', userController.updateLocation);

// Get nearby users (uses geospatial index)
router.get('/nearby', userController.getNearbyUsers);

// Get users in a specific area (polygon) - Changed to GET
router.get('/in-area', userController.getUsersInArea);

export default router;