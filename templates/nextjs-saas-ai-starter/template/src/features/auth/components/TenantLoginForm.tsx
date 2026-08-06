'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  FormFieldError,
  FormGlobalError,
  FormLabel,
  Input,
} from '@/shared/components/ui';

// ============================================================================
// Validation Schema
// ============================================================================

const tenantLoginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
});

type TenantLoginFormValues = z.infer<typeof tenantLoginSchema>;

// ============================================================================
// Component
// ============================================================================

interface TenantLoginFormProps {
  tenantSlug: string;
  tenantName: string;
  /** Pre-fill email (e.g. from ?email= in URL) */
  initialEmail?: string;
}

export function TenantLoginForm({ tenantSlug, tenantName, initialEmail = '' }: TenantLoginFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TenantLoginFormValues>({
    resolver: zodResolver(tenantLoginSchema),
    defaultValues: {
      email: initialEmail,
    },
  });

  // Callback URL points to the tenant dashboard
  const callbackUrl = `/t/${tenantSlug}`;

  // Handle development credentials login
  const onSubmit = async (data: TenantLoginFormValues) => {
    setIsLoading(true);
    setServerError(null);

    try {
      const result = await signIn('development', {
        email: data.email,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setServerError(result.error);
      } else if (result?.url) {
        // Keep navigation on current origin even if Auth.js returns an absolute URL with a stale host.
        const target = new URL(result.url, window.location.origin);
        window.location.href = `${target.pathname}${target.search}${target.hash}`;
      }
    } catch {
      setServerError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Auth0 login
  const handleAuth0Login = async () => {
    setIsLoading(true);
    try {
      await signIn('auth0', { callbackUrl });
    } catch {
      setServerError('Failed to initiate login');
      setIsLoading(false);
    }
  };

  const emailError = errors.email?.message;
  const hasError = !!emailError || !!serverError;

  return (
    <Card className="w-full border shadow-xl bg-card">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl">Sign in to {tenantName}</CardTitle>
        <CardDescription>Choose your preferred sign in method</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormGlobalError visible={!!serverError} id="tenant-login-error">
          {serverError}
        </FormGlobalError>

        {/* Auth0 Login Button */}
        <Button
          type="button"
          className="w-full h-12 bg-primary hover:opacity-90 shadow-md text-base font-medium"
          onClick={handleAuth0Login}
          disabled={isLoading}
          aria-busy={isLoading}
        >
          {isLoading ? 'Signing in...' : 'Continue with Auth0'}
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or development login</span>
          </div>
        </div>

        {/* Development Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" aria-label="Development login form" noValidate>
          <div className="space-y-2">
            <FormLabel htmlFor="tenant-email" required>
              Email
            </FormLabel>
            <Input
              id="tenant-email"
              type="email"
              placeholder="admin@example.com"
              {...register('email')}
              aria-required="true"
              aria-invalid={hasError ? 'true' : undefined}
              aria-describedby={emailError ? 'tenant-email-error' : serverError ? 'tenant-login-error' : undefined}
              disabled={isLoading}
              className={emailError ? 'h-11 border-destructive focus-visible:ring-destructive' : 'h-11'}
            />
            <FormFieldError visible={!!emailError} id="tenant-email-error">
              {emailError}
            </FormFieldError>
          </div>
          <Button type="submit" variant="outline" className="w-full h-11" disabled={isLoading} aria-busy={isLoading}>
            {isLoading ? 'Signing in...' : 'Dev Login'}
          </Button>
        </form>

        <p className="text-xs text-center text-muted-foreground mt-4">
          By signing in, you agree to access {tenantName}&apos;s workspace.
        </p>
      </CardContent>
    </Card>
  );
}
