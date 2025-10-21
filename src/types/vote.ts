/**
 * Vote types for player elimination voting
 */

export interface Vote {
  id: string;
  gameId: string;
  playerId: string;
  targetId: string;
  createdAt: number;
}

export interface CreateVoteInput {
  gameId: string;
  playerId: string;
  targetId: string;
}

export interface VoteResponse {
  success: boolean;
  targetName: string;
  canChangeVote: boolean;
}
