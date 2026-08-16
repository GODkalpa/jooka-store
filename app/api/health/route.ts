// Health check API endpoint for JOOKA E-commerce Platform
import { NextRequest, NextResponse } from 'next/server';

const MEDUSA_BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000';

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();
    let backendStatus = 'healthy';
    let backendError: string | undefined;

    try {
      const res = await fetch(`${MEDUSA_BACKEND_URL}/health`, {
        method: 'GET',
        cache: 'no-store',
      });
      if (!res.ok) {
        backendStatus = 'unreachable';
        backendError = `HTTP ${res.status}`;
      }
    } catch (err) {
      backendStatus = 'unreachable';
      backendError = (err as Error).message;
    }

    const responseTime = Date.now() - startTime;

    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      services: {
        storefront: {
          status: 'healthy',
          type: 'Next.js App Router',
        },
        medusaBackend: {
          status: backendStatus,
          responseTime,
          error: backendError,
          url: MEDUSA_BACKEND_URL,
        },
      },
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
      },
    };

    return NextResponse.json(healthData, { status: 200 });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}