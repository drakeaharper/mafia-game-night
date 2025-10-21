import { getDb } from '../db';
import { Vote, CreateVoteInput } from '@/types/vote';
import { nanoid } from 'nanoid';

/**
 * Create or update a vote
 * If the player has already voted, this will update their vote to the new target
 */
export function createOrUpdateVote(input: CreateVoteInput): Vote {
  const db = getDb();
  const id = nanoid();
  const now = Date.now();

  // Check if player has already voted in this game
  const existingVote = getVoteByPlayer(input.playerId, input.gameId);

  if (existingVote) {
    // Update existing vote
    const stmt = db.prepare(`
      UPDATE votes
      SET target_id = ?, created_at = ?
      WHERE player_id = ? AND game_id = ?
    `);
    stmt.run(input.targetId, now, input.playerId, input.gameId);

    return {
      id: existingVote.id,
      gameId: input.gameId,
      playerId: input.playerId,
      targetId: input.targetId,
      createdAt: now,
    };
  } else {
    // Create new vote
    const stmt = db.prepare(`
      INSERT INTO votes (id, game_id, player_id, target_id, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(id, input.gameId, input.playerId, input.targetId, now);

    return {
      id,
      gameId: input.gameId,
      playerId: input.playerId,
      targetId: input.targetId,
      createdAt: now,
    };
  }
}

/**
 * Get a vote by player ID and game ID
 */
export function getVoteByPlayer(playerId: string, gameId: string): Vote | null {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT * FROM votes
    WHERE player_id = ? AND game_id = ?
  `);
  const row = stmt.get(playerId, gameId) as any;

  if (!row) return null;

  return {
    id: row.id,
    gameId: row.game_id,
    playerId: row.player_id,
    targetId: row.target_id,
    createdAt: row.created_at,
  };
}

/**
 * Get all votes for a game
 */
export function getVotesByGame(gameId: string): Vote[] {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT * FROM votes
    WHERE game_id = ?
    ORDER BY created_at DESC
  `);
  const rows = stmt.all(gameId) as any[];

  return rows.map(row => ({
    id: row.id,
    gameId: row.game_id,
    playerId: row.player_id,
    targetId: row.target_id,
    createdAt: row.created_at,
  }));
}

/**
 * Delete a vote
 */
export function deleteVote(voteId: string): void {
  const db = getDb();
  const stmt = db.prepare('DELETE FROM votes WHERE id = ?');
  stmt.run(voteId);
}

/**
 * Delete all votes for a game
 */
export function deleteVotesByGame(gameId: string): void {
  const db = getDb();
  const stmt = db.prepare('DELETE FROM votes WHERE game_id = ?');
  stmt.run(gameId);
}

/**
 * Get vote count for each target in a game
 */
export function getVoteCounts(gameId: string): Map<string, number> {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT target_id, COUNT(*) as count
    FROM votes
    WHERE game_id = ?
    GROUP BY target_id
  `);
  const rows = stmt.all(gameId) as any[];

  const counts = new Map<string, number>();
  rows.forEach(row => {
    counts.set(row.target_id, row.count);
  });

  return counts;
}

/**
 * Get player(s) with the most votes in a game
 * Returns array to handle ties
 */
export function getPlayersWithMostVotes(gameId: string): { playerId: string; voteCount: number }[] {
  const voteCounts = getVoteCounts(gameId);

  if (voteCounts.size === 0) {
    return [];
  }

  // Find the maximum vote count
  let maxVotes = 0;
  voteCounts.forEach(count => {
    if (count > maxVotes) {
      maxVotes = count;
    }
  });

  // Find all players with that vote count (handles ties)
  const topPlayers: { playerId: string; voteCount: number }[] = [];
  voteCounts.forEach((count, playerId) => {
    if (count === maxVotes) {
      topPlayers.push({ playerId, voteCount: count });
    }
  });

  return topPlayers;
}
