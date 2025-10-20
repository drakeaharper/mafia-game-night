# Phase 04: API Routes - Core Game Management

**Status:** Complete
**Started:** 2025-10-19
**Completed:** 2025-10-19

## Objective
Create Next.js API routes for game and player management, including creating games, joining games, issuing role cards, and retrieving game state.

## Prerequisites
- [x] Phase 00 completed (Next.js initialized)
- [x] Phase 01 completed (Database setup)
- [x] Phase 02 completed (Types and models)
- [x] Phase 03 completed (Role system loader)

## Tasks
- [ ] Create `POST /api/games` - Create new game
- [ ] Create `GET /api/games/[id]` - Get game details
- [ ] Create `POST /api/games/[code]/join` - Join game by code
- [ ] Create `POST /api/games/[id]/issue-cards` - Distribute roles to players
- [ ] Create `GET /api/players/[id]` - Get player details (including role)
- [ ] Create `GET /api/themes` - List available themes
- [ ] Add proper error handling and status codes
- [ ] Test all endpoints with sample data
- [ ] Document API request/response formats

## Acceptance Criteria
- [x] Can create a game via POST request
- [x] Can join a game with a valid code
- [x] Can retrieve game state with players list
- [x] Can issue cards to all players in a game
- [x] Players receive unique roles
- [x] Can get player details including their assigned role
- [x] All endpoints return proper JSON responses
- [x] Error cases are handled (invalid code, game not found, etc.)
- [x] No TypeScript errors

## Technical Notes

### API Route Structure
```
src/app/api/
├── games/
│   ├── route.ts                    # POST - Create game
│   ├── [id]/
│   │   ├── route.ts                # GET - Get game details
│   │   └── issue-cards/
│   │       └── route.ts            # POST - Issue role cards
│   └── [code]/
│       └── join/
│           └── route.ts            # POST - Join game
├── players/
│   └── [id]/
│       └── route.ts                # GET - Get player details
└── themes/
    └── route.ts                    # GET - List themes
```

### Endpoint Specifications

#### 1. Create Game
**Endpoint:** `POST /api/games`

**Request Body:**
```json
{
  "theme": "classic" | "harry-potter",
  "playerCount": 10
}
```

**Response:** `201 Created`
```json
{
  "id": "xyz123",
  "code": "ABC123",
  "theme": "classic",
  "state": "waiting",
  "createdAt": 1234567890,
  "config": {
    "roleDistribution": { "mafia": 3, "detective": 1, ... },
    "playerCount": 10,
    "theme": "classic"
  }
}
```

**Implementation:**
```typescript
// src/app/api/games/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createGame } from '@/lib/models/game';
import { getDistributionForPlayerCount } from '@/lib/roles';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { theme, playerCount } = body;

    // Validate input
    if (!theme || !playerCount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get role distribution
    const roleDistribution = getDistributionForPlayerCount(playerCount, theme);
    if (!roleDistribution) {
      return NextResponse.json(
        { error: 'Invalid player count for theme' },
        { status: 400 }
      );
    }

    // Create game
    const game = createGame({
      theme,
      config: {
        roleDistribution,
        playerCount,
        theme,
      },
    });

    return NextResponse.json(game, { status: 201 });
  } catch (error) {
    console.error('Error creating game:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

#### 2. Get Game Details
**Endpoint:** `GET /api/games/[id]`

**Response:** `200 OK`
```json
{
  "id": "xyz123",
  "code": "ABC123",
  "theme": "classic",
  "state": "waiting",
  "players": [
    {
      "id": "player1",
      "name": "Alice",
      "isAlive": true,
      "hasRole": false
    }
  ]
}
```

**Note:** Don't include role information in the game details endpoint. Roles should only be visible to individual players via their own endpoint.

#### 3. Join Game
**Endpoint:** `POST /api/games/[code]/join`

**Request Body:**
```json
{
  "name": "Alice"
}
```

**Response:** `201 Created`
```json
{
  "id": "player1",
  "gameId": "xyz123",
  "name": "Alice",
  "joinedAt": 1234567890
}
```

**Error Cases:**
- Game not found: `404`
- Game already started: `400`
- Player name already taken in this game: `409`

#### 4. Issue Role Cards
**Endpoint:** `POST /api/games/[id]/issue-cards`

**Request Body:** None (uses game config)

**Response:** `200 OK`
```json
{
  "success": true,
  "playerCount": 10,
  "rolesIssued": true
}
```

**Implementation Logic:**
1. Get all players for the game
2. Get role distribution from game config
3. Create an array of roles based on distribution
4. Shuffle roles randomly
5. Assign one role to each player
6. Update game state to 'active'

**Error Cases:**
- Game not found: `404`
- Not enough players: `400`
- Cards already issued: `400`

#### 5. Get Player Details
**Endpoint:** `GET /api/players/[id]`

**Response:** `200 OK`
```json
{
  "id": "player1",
  "name": "Alice",
  "gameId": "xyz123",
  "role": {
    "id": "detective",
    "name": "Detective",
    "alignment": "good",
    "description": "...",
    "abilities": [...],
    "cardInstructions": [...]
  },
  "isAlive": true
}
```

**Note:** This endpoint reveals the player's role. Protect this with the player ID in the URL (acts as authentication).

#### 6. List Themes
**Endpoint:** `GET /api/themes`

**Response:** `200 OK`
```json
{
  "themes": [
    {
      "id": "classic",
      "name": "Classic Mafia",
      "minPlayers": 7,
      "recommendedPlayers": "10-15"
    },
    {
      "id": "harry-potter",
      "name": "Death Eaters Among Us",
      "minPlayers": 7,
      "recommendedPlayers": "10-15"
    }
  ]
}
```

## Role Assignment Algorithm

**src/lib/roles/assignRoles.ts:**
```typescript
import { RoleDefinition } from '@/types/role';
import { getRolesForTheme } from '@/lib/roles';

