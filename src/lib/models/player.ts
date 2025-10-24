import { getDb } from '../db-unified';
import { Player, CreatePlayerInput } from '@/types/player';
import { RoleDefinition } from '@/types/role';
import { nanoid } from 'nanoid';

/**
 * Create a new player
 */
export async function createPlayer(input: CreatePlayerInput): Promise<Player> {
  const db = getDb();
  const id = nanoid();
  const now = Date.now();

  const stmt = db.prepare(`
    INSERT INTO players (id, game_id, name, joined_at)
    VALUES (?, ?, ?, ?)
  `);

  await stmt.bind(id, input.gameId, input.name, now).run();

  return {
    id,
    gameId: input.gameId,
    name: input.name,
    role: null,
    roleData: null,
    isAlive: true,
    joinedAt: now,
  };
}

/**
 * Get player by ID
 */
export async function getPlayerById(id: string): Promise<Player | null> {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM players WHERE id = ?');
  const row = await stmt.bind(id).get() as any;

  if (!row) return null;

  return {
    id: row.id,
    gameId: row.game_id,
    name: row.name,
    role: row.role,
    roleData: row.role_data ? JSON.parse(row.role_data) : null,
    isAlive: Boolean(row.is_alive),
    joinedAt: row.joined_at,
  };
}

/**
 * Get all players for a game
 */
export async function getPlayersByGameId(gameId: string): Promise<Player[]> {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM players WHERE game_id = ? ORDER BY joined_at');
  const rows = await stmt.bind(gameId).all() as any[];

  return rows.map(row => ({
    id: row.id,
    gameId: row.game_id,
    name: row.name,
    role: row.role,
    roleData: row.role_data ? JSON.parse(row.role_data) : null,
    isAlive: Boolean(row.is_alive),
    joinedAt: row.joined_at,
  }));
}

/**
 * Assign a role to a player
 */
export async function assignRole(playerId: string, role: string, roleData: RoleDefinition): Promise<void> {
  const db = getDb();
  const stmt = db.prepare(`
    UPDATE players
    SET role = ?, role_data = ?
    WHERE id = ?
  `);
  await stmt.bind(role, JSON.stringify(roleData), playerId).run();
}

/**
 * Mark a player as eliminated
 */
export async function eliminatePlayer(playerId: string): Promise<void> {
  const db = getDb();
  const stmt = db.prepare('UPDATE players SET is_alive = 0 WHERE id = ?');
  await stmt.bind(playerId).run();
}

/**
 * Revive a player (set is_alive back to 1)
 */
export async function revivePlayer(playerId: string): Promise<void> {
  const db = getDb();
  const stmt = db.prepare('UPDATE players SET is_alive = 1 WHERE id = ?');
  await stmt.bind(playerId).run();
}

/**
 * Delete a player
 */
export async function deletePlayer(id: string): Promise<void> {
  const db = getDb();
  const stmt = db.prepare('DELETE FROM players WHERE id = ?');
  await stmt.bind(id).run();
}

/**
 * Check if a player name is already taken in a game
 */
export async function isPlayerNameTaken(gameId: string, name: string): Promise<boolean> {
  const db = getDb();
  const stmt = db.prepare('SELECT COUNT(*) as count FROM players WHERE game_id = ? AND name = ?');
  const result = await stmt.bind(gameId, name).get() as any;
  return result.count > 0;
}

/**
 * Get player count for a game
 */
export async function getPlayerCount(gameId: string): Promise<number> {
  const db = getDb();
  const stmt = db.prepare('SELECT COUNT(*) as count FROM players WHERE game_id = ?');
  const result = await stmt.bind(gameId).get() as any;
  return result.count;
}
