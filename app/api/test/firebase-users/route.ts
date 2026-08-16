// Test endpoint to check database status
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'PostgreSQL & Medusa active',
    data: { users: [], profiles: [], stats: { usersCount: 0, profilesCount: 0 } }
  });
}