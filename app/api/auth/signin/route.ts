// Sign in API route for Firebase
import { NextRequest, NextResponse } from 'next/server';
import { signInWithEmailPassword } from '@/lib/firebase/auth-fallback';

export async function POST(request: NextRequest) {
  try {
    console.log('Sign in API called');
    
    const body = await request.json();
    const { email, password } = body;
    
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    console.log('Attempting to sign in user:', email);

    // Sign in with Firebase Auth
    const result = await signInWithEmailPassword(email, password);

    if (!result.success) {
      console.error('Failed to sign in user:', result.error);
      return NextResponse.json(
        { error: result.error || 'Failed to sign in' },
        { status: 401 }
      );
    }

    console.log('User signed in successfully:', result.user?.uid);

    return NextResponse.json({
      message: 'Signed in successfully',
      userId: result.user?.uid
    });

  } catch (error) {
    console.error('Sign in error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}