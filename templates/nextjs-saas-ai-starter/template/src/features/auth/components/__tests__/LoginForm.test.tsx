/**
 * LoginForm Component Tests
 */

import { screen, waitFor } from '@testing-library/react';
import { signIn } from 'next-auth/react';

import { renderWithProviders, userEvent } from '@/__tests__/test-utils';

import { LoginForm } from '../LoginForm';

// Mock next-auth
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock window.location
const mockLocation = {
  href: '',
  origin: 'http://localhost',
  assign: jest.fn(),
  replace: jest.fn(),
};

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocation.href = '';
  });

  it('renders sign in title and description', () => {
    renderWithProviders(<LoginForm />);

    expect(screen.getByText('Sign in')).toBeInTheDocument();
    expect(screen.getByText('Choose your preferred sign in method')).toBeInTheDocument();
  });

  it('renders Auth0 login button', () => {
    renderWithProviders(<LoginForm />);

    expect(screen.getByRole('button', { name: /continue with auth0/i })).toBeInTheDocument();
  });

  it('renders development login form with email input', () => {
    renderWithProviders(<LoginForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /development login/i })).toBeInTheDocument();
  });

  it('shows development login disclaimer', () => {
    renderWithProviders(<LoginForm />);

    expect(screen.getByText(/development login is only available in development mode/i)).toBeInTheDocument();
  });

  describe('Auth0 Login', () => {
    it('calls signIn with auth0 provider when clicked', async () => {
      const user = userEvent.setup();
      (signIn as jest.Mock).mockResolvedValue({ ok: true });

      renderWithProviders(<LoginForm />);

      const auth0Button = screen.getByRole('button', { name: /continue with auth0/i });
      await user.click(auth0Button);

      expect(signIn).toHaveBeenCalledWith('auth0', { callbackUrl: '/select-tenant' });
    });

    it('shows loading state while signing in', async () => {
      const user = userEvent.setup();
      // Create a promise that never resolves to keep loading state
      (signIn as jest.Mock).mockImplementation(() => new Promise(() => {}));

      renderWithProviders(<LoginForm />);

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

      renderWithProviders(<LoginForm />);

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
      renderWithProviders(<LoginForm />);

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'test@example.com');

      expect(emailInput).toHaveValue('test@example.com');
    });

    it('calls signIn with development provider on form submit', async () => {
      const user = userEvent.setup();
      (signIn as jest.Mock).mockResolvedValue({ ok: true, url: '/select-tenant' });

      renderWithProviders(<LoginForm />);

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

      renderWithProviders(<LoginForm />);

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'dev@example.com');

      const devButton = screen.getByRole('button', { name: /development login/i });
      await user.click(devButton);

      await waitFor(() => {
        expect(mockLocation.href).toBe('/select-tenant');
      });
    });

    it('displays error message on login failure', async () => {
      const user = userEvent.setup();
      (signIn as jest.Mock).mockResolvedValue({ error: 'Invalid email' });

      renderWithProviders(<LoginForm />);

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

      renderWithProviders(<LoginForm />);

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
      renderWithProviders(<LoginForm />);

      const emailInput = screen.getByLabelText(/email/i);
      expect(emailInput).toBeRequired();
    });

    it('validates email format', async () => {
      renderWithProviders(<LoginForm />);

      const emailInput = screen.getByLabelText(/email/i);
      expect(emailInput).toHaveAttribute('type', 'email');
    });
  });

  describe('Error handling', () => {
    it('handles unexpected errors gracefully', async () => {
      const user = userEvent.setup();
      (signIn as jest.Mock).mockRejectedValue(new Error('Network error'));

      renderWithProviders(<LoginForm />);

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
      renderWithProviders(<LoginForm />);

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
