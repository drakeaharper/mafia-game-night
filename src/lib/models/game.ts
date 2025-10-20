import { getDb } from '../db';
import { Game, CreateGameInput, GameState } from '@/types/game';
import { nanoid } from 'nanoid';

/**
 * Generate a random 6-character game code
 * Excludes confusing characters (0, O, 1, I, L)
 */
export function generateGameCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Create a new game
 */
export function createGame(input: CreateGameInput): Game {
  const db = getDb();
  const id = nanoid();
  const code = generateGameCode();
  const now = Date.now();

  const stmt = db.prepare(`
    INSERT INTO games (id, code, theme, state, created_at, config)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    code,
    input.theme,
    'waiting',
    now,
    JSON.stringify(input.config)
  );

  return {
    id,
    code,
    theme: input.theme,
    state: 'waiting',
    createdAt: now,
    startedAt: null,
    endedAt: null,
    config: input.config,
  };
}

/**
 * Get game by ID
 */
export function getGameById(id: string): Game | null {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM games WHERE id = ?');
  const row = stmt.get(id) as any;

  if (!row) return null;

  return {
    id: row.id,
    code: row.code,
    theme: row.theme,
    state: row.state,
    createdAt: row.created_at,
    startedAt: row.started_at,
    endedAt: row.ended_at,
    config: JSON.parse(row.config),
  };
}

/**
 * Get game by code
 */
export function getGameByCode(code: string): Game | null {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM games WHERE code = ?');
  const row = stmt.get(code.toUpperCase()) as any;

  if (!row) return null;

  return {
    id: row.id,
    code: row.code,
    theme: row.theme,
    state: row.state,
    createdAt: row.created_at,
    startedAt: row.started_at,
    endedAt: row.ended_at,
    config: JSON.parse(row.config),
  };
}

/**
 * Update game state
 */
export function updateGameState(id: string, state: GameState): void {
  const db = getDb();
  const now = Date.now();

  const stmt = db.prepare(`
    UPDATE games
    SET state = ?,
        started_at = CASE WHEN ? = 'active' AND started_at IS NULL THEN ? ELSE started_at END,
        ended_at = CASE WHEN ? = 'ended' THEN ? ELSE ended_at END
    WHERE id = ?
  `);

  stmt.run(state, state, now, state, now, id);
}

/**
 * Delete a game (and all associated players via CASCADE)
 */
export function deleteGame(id: string): void {
  const db = getDb();
  const stmt = db.prepare('DELETE FROM games WHERE id = ?');
  stmt.run(id);
}

/**
 * Get all games (for admin/debugging)
 */
export function getAllGames(): Game[] {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM games ORDER BY created_at DESC');
  const rows = stmt.all() as any[];

  return rows.map(row => ({
    id: row.id,
    code: row.code,
    theme: row.theme,
    state: row.state,
    createdAt: row.created_at,
    startedAt: row.started_at,
    endedAt: row.ended_at,
    config: JSON.parse(row.config),
  }));
}
