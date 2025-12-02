import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/ApiResponse';
import * as matchService from '../services/match.service';

const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

/**
 * Get all matched users for the currently logged-in user
 */
export const getMatches = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;

    const matches = await matchService.getMatchesForUser(userId);

    res.status(200).json(
      new ApiResponse(
        200,
        { matches, count: matches.length },
        'Matches retrieved successfully'
      )
    );
  }
);
