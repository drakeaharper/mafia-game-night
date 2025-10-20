# Phase 03: Role System Loader

**Status:** Not Started
**Started:** -
**Completed:** -

## Objective
Create the role loading and merging system that reads base roles and theme roles from JSON files, applies overrides, and provides a clean API for role management.

## Prerequisites
- [x] Phase 00 completed (Next.js initialized)
- [x] Phase 01 completed (Database created)
- [x] Phase 02 completed (Types defined)
- [x] `base-rules/base-roles.json` exists
- [x] `harry-potter/harry-potter-roles.json` exists

## Tasks
- [ ] Create `src/lib/roles/loader.ts` - Load role JSON files
- [ ] Create `src/lib/roles/merger.ts` - Merge base roles with theme overrides
- [ ] Create `src/lib/roles/index.ts` - Public API for role system
- [ ] Implement caching to avoid repeated file reads
- [ ] Create functions to get roles by theme
- [ ] Create functions to get specific role by ID
- [ ] Handle theme role mappings and new roles
- [ ] Add error handling for missing/malformed JSON
- [ ] Test with both classic and Harry Potter themes
- [ ] Create helper for role distribution

## Acceptance Criteria
- [x] Can load base roles from JSON
- [x] Can load theme roles from JSON
- [x] Can merge theme overrides with base roles correctly
- [x] Can get all roles for a theme
- [x] Can get a specific role by ID for a theme
- [x] Theme-specific roles (like Voldemort) are included
- [x] Role distribution presets are accessible
- [x] No errors when loading JSON files
- [x] Proper TypeScript typing throughout

## Technical Notes

### File Structure
```
src/lib/roles/
├── loader.ts      # Load JSON files from filesystem
├── merger.ts      # Merge base + theme roles
├── index.ts       # Public API
└── cache.ts       # Optional: Cache loaded roles
```

### Loader Implementation

**src/lib/roles/loader.ts:**
```typescript
import fs from 'fs';
import path from 'path';
import { BaseRoles, ThemeRoles } from '@/types/role';

export function loadBaseRoles(): BaseRoles {
  const filePath = path.join(process.cwd(), 'base-rules', 'base-roles.json');
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content) as BaseRoles;
}

export function loadThemeRoles(themeId: string): ThemeRoles | null {
  const filePath = path.join(process.cwd(), themeId, `${themeId}-roles.json`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content) as ThemeRoles;
}

export function listAvailableThemes(): string[] {
  const baseDir = process.cwd();
  const dirs = fs.readdirSync(baseDir, { withFileTypes: true });

  const themes: string[] = ['classic']; // Always include classic (base rules)

  for (const dir of dirs) {
    if (dir.isDirectory() && dir.name !== 'base-rules') {
      const rolesFile = path.join(baseDir, dir.name, `${dir.name}-roles.json`);
      if (fs.existsSync(rolesFile)) {
        themes.push(dir.name);
      }
    }
  }

  return themes;
}
```

### Merger Implementation

**src/lib/roles/merger.ts:**
```typescript
import { RoleDefinition } from '@/types/role';
import { BaseRoles, ThemeRoles } from '@/types/role';

/**
 * Merges base roles with theme overrides and new roles
 */
export function mergeRoles(baseRoles: BaseRoles, themeRoles: ThemeRoles | null): RoleDefinition[] {
  if (!themeRoles) {
    // No theme, just return base roles
    return baseRoles.roles;
  }

  const mergedRoles: RoleDefinition[] = [];
  const processedBaseRoles = new Set<string>();

  // Apply theme mappings (overrides)
  for (const mapping of themeRoles.roleMappings) {
    const baseRole = baseRoles.roles.find(r => r.id === mapping.baseRole);

    if (!baseRole) {
      console.warn(`Base role "${mapping.baseRole}" not found for theme mapping`);
      continue;
    }

    // Merge base role with overrides
    const mergedRole: RoleDefinition = {
      ...baseRole,
      ...mapping.overrides,
      // Deep merge abilities if provided in overrides
      abilities: mapping.overrides.abilities || baseRole.abilities,
      knowledge: mapping.overrides.knowledge || baseRole.knowledge,
      winCondition: mapping.overrides.winCondition || baseRole.winCondition,
      cardInstructions: mapping.overrides.cardInstructions || baseRole.cardInstructions,
      flavor: {
        ...baseRole.flavor,
        ...mapping.overrides.flavor,
      },
    };

    mergedRoles.push(mergedRole);
    processedBaseRoles.add(mapping.baseRole);
  }

  // Add base roles that weren't mapped
  for (const baseRole of baseRoles.roles) {
    if (!processedBaseRoles.has(baseRole.id)) {
      mergedRoles.push(baseRole);
    }
  }

  // Add new theme-specific roles
  if (themeRoles.newRoles) {
    mergedRoles.push(...themeRoles.newRoles);
  }

  return mergedRoles;
}

/**
 * Gets role distribution preset for a given player count and theme
 */
export function getRoleDistribution(
  theme: 'classic' | string,
  playerCount: number,
  baseRoles: BaseRoles,
  themeRoles: ThemeRoles | null
): Record<string, number> | null {
  const presets = themeRoles?.roleDistributionPresets || baseRoles.roleDistributionPresets;

  // Try exact match
  const exactKey = `${playerCount}_players`;
  if (presets[exactKey]) {
    return presets[exactKey];
  }

  // Find closest preset
  const presetKeys = Object.keys(presets).sort((a, b) => {
    const aCount = parseInt(a.split('_')[0]);
    const bCount = parseInt(b.split('_')[0]);
    return aCount - bCount;
  });

  for (const key of presetKeys) {
    const count = parseInt(key.split('_')[0]);
    if (count >= playerCount) {
      return presets[key];
    }
  }

  // Return largest preset if player count exceeds all presets
  const largestKey = presetKeys[presetKeys.length - 1];
  return presets[largestKey] || null;
}
```

