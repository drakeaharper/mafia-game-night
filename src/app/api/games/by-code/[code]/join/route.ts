import { NextRequest, NextResponse } from 'next/server';
import { getGameByCode } from '@/lib/models/game';
import { createPlayer, isPlayerNameTaken } from '@/lib/models/player';
export const runtime = 'edge';


/**
 * POST /api/games/by-code/[code]/join
 * Join a game by code
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const body = await request.json() as { name: string };
    const { name } = body;

    // Validate input
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    if (name.trim().length > 20) {
      return NextResponse.json(
        { error: 'Name must be 20 characters or less' },
        { status: 400 }
      );
    }

    // Find game by code
    const game = await getGameByCode(code);
    if (!game) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }

    // Check if game already started
    if (game.state !== 'waiting') {
      return NextResponse.json(
        { error: 'Game has already started' },
        { status: 400 }
      );
    }

    // Check if name is already taken
    if (await isPlayerNameTaken(game.id, name.trim())) {
      return NextResponse.json(
        { error: 'Name is already taken in this game' },
        { status: 409 }
      );
    }

    // Create player
    const player = await createPlayer({
      gameId: game.id,
      name: name.trim(),
    });

    return NextResponse.json(player, { status: 201 });
  } catch (error) {
    console.error('Error joining game:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
