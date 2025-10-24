import { NextRequest, NextResponse } from 'next/server';
import { getGameById, updateGameState } from '@/lib/models/game';
import { getPlayersByGameId, assignRole } from '@/lib/models/player';
import { generateRolePool } from '@/lib/roles';

export const runtime = 'edge';

/**
 * POST /api/games/by-id/[id]/issue-cards
 * Issue role cards to all players in a game
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get game
    const game = await getGameById(id);
    if (!game) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }

    // Check if game is in waiting state
    if (game.state !== 'waiting') {
      return NextResponse.json(
        { error: 'Cards have already been issued' },
        { status: 400 }
      );
    }

    // Get players
    const players = await getPlayersByGameId(id);

    // Check if we have enough players
    if (players.length < game.config.playerCount) {
      return NextResponse.json(
        {
          error: `Not enough players. Need ${game.config.playerCount}, have ${players.length}`,
        },
        { status: 400 }
      );
    }

    // Generate role pool (shuffled)
    const rolePool = generateRolePool(game.config.roleDistribution, game.theme);

    // Verify we have the right number of roles
    if (rolePool.length !== players.length) {
      return NextResponse.json(
        { error: 'Role distribution mismatch' },
        { status: 500 }
      );
    }

    // Assign roles to players
    for (let index = 0; index < players.length; index++) {
      const player = players[index];
      const role = rolePool[index];
      await assignRole(player.id, role.id, role);
    }

    // Update game state to active
    await updateGameState(id, 'active');

    return NextResponse.json({
      success: true,
      playerCount: players.length,
      rolesIssued: true,
    });
  } catch (error) {
    console.error('Error issuing cards:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