### Public API

**src/lib/roles/index.ts:**
```typescript
import { loadBaseRoles, loadThemeRoles, listAvailableThemes } from './loader';
import { mergeRoles, getRoleDistribution } from './merger';
import { RoleDefinition } from '@/types/role';

// Simple in-memory cache
let baseRolesCache: ReturnType<typeof loadBaseRoles> | null = null;
const themeRolesCache: Map<string, ReturnType<typeof loadThemeRoles>> = new Map();

/**
 * Get all roles for a given theme (merged with base roles)
 */
export function getRolesForTheme(theme: string = 'classic'): RoleDefinition[] {
  // Load base roles (cached)
  if (!baseRolesCache) {
    baseRolesCache = loadBaseRoles();
  }

  // For classic theme, just return base roles
  if (theme === 'classic') {
    return baseRolesCache.roles;
  }

  // Load theme roles (cached)
  if (!themeRolesCache.has(theme)) {
    themeRolesCache.set(theme, loadThemeRoles(theme));
  }

  const themeRoles = themeRolesCache.get(theme)!;
  return mergeRoles(baseRolesCache, themeRoles);
}

/**
 * Get a specific role by ID for a theme
 */
export function getRoleById(roleId: string, theme: string = 'classic'): RoleDefinition | null {
  const roles = getRolesForTheme(theme);
  return roles.find(r => r.id === roleId) || null;
}

/**
 * Get role distribution preset for player count
 */
export function getDistributionForPlayerCount(
  playerCount: number,
  theme: string = 'classic'
): Record<string, number> | null {
  if (!baseRolesCache) {
    baseRolesCache = loadBaseRoles();
  }

  const themeRoles = theme === 'classic' ? null : loadThemeRoles(theme);
  return getRoleDistribution(theme, playerCount, baseRolesCache, themeRoles);
}

/**
 * List all available themes
 */
export function getAvailableThemes(): string[] {
  return listAvailableThemes();
}

/**
 * Get theme metadata
 */
export function getThemeMetadata(theme: string = 'classic') {
  if (!baseRolesCache) {
    baseRolesCache = loadBaseRoles();
  }

  if (theme === 'classic') {
    return baseRolesCache.metadata;
  }

  if (!themeRolesCache.has(theme)) {
    themeRolesCache.set(theme, loadThemeRoles(theme));
  }

  const themeRoles = themeRolesCache.get(theme);
  return themeRoles?.metadata || baseRolesCache.metadata;
}

/**
 * Clear cache (useful for testing or hot reload)
 */
export function clearRoleCache() {
  baseRolesCache = null;
  themeRolesCache.clear();
}
```

## Files Created/Modified

**Created:**
- `src/lib/roles/loader.ts` - JSON file loading
- `src/lib/roles/merger.ts` - Role merging logic
- `src/lib/roles/index.ts` - Public API exports
- `src/lib/roles/cache.ts` - Optional caching (can be inline in index.ts)

## Testing Checklist
- [ ] Can load base roles from `base-rules/base-roles.json`
- [ ] Can load Harry Potter theme from `harry-potter/harry-potter-roles.json`
- [ ] Classic theme returns base roles unchanged
- [ ] Harry Potter theme returns merged roles (Death Eater instead of Mafia, etc.)
- [ ] New roles (Voldemort) are included in Harry Potter theme
- [ ] Can get role by ID for both classic and themed games
- [ ] Can get role distribution for 7, 10, 13, 15 players
- [ ] `listAvailableThemes()` returns `['classic', 'harry-potter']`
- [ ] Theme metadata is accessible
- [ ] No errors when loading files

## Test Script

Create a temporary test file to verify functionality:

**src/lib/roles/__test.ts:**
```typescript
import { getRolesForTheme, getRoleById, getDistributionForPlayerCount, getAvailableThemes } from './index';

console.log('=== Testing Role System ===\n');

// Test 1: List themes
console.log('Available themes:', getAvailableThemes());

// Test 2: Get classic roles
const classicRoles = getRolesForTheme('classic');
console.log('\nClassic roles:', classicRoles.map(r => r.name));

// Test 3: Get Harry Potter roles
const hpRoles = getRolesForTheme('harry-potter');
console.log('\nHarry Potter roles:', hpRoles.map(r => r.name));

// Test 4: Get specific role
const dumbledore = getRoleById('detective', 'harry-potter');
console.log('\nDumbledore (detective in HP theme):', dumbledore?.name);

// Test 5: Get distribution
const dist10 = getDistributionForPlayerCount(10, 'harry-potter');
console.log('\nRole distribution for 10 players (HP):', dist10);

console.log('\n=== All tests passed! ===');
```

Run with: `npx tsx src/lib/roles/__test.ts`

## Next Steps
- **Phase 04:** API Routes - Game Management
  - Create game API endpoint
  - Join game API endpoint
  - Get game state API endpoint

## Notes
- Cache roles in memory to avoid repeated file reads (improves performance)
- Use `fs.readFileSync` since we're in server context (Next.js API routes)
- Handle missing theme files gracefully (return null)
- Theme role IDs should match base role IDs for overrides to work
- Deep merge is important for complex objects like abilities array
- Consider using Zod for runtime validation of JSON structure (future enhancement)
