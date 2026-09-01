'use client';

/**
 * AI Assistant Error Boundary
 *
 * Provides a contextual error message for AI assistant errors.
 */

import { AlertTriangle, Bot, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';

import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { logger } from '@/shared/lib/logger';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AssistantError({ error, reset }: ErrorProps) {
  const params = useParams();
  const tenantSlug = params.tenant as string;

  useEffect(() => {
    logger.error({ error: error.message, digest: error.digest }, 'AI Assistant error');
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-96">
      <Card className="max-w-md border-destructive/20">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-950">
            <Bot className="h-7 w-7 text-purple-600 dark:text-purple-400" />
          </div>
          <CardTitle className="text-xl">AI Assistant Unavailable</CardTitle>
          <CardDescription>
            The AI assistant encountered an error. This might be a temporary issue with the AI service.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{error.message || 'An unexpected error occurred'}</span>
            </div>
            {error.digest && <p className="mt-2 text-xs font-mono opacity-70">Error ID: {error.digest}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Button onClick={reset}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try again
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/t/${tenantSlug}`}>Return to Dashboard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
