// Health check API endpoint
import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();
    
    // Check Firebase connectivity
    let dbStatus = 'healthy';
    let dbError: string | undefined;
    
    try {
      const db = getAdminDb();
      // Try to read from users collection to test connectivity
      await db.collection('users').limit(1).get();
    } catch (error) {
      dbStatus = 'unhealthy';
      dbError = error instanceof Error ? error.message : 'Unknown database error';
    }
    
    const dbResponseTime = Date.now() - startTime;
    
    // Determine overall health status
    const isHealthy = dbStatus === 'healthy';
    
    const healthData = {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      
      services: {
        database: {
          status: dbStatus,
          responseTime: dbResponseTime,
          error: dbError,
          type: 'Firebase Firestore'
        },
      },
      
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        pid: process.pid,
      },
    };
    
    const statusCode = isHealthy ? 200 : 503;
    return NextResponse.json(healthData, { status: statusCode });
    
  } catch (error) {
    console.error('Health check error:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 503 });
  }
}