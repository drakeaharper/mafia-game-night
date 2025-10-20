# Phase 01: SQLite Database Setup

**Status:** Complete
**Started:** 2025-10-19
**Completed:** 2025-10-19

## Objective
Create the SQLite database schema, initialization script, and database helper functions for managing games, players, and events.

## Prerequisites
- [x] Phase 00 completed (Next.js project initialized)
- [x] `better-sqlite3` package installed
- [x] `src/` directory structure created

## Tasks
- [x] Create database schema SQL file
- [x] Create database initialization module (`src/lib/db.ts`)
- [x] Write database migration/setup function
- [x] Create type-safe query helper functions
- [x] Add database to `.gitignore`
- [x] Test database creation and basic queries
- [x] Create seed data script for testing (optional)
- [x] Document database structure in code comments

## Acceptance Criteria
- [x] Database file is created at `src/data/mafia.db` on first run
- [x] All tables are created correctly with proper schema
- [x] Can insert a test game and player
- [x] Can query data back successfully
- [x] Type definitions match database schema
- [x] No TypeScript errors
- [x] Database file is gitignored

## Technical Notes

### Database Schema

**games table:**
```sql
CREATE TABLE IF NOT EXISTS games (
  id TEXT PRIMARY KEY,              -- nanoid
  code TEXT UNIQUE NOT NULL,        -- 6-char uppercase join code
  theme TEXT NOT NULL,              -- 'classic', 'harry-potter', etc.
  state TEXT NOT NULL,              -- 'waiting', 'active', 'ended'
  created_at INTEGER NOT NULL,      -- Unix timestamp
  started_at INTEGER,               -- Unix timestamp (nullable)
  ended_at INTEGER,                 -- Unix timestamp (nullable)
  config TEXT NOT NULL              -- JSON: { roleDistribution, rules, etc. }
);
```

**players table:**
```sql
CREATE TABLE IF NOT EXISTS players (
  id TEXT PRIMARY KEY,              -- nanoid
  game_id TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT,                        -- NULL until cards issued, then role ID
  role_data TEXT,                   -- JSON: full role information
  is_alive INTEGER DEFAULT 1,       -- 1 = alive, 0 = eliminated
  joined_at INTEGER NOT NULL,       -- Unix timestamp
  FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
);
```

**game_events table (optional for MVP, good for history):**
```sql
CREATE TABLE IF NOT EXISTS game_events (
  id TEXT PRIMARY KEY,              -- nanoid
  game_id TEXT NOT NULL,
  event_type TEXT NOT NULL,         -- 'player_joined', 'cards_issued', 'player_eliminated', 'game_ended'
  data TEXT,                        -- JSON: event-specific data
  created_at INTEGER NOT NULL,      -- Unix timestamp
  FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
);
```

### Database Module Structure

**src/lib/db.ts:**
```typescript
import Database from 'better-sqlite3';
import path from 'path';
import { nanoid } from 'nanoid';

// Initialize database connection
// Create tables if they don't exist
// Export database instance and helper functions
```

**Key functions to implement:**
- `initDatabase()` - Create tables
- `getDb()` - Get database instance (singleton pattern)
- Type-safe query helpers (optional for phase 01, can add in later phases)

### File Locations
- Database file: `src/data/mafia.db`
- Schema: `src/lib/schema.sql` (separate file) OR inline in `db.ts`
- Database module: `src/lib/db.ts`

### Testing Strategy
Create a simple script or API route to test:
1. Create a game
2. Add players to the game
3. Query games and players back
4. Update game state
5. Delete test data

Can create a temporary test file: `src/lib/__test_db.ts` (delete after testing)

## Files Created/Modified

**Created:**
- `src/lib/db.ts` - Database initialization and connection
- `src/lib/schema.sql` - SQL schema (optional, can be inline)
- `src/data/` - Directory for database file (gitignored)
- `src/data/.gitkeep` - Keep empty directory in git

**Modified:**
- `.gitignore` - Add `src/data/*.db` and `src/data/*.db-journal`

## Implementation Example

```typescript
// src/lib/db.ts
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

let db: Database.Database | null = null;

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

function initSchema(db: Database.Database) {
  // Create tables
  db.exec(`
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

    CREATE TABLE IF NOT EXISTS game_events (
      id TEXT PRIMARY KEY,
      game_id TEXT NOT NULL,
      event_type TEXT NOT NULL,
      data TEXT,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
    );
  `);
}

// Export for cleanup in tests
export function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}
```

## Testing Checklist
- [ ] Database file created at correct path
- [ ] All three tables exist in database
- [ ] Can insert a game record
- [ ] Can insert a player linked to a game
- [ ] Foreign key constraints work (can't add player without game)
- [ ] Can query data back
- [ ] Database file is gitignored
- [ ] No TypeScript errors

## Next Steps
- **Phase 02:** Type definitions for database models
  - Create TypeScript interfaces for Game, Player, GameEvent
  - Create type-safe database query helpers
  - Align types with database schema

## Notes
- Use `better-sqlite3` (synchronous) instead of async libraries for simplicity
- SQLite is perfect for local/self-hosted apps - no server needed
- Foreign keys must be explicitly enabled with `PRAGMA foreign_keys = ON`
- Store JSON data as TEXT (use `JSON.stringify`/`JSON.parse`)
- Timestamps as Unix epoch (milliseconds): `Date.now()`
- Game codes: 6 random uppercase alphanumeric characters for easy entry
