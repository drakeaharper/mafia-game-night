# Phase 00: Next.js Project Initialization

**Status:** Complete
**Started:** 2025-10-19
**Completed:** 2025-10-19

## Objective
Set up the foundational Next.js project with TypeScript, Tailwind CSS, and all necessary dependencies for the Mafia Game Night application.

## Prerequisites
- [x] Node.js 18+ installed
- [x] Git repository initialized
- [x] Planning structure documented

## Tasks
- [x] Initialize Next.js project with TypeScript and App Router
- [x] Configure Tailwind CSS
- [x] Set up project structure (directories for app, components, lib, types)
- [x] Install SQLite dependencies (better-sqlite3)
- [x] Configure TypeScript with strict mode
- [x] Create basic file structure
- [x] Add `.gitignore` for Node/Next.js
- [x] Install additional dependencies (nanoid for ID generation, qrcode for game codes)
- [x] Test that development server runs successfully
- [x] Create basic landing page

## Acceptance Criteria
- [x] `npm run dev` starts the development server without errors
- [x] Can access http://localhost:3000 and see a basic page
- [x] TypeScript compilation works without errors
- [x] Tailwind CSS is functional (can apply utility classes)
- [x] Directory structure matches planned architecture
- [x] SQLite dependencies installed and importable
- [x] No build warnings or errors

## Technical Notes

### Next.js Setup
- Use `create-next-app` with TypeScript template
- Enable App Router (default in Next.js 13+)
- Use `src/` directory for better organization

### Dependencies to Install

**Core:**
- `next` - Framework
- `react` & `react-dom` - React libraries
- `typescript` - TypeScript support
- `@types/react` & `@types/node` - Type definitions

**Styling:**
- `tailwindcss` - Utility-first CSS
- `postcss` & `autoprefixer` - CSS processing

**Database:**
- `better-sqlite3` - Synchronous SQLite3 library
- `@types/better-sqlite3` - TypeScript types

**Utilities:**
- `nanoid` - Generate short unique IDs for games/players
- `qrcode` - Generate QR codes for easy game joining
- `@types/qrcode` - TypeScript types

### Directory Structure to Create
```
src/
├── app/
│   ├── page.tsx                 # Landing page
│   ├── layout.tsx               # Root layout
│   ├── globals.css              # Global styles + Tailwind
│   ├── admin/                   # Game Master UI (future)
│   ├── game/                    # Player UI (future)
│   └── api/                     # API routes (future)
├── components/                  # React components (future)
├── lib/                         # Utility functions
│   └── utils.ts                 # Helper functions
├── types/                       # TypeScript type definitions
│   ├── game.ts
│   ├── player.ts
│   └── role.ts
└── data/                        # SQLite database location
```

### TypeScript Configuration
- Enable strict mode
- Path aliases: `@/` → `src/`
- Target ES2022

### Tailwind Configuration
- Configure content paths for `src/` directory
- Add custom theme colors if needed (can be added later)

### Git Ignore
Ensure these are ignored:
- `node_modules/`
- `.next/`
- `*.db` (SQLite databases - don't commit local data)
- `*.db-journal`
- `.env*.local`

## Files Created/Modified

**Created:**
- `package.json` - Project dependencies
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.ts` - Tailwind configuration
- `postcss.config.js` - PostCSS configuration
- `next.config.js` - Next.js configuration
- `.gitignore` - Git ignore rules
- `src/app/page.tsx` - Landing page
- `src/app/layout.tsx` - Root layout
- `src/app/globals.css` - Global styles
- `src/lib/utils.ts` - Utility functions placeholder
- `src/types/game.ts` - Game type definitions
- `src/types/player.ts` - Player type definitions
- `src/types/role.ts` - Role type definitions

## Commands to Run

```bash
# Initialize Next.js with TypeScript
npx create-next-app@latest . --typescript --tailwind --app --src-dir --no-import-alias

# Install additional dependencies
npm install better-sqlite3 nanoid qrcode
npm install -D @types/better-sqlite3 @types/qrcode

# Run development server
npm run dev
```

## Testing Checklist
- [ ] Run `npm run dev` - server starts on port 3000
- [ ] Visit http://localhost:3000 - page loads
- [ ] Check browser console - no errors
- [ ] Check terminal - no TypeScript errors
- [ ] Hot reload works - make a change and verify it updates
- [ ] Can import from `better-sqlite3` without errors
- [ ] Tailwind classes work - add a `className="text-red-500"` and verify it's red

## Next Steps
- **Phase 01:** Database schema and SQLite setup
  - Create database initialization script
  - Define tables (games, players, game_events)
  - Create database helper functions
  - Set up migrations or schema file

## Notes
- Keep the initial landing page simple - just a title and description
- Don't worry about styling yet - focus on getting the foundation working
- The `create-next-app` command will ask several questions - choose:
  - TypeScript: Yes
  - ESLint: Yes
  - Tailwind CSS: Yes
  - `src/` directory: Yes
  - App Router: Yes
  - Import alias: No (we'll configure manually if needed)
