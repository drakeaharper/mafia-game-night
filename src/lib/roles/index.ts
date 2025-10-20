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
  return getRoleDistribution(playerCount, baseRolesCache, themeRoles);
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

/**
 * Generate array of roles based on distribution (for role assignment)
 * Returns a shuffled array of role definitions
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

  // Shuffle the role pool
  return shuffleArray(rolePool);
}

/**
 * Shuffle array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
