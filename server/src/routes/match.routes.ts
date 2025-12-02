import { Router } from 'express';
import * as matchController from '../controllers/match.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all matches for the authenticated user
router.get('/', matchController.getMatches);

export default router;
