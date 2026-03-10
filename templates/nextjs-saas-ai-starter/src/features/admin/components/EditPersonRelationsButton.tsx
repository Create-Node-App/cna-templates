'use client';

import { Users } from 'lucide-react';
import { useState } from 'react';

import { PersonRelationsDialog } from '@/features/admin/components/PersonRelationsDialog';
import { listTenantPersonsForRelations } from '@/features/admin/services/members-service';
import { Button } from '@/shared/components/ui';

interface EditPersonRelationsButtonProps {
  tenantSlug: string;
  personId: string;
  personName: string;
}

export function EditPersonRelationsButton({ tenantSlug, personId, personName }: EditPersonRelationsButtonProps) {
  const [open, setOpen] = useState(false);
  const [availablePersons, setAvailablePersons] = useState<
    Array<{ id: string; displayName: string | null; email: string; avatarUrl: string | null }>
  >([]);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      listTenantPersonsForRelations(tenantSlug).then((res) => {
        if (res.success && res.data) {
          setAvailablePersons(res.data);
        }
      });
    }
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => handleOpenChange(true)} className="gap-2">
        <Users className="h-4 w-4" />
        Edit relations
      </Button>
      <PersonRelationsDialog
        open={open}
        onOpenChange={handleOpenChange}
        tenantSlug={tenantSlug}
        personId={personId}
        personName={personName}
        availablePersons={availablePersons}
      />
    </>
  );
}
