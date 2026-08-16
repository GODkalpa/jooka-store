// Deprecated registration verification route - redirect to /api/verify-otp
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'This verification method is deprecated. Please use /api/verify-otp for OTP verification.' },
    { status: 410 }
  );
}
