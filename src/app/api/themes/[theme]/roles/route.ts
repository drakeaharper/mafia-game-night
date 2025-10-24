import { NextRequest, NextResponse } from 'next/server';
import { getRolesForTheme } from '@/lib/roles';

/**
 * GET /api/themes/[theme]/roles
 * Get all roles for a specific theme
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ theme: string }> }
) {
  try {
    const { theme } = await params;
    const roles = getRolesForTheme(theme);

    return NextResponse.json({ roles });
  } catch (error) {
    console.error('Error fetching roles:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
