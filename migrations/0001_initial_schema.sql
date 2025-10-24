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

-- Votes table
CREATE TABLE IF NOT EXISTS votes (
  id TEXT PRIMARY KEY,
  game_id TEXT NOT NULL,
  player_id TEXT NOT NULL,
  target_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
  FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
  FOREIGN KEY (target_id) REFERENCES players(id) ON DELETE CASCADE,
  UNIQUE(game_id, player_id)
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_players_game_id ON players(game_id);
CREATE INDEX IF NOT EXISTS idx_game_events_game_id ON game_events(game_id);
CREATE INDEX IF NOT EXISTS idx_votes_game_id ON votes(game_id);
CREATE INDEX IF NOT EXISTS idx_votes_player_id ON votes(player_id);
CREATE INDEX IF NOT EXISTS idx_games_code ON games(code);
