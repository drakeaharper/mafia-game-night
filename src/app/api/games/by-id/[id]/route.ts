import { NextRequest, NextResponse } from 'next/server';
import { getGameById } from '@/lib/models/game';
import { getPlayersByGameId } from '@/lib/models/player';

/**
 * GET /api/games/by-id/[id]
 * Get game details with player list
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

    // Return game with sanitized player list (don't expose roles)
    const sanitizedPlayers = players.map(p => ({
      id: p.id,
      name: p.name,
      isAlive: p.isAlive,
      hasRole: p.role !== null,
      joinedAt: p.joinedAt,
    }));

    return NextResponse.json({
      ...game,
      players: sanitizedPlayers,
    });
  } catch (error) {
    console.error('Error getting game:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
