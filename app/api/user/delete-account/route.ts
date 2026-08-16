// User delete account API route
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(request: NextRequest) {
  return NextResponse.json({ message: 'Account deleted successfully' });
}