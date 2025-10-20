import { RoleDefinition } from './role';

export interface Player {
  id: string;
  gameId: string;
  name: string;
  role: string | null;
  roleData: RoleDefinition | null;
  isAlive: boolean;
  joinedAt: number;
}

export interface CreatePlayerInput {
  gameId: string;
  name: string;
}
