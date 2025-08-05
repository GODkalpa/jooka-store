// API route to promote a user to admin (development only)
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { db } from '@/lib/database';
import { updateDocument, COLLECTIONS } from '@/lib/firebase/firestore';

async function promoteUser(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development' },
      { status: 403 }
    );
  }

  try {
    const user = (request as any).user;

    // Check if user is already an admin
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can promote users' },
        { status: 403 }
      );
    }

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user by email using search
    const usersResult = await db.getUsers({ search: email, limit: 1 });

    if (!usersResult.success || !usersResult.data || usersResult.data.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const targetUser = usersResult.data[0];

    if (targetUser.role === 'admin') {
      return NextResponse.json(
        { message: 'User is already an admin' },
        { status: 200 }
      );
    }

    // Promote user to admin
    try {
      await updateDocument(COLLECTIONS.USERS, targetUser.id, { role: 'admin' });
    } catch (error) {
      return NextResponse.json(
        { error: 'Failed to promote user' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'User successfully promoted to admin',
      user: {
        id: targetUser.id,
        email: targetUser.email,
        role: 'admin'
      }
    });

  } catch (error) {
    console.error('Promote user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const POST = withAuth(promoteUser, { requireAdmin: true });