# Phase 02: TypeScript Types and Database Models

**Status:** Not Started
**Started:** -
**Completed:** -

## Objective
Define comprehensive TypeScript types and interfaces for the application domain (games, players, roles) and create type-safe database query functions.

## Prerequisites
- [x] Phase 00 completed (Next.js initialized)
- [x] Phase 01 completed (Database schema created)
- [x] Database is functional

## Tasks
- [ ] Create `src/types/game.ts` with Game interfaces
- [ ] Create `src/types/player.ts` with Player interfaces
- [ ] Create `src/types/role.ts` with Role interfaces
- [ ] Create `src/lib/models/game.ts` with database CRUD functions
- [ ] Create `src/lib/models/player.ts` with database CRUD functions
- [ ] Create `src/lib/utils.ts` with helper functions (game code generator, etc.)
- [ ] Add JSDoc comments for all public interfaces
- [ ] Test all model functions
- [ ] Ensure type safety throughout

## Acceptance Criteria
- [x] All types are properly defined and exported
- [x] Database models provide type-safe CRUD operations
- [x] Can create, read, update, and delete games
- [x] Can create, read, update, and delete players
- [x] TypeScript compiler shows no errors
- [x] All functions have proper return types
- [x] JSON fields are properly typed

## Technical Notes

### Type Definitions

**src/types/game.ts:**
```typescript
export type GameState = 'waiting' | 'active' | 'ended';
export type Theme = 'classic' | 'harry-potter';

export interface GameConfig {
  roleDistribution: Record<string, number>;
  playerCount: number;
  theme: Theme;
}

export interface Game {
  id: string;
  code: string;
  theme: Theme;
  state: GameState;
  createdAt: number;
  startedAt: number | null;
  endedAt: number | null;
  config: GameConfig;
}

export interface CreateGameInput {
  theme: Theme;
  config: GameConfig;
}
```

**src/types/player.ts:**
```typescript
export interface Player {
  id: string;
  gameId: string;
  name: string;
  role: string | null;
  roleData: RoleDefinition | null;
  isAlive: boolean;
  joinedAt: number;
}

export interface CreatePlayerInput {
  gameId: string;
  name: string;
}
```

**src/types/role.ts:**
```typescript
export type Alignment = 'good' | 'evil' | 'neutral';
export type Phase = 'night' | 'day' | 'passive';

export interface Ability {
  id: string;
  name: string;
  description: string;
  phase: Phase;
  target?: string;
  collective?: boolean;
  uses?: 'unlimited' | 'limited';
  maxUses?: number;
  restrictions?: string[];
}

export interface Knowledge {
  type: string;
  description: string;
}

export interface WinCondition {
  type: string;
  target?: string;
  description: string;
}

export interface RoleDefinition {
  id: string;
  name: string;
  alignment: Alignment;
  description: string;
  abilities: Ability[];
  knowledge: Knowledge[];
  winCondition: WinCondition;
  cardInstructions: string[];
  flavor?: {
    icon?: string;
    color?: string;
    flavorText?: string;
  };
}

export interface BaseRoles {
  schemaVersion: string;
  roles: RoleDefinition[];
  roleDistributionPresets: Record<string, Record<string, number>>;
  metadata: {
    gameName: string;
    minPlayers: number;
    maxPlayers: number;
    recommendedPlayers: string;
    complexity: string;
  };
}

export interface ThemeRoles {
  schemaVersion: string;
  themeId: string;
  themeName: string;
  baseTheme: string;
  description: string;
  roleMappings: Array<{
    baseRole: string;
    overrides: Partial<RoleDefinition>;
  }>;
  newRoles: RoleDefinition[];
  roleDistributionPresets: Record<string, Record<string, number>>;
  gameFlowOverrides?: any;
  flavorText?: Record<string, string>;
  metadata: {
    gameName: string;
    minPlayers: number;
    maxPlayers: number;
    recommendedPlayers: string;
    complexity: string;
    author?: string;
    version?: string;
  };
}
```

### Database Models

**src/lib/models/game.ts:**
```typescript
import { getDb } from '../db';
import { Game, CreateGameInput, GameState } from '@/types/game';
import { nanoid } from 'nanoid';

export function generateGameCode(): string {
  // Generate 6-character uppercase alphanumeric code
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude confusing chars
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

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

export function deleteGame(id: string): void {
  const db = getDb();
  const stmt = db.prepare('DELETE FROM games WHERE id = ?');
  stmt.run(id);
}
```

**src/lib/models/player.ts:**
```typescript
import { getDb } from '../db';
import { Player, CreatePlayerInput } from '@/types/player';
import { RoleDefinition } from '@/types/role';
import { nanoid } from 'nanoid';

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

export function assignRole(playerId: string, role: string, roleData: RoleDefinition): void {
  const db = getDb();
  const stmt = db.prepare(`
    UPDATE players
    SET role = ?, role_data = ?
    WHERE id = ?
  `);
  stmt.run(role, JSON.stringify(roleData), playerId);
}

export function eliminatePlayer(playerId: string): void {
  const db = getDb();
  const stmt = db.prepare('UPDATE players SET is_alive = 0 WHERE id = ?');
  stmt.run(playerId);
}

export function deletePlayer(id: string): void {
  const db = getDb();
  const stmt = db.prepare('DELETE FROM players WHERE id = ?');
  stmt.run(id);
}
```

## Files Created/Modified

**Created:**
- `src/types/game.ts` - Game-related types
- `src/types/player.ts` - Player-related types
- `src/types/role.ts` - Role-related types
- `src/lib/models/game.ts` - Game database operations
- `src/lib/models/player.ts` - Player database operations
- `src/lib/utils.ts` - Utility functions

## Testing Checklist
- [ ] Can create a game and get it back by ID
- [ ] Can create a game and get it by code
- [ ] Game code is 6 characters, uppercase
- [ ] Can update game state
- [ ] Can create players for a game
- [ ] Can get all players for a game
- [ ] Can assign role to player
- [ ] Can eliminate player
- [ ] All types compile without errors
- [ ] JSON serialization/deserialization works correctly

## Next Steps
- **Phase 03:** Role system loader
  - Load base-roles.json
  - Load theme-roles.json
  - Merge roles (apply overrides)
  - Provide API to get roles by theme

## Notes
- Use `@/` alias for imports from `src/` (configure in tsconfig.json if needed)
- All timestamps are Unix epoch in milliseconds
- Game codes exclude confusing characters (0/O, 1/I/L)
- Store complex objects (config, roleData) as JSON strings in database
- Use `nanoid` for generating unique IDs (shorter than UUIDs)