/**
 * Shuffle array in place (Fisher-Yates algorithm)
 */
function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Generate array of roles based on distribution
 */
export function generateRolePool(
  distribution: Record<string, number>,
  theme: string
): RoleDefinition[] {
  const allRoles = getRolesForTheme(theme);
  const rolePool: RoleDefinition[] = [];

  for (const [roleId, count] of Object.entries(distribution)) {
    const role = allRoles.find(r => r.id === roleId);
    if (!role) {
      throw new Error(`Role "${roleId}" not found in theme "${theme}"`);
    }
    for (let i = 0; i < count; i++) {
      rolePool.push(role);
    }
  }

  return shuffle(rolePool);
}
```

## Files Created/Modified

**Created:**
- `src/app/api/games/route.ts` - Create game
- `src/app/api/games/[id]/route.ts` - Get game details
- `src/app/api/games/[id]/issue-cards/route.ts` - Issue cards
- `src/app/api/games/[code]/join/route.ts` - Join game (NOTE: might conflict with [id])
- `src/app/api/players/[id]/route.ts` - Get player details
- `src/app/api/themes/route.ts` - List themes
- `src/lib/roles/assignRoles.ts` - Role assignment helpers

**Note on Route Conflicts:**
Since Next.js routes can't distinguish between `[id]` and `[code]` at the same level, we need to structure differently:

**Revised Structure:**
```
src/app/api/
├── games/
│   ├── route.ts                    # POST - Create game
│   ├── by-id/
│   │   └── [id]/
│   │       ├── route.ts            # GET - Get game details
│   │       └── issue-cards/
│   │           └── route.ts        # POST - Issue cards
│   └── by-code/
│       └── [code]/
│           └── join/
│               └── route.ts        # POST - Join game
```

OR use a single `[identifier]` route and detect if it's an ID or code based on format.

## Testing Checklist
- [ ] Create a game with classic theme
- [ ] Create a game with Harry Potter theme
- [ ] Get game details by ID
- [ ] Join a game with valid code
- [ ] Try to join non-existent game (should fail)
- [ ] Issue cards to a game with enough players
- [ ] Verify all players have unique roles
- [ ] Get player details and see assigned role
- [ ] List all available themes
- [ ] Test error cases (missing fields, invalid data)

## Testing with cURL or Postman

```bash
# 1. Create a game
curl -X POST http://localhost:3000/api/games \
  -H "Content-Type: application/json" \
  -d '{"theme":"classic","playerCount":10}'

# 2. Join the game (use code from step 1)
curl -X POST http://localhost:3000/api/games/by-code/ABC123/join \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice"}'

# 3. Get game details (use ID from step 1)
curl http://localhost:3000/api/games/by-id/xyz123

# 4. Issue cards (use ID from step 1, after enough players join)
curl -X POST http://localhost:3000/api/games/by-id/xyz123/issue-cards

# 5. Get player details (use player ID from step 2)
curl http://localhost:3000/api/players/player1

# 6. List themes
curl http://localhost:3000/api/themes
```

## Next Steps
- **Phase 05:** Admin Interface (Game Master UI)
  - Create game form
  - Display waiting room
  - Issue cards button
  - Player list management

## Notes
- Use Next.js 13+ App Router conventions
- All endpoints are server-side only (no client components needed)
- Use `NextRequest` and `NextResponse` for type safety
- Validate all input data before processing
- Return appropriate HTTP status codes
- Handle database errors gracefully
- Consider adding request logging for debugging
