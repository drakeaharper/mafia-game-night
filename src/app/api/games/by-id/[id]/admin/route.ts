import { NextRequest, NextResponse } from 'next/server';
import { getGameById } from '@/lib/models/game';
import { getPlayersByGameId } from '@/lib/models/player';

/**
 * GET /api/games/by-id/[id]/admin
 * Get game details with full player role data for Game Master
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const game = getGameById(id);
    if (!game) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }

    // Get players for this game
    const players = getPlayersByGameId(id);

    // Return game with full player data including roles
    const fullPlayers = players.map(p => ({
      id: p.id,
      name: p.name,
      isAlive: p.isAlive,
      hasRole: p.role !== null,
      role: p.role,
      roleData: p.roleData,
      joinedAt: p.joinedAt,
    }));

    return NextResponse.json({
      ...game,
      players: fullPlayers,
    });
  } catch (error) {
    console.error('Error getting game for admin:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
