import { NextRequest, NextResponse } from 'next/server';
import { createGame } from '@/lib/models/game';
import { getDistributionForPlayerCount } from '@/lib/roles';

/**
 * POST /api/games
 * Create a new game
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { theme, playerCount } = body;

    // Validate input
    if (!theme || !playerCount) {
      return NextResponse.json(
        { error: 'Missing required fields: theme and playerCount' },
        { status: 400 }
      );
    }

    if (typeof playerCount !== 'number' || playerCount < 7) {
      return NextResponse.json(
        { error: 'playerCount must be a number >= 7' },
        { status: 400 }
      );
    }

    // Get role distribution for this player count
    const roleDistribution = getDistributionForPlayerCount(playerCount, theme);
    if (!roleDistribution) {
      return NextResponse.json(
        { error: 'Invalid player count or theme' },
        { status: 400 }
      );
    }

    // Create game
    const game = createGame({
      theme,
      config: {
        roleDistribution,
        playerCount,
        theme,
      },
    });

    return NextResponse.json(game, { status: 201 });
  } catch (error) {
    console.error('Error creating game:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
