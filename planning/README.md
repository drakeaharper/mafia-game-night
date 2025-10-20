# Planning Directory

This directory contains phased planning documents for the Mafia Game Night project.

## Naming Convention

### Standard Phases
Files are named `phase_XX.md` where `XX` is a zero-padded number starting at `00`.

**Examples:**
- `phase_00.md` - First phase
- `phase_01.md` - Second phase
- `phase_02.md` - Third phase

### Sub-phases
For larger tasks that span multiple related contexts, use decimal notation: `phase_XX.YY.md`

**Examples:**
- `phase_03.01.md` - First sub-phase of phase 3
- `phase_03.02.md` - Second sub-phase of phase 3

## Planning Document Template

Each planning document should follow this structure:

```markdown
# Phase XX: [Title]

**Status:** Not Started | In Progress | Complete
**Started:** YYYY-MM-DD
**Completed:** YYYY-MM-DD

## Objective
[Clear, concise statement of what this phase accomplishes]

## Prerequisites
- [ ] List of phases or tasks that must be completed first
- [ ] Can be empty for phase_00

## Tasks
- [ ] Specific task 1
- [ ] Specific task 2
- [ ] Specific task 3

## Acceptance Criteria
- [ ] How to verify task 1 is complete
- [ ] How to verify task 2 is complete
- [ ] Functional tests or outcomes that prove the phase is done

## Technical Notes
- Implementation details
- Technology choices and rationale
- Potential gotchas or challenges
- Code patterns to follow

## Files Created/Modified
- `path/to/file.ts` - Description
- `path/to/other.tsx` - Description

## Next Steps
- What phase comes after this one
- Any setup needed for the next phase
```

## Current Phases

| Phase | Title | Status | Description |
|-------|-------|--------|-------------|
| [00](phase_00.md) | Next.js Project Initialization | ✅ Complete | Set up Next.js with TypeScript, Tailwind, SQLite dependencies |
| [01](phase_01.md) | SQLite Database Setup | ✅ Complete | Create database schema, initialization, and connection |
| [02](phase_02.md) | TypeScript Types and Models | Not Started | Define types and create type-safe database CRUD functions |
| [03](phase_03.md) | Role System Loader | Not Started | Load and merge base roles with theme overrides from JSON |
| [04](phase_04.md) | API Routes - Core Game Management | Not Started | Create REST API for games, players, themes, and role assignment |
| [05](phase_05.md) | Admin Interface (Game Master UI) | Not Started | Build Game Master console for creating/managing games |
| [06](phase_06.md) | Player Interface | Not Started | Build player join flow and role card display |

**MVP Complete after Phase 06** - All core functionality will be working

### Future Phases (Not Yet Planned)
- Phase 07: Game Flow Management (night/day phases, elimination tracking)
- Phase 08: Polish & Testing (error handling, loading states, animations)
- Phase 09: Advanced Features (game history, statistics, custom roles)

*This table is updated as phases are created and completed.*

## Guidelines

1. **One Focus Per Phase** - Each phase should accomplish one clear objective
2. **Sequential** - Phases build on each other in order
3. **Testable** - Each phase should result in working, verifiable code
4. **Documented** - Include technical rationale and decisions
5. **Updated** - Mark status and dates as work progresses

## See Also

- [CLAUDE.md](../CLAUDE.md) - Full development context and architecture
- [README.md](../README.md) - Project overview
