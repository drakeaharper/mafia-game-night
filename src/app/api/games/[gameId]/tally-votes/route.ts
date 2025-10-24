import { NextRequest, NextResponse } from 'next/server';
import { getGameById } from '@/lib/models/game';
import { getPlayerById, eliminatePlayer } from '@/lib/models/player';
import { getPlayersWithMostVotes, getVoteCounts, deleteVotesByGame } from '@/lib/models/vote';

/**
 * POST /api/games/[gameId]/tally-votes
 * Tally votes and eliminate the player with the most votes
 * If tie, requires targetPlayerId in request body to resolve
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;
    const body = await request.json() as { targetPlayerId?: string };
    const { targetPlayerId } = body; // Optional: for tie resolution

    // Verify game exists
    const game = await getGameById(gameId);
    if (!game) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }

    // Get vote counts
    const voteCounts = await getVoteCounts(gameId);
    const voteCountsObj: Record<string, number> = {};
    voteCounts.forEach((count, playerId) => {
      voteCountsObj[playerId] = count;
    });

    // Check if there are any votes
    if (voteCounts.size === 0) {
      return NextResponse.json({
        success: false,
        error: 'No votes have been cast',
        voteSummary: voteCountsObj,
      });
    }

    // Get player(s) with most votes
    const topPlayers = await getPlayersWithMostVotes(gameId);

    // Handle tie
    if (topPlayers.length > 1) {
      // If targetPlayerId provided, use it to resolve tie
      if (targetPlayerId) {
        // Verify the target is one of the tied players
        const isValidTieResolution = topPlayers.some(p => p.playerId === targetPlayerId);
        if (!isValidTieResolution) {
          return NextResponse.json(
            { error: 'Selected player is not part of the tie' },
            { status: 400 }
          );
        }

        // Eliminate the selected player
        const target = await getPlayerById(targetPlayerId);
        if (!target) {
          return NextResponse.json(
            { error: 'Target player not found' },
            { status: 404 }
          );
        }

        await eliminatePlayer(targetPlayerId);

        // Automatically clear votes after successful elimination
        await deleteVotesByGame(gameId);

        return NextResponse.json({
          success: true,
          tieResolved: true,
          eliminatedPlayer: {
            id: target.id,
            name: target.name,
            voteCount: topPlayers.find(p => p.playerId === targetPlayerId)!.voteCount,
          },
          votesCleared: true,
          voteSummary: voteCountsObj,
        });
      }

      // Return tie information for admin to resolve
      const tiedPlayers = await Promise.all(topPlayers.map(async tp => {
        const player = await getPlayerById(tp.playerId);
        return {
          id: tp.playerId,
          name: player?.name || 'Unknown',
          voteCount: tp.voteCount,
        };
      }));

      return NextResponse.json({
        success: false,
        tie: true,
        tiedPlayers,
        voteSummary: voteCountsObj,
      });
    }

    // Clear winner - eliminate them
    const winner = topPlayers[0];
    const target = await getPlayerById(winner.playerId);

    if (!target) {
      return NextResponse.json(
        { error: 'Target player not found' },
        { status: 404 }
      );
    }

    if (!target.isAlive) {
      return NextResponse.json(
        { error: 'Target player is already eliminated' },
        { status: 400 }
      );
    }

    await eliminatePlayer(winner.playerId);

    // Automatically clear votes after successful elimination
    await deleteVotesByGame(gameId);

    return NextResponse.json({
      success: true,
      eliminatedPlayer: {
        id: target.id,
        name: target.name,
        voteCount: winner.voteCount,
      },
      votesCleared: true,
      voteSummary: voteCountsObj,
    });
  } catch (error) {
    console.error('Error tallying votes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/games/[gameId]/tally-votes
 * Clear all votes for the game (for next round)
 */
export async function DELETE(
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

    // Delete all votes
    await deleteVotesByGame(gameId);

    return NextResponse.json({
      success: true,
      message: 'All votes cleared',
    });
  } catch (error) {
    console.error('Error clearing votes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
