import { NextRequest, NextResponse } from 'next/server';
import { getPlayerById } from '@/lib/models/player';

/**
 * GET /api/players/[id]
 * Get player details including their role
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

    // Return full player data including role
    // The player ID in the URL acts as authentication
    return NextResponse.json({
      id: player.id,
      name: player.name,
      gameId: player.gameId,
      role: player.roleData, // Full role information
      isAlive: player.isAlive,
      joinedAt: player.joinedAt,
    });
  } catch (error) {
    console.error('Error getting player:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
