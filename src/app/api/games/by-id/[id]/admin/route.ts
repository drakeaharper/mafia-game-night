import { NextRequest, NextResponse } from 'next/server';
import { getGameById } from '@/lib/models/game';
import { getPlayersByGameId } from '@/lib/models/player';
import { getVotesByGame, getVoteCounts } from '@/lib/models/vote';
export const runtime = 'edge';


/**
 * GET /api/games/by-id/[id]/admin
 * Get game details with full player role data for Game Master
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

    // Return game with full player data including roles
    const fullPlayers = players.map(p => ({
      id: p.id,
      name: p.name,
      isAlive: p.isAlive,
      hasRole: p.role !== null,
      role: p.role,
      roleData: p.roleData,
      joinedAt: p.joinedAt,
    }));

    // Get vote information
    const votes = await getVotesByGame(id);
    const voteCounts = await getVoteCounts(id);

    // Convert vote counts Map to object
    const voteCountsObj: Record<string, number> = {};
    voteCounts.forEach((count, playerId) => {
      voteCountsObj[playerId] = count;
    });

    // Create vote details with voter names
    const voteDetails = votes.map(vote => {
      const voter = players.find(p => p.id === vote.playerId);
      const target = players.find(p => p.id === vote.targetId);
      return {
        voterId: vote.playerId,
        voterName: voter?.name || 'Unknown',
        targetId: vote.targetId,
        targetName: target?.name || 'Unknown',
        createdAt: vote.createdAt,
      };
    });

    return NextResponse.json({
      ...game,
      players: fullPlayers,
      votes: {
        all: voteDetails,
        counts: voteCountsObj,
        totalVotes: votes.length,
      },
    });
  } catch (error) {
    console.error('Error getting game for admin:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
