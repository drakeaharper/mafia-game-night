import { NextRequest, NextResponse } from 'next/server';
import { getPlayerById, eliminatePlayer, revivePlayer } from '@/lib/models/player';

/**
 * PATCH /api/players/[id]/status
 * Update player alive/eliminated status
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json() as { isAlive: boolean };

    // Validate player exists
    const player = await getPlayerById(id);
    if (!player) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      );
    }

    // Validate request body
    if (typeof body.isAlive !== 'boolean') {
      return NextResponse.json(
        { error: 'isAlive must be a boolean' },
        { status: 400 }
      );
    }

    // Update player status
    if (body.isAlive) {
      await revivePlayer(id);
    } else {
      await eliminatePlayer(id);
    }

    // Return updated player data
    const updatedPlayer = await getPlayerById(id);
    return NextResponse.json({
      id: updatedPlayer!.id,
      name: updatedPlayer!.name,
      isAlive: updatedPlayer!.isAlive,
    });
  } catch (error) {
    console.error('Error updating player status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
