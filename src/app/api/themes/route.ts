import { NextResponse } from 'next/server';
import { getAvailableThemes, getThemeMetadata } from '@/lib/roles';
export const runtime = 'edge';


/**
 * GET /api/themes
 * List all available themes with metadata
 */
export async function GET() {
  try {
    const themeIds = getAvailableThemes();

    const themes = themeIds.map(themeId => {
      const metadata = getThemeMetadata(themeId);
      return {
        id: themeId,
        name: metadata.game_name,
        minPlayers: metadata.min_players,
        maxPlayers: metadata.max_players,
        recommendedPlayers: metadata.recommended_players,
        complexity: metadata.complexity,
      };
    });

    return NextResponse.json({ themes });
  } catch (error) {
    console.error('Error listing themes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
