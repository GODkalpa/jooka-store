// Admin users management API routes
import { NextRequest, NextResponse } from 'next/server';
import { FirebaseAdminDatabaseService } from '@/lib/database/firebase-admin-service';
import { z } from 'zod';
import { baseSchemas } from '@/lib/validation/schemas';

const createUserSchema = z.object({
  email: baseSchemas.email,
  firstName: baseSchemas.name,
  lastName: baseSchemas.name,
  role: z.enum(['admin', 'customer']).default('customer'),
  phone: baseSchemas.phoneOptional,
});

async function getUsers(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');

    const dbService = new FirebaseAdminDatabaseService();
    const result = await dbService.getUsers({ limit });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

async function createUser(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = createUserSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { email, role } = validationResult.data;

    // For now, return a placeholder response since user creation should be handled
    // through Firebase Authentication registration flow
    return NextResponse.json({
      message: 'User creation not yet implemented - use Firebase Auth registration',
      email,
      role
    }, { status: 501 });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

// Temporarily export functions directly without admin check for testing
// TODO: Re-enable admin authentication after testing
export const GET = getUsers;
export const POST = createUser;