import { NextRequest, NextResponse } from 'next/server';
import { getGameById } from '@/lib/models/game';
import { getPlayersByGameId } from '@/lib/models/player';

export const runtime = 'edge';

/**
 * GET /api/games/[gameId]/players
 * Get all players in a game (for player list view)
 * Returns alive players with minimal info, eliminated players with revealed roles
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;

    // Verify game exists
    const game = await getGameById(gameId);
    if (!game) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }

    // Get all players
    const players = await getPlayersByGameId(gameId);

    // Format player list
    // Alive players: show name and status only
    // Eliminated players: show name, status, and revealed role
    const playerList = players.map(p => ({
      id: p.id,
      name: p.name,
      isAlive: p.isAlive,
      // Only reveal role data if player is eliminated
      ...(p.isAlive
        ? {}
        : {
            role: p.role,
            roleData: p.roleData,
          }),
    }));

    return NextResponse.json({
      players: playerList,
    });
  } catch (error) {
    console.error('Error getting players:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
