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
  schema_version: string;
  roles: RoleDefinition[];
  role_distribution_presets: Record<string, Record<string, number>>;
  metadata: {
    game_name: string;
    min_players: number;
    max_players: number;
    recommended_players: string;
    complexity: string;
  };
}

export interface ThemeRoles {
  schema_version: string;
  theme_id: string;
  theme_name: string;
  base_theme: string;
  description: string;
  role_mappings: Array<{
    base_role: string;
    overrides: Partial<RoleDefinition>;
  }>;
  new_roles: RoleDefinition[];
  role_distribution_presets: Record<string, Record<string, number>>;
  game_flow_overrides?: any;
  flavor_text?: Record<string, string>;
  metadata: {
    game_name: string;
    min_players: number;
    max_players: number;
    recommended_players: string;
    complexity: string;
    author?: string;
    version?: string;
  };
}
