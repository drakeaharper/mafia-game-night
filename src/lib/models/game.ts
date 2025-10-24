import { getDb } from '../db-unified';
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
export async function createGame(input: CreateGameInput): Promise<Game> {
  const db = getDb();
  const id = nanoid();
  const code = generateGameCode();
  const now = Date.now();

  const stmt = db.prepare(`
    INSERT INTO games (id, code, theme, state, created_at, config)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  await stmt.bind(
    id,
    code,
    input.theme,
    'waiting',
    now,
    JSON.stringify(input.config)
  ).run();

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
export async function getGameById(id: string): Promise<Game | null> {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM games WHERE id = ?');
  const row = await stmt.bind(id).get() as any;

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
export async function getGameByCode(code: string): Promise<Game | null> {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM games WHERE code = ?');
  const row = await stmt.bind(code.toUpperCase()).get() as any;

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
export async function updateGameState(id: string, state: GameState): Promise<void> {
  const db = getDb();
  const now = Date.now();

  const stmt = db.prepare(`
    UPDATE games
    SET state = ?,
        started_at = CASE WHEN ? = 'active' AND started_at IS NULL THEN ? ELSE started_at END,
        ended_at = CASE WHEN ? = 'ended' THEN ? ELSE ended_at END
    WHERE id = ?
  `);

  await stmt.bind(state, state, now, state, now, id).run();
}

/**
 * Delete a game (and all associated players via CASCADE)
 */
export async function deleteGame(id: string): Promise<void> {
  const db = getDb();
  const stmt = db.prepare('DELETE FROM games WHERE id = ?');
  await stmt.bind(id).run();
}

/**
 * Get all games (for admin/debugging)
 */
export async function getAllGames(): Promise<Game[]> {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM games ORDER BY created_at DESC');
  const result = await stmt.all();
  const rows = result.results as any[];

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
