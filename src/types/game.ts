export type GameState = 'waiting' | 'active' | 'ended';
export type Theme = 'classic' | 'harry-potter';

export interface GameConfig {
  roleDistribution: Record<string, number>;
  playerCount: number;
  theme: Theme;
}

export interface Game {
  id: string;
  code: string;
  theme: Theme;
  state: GameState;
  createdAt: number;
  startedAt: number | null;
  endedAt: number | null;
  config: GameConfig;
}

export interface CreateGameInput {
  theme: Theme;
  config: GameConfig;
}
