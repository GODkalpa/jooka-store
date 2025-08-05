// Temporary users API that bypasses authentication for debugging
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database/index';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Fetching users with Firebase database service...');
    console.log('🔧 Database service type:', typeof db);
    console.log('🔧 Database service methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(db)));
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || undefined;
    const role = searchParams.get('role') || undefined;

    console.log('📋 Query parameters:', { page, limit, search, role });

    const result = await db.getUsers({
      search,
      role,
      page,
      limit
    });

    console.log('📊 Users query result:', { 
      total: result.total, 
      dataLength: result.data?.length,
      hasError: !!result.error,
      errorMessage: result.error,
      sampleData: result.data?.slice(0, 2) // Show first 2 users for debugging
    });

    if (result.error) {
      console.error('❌ Users query error:', result.error);
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    console.log('✅ Returning users data successfully');
    return NextResponse.json({
      data: result.data || [],
      pagination: {
        page,
        limit,
        total: result.total || 0,
        totalPages: Math.ceil((result.total || 0) / limit)
      }
    });
    
  } catch (error) {
    console.error('💥 Get users error:', error);
    console.error('💥 Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { error: `Failed to fetch users: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
