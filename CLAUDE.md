# CLAUDE.md - Development Context

This file contains development notes, architectural decisions, and context for AI assistants working on this project.

## Project Vision

A self-hosted web application that helps manage in-person Mafia/Werewolf games. The app runs on a local server (desktop) and allows:
- Game Master to administrate from their phone
- Players to join and receive role cards digitally
- Theme selection and role customization
- Clean, intuitive interfaces for both admin and players

## Architecture Overview

### Tech Stack
- **Framework:** Next.js (App Router)
- **Frontend:** React with TypeScript
- **Database:** SQLite (simple, self-contained, no external dependencies)
- **Styling:** Tailwind CSS (recommended for rapid development)
- **State Management:** React Context + hooks (keep it simple initially)

### Why These Choices?
- **Next.js:** Full-stack framework, easy to deploy, great DX
- **SQLite:** Perfect for self-hosted apps, no setup required, portable
- **Self-hosted:** No cloud dependencies, works on local network

---

## Core Concepts

### 1. Roles System

Roles are defined in a hierarchical JSON structure:

#### Base Roles (`base-rules/base-roles.json`)
- Contains the canonical role definitions for standard Mafia
- Includes: Mafia, Detective, Doctor, Townsperson, Vigilante, etc.
- Each role has: name, alignment, abilities, win conditions

#### Theme Roles (`<theme-name>/<theme-name>-roles.json`)
- Themes reference base roles and override properties
- Examples: Harry Potter theme maps "Mafia" → "Death Eater", "Detective" → "Dumbledore"
- Themes can add new unique roles or modify existing ones

**Benefits:**
- DRY principle - don't duplicate role logic
- Easy to create new themes
- Consistent game mechanics across variants
- Simple JSON structure for non-developers to create themes

### 2. Game Flow

```
1. CREATE GAME
   ├─ Game Master creates a new game
   ├─ Selects a theme (Classic, Harry Potter, etc.)
   ├─ Configures player count and role distribution
   └─ Game enters "WAITING" state

2. PLAYERS JOIN
   ├─ Players enter game code/join via QR
   ├─ Enter their name
   └─ Wait for role assignment

3. ISSUE CARDS
   ├─ Game Master reviews player list
   ├─ Clicks "Issue Cards"
   ├─ System assigns roles based on configuration
   └─ Each player receives their role card privately

4. PLAY GAME
   ├─ Game Master manages night/day phases
   ├─ Players see their role and abilities
   ├─ Track eliminations and game state
   └─ Declare winner when conditions met

5. END GAME
   ├─ Reveal all roles
   └─ Option to play again
```

### 3. User Roles

#### Game Master (Admin)
- Creates games
- Issues role cards
- Manages game flow
- Can access from phone while game runs

#### Player
- Joins game with code
- Receives role card
- Views role information during game
- No ability to see other players' roles

---

## Database Schema (Draft)

### Tables

#### `games`
```sql
CREATE TABLE games (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,        -- 6-char join code
  theme TEXT NOT NULL,               -- 'classic', 'harry-potter', etc.
  state TEXT NOT NULL,               -- 'waiting', 'active', 'ended'
  created_at INTEGER NOT NULL,
  started_at INTEGER,
  ended_at INTEGER,
  config TEXT NOT NULL              -- JSON: role distribution, rules
);
```

#### `players`
```sql
CREATE TABLE players (
  id TEXT PRIMARY KEY,
  game_id TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT,                        -- NULL until cards issued
  is_alive INTEGER DEFAULT 1,
  joined_at INTEGER NOT NULL,
  FOREIGN KEY (game_id) REFERENCES games(id)
);
```

#### `game_events` (optional, for history)
```sql
CREATE TABLE game_events (
  id TEXT PRIMARY KEY,
  game_id TEXT NOT NULL,
  event_type TEXT NOT NULL,         -- 'join', 'eliminate', 'phase_change'
  data TEXT,                         -- JSON event data
  created_at INTEGER NOT NULL,
  FOREIGN KEY (game_id) REFERENCES games(id)
);
```

---

## API Routes (Planned)

### Game Management
- `POST /api/games` - Create new game
- `GET /api/games/:id` - Get game state
- `POST /api/games/:id/start` - Issue cards and start
- `POST /api/games/:id/end` - End game

### Player Management
- `POST /api/games/:code/join` - Join game by code
- `GET /api/players/:id` - Get player info (including role)
- `POST /api/players/:id/eliminate` - Mark player as eliminated

### Theme/Roles
- `GET /api/themes` - List available themes
- `GET /api/themes/:theme/roles` - Get roles for theme

---

## File Structure

```
mafia-game-night/
├── base-rules/
│   ├── mafia-base-rules.md        # Human-readable rules
│   └── base-roles.json            # Canonical role definitions
│
├── harry-potter/
│   ├── harry-potter-mafia-rules.md
│   └── harry-potter-roles.json    # Theme overrides/extensions
│
├── planning/
│   ├── phase_00.md                # Phase planning documents
│   ├── phase_01.md
│   └── ...
│
├── src/
│   ├── app/                       # Next.js app directory
│   │   ├── page.tsx              # Landing page
│   │   ├── admin/                # Game Master interface
│   │   ├── game/[code]/          # Player join/view
│   │   └── api/                  # API routes
│   │
│   ├── components/
│   │   ├── RoleCard.tsx          # Display role information
│   │   ├── PlayerList.tsx        # Show players in game
│   │   └── GameControls.tsx      # GM controls
│   │
│   ├── lib/
│   │   ├── db.ts                 # SQLite database connection
│   │   ├── roles.ts              # Role loading/merging logic
│   │   └── game-logic.ts         # Game state management
│   │
│   └── types/
│       ├── game.ts               # Game type definitions
│       ├── player.ts             # Player type definitions
│       └── role.ts               # Role type definitions
│
├── public/
│   └── themes/                   # Theme assets (icons, images)
│
├── prisma/ (or raw SQL migrations)
│   └── schema.prisma
│
├── README.md
├── CLAUDE.md                     # This file
└── package.json
```

