import { RoleDefinition, BaseRoles, ThemeRoles } from '@/types/role';

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
  const roleMappings = themeRoles.role_mappings || [];
  for (const mapping of roleMappings) {
    const baseRole = baseRoles.roles.find(r => r.id === mapping.base_role);

    if (!baseRole) {
      console.warn(`Base role "${mapping.base_role}" not found for theme mapping`);
      continue;
    }

    // Handle flavor at mapping level (for backward compatibility with JSON structure)
    const mappingWithFlavor = mapping as any;
    const flavorOverride = mappingWithFlavor.flavor || mapping.overrides.flavor;

    // Merge base role with overrides (deep merge for nested objects)
    const mergedRole: RoleDefinition = {
      ...baseRole,
      ...mapping.overrides,
      // Deep merge abilities if provided in overrides
      abilities: mapping.overrides.abilities !== undefined
        ? mapping.overrides.abilities
        : baseRole.abilities,
      knowledge: mapping.overrides.knowledge !== undefined
        ? mapping.overrides.knowledge
        : baseRole.knowledge,
      winCondition: mapping.overrides.winCondition !== undefined
        ? mapping.overrides.winCondition
        : baseRole.winCondition,
      cardInstructions: mapping.overrides.cardInstructions !== undefined
        ? mapping.overrides.cardInstructions
        : baseRole.cardInstructions,
      flavor: {
        ...baseRole.flavor,
        ...flavorOverride,
      },
    };

    mergedRoles.push(mergedRole);
    processedBaseRoles.add(mapping.base_role);
  }

  // Add base roles that weren't mapped (keep them as-is)
  for (const baseRole of baseRoles.roles) {
    if (!processedBaseRoles.has(baseRole.id)) {
      mergedRoles.push(baseRole);
    }
  }

  // Add new theme-specific roles
  if (themeRoles.new_roles && themeRoles.new_roles.length > 0) {
    mergedRoles.push(...themeRoles.new_roles);
  }

  return mergedRoles;
}

/**
 * Gets role distribution preset for a given player count and theme
 */
export function getRoleDistribution(
  playerCount: number,
  baseRoles: BaseRoles,
  themeRoles: ThemeRoles | null
): Record<string, number> | null {
  const presets = themeRoles?.role_distribution_presets || baseRoles.role_distribution_presets;

  if (!presets) {
    return null;
  }

  // Try exact match
  const exactKey = `${playerCount}_players`;
  if (presets[exactKey]) {
    return presets[exactKey];
  }

  // Find closest preset (use the one for the player count or the next highest)
  const presetKeys = Object.keys(presets).sort((a, b) => {
    const aCount = parseInt(a.split('_')[0]);
    const bCount = parseInt(b.split('_')[0]);
    return aCount - bCount;
  });

  // Find the preset that best fits this player count
  let bestMatch: string | null = null;
  for (const key of presetKeys) {
    const count = parseInt(key.split('_')[0]);
    if (count <= playerCount) {
      bestMatch = key;
    } else {
      break;
    }
  }

  return bestMatch ? presets[bestMatch] : null;
}
