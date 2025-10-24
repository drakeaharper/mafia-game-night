import { BaseRoles, ThemeRoles } from '@/types/role';

// Static imports for all theme JSON files
import baseRolesData from '@/../base-rules/base-roles.json';
import harryPotterRolesData from '@/../harry-potter/harry-potter-roles.json';
import werewolfRolesData from '@/../werewolf/werewolf-roles.json';

// Type-safe imports
const BASE_ROLES = baseRolesData as BaseRoles;
const THEME_ROLES: Record<string, ThemeRoles> = {
  'harry-potter': harryPotterRolesData as ThemeRoles,
  'werewolf': werewolfRolesData as ThemeRoles,
};

// List of all available themes
const AVAILABLE_THEMES = ['classic', 'harry-potter', 'werewolf'] as const;

/**
 * Load base roles from base-rules/base-roles.json
 */
export function loadBaseRoles(): BaseRoles {
  return BASE_ROLES;
}

/**
 * Load theme roles from <theme-id>/<theme-id>-roles.json
 */
export function loadThemeRoles(themeId: string): ThemeRoles | null {
  return THEME_ROLES[themeId] || null;
}

/**
 * List all available themes
 * Returns array of theme IDs
 */
export function listAvailableThemes(): string[] {
  return [...AVAILABLE_THEMES];
}
