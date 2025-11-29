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

export default router;