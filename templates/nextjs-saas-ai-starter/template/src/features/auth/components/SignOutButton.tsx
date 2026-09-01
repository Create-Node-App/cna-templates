'use client';

import { signOut } from 'next-auth/react';
import { Button } from '@/shared/components/ui';

export function SignOutButton() {
  return (
    <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: '/' })}>
      Sign Out
    </Button>
  );
}
