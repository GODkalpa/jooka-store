// Individual notification API routes
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { db } from '@/lib/database/index';

async function markAsRead(request: NextRequest, { params }: { params: { id: string } }) {
  const notificationId = params.id;
  
  try {
    const result = await db.markNotificationAsRead(notificationId);
    
    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({ 
      message: 'Notification marked as read',
      data: result.data 
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    return NextResponse.json(
      { error: 'Failed to mark notification as read' },
      { status: 500 }
    );
  }
}

export const PUT = withAuth(markAsRead);