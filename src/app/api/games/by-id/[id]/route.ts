import { NextRequest, NextResponse } from 'next/server';
import { getGameById } from '@/lib/models/game';
import { getPlayersByGameId } from '@/lib/models/player';
export const runtime = 'edge';


/**
 * GET /api/games/by-id/[id]
 * Get game details with player list
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const game = await getGameById(id);
    if (!game) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }

    // Get players for this game
    const players = await getPlayersByGameId(id);

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
