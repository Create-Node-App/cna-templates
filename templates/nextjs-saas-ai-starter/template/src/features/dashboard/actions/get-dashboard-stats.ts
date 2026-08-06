'use server';

import { count, desc, eq } from 'drizzle-orm';

import { db } from '@/shared/db';
import { auditEvents, persons } from '@/shared/db/schema';
import { auth } from '@/shared/lib/auth';
import { logger } from '@/shared/lib/logger';

export interface DashboardStats {
  teamSize: number;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  action: string;
  entityType: string | null;
  entityId: string | null;
  createdAt: Date;
}

export interface DashboardStatsResult {
  success: boolean;
  data?: DashboardStats;
  error?: string;
}

export async function getDashboardStats(tenantId: string): Promise<DashboardStatsResult> {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return { success: false, error: 'Not authenticated' };
    }

    const [teamCount] = await db.select({ count: count() }).from(persons).where(eq(persons.tenantId, tenantId));

    const recentEvents = await db.query.auditEvents.findMany({
      where: eq(auditEvents.tenantId, tenantId),
      orderBy: [desc(auditEvents.timestamp)],
      limit: 10,
    });

    const recentActivity: ActivityItem[] = recentEvents.map((e) => ({
      id: e.id,
      action: e.action,
      entityType: e.entityType,
      entityId: e.entityId,
      createdAt: e.timestamp,
    }));

    return {
      success: true,
      data: {
        teamSize: teamCount?.count ?? 0,
        recentActivity,
      },
    };
  } catch (error) {
    logger.error({ error }, 'Error fetching dashboard stats');
    return { success: false, error: 'Failed to fetch dashboard stats' };
  }
}
