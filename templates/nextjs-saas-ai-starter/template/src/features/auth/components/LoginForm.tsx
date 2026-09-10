'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Lock } from 'lucide-react';
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
import { getAuthProviderDisplayName, getPublicAuthProviderId } from '@/shared/lib/auth-providers';
import { navigateToSameOrigin } from '@/shared/lib/navigation';

// ============================================================================
// Form Values
// ============================================================================

interface LoginFormValues {
  email: string;
}

// ============================================================================
// Component
// ============================================================================

interface LoginFormProps {
  /** Pre-fill email (e.g. from ?email= in URL) */
  initialEmail?: string;
}

export const LoginForm = ({ initialEmail = '' }: LoginFormProps) => {
  const t = useTranslations('auth');
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(
      z.object({
        email: z.string().min(1, t('emailRequired')).email(t('enterValidEmail')),
      }),
    ),
    defaultValues: {
      email: initialEmail,
    },
  });

  // Callback URL goes to tenant selector which handles smart redirect
  const callbackUrl = '/select-tenant';

  // Handle development credentials login
  const onSubmit = async (data: LoginFormValues) => {
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

  // Active production SSO provider (Auth0 default, WorkOS when configured)
  const ssoProviderId = getPublicAuthProviderId();
  const ssoProviderName = getAuthProviderDisplayName(ssoProviderId);

  // Handle SSO login with the active provider
  const handleSsoLogin = async () => {
    setIsLoading(true);
    try {
      await signIn(ssoProviderId, { callbackUrl });
    } catch {
      setServerError(t('failedToStartLogin'));
      setIsLoading(false);
    }
  };

  const emailError = errors.email?.message;
  const hasError = !!emailError || !!serverError;

  return (
    <Card className="w-full border shadow-xl bg-card backdrop-blur-sm">
      <CardHeader className="space-y-1 text-center pb-6">
        <CardTitle className="text-2xl font-bold">{t('signInTitle')}</CardTitle>
        <CardDescription>{t('chooseMethod')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormGlobalError visible={!!serverError} id="login-server-error">
          {serverError}
        </FormGlobalError>

        {/* SSO Login Button (active provider) */}
        <Button
          type="button"
          className="w-full h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 text-base font-semibold group"
          onClick={handleSsoLogin}
          disabled={isLoading}
          aria-busy={isLoading}
        >
          <Lock className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
          {isLoading ? t('signingIn') : t('continueWith', { provider: ssoProviderName })}
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/50" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-3 py-1 text-muted-foreground font-medium rounded-full">
              {t('orDevelopmentLogin')}
            </span>
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
            <FormLabel htmlFor="email" required>
              {t('email')}
            </FormLabel>
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              {...register('email')}
              aria-required="true"
              aria-invalid={hasError ? 'true' : undefined}
              aria-describedby={emailError ? 'email-error' : serverError ? 'login-server-error' : undefined}
              className={emailError ? 'h-11 border-destructive focus-visible:ring-destructive' : 'h-11'}
            />
            <FormFieldError visible={!!emailError} id="email-error">
              {emailError}
            </FormFieldError>
          </div>
          <Button
            type="submit"
            variant="outline"
            className="w-full h-11 shadow-sm hover:bg-muted/50 transition-colors"
            disabled={isLoading}
            aria-busy={isLoading}
          >
            {isLoading ? t('signingIn') : t('developmentLogin')}
          </Button>
        </form>

        <p className="text-xs text-center text-muted-foreground pt-2">{t('devLoginOnly')}</p>
      </CardContent>
    </Card>
  );
};
