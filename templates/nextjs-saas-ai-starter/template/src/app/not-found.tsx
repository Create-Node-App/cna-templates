import { Home } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';

// Force dynamic rendering to avoid static generation issues with next-intl
export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-muted">
      <Card className="max-w-md border-0 shadow-xl">
        <CardContent className="flex flex-col items-center py-12 px-8 text-center">
          <div className="relative">
            <div className="text-8xl mb-6 opacity-80">404</div>
            <div className="absolute -top-2 -right-2 text-4xl">🔍</div>
          </div>
          <h2 className="text-2xl font-bold mb-2">Page Not Found</h2>
          <p className="text-muted-foreground mb-8">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <div className="flex gap-3">
            <Link href="/">
              <Button>
                <Home className="mr-2 h-4 w-4" />
                Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
