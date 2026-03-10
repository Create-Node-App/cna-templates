'use client';

import {
  BarChart3,
  Brain,
  Building2,
  ClipboardList,
  Database,
  FileSpreadsheet,
  LayoutDashboard,
  Link2,
  Mail,
  Palette,
  Settings,
  Sliders,
  UserPlus,
  Users,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

import { canShowNav, canShowNavAny } from '@/shared/lib/permissions-ui';

import { SidebarNavItem } from '../SidebarNavItem';
import { SidebarSection } from '../SidebarSection';
import { SidebarSeparator } from '../SidebarSeparator';

interface AdminViewNavProps {
  basePath: string;
  permissions?: string[];
  /** Callback when a nav item is clicked (for closing mobile drawer) */
  onItemClick?: () => void;
}

export function AdminViewNav({ basePath, permissions, onItemClick }: AdminViewNavProps) {
  const tAdmin = useTranslations('admin');
  const adminBase = `${basePath}/admin`;

  return (
    <>
      {/* Dashboard & Analytics - root level with color */}
      {canShowNav(permissions, 'admin:dashboard') && (
        <>
          <SidebarNavItem
            href={adminBase}
            label={tAdmin('dashboard')}
            icon={LayoutDashboard}
            iconTint="primary"
            exact
            onClick={onItemClick}
          />
          <SidebarNavItem
            href={`${adminBase}/analytics`}
            label={tAdmin('analytics')}
            icon={BarChart3}
            iconTint="performance"
            onClick={onItemClick}
          />
        </>
      )}

      <SidebarSeparator />

      {/* People & Operations */}
      {canShowNavAny(permissions, ['admin:members', 'admin:invites', 'admin:onboard', 'admin:settings']) && (
        <SidebarSection title={tAdmin('peopleManagement')} icon={<Users className="h-4 w-4" />} variant="team">
          {canShowNav(permissions, 'admin:members') && (
            <SidebarNavItem
              href={`${adminBase}/members`}
              label={tAdmin('members')}
              icon={Users}
              onClick={onItemClick}
            />
          )}
          {canShowNav(permissions, 'admin:invites') && (
            <SidebarNavItem href={`${adminBase}/invites`} label={tAdmin('invites')} icon={Mail} onClick={onItemClick} />
          )}
          {canShowNav(permissions, 'admin:onboard') && (
            <SidebarNavItem
              href={`${adminBase}/onboard-person`}
              label={tAdmin('onboardPerson')}
              icon={UserPlus}
              onClick={onItemClick}
            />
          )}
          {canShowNav(permissions, 'admin:settings') && (
            <SidebarNavItem
              href={`${adminBase}/departments`}
              label={tAdmin('departments')}
              icon={Building2}
              onClick={onItemClick}
            />
          )}
        </SidebarSection>
      )}

      <SidebarSeparator />

      {/* Settings & System - collapsible by default */}
      {canShowNavAny(permissions, [
        'admin:settings',
        'admin:roles',
        'admin:audit',
        'admin:integrations',
        'admin:members',
      ]) && (
        <SidebarSection
          title="Settings & System"
          icon={<Settings className="h-4 w-4" />}
          variant="admin"
          defaultExpanded={false}
        >
          {canShowNav(permissions, 'admin:settings') && (
            <>
              <SidebarNavItem
                href={`${adminBase}/settings`}
                label={tAdmin('settingsTabs.general')}
                icon={Settings}
                exact
                onClick={onItemClick}
              />
              <SidebarNavItem
                href={`${adminBase}/settings/features`}
                label={tAdmin('settingsTabs.features')}
                icon={Sliders}
                onClick={onItemClick}
              />
              <SidebarNavItem
                href={`${adminBase}/settings/branding`}
                label={tAdmin('settingsTabs.branding')}
                icon={Palette}
                onClick={onItemClick}
              />
              <SidebarNavItem
                href={`${adminBase}/settings/ai-provider`}
                label={tAdmin('settingsTabs.aiProvider')}
                icon={Brain}
                onClick={onItemClick}
              />
              <SidebarNavItem
                href={`${adminBase}/settings/storage`}
                label={tAdmin('settingsTabs.storage')}
                icon={Database}
                onClick={onItemClick}
              />
            </>
          )}
          {canShowNav(permissions, 'admin:roles') && (
            <SidebarNavItem
              href={`${adminBase}/roles`}
              label={tAdmin('rolesAndPermissions')}
              icon={Users}
              onClick={onItemClick}
            />
          )}
          {canShowNav(permissions, 'admin:integrations') && (
            <SidebarNavItem
              href={`${adminBase}/integrations`}
              label={tAdmin('integrations')}
              icon={Link2}
              onClick={onItemClick}
            />
          )}
          {canShowNav(permissions, 'admin:members') && (
            <SidebarNavItem
              href={`${adminBase}/bulk-import`}
              label={tAdmin('bulkImport')}
              icon={FileSpreadsheet}
              onClick={onItemClick}
            />
          )}
          {canShowNav(permissions, 'admin:audit') && (
            <SidebarNavItem
              href={`${adminBase}/audit-logs`}
              label={tAdmin('auditLogs')}
              icon={ClipboardList}
              onClick={onItemClick}
            />
          )}
        </SidebarSection>
      )}
    </>
  );
}
