import fs from 'fs';
import path from 'path';
import { BaseRoles, ThemeRoles } from '@/types/role';

/**
 * Load base roles from base-rules/base-roles.json
 */
export function loadBaseRoles(): BaseRoles {
  const filePath = path.join(process.cwd(), 'base-rules', 'base-roles.json');
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content) as BaseRoles;
}

/**
 * Load theme roles from <theme-id>/<theme-id>-roles.json
 */
export function loadThemeRoles(themeId: string): ThemeRoles | null {
  const filePath = path.join(process.cwd(), themeId, `${themeId}-roles.json`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content) as ThemeRoles;
}

/**
 * List all available themes
 * Returns array of theme IDs
 */
export function listAvailableThemes(): string[] {
  const baseDir = process.cwd();
  const themes: string[] = ['classic']; // Always include classic (base rules)

  try {
    const dirs = fs.readdirSync(baseDir, { withFileTypes: true });

    for (const dir of dirs) {
      if (dir.isDirectory() && dir.name !== 'base-rules' && !dir.name.startsWith('.')) {
        const rolesFile = path.join(baseDir, dir.name, `${dir.name}-roles.json`);
        if (fs.existsSync(rolesFile)) {
          themes.push(dir.name);
        }
      }
    }
  } catch (error) {
    console.error('Error listing themes:', error);
  }

  return themes;
}
