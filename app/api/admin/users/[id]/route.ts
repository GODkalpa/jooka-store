// Individual user management API routes
import { NextRequest, NextResponse } from 'next/server';
import { FirebaseAdminDatabaseService } from '@/lib/database/firebase-admin-service';
import { requireAdmin } from '@/lib/auth/middleware';
import { z } from 'zod';

const updateUserRoleSchema = z.object({
  role: z.enum(['admin', 'customer']),
});

async function updateUserRole(request: NextRequest, context: { params: { id: string } }) {
  const { params } = context;
  const userId = params.id;
  
  try {
    const body = await request.json();
    const validationResult = updateUserRoleSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { role } = validationResult.data;
    
    console.log(`Updating user ${userId} role to ${role}`);
    
    const dbService = new FirebaseAdminDatabaseService();
    
    // Update user role in Firestore
    const result = await dbService.updateUserRole(userId, role);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to update user role' },
        { status: 500 }
      );
    }

    console.log(`User ${userId} role updated to ${role} successfully`);
    return NextResponse.json({ 
      message: 'User role updated successfully',
      userId,
      role
    });
  } catch (error) {
    console.error('Update user role error:', error);
    return NextResponse.json(
      { error: 'Failed to update user role' },
      { status: 500 }
    );
  }
}

async function deleteUser(request: NextRequest, context: { params: { id: string } }) {
  const { params } = context;
  const userId = params.id;

  try {
    console.log(`Attempting to delete user: ${userId}`);
    
    const dbService = new FirebaseAdminDatabaseService();
    
    // Delete user from Firebase Authentication and Firestore
    const result = await dbService.deleteUser(userId);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to delete user' },
        { status: 500 }
      );
    }

    console.log(`User ${userId} deleted successfully`);
    return NextResponse.json({ 
      message: 'User deleted successfully',
      userId
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}

// Temporarily export without admin authentication middleware for testing
export async function PUT(request: NextRequest, context: { params: { id: string } }) {
  // TODO: Re-enable admin authentication after testing
  // const adminResult = await requireAdmin(request);
  // if (adminResult) return adminResult;
  
  return updateUserRole(request, context);
}

export async function DELETE(request: NextRequest, context: { params: { id: string } }) {
  // TODO: Re-enable admin authentication after testing
  // const adminResult = await requireAdmin(request);
  // if (adminResult) return adminResult;
  
  return deleteUser(request, context);
}