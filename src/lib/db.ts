import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

let db: Database.Database | null = null;

/**
 * Get database instance (singleton pattern)
 * Creates database file and tables on first access
 */
export function getDb(): Database.Database {
  if (db) return db;

  // Ensure data directory exists
  const dataDir = path.join(process.cwd(), 'src', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dbPath = path.join(dataDir, 'mafia.db');
  db = new Database(dbPath);

  // Enable foreign keys
  db.pragma('foreign_keys = ON');

  // Initialize schema
  initSchema(db);

  return db;
}

/**
 * Initialize database schema
 * Creates all tables if they don't exist
 */
function initSchema(db: Database.Database) {
  db.exec(`
    -- Games table
    CREATE TABLE IF NOT EXISTS games (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      theme TEXT NOT NULL,
      state TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      started_at INTEGER,
      ended_at INTEGER,
      config TEXT NOT NULL
    );

    -- Players table
    CREATE TABLE IF NOT EXISTS players (
      id TEXT PRIMARY KEY,
      game_id TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT,
      role_data TEXT,
      is_alive INTEGER DEFAULT 1,
      joined_at INTEGER NOT NULL,
      FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
    );

    -- Game events table (for history/auditing)
    CREATE TABLE IF NOT EXISTS game_events (
      id TEXT PRIMARY KEY,
      game_id TEXT NOT NULL,
      event_type TEXT NOT NULL,
      data TEXT,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
    );

    -- Create indexes for common queries
    CREATE INDEX IF NOT EXISTS idx_players_game_id ON players(game_id);
    CREATE INDEX IF NOT EXISTS idx_game_events_game_id ON game_events(game_id);
    CREATE INDEX IF NOT EXISTS idx_games_code ON games(code);
  `);
}

/**
 * Close database connection
 * Useful for cleanup in tests
 */
export function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}