---

## Role JSON Structure

### Base Role Format
```json
{
  "id": "mafia",
  "name": "Mafia",
  "alignment": "evil",
  "description": "You are a member of the Mafia...",
  "abilities": [
    {
      "name": "night_kill",
      "description": "Choose one player to eliminate each night",
      "phase": "night"
    }
  ],
  "knowledge": ["other_mafia"],
  "win_condition": "equal_or_outnumber_town"
}
```

### Theme Override Format
```json
{
  "theme_id": "harry-potter",
  "theme_name": "Death Eaters Among Us",
  "base_theme": "classic",
  "role_mappings": [
    {
      "base_role": "mafia",
      "overrides": {
        "name": "Death Eater",
        "description": "You are a Death Eater serving the Dark Lord...",
        "flavor_text": "Your Dark Mark burns..."
      }
    },
    {
      "base_role": "detective",
      "overrides": {
        "name": "Dumbledore",
        "description": "As Dumbledore, you can sense dark magic..."
      }
    }
  ],
  "new_roles": []
}
```

---

## Key Features to Implement

### Phase 1 - MVP
- [ ] Basic game creation
- [ ] Player join with code
- [ ] Role card distribution
- [ ] Simple admin interface
- [ ] Player role viewing
- [ ] Classic theme only

### Phase 2 - Enhanced
- [ ] Multiple themes (Harry Potter, etc.)
- [ ] Role JSON system
- [ ] Game phase tracking
- [ ] Player elimination tracking
- [ ] QR code joining

### Phase 3 - Advanced
- [ ] Game history
- [ ] Custom role creation UI
- [ ] Timer for phases
- [ ] Sound effects
- [ ] Statistics tracking

---

## Design Principles

1. **Simplicity First:** Start with core functionality, add features incrementally
2. **Mobile-Friendly:** Admin and player interfaces must work great on phones
3. **Self-Contained:** No external services required (works on local network)
4. **Theme Flexibility:** Easy to add new themes without code changes
5. **Privacy:** Role information is sacred - secure by default

---

## Development Notes

### Local Network Setup
- App runs on host's IP address (e.g., `http://192.168.1.100:3000`)
- Players connect via WiFi to the same network
- QR codes make joining easy (encode the game URL)

### Security Considerations
- No authentication needed (local network only)
- Game codes prevent accidental joins
- Player IDs in URLs (hard to guess)
- Don't log role information

### Testing Strategy
- Unit tests for role merging logic
- Integration tests for game flow
- Manual testing on multiple devices
- Test with actual game nights!

---

## Phased Planning Methodology

This project follows a structured phased planning approach to break down development into manageable, sequential tasks.

### Planning Structure

All planning documents are stored in the `planning/` directory using the following naming convention:

**Format:** `phase_XX.md` where `XX` is a zero-padded number starting at `00`

**Examples:**
- `planning/phase_00.md` - First phase (e.g., Initial Next.js setup)
- `planning/phase_01.md` - Second phase (e.g., Database setup)
- `planning/phase_02.md` - Third phase (e.g., API routes)

### Sub-phases for Complex Tasks

When a task is larger than a single phase or requires breaking down into multiple related contexts, use decimal notation:

**Format:** `phase_XX.YY.md`

**Examples:**
- `planning/phase_03.01.md` - First part of phase 3
- `planning/phase_03.02.md` - Second part of phase 3
- `planning/phase_03.03.md` - Third part of phase 3

This keeps related tasks grouped together while maintaining clear separation of concerns.

### Planning Best Practices

1. **One Focus Per Phase:** Each phase should have a clear, singular objective
2. **Sequential Execution:** Phases should build on previous work
3. **Complete and Test:** Each phase should result in working, testable code
4. **Document Decisions:** Include rationale for technical choices in the planning doc
5. **Update Status:** Mark phases as complete in the planning doc when finished

### Planning Document Template

Each planning file should include:
- **Phase Number & Title**
- **Objective:** What this phase accomplishes
- **Prerequisites:** What must be completed before starting
- **Tasks:** Specific items to complete
- **Acceptance Criteria:** How to verify the phase is complete
- **Technical Notes:** Implementation details, gotchas, considerations
- **Next Steps:** What phase comes after

---

## Questions to Resolve

- [ ] Should Game Master also be a player, or separate?
- [ ] How to handle reconnections if player closes browser?
- [ ] Display eliminated players' roles immediately or at game end?
- [ ] Allow custom role distributions or use presets?
- [ ] Support multiple simultaneous games?

---

## References

- [Next.js Documentation](https://nextjs.org/docs)
- [SQLite](https://www.sqlite.org/index.html)
- [Mafia Game Rules](./base-rules/mafia-base-rules.md)

---

**Last Updated:** 2025-10-19
**Status:** Planning Phase
