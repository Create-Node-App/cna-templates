'use client';

import { Briefcase, Mail } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/shared/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/shared/components/ui/sheet';

interface PersonData {
  id: string;
  name: string;
  email: string;
  title?: string | null;
  department?: string | null;
}

interface PersonSheetProps {
  person: PersonData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenantSlug: string;
}

export function PersonSheet({ person, open, onOpenChange, tenantSlug }: PersonSheetProps) {
  if (!person) return null;

  const initials = person.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-xl font-bold text-primary">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-xl">{person.name}</SheetTitle>
              <SheetDescription className="flex flex-col gap-1 mt-1">
                <span className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {person.email}
                </span>
                {person.title && (
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-3 w-3" />
                    {person.title}
                    {person.department && ` • ${person.department}`}
                  </span>
                )}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6 pt-4 border-t">
          <Link href={`/t/${tenantSlug}/people?q=${encodeURIComponent(person.name)}`}>
            <Button variant="outline" className="w-full">
              View Full Profile
            </Button>
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
