import { sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db } from '@/shared/db';

/**
 * Health Check Endpoint
 *
 * Returns the health status of the application and its dependencies.
 * Used by load balancers, Kubernetes probes, and monitoring systems.
 *
 * GET /api/health
 */
export async function GET() {
  const startTime = Date.now();
  const checks: Record<string, { status: 'healthy' | 'unhealthy'; latency?: number; error?: string }> = {};

  // Database health check
  try {
    const dbStart = Date.now();
    await db.execute(sql`SELECT 1`);
    checks.database = {
      status: 'healthy',
      latency: Date.now() - dbStart,
    };
  } catch (error) {
    checks.database = {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown database error',
    };
  }

  // Overall status
  const isHealthy = Object.values(checks).every((check) => check.status === 'healthy');

  const response = {
    status: isHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '0.0.0',
    environment: process.env.NODE_ENV,
    checks,
    responseTime: Date.now() - startTime,
  };

  return NextResponse.json(response, {
    status: isHealthy ? 200 : 503,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}
