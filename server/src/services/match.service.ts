import { Match } from '../models/matches.model';
import { logger } from '../config/logger.config';
import { BadRequestError } from '../utils/ApiError';
import { Types } from 'mongoose';
import { IMatchResult } from '../types/match.types';

/**
 * Get all matches for a user with populated user profiles
 * Returns matches sorted by most recent first
 */
export const getMatchesForUser = async (userId: string): Promise<IMatchResult[]> => {
  logger.debug(`Match Service: getMatchesForUser - Fetching matches for user ${userId}`);

  if (!Types.ObjectId.isValid(userId)) {
    throw new BadRequestError('Invalid user ID');
  }

  // Find matches where the user is either user_id_1 or user_id_2
  // and the match is active (matched: true)
  const matches = await Match.find({
    $or: [
      { user_id_1: userId },
      { user_id_2: userId }
    ],
    matched: true
  })
    .populate({
      path: 'user_id_1',
      select: 'name email age gender bio photos interests location last_active is_verified'
    })
    .populate({
      path: 'user_id_2',
      select: 'name email age gender bio photos interests location last_active is_verified'
    })
    .sort({ created_at: -1 }) // Most recent first
    .lean();

  // Transform the matches to return the matched user (not the requesting user)
  const transformedMatches = matches.map((match: any) => {
    const matchedUser = match.user_id_1._id.toString() === userId 
      ? match.user_id_2 
      : match.user_id_1;

    return {
      matchId: match._id,
      matchedAt: match.created_at,
      user: matchedUser
    };
  });

  logger.info(`Match Service: Retrieved ${transformedMatches.length} match(es) for user ${userId}`);

  return transformedMatches;
};
