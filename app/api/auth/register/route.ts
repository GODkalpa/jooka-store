// Deprecated registration route - redirect to /api/register-otp
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'This registration method is deprecated. Please use /api/register-otp for OTP-based registration.' },
    { status: 410 }
  );
}
