'use client';

import { Bot, Github, Globe, LayoutDashboard, User } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { SidebarNavItem } from '../SidebarNavItem';
import { SidebarSection } from '../SidebarSection';
import { SidebarSeparator } from '../SidebarSeparator';

interface MyViewNavProps {
  basePath: string;
  onItemClick?: () => void;
}

export function MyViewNav({ basePath, onItemClick }: MyViewNavProps) {
  const t = useTranslations('nav');

  return (
    <>
      <SidebarNavItem
        href={basePath}
        label={t('dashboard')}
        icon={LayoutDashboard}
        iconTint="primary"
        exact
        onClick={onItemClick}
      />
      <SidebarNavItem
        href={`${basePath}/assistant`}
        label={t('assistant')}
        icon={Bot}
        iconTint="assistant"
        onClick={onItemClick}
      />

      <SidebarSeparator />

      <SidebarSection title={t('myProfile')} icon={<User className="h-4 w-4" />} variant="default">
        <SidebarNavItem href={`${basePath}/profile`} label={t('overview')} icon={User} exact onClick={onItemClick} />
      </SidebarSection>

      <SidebarSection title={t('integrations')} icon={<Globe className="h-4 w-4" />} variant="default">
        <SidebarNavItem href={`${basePath}/profile?tab=github`} label="GitHub" icon={Github} onClick={onItemClick} />
      </SidebarSection>
    </>
  );
}
