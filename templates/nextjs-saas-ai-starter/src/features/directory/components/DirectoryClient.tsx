'use client';

import { Building2, Mail, MapPin, Search, Users } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useCallback, useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage, Card, Input, Skeleton } from '@/shared/components/ui';
import { useAsyncEffect } from '@/shared/hooks';
import { useTenant } from '@/shared/providers';

interface DirectoryClientProps {
  tenantSlug: string;
}

interface PersonWithDetails {
  id: string;
  displayName: string | null;
  email: string;
  avatarUrl: string | null;
  title: string | null;
  department: string | null;
  departmentId: string | null;
  location: string | null;
  manager?: {
    id: string;
    displayName: string | null;
    email: string;
  };
}

export function DirectoryClient({ tenantSlug }: DirectoryClientProps) {
  const t = useTranslations('directory');
  const { slug } = useTenant();

  const [persons, setPersons] = useState<PersonWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [departments, setDepartments] = useState<Array<{ id: string; name: string }>>([]);

  const loadDirectory = useCallback(async () => {
    try {
      // Get departments
      const deptResponse = await fetch(`/api/tenants/${tenantSlug}/departments`);
      if (deptResponse.ok) {
        const deptData = await deptResponse.json();
        setDepartments(deptData.departments ?? []);
      }

      // Get all persons from directory API
      const response = await fetch(`/api/tenants/${tenantSlug}/directory`);
      if (!response.ok) {
        throw new Error('Failed to load directory');
      }

      const data = await response.json();
      setPersons(data.persons ?? []);
    } catch (error) {
      console.error('Failed to load directory:', error);
    } finally {
      setIsLoading(false);
    }
  }, [tenantSlug]);

  useAsyncEffect(
    async (signal) => {
      await loadDirectory();
      if (!signal.aborted) {
        setIsLoading(false);
      }
    },
    [loadDirectory],
  );

  const filteredPersons = persons.filter((person) => {
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matches =
        person.displayName?.toLowerCase().includes(query) ||
        person.email.toLowerCase().includes(query) ||
        person.title?.toLowerCase().includes(query) ||
        person.department?.toLowerCase().includes(query) ||
        person.location?.toLowerCase().includes(query);
      if (!matches) return false;
    }

    // Department filter
    if (departmentFilter !== 'all') {
      if (departmentFilter === 'none') {
        if (person.departmentId) return false;
      } else {
        if (person.departmentId !== departmentFilter) return false;
      }
    }

    return true;
  });

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return email[0].toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm min-w-[200px]"
          >
            <option value="all">{t('allDepartments')}</option>
            <option value="none">{t('noDepartment')}</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Results */}
      <div className="space-y-3">
        {filteredPersons.length === 0 ? (
          <Card className="p-12 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">{t('noResults')}</p>
          </Card>
        ) : (
          <>
            <div className="text-sm text-muted-foreground">
              {t('showing')} {filteredPersons.length} {t('of')} {persons.length} {t('people')}
            </div>
            {filteredPersons.map((person) => (
              <Link key={person.id} href={`/t/${slug}/team/${person.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <div className="p-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={person.avatarUrl ?? undefined} />
                        <AvatarFallback>{getInitials(person.displayName, person.email)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg">{person.displayName ?? person.email}</h3>
                        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                          {person.title && (
                            <div className="flex items-center gap-1">
                              <span>{person.title}</span>
                            </div>
                          )}
                          {person.department && (
                            <div className="flex items-center gap-1">
                              <Building2 className="h-4 w-4" />
                              <span>{person.department}</span>
                            </div>
                          )}
                          {person.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              <span>{person.location}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            <span>{person.email}</span>
                          </div>
                        </div>
                        {person.manager && (
                          <div className="mt-2 text-xs text-muted-foreground">
                            {t('manager')}: {person.manager.displayName ?? person.manager.email}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
