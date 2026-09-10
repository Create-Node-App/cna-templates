/**
 * LoginForm Component Tests
 */

import { screen, waitFor } from '@testing-library/react';
import { signIn } from 'next-auth/react';

import { renderWithProviders, userEvent } from '@/__tests__/test-utils';
import enMessages from '@/i18n/messages/en.json';
import esMessages from '@/i18n/messages/es.json';

import { LoginForm } from '../LoginForm';

// Resolve translations from the real message catalogs in this suite: the
// global jest mock returns translation keys, which would hide the actual
// rendered copy. (next-intl ships ESM only, so the real provider cannot be
// required from these CommonJS tests.)
const mockLocaleMessages: { current: typeof enMessages } = { current: enMessages };

jest.mock('next-intl', () => ({
  useTranslations:
    (namespace?: string) =>
    (key: string, vars?: Record<string, string | number>): string => {
      const catalog = mockLocaleMessages.current as unknown as Record<string, Record<string, string>>;
      let text: string = catalog[namespace ?? '']?.[key] ?? key;
      for (const [name, value] of Object.entries(vars ?? {})) {
        text = text.replace(`{${name}}`, String(value));
      }
      return text;
    },
  useLocale: () => 'en',
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => children,
}));

function renderLogin(messages: typeof enMessages) {
  mockLocaleMessages.current = messages;
  return renderWithProviders(<LoginForm />);
}

