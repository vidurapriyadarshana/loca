import { Types } from 'mongoose';
import { IUser } from './user.types';

/**
 * Transformed match result with the matched user
 */
export interface IMatchResult {
  matchId: Types.ObjectId;
  matchedAt: Date;
  user: Partial<IUser>;
}
