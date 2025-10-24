import { NextRequest, NextResponse } from 'next/server';
import { getPlayerById } from '@/lib/models/player';
import { createOrUpdateVote, getVoteByPlayer } from '@/lib/models/vote';

/**
 * POST /api/players/[id]/vote
 * Submit a vote for elimination
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: playerId } = await params;
    const body = await request.json() as { targetId: string };
    const { targetId } = body;

    // Validate request
    if (!targetId) {
      return NextResponse.json(
        { error: 'Target player ID is required' },
        { status: 400 }
      );
    }

    // Get voting player
    const player = await getPlayerById(playerId);
    if (!player) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      );
    }

    // Validate player is alive
    if (!player.isAlive) {
      return NextResponse.json(
        { error: 'Eliminated players cannot vote' },
        { status: 403 }
      );
    }

    // Get target player
    const target = await getPlayerById(targetId);
    if (!target) {
      return NextResponse.json(
        { error: 'Target player not found' },
        { status: 404 }
      );
    }

    // Validate target is in the same game
    if (target.gameId !== player.gameId) {
      return NextResponse.json(
        { error: 'Cannot vote for player in different game' },
        { status: 400 }
      );
    }

    // Validate target is alive
    if (!target.isAlive) {
      return NextResponse.json(
        { error: 'Cannot vote for eliminated players' },
        { status: 400 }
      );
    }

    // Validate not voting for self
    if (playerId === targetId) {
      return NextResponse.json(
        { error: 'Cannot vote for yourself' },
        { status: 400 }
      );
    }

    // Create or update vote
    await createOrUpdateVote({
      gameId: player.gameId,
      playerId,
      targetId,
    });

    return NextResponse.json({
      success: true,
      targetName: target.name,
      canChangeVote: true,
    });
  } catch (error) {
    console.error('Error submitting vote:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/players/[id]/vote
 * Get current vote for a player
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: playerId } = await params;

    // Get player
    const player = await getPlayerById(playerId);
    if (!player) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      );
    }

    // Get vote
    const vote = await getVoteByPlayer(playerId, player.gameId);

    if (!vote) {
      return NextResponse.json({
        hasVoted: false,
      });
    }

    // Get target player name
    const target = await getPlayerById(vote.targetId);

    return NextResponse.json({
      hasVoted: true,
      targetId: vote.targetId,
      targetName: target?.name || 'Unknown',
    });
  } catch (error) {
    console.error('Error getting vote:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
