/**
 * Dashboard Feature Types
 */

export interface DashboardStats {
  teamSize: number;
  recentActivity: ActivityItem[];
  profileCompletion: number;
  conversationsCount: number;
  webhooksCount?: number;
}

export interface ActivityItem {
  id: string;
  type: 'profile_update' | 'ai_conversation' | 'member_joined' | 'invitation_sent' | 'integration_synced';
  title: string;
  description?: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface DashboardStatsResult {
  success: boolean;
  stats?: DashboardStats;
  error?: string;
}
