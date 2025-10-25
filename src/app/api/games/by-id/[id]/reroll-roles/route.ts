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

    // Get all players (including those in waiting room)
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

    // Assign roles to as many players as we have roles for
    const playersToAssign = Math.min(players.length, rolePool.length);

    // Reset all players to alive
    await resetPlayersToAlive(id);

    // Clear all votes
    await deleteVotesByGame(id);

    // Reassign roles to players (up to available role count)
    for (let index = 0; index < playersToAssign; index++) {
      const player = players[index];
      const role = rolePool[index];
      await assignRole(player.id, role.id, role);
    }

    return NextResponse.json({
      success: true,
      playerCount: players.length,
      rolesAssigned: playersToAssign,
      waitingRoom: players.length - playersToAssign,
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