// Mock next-auth
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock same-origin navigation (jsdom freezes window.location, so the
// component delegates navigation to this mockable module).
const navigateToSameOriginMock = jest.fn();

jest.mock('@/shared/lib/navigation', () => ({
  navigateToSameOrigin: (...args: unknown[]) => navigateToSameOriginMock(...args),
}));

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders sign in title and description', () => {
    renderLogin(enMessages);

    expect(screen.getByText('Sign in')).toBeInTheDocument();
    expect(screen.getByText('Choose your preferred sign in method')).toBeInTheDocument();
  });

  it('renders Spanish copy when locale is es', () => {
    renderLogin(esMessages);

    expect(screen.getByText('Iniciar sesión')).toBeInTheDocument();
    expect(screen.getByText('Elige tu método de inicio de sesión')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /continuar con auth0/i })).toBeInTheDocument();
  });

  it('renders Auth0 login button', () => {
    renderLogin(enMessages);

    expect(screen.getByRole('button', { name: /continue with auth0/i })).toBeInTheDocument();
  });

  it('renders development login form with email input', () => {
    renderLogin(enMessages);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /development login/i })).toBeInTheDocument();
  });

  it('shows development login disclaimer', () => {
    renderLogin(enMessages);

    expect(screen.getByText(/development login is only available in development mode/i)).toBeInTheDocument();
  });

  describe('Auth0 Login', () => {
    it('calls signIn with auth0 provider when clicked', async () => {
      const user = userEvent.setup();
      (signIn as jest.Mock).mockResolvedValue({ ok: true });

      renderLogin(enMessages);

      const auth0Button = screen.getByRole('button', { name: /continue with auth0/i });
      await user.click(auth0Button);

      expect(signIn).toHaveBeenCalledWith('auth0', { callbackUrl: '/select-tenant' });
    });

    it('calls signIn with workos provider when NEXT_PUBLIC_AUTH_PROVIDER=workos', async () => {
      const previous = process.env.NEXT_PUBLIC_AUTH_PROVIDER;
      process.env.NEXT_PUBLIC_AUTH_PROVIDER = 'workos';
      try {
        const user = userEvent.setup();
        (signIn as jest.Mock).mockResolvedValue({ ok: true });

        renderLogin(enMessages);

        const workosButton = screen.getByRole('button', { name: /continue with workos/i });
        await user.click(workosButton);

        expect(signIn).toHaveBeenCalledWith('workos', { callbackUrl: '/select-tenant' });
      } finally {
        if (previous === undefined) {
          delete process.env.NEXT_PUBLIC_AUTH_PROVIDER;
        } else {
          process.env.NEXT_PUBLIC_AUTH_PROVIDER = previous;
        }
      }
    });

    it('shows loading state while signing in', async () => {
      const user = userEvent.setup();
      // Create a promise that never resolves to keep loading state
      (signIn as jest.Mock).mockImplementation(() => new Promise(() => {}));

      renderLogin(enMessages);

      const auth0Button = screen.getByRole('button', { name: /continue with auth0/i });
      await user.click(auth0Button);

      // Both buttons show "Signing in..." when loading
      const buttons = screen.getAllByRole('button', { name: /signing in/i });
      expect(buttons).toHaveLength(2);
      expect(buttons[0]).toBeDisabled();
    });

    it('handles auth0 login error', async () => {
      const user = userEvent.setup();
      (signIn as jest.Mock).mockRejectedValue(new Error('Auth0 error'));

      renderLogin(enMessages);

      const auth0Button = screen.getByRole('button', { name: /continue with auth0/i });
      await user.click(auth0Button);

      await waitFor(() => {
        expect(screen.getByText(/failed to initiate login/i)).toBeInTheDocument();
      });
    });
  });

  describe('Development Login', () => {
    it('allows email input', async () => {
      const user = userEvent.setup();
      renderLogin(enMessages);

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'test@example.com');

      expect(emailInput).toHaveValue('test@example.com');
    });

    it('calls signIn with development provider on form submit', async () => {
      const user = userEvent.setup();
      (signIn as jest.Mock).mockResolvedValue({ ok: true, url: '/select-tenant' });

      renderLogin(enMessages);

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'dev@example.com');

      const devButton = screen.getByRole('button', { name: /development login/i });
      await user.click(devButton);

      expect(signIn).toHaveBeenCalledWith('development', {
        email: 'dev@example.com',
        redirect: false,
        callbackUrl: '/select-tenant',
      });
    });

    it('redirects on successful development login', async () => {
      const user = userEvent.setup();
      (signIn as jest.Mock).mockResolvedValue({ ok: true, url: '/select-tenant' });

      renderLogin(enMessages);

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'dev@example.com');

      const devButton = screen.getByRole('button', { name: /development login/i });
      await user.click(devButton);

      await waitFor(() => {
        expect(navigateToSameOriginMock).toHaveBeenCalledWith('/select-tenant');
      });
    });

    it('displays error message on login failure', async () => {
      const user = userEvent.setup();
      (signIn as jest.Mock).mockResolvedValue({ error: 'Invalid email' });

      renderLogin(enMessages);

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'invalid@example.com');

      const devButton = screen.getByRole('button', { name: /development login/i });
      await user.click(devButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid email')).toBeInTheDocument();
      });
    });

    it('shows loading state during form submission', async () => {
      const user = userEvent.setup();
      (signIn as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve({ ok: true, url: '/select-tenant' }), 100);
          }),
      );

      renderLogin(enMessages);

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'dev@example.com');

      const devButton = screen.getByRole('button', { name: /development login/i });
      await user.click(devButton);

      // Both buttons show "Signing in..." when loading
      const buttons = screen.getAllByRole('button', { name: /signing in/i });
      expect(buttons).toHaveLength(2);
      buttons.forEach((btn) => expect(btn).toBeDisabled());
    });

    it('requires email to submit form', async () => {
      renderLogin(enMessages);

      const emailInput = screen.getByLabelText(/email/i);
      expect(emailInput).toBeRequired();
    });

    it('validates email format', async () => {
      renderLogin(enMessages);

      const emailInput = screen.getByLabelText(/email/i);
      expect(emailInput).toHaveAttribute('type', 'email');
    });
  });

  describe('Error handling', () => {
    it('handles unexpected errors gracefully', async () => {
      const user = userEvent.setup();
      (signIn as jest.Mock).mockRejectedValue(new Error('Network error'));

      renderLogin(enMessages);

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'dev@example.com');

      const devButton = screen.getByRole('button', { name: /development login/i });
      await user.click(devButton);

      await waitFor(() => {
        expect(screen.getByText('An unexpected error occurred')).toBeInTheDocument();
      });
    });

    it('clears error when starting new login attempt', async () => {
      const user = userEvent.setup();

      // First attempt - fails
      (signIn as jest.Mock).mockResolvedValueOnce({ error: 'First error' });
      renderLogin(enMessages);

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'dev@example.com');

      const devButton = screen.getByRole('button', { name: /development login/i });
      await user.click(devButton);

      await waitFor(() => {
        expect(screen.getByText('First error')).toBeInTheDocument();
      });

      // Second attempt - should clear error
      (signIn as jest.Mock).mockResolvedValueOnce({ ok: true, url: '/select-tenant' });
      await user.click(devButton);

      await waitFor(() => {
        expect(screen.queryByText('First error')).not.toBeInTheDocument();
      });
    });
  });
});
