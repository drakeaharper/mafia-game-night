import { NextRequest, NextResponse } from 'next/server';
import { getPlayerById } from '@/lib/models/player';
import { getGameById } from '@/lib/models/game';

/**
 * GET /api/players/[id]
 * Get player details including their role and game theme
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const player = getPlayerById(id);
    if (!player) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      );
    }

    // Get game to include theme
    const game = getGameById(player.gameId);

    // Return full player data including role and theme
    // The player ID in the URL acts as authentication
    return NextResponse.json({
      id: player.id,
      name: player.name,
      gameId: player.gameId,
      role: player.roleData, // Full role information
      isAlive: player.isAlive,
      joinedAt: player.joinedAt,
      theme: game?.theme || 'classic',
    });
  } catch (error) {
    console.error('Error getting player:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
