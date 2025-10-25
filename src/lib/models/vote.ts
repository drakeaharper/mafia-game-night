import { getDb } from '../db-unified';
import { Vote, CreateVoteInput } from '@/types/vote';
import { nanoid } from 'nanoid';

/**
 * Create or update a vote
 * If the player has already voted, this will update their vote to the new target
 */
export async function createOrUpdateVote(input: CreateVoteInput): Promise<Vote> {
  const db = getDb();
  const id = nanoid();
  const now = Date.now();

  // Check if player has already voted in this game
  const existingVote = await getVoteByPlayer(input.playerId, input.gameId);

  if (existingVote) {
    // Update existing vote
    const stmt = db.prepare(`
      UPDATE votes
      SET target_id = ?, created_at = ?
      WHERE player_id = ? AND game_id = ?
    `);
    await stmt.bind(input.targetId, now, input.playerId, input.gameId).run();

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
    await stmt.bind(id, input.gameId, input.playerId, input.targetId, now).run();

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
export async function getVoteByPlayer(playerId: string, gameId: string): Promise<Vote | null> {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT * FROM votes
    WHERE player_id = ? AND game_id = ?
  `);
  const row = await stmt.bind(playerId, gameId).get() as any;

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
export async function getVotesByGame(gameId: string): Promise<Vote[]> {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT * FROM votes
    WHERE game_id = ?
    ORDER BY created_at DESC
  `);
  const rows = await stmt.bind(gameId).all() as any[];

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
export async function deleteVote(voteId: string): Promise<void> {
  const db = getDb();
  const stmt = db.prepare('DELETE FROM votes WHERE id = ?');
  await stmt.bind(voteId).run();
}

/**
 * Delete all votes for a game
 */
export async function deleteVotesByGame(gameId: string): Promise<void> {
  const db = getDb();
  const stmt = db.prepare('DELETE FROM votes WHERE game_id = ?');
  await stmt.bind(gameId).run();
}

/**
 * Delete all votes by or for a specific player
 */
export async function deleteVotesByPlayer(playerId: string): Promise<void> {
  const db = getDb();
  const stmt = db.prepare('DELETE FROM votes WHERE player_id = ? OR target_id = ?');
  await stmt.bind(playerId, playerId).run();
}

/**
 * Get vote count for each target in a game
 */
export async function getVoteCounts(gameId: string): Promise<Map<string, number>> {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT target_id, COUNT(*) as count
    FROM votes
    WHERE game_id = ?
    GROUP BY target_id
  `);
  const rows = await stmt.bind(gameId).all() as any[];

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
export async function getPlayersWithMostVotes(gameId: string): Promise<{ playerId: string; voteCount: number }[]> {
  const voteCounts = await getVoteCounts(gameId);

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
