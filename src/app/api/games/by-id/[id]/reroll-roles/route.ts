import { NextRequest, NextResponse } from 'next/server';
import { getGameById } from '@/lib/models/game';
import { getPlayersByGameId, assignRole, resetPlayersToAlive } from '@/lib/models/player';
import { deleteVotesByGame } from '@/lib/models/vote';
import { generateRolePool } from '@/lib/roles';
export const runtime = 'edge';


/**
 * POST /api/games/by-id/[id]/reroll-roles
 * Reroll role cards for all players in an active game
 * This will:
 * - Clear existing role assignments
 * - Generate new shuffled roles
 * - Reassign roles to players
 * - Reset all players to alive status
 * - Clear all votes
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

    // Check if game is in active state
    if (game.state !== 'active') {
      return NextResponse.json(
        { error: 'Can only reroll roles for active games. Issue cards first.' },
        { status: 400 }
      );
    }

    // Get players
    const players = await getPlayersByGameId(id);

    // Verify we have players
    if (players.length === 0) {
      return NextResponse.json(
        { error: 'No players in game' },
        { status: 400 }
      );
    }

    // Generate new role pool (shuffled)
    const rolePool = generateRolePool(game.config.roleDistribution, game.theme);

    // Verify we have the right number of roles
    if (rolePool.length !== players.length) {
      return NextResponse.json(
        { error: 'Role distribution mismatch' },
        { status: 500 }
      );
    }

    // Reset all players to alive
    await resetPlayersToAlive(id);

    // Clear all votes
    await deleteVotesByGame(id);

    // Reassign roles to players
    for (let index = 0; index < players.length; index++) {
      const player = players[index];
      const role = rolePool[index];
      await assignRole(player.id, role.id, role);
    }

    return NextResponse.json({
      success: true,
      playerCount: players.length,
      rolesRerolled: true,
    });
  } catch (error) {
    console.error('Error rerolling roles:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
