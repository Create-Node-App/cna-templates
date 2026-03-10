'use client';

/**
 * People Directory Client
 *
 * Lists all people in the tenant.
 */

import { Search, Users } from 'lucide-react';
import { useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { PageHeader } from '@/shared/components/ui/page-header';

interface Person {
  id: string;
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  title: string | null;
  department: string | null;
  avatarUrl: string | null;
}

interface PeopleFinderClientProps {
  tenantSlug: string;
  persons: Person[];
}

export function PeopleFinderClient({ tenantSlug, persons }: PeopleFinderClientProps) {
  const [query, setQuery] = useState('');

  const filtered = persons.filter((p) => {
    if (!query.trim()) return true;
    const name = p.displayName ?? `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim();
    const lower = query.toLowerCase();
    return (
      name.toLowerCase().includes(lower) ||
      (p.email ?? '').toLowerCase().includes(lower) ||
      (p.department ?? '').toLowerCase().includes(lower) ||
      (p.title ?? '').toLowerCase().includes(lower)
    );
  });

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={{
          backTo: `/t/${tenantSlug}`,
          backLabel: 'Dashboard',
          current: 'People',
        }}
        variant="hero"
        icon={<Users className="h-5 w-5" />}
        title="People Directory"
        description="Find and connect with people in your organization"
      />

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-10"
          placeholder="Search by name, role, department..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No people found matching your search.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((person) => {
            const name =
              (person.displayName ?? `${person.firstName ?? ''} ${person.lastName ?? ''}`.trim()) || person.email || '';
            const initials = name
              .split(' ')
              .map((n) => n[0])
              .slice(0, 2)
              .join('')
              .toUpperCase();

            return (
              <Card key={person.id} className="hover:shadow-md transition-shadow">
                <CardContent className="flex items-start gap-4 p-4">
                  <Avatar className="h-12 w-12 shrink-0">
                    {person.avatarUrl && <AvatarImage src={person.avatarUrl} alt={name} />}
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{name}</p>
                    {person.title && <p className="text-sm text-muted-foreground truncate">{person.title}</p>}
                    {person.department && (
                      <Badge variant="secondary" className="mt-1 text-xs">
                        {person.department}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
