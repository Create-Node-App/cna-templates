'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';
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
import { navigateToSameOrigin } from '@/shared/lib/navigation';

// ============================================================================
// Form Values
// ============================================================================

interface TenantLoginFormValues {
  email: string;
}

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
  const t = useTranslations('auth');
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TenantLoginFormValues>({
    resolver: zodResolver(
      z.object({
        email: z.string().min(1, t('emailRequired')).email(t('enterValidEmail')),
      }),
    ),
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
        navigateToSameOrigin(result.url);
      }
    } catch {
      setServerError(t('unexpectedError'));
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
      setServerError(t('failedToStartLogin'));
      setIsLoading(false);
    }
  };

  const emailError = errors.email?.message;
  const hasError = !!emailError || !!serverError;

  return (
    <Card className="w-full border shadow-xl bg-card">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl">{t('signInToTenant', { tenant: tenantName })}</CardTitle>
        <CardDescription>{t('chooseMethod')}</CardDescription>
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
          {isLoading ? t('signingIn') : t('continueWith', { provider: 'Auth0' })}
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">{t('orDevelopmentLogin')}</span>
          </div>
        </div>

        {/* Development Login Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          aria-label={t('devLoginFormLabel')}
          noValidate
        >
          <div className="space-y-2">
            <FormLabel htmlFor="tenant-email" required>
              {t('email')}
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
            {isLoading ? t('signingIn') : t('devLoginShort')}
          </Button>
        </form>

        <p className="text-xs text-center text-muted-foreground mt-4">
          {t('agreeToWorkspace', { tenant: tenantName })}
        </p>
      </CardContent>
    </Card>
  );
}
