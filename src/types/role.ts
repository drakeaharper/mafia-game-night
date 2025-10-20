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
