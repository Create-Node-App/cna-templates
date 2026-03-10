'use client';

/**
 * Profile Client Component
 *
 * Simple profile view showing basic person information.
 */

import { Building2, Clock, ExternalLink, Github, Linkedin, Mail, MapPin } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui';

// ============================================================================
// Types
// ============================================================================

interface Person {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string | null;
  email: string;
  title: string | null;
  department: string | null;
  profileInitialized: boolean | null;
}

interface PersonExtra {
  bio: string | null;
  pronouns: string | null;
  location: string | null;
  timezone: string | null;
  githubUsername: string | null;
  linkedinUrl: string | null;
  avatarUrl: string | null;
  isGitHubConnected: boolean;
  isLinkedInConnected: boolean;
}

export type MyRelationType = 'manager' | 'one_to_one' | 'mentor' | 'teacher';

interface ProfileClientProps {
  tenantSlug: string;
  person: Person;
  personExtra?: PersonExtra;
}

// ============================================================================
// Helpers
// ============================================================================

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

// ============================================================================
// Component
// ============================================================================

export function ProfileClient({ tenantSlug: _tenantSlug, person, personExtra }: ProfileClientProps) {
  const t = useTranslations('profile');

  const displayName = person.displayName ?? `${person.firstName} ${person.lastName}`;
  const initials = getInitials(person.firstName, person.lastName);

  return (
    <div className="max-w-3xl mx-auto space-y-6 p-4">
      {/* Header card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <Avatar className="h-24 w-24 text-2xl">
              {personExtra?.avatarUrl && <AvatarImage src={personExtra.avatarUrl} alt={displayName} />}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center sm:text-left space-y-2">
              <div>
                <h1 className="text-2xl font-bold">{displayName}</h1>
                {personExtra?.pronouns && (
                  <span className="text-sm text-muted-foreground">({personExtra.pronouns})</span>
                )}
              </div>

              {person.title && <p className="text-muted-foreground">{person.title}</p>}

              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                {person.department && (
                  <Badge variant="secondary">
                    <Building2 className="mr-1 h-3 w-3" />
                    {person.department}
                  </Badge>
                )}
                {personExtra?.location && (
                  <Badge variant="outline">
                    <MapPin className="mr-1 h-3 w-3" />
                    {personExtra.location}
                  </Badge>
                )}
                {personExtra?.timezone && (
                  <Badge variant="outline">
                    <Clock className="mr-1 h-3 w-3" />
                    {personExtra.timezone}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bio */}
      {personExtra?.bio && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('bio') ?? 'About'}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-line">{personExtra.bio}</p>
          </CardContent>
        </Card>
      )}

      {/* Contact & links */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('contact') ?? 'Contact'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
            <a href={`mailto:${person.email}`} className="text-primary hover:underline truncate">
              {person.email}
            </a>
          </div>

          {personExtra?.githubUsername && (
            <div className="flex items-center gap-2 text-sm">
              <Github className="h-4 w-4 text-muted-foreground shrink-0" />
              <Link
                href={`https://github.com/${personExtra.githubUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline flex items-center gap-1"
              >
                {personExtra.githubUsername}
                <ExternalLink className="h-3 w-3" />
              </Link>
              {personExtra.isGitHubConnected && (
                <Badge variant="secondary" className="text-xs">
                  Connected
                </Badge>
              )}
            </div>
          )}

          {personExtra?.linkedinUrl && (
            <div className="flex items-center gap-2 text-sm">
              <Linkedin className="h-4 w-4 text-muted-foreground shrink-0" />
              <Link
                href={personExtra.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline flex items-center gap-1"
              >
                LinkedIn
                <ExternalLink className="h-3 w-3" />
              </Link>
              {personExtra.isLinkedInConnected && (
                <Badge variant="secondary" className="text-xs">
                  Connected
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
