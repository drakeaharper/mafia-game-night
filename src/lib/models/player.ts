import { getDb } from '../db';
import { Player, CreatePlayerInput } from '@/types/player';
import { RoleDefinition } from '@/types/role';
import { nanoid } from 'nanoid';

/**
 * Create a new player
 */
export function createPlayer(input: CreatePlayerInput): Player {
  const db = getDb();
  const id = nanoid();
  const now = Date.now();

  const stmt = db.prepare(`
    INSERT INTO players (id, game_id, name, joined_at)
    VALUES (?, ?, ?, ?)
  `);

  stmt.run(id, input.gameId, input.name, now);

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
export function getPlayerById(id: string): Player | null {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM players WHERE id = ?');
  const row = stmt.get(id) as any;

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
export function getPlayersByGameId(gameId: string): Player[] {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM players WHERE game_id = ? ORDER BY joined_at');
  const rows = stmt.all(gameId) as any[];

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
export function assignRole(playerId: string, role: string, roleData: RoleDefinition): void {
  const db = getDb();
  const stmt = db.prepare(`
    UPDATE players
    SET role = ?, role_data = ?
    WHERE id = ?
  `);
  stmt.run(role, JSON.stringify(roleData), playerId);
}

/**
 * Mark a player as eliminated
 */
export function eliminatePlayer(playerId: string): void {
  const db = getDb();
  const stmt = db.prepare('UPDATE players SET is_alive = 0 WHERE id = ?');
  stmt.run(playerId);
}

/**
 * Revive a player (set is_alive back to 1)
 */
export function revivePlayer(playerId: string): void {
  const db = getDb();
  const stmt = db.prepare('UPDATE players SET is_alive = 1 WHERE id = ?');
  stmt.run(playerId);
}

/**
 * Delete a player
 */
export function deletePlayer(id: string): void {
  const db = getDb();
  const stmt = db.prepare('DELETE FROM players WHERE id = ?');
  stmt.run(id);
}

/**
 * Check if a player name is already taken in a game
 */
export function isPlayerNameTaken(gameId: string, name: string): boolean {
  const db = getDb();
  const stmt = db.prepare('SELECT COUNT(*) as count FROM players WHERE game_id = ? AND name = ?');
  const result = stmt.get(gameId, name) as any;
  return result.count > 0;
}

/**
 * Get player count for a game
 */
export function getPlayerCount(gameId: string): number {
  const db = getDb();
  const stmt = db.prepare('SELECT COUNT(*) as count FROM players WHERE game_id = ?');
  const result = stmt.get(gameId) as any;
  return result.count;
}
