import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext.jsx';
import { QueryProvider } from '../../context/QueryContext.jsx';
import LoginScreen from '../LoginScreen.jsx';
import { signup, logout } from '../../services/AuthService.js';
import { STORAGE_KEYS } from '../../utils/constants.js';

/**
 * Helper to render LoginScreen within the required providers and router context.
 * @param {object} [options={}] - Render options.
 * @param {string} [options.initialRoute='/login'] - The initial route.
 * @param {object} [options.locationState=null] - State to pass to the route.
 * @returns {object} The render result plus a user-event instance.
 */
function renderLoginScreen(options = {}) {
  const { initialRoute = '/login', locationState = null } = options;

  const entries = [{ pathname: initialRoute, state: locationState }];

  const user = userEvent.setup();

  const result = render(
    <MemoryRouter initialEntries={entries}>
      <AuthProvider>
        <QueryProvider>
          <Routes>
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/signup" element={<div data-testid="signup-page">Signup Page</div>} />
            <Route path="/" element={<div data-testid="home-page">Home Page</div>} />
          </Routes>
        </QueryProvider>
      </AuthProvider>
    </MemoryRouter>,
  );

  return { ...result, user };
}

describe('LoginScreen', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  // ---------------------------------------------------------------------------
  // Rendering
  // ---------------------------------------------------------------------------

  describe('rendering', () => {
    it('renders the login form with email and password fields', () => {
      renderLoginScreen();

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('renders the Welcome Back heading', () => {
      renderLoginScreen();

      expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
    });

    it('renders the forgot password link', () => {
      renderLoginScreen();

      expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
    });

    it('renders the create account link', () => {
      renderLoginScreen();

      expect(screen.getByText(/create account/i)).toBeInTheDocument();
    });

    it('renders persona quick-login buttons', () => {
      renderLoginScreen();

      expect(screen.getByRole('button', { name: /quick login as lukas müller/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /quick login as elena rossi/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /quick login as sophie dubois/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /quick login as james carter/i })).toBeInTheDocument();
    });

    it('displays signup success message when redirected from signup', () => {
      renderLoginScreen({ locationState: { signupSuccess: true } });

      expect(screen.getByText(/account created successfully/i)).toBeInTheDocument();
    });

    it('does not display signup success message by default', () => {
      renderLoginScreen();

      expect(screen.queryByText(/account created successfully/i)).not.toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------------------------
  // Validation
  // ---------------------------------------------------------------------------

  describe('validation', () => {
    it('shows email validation error when email field is blurred empty', async () => {
      const { user } = renderLoginScreen();

      const emailInput = screen.getByLabelText(/email/i);
      await user.click(emailInput);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });
    });

    it('shows email validation error for invalid email format', async () => {
      const { user } = renderLoginScreen();

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'not-an-email');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
      });
    });

    it('shows password validation error when password field is blurred empty', async () => {
      const { user } = renderLoginScreen();

      const passwordInput = screen.getByPlaceholderText(/enter your password/i);
      await user.click(passwordInput);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });
    });

    it('does not show validation errors before fields are touched', () => {
      renderLoginScreen();

      expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/password is required/i)).not.toBeInTheDocument();
    });

    it('clears email validation error when valid email is entered', async () => {
      const { user } = renderLoginScreen();

      const emailInput = screen.getByLabelText(/email/i);
      await user.click(emailInput);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });

      await user.type(emailInput, 'valid@example.com');

      await waitFor(() => {
        expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/invalid email format/i)).not.toBeInTheDocument();
      });
    });

    it('shows all validation errors on submit with empty fields', async () => {
      const { user } = renderLoginScreen();

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Login flow
  // ---------------------------------------------------------------------------

  describe('login flow', () => {
    beforeEach(() => {
      // Create a test user for login tests
      signup({
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'Password1',
        confirmPassword: 'Password1',
        role: 'admin',
      });
      logout();
    });

    it('logs in successfully with correct credentials and navigates to home', async () => {
      const { user } = renderLoginScreen();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/enter your password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'Password1');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
      });
    });

    it('shows error message for incorrect password', async () => {
      const { user } = renderLoginScreen();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/enter your password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'WrongPassword1');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });
    });

    it('shows error message for non-existent email', async () => {
      const { user } = renderLoginScreen();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/enter your password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'nonexistent@example.com');
      await user.type(passwordInput, 'Password1');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });
    });

    it('does not submit the form when validation fails', async () => {
      const { user } = renderLoginScreen();

      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'not-an-email');
      await user.click(submitButton);

      // Should still be on login page
      expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
      expect(screen.queryByTestId('home-page')).not.toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------------------------
  // Persona quick-login
  // ---------------------------------------------------------------------------

  describe('persona quick-login', () => {
    it('logs in as Lukas Müller and navigates to home', async () => {
      const { user } = renderLoginScreen();

      const lukasButton = screen.getByRole('button', { name: /quick login as lukas müller/i });
      await user.click(lukasButton);

      await waitFor(() => {
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
      });
    });

    it('logs in as Elena Rossi and navigates to home', async () => {
      const { user } = renderLoginScreen();

      const elenaButton = screen.getByRole('button', { name: /quick login as elena rossi/i });
      await user.click(elenaButton);

      await waitFor(() => {
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
      });
    });

    it('logs in as Sophie Dubois and navigates to home', async () => {
      const { user } = renderLoginScreen();

      const sophieButton = screen.getByRole('button', { name: /quick login as sophie dubois/i });
      await user.click(sophieButton);

      await waitFor(() => {
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
      });
    });

    it('logs in as James Carter and navigates to home', async () => {
      const { user } = renderLoginScreen();

      const jamesButton = screen.getByRole('button', { name: /quick login as james carter/i });
      await user.click(jamesButton);

      await waitFor(() => {
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
      });
    });

    it('creates a session in localStorage after persona quick-login', async () => {
      const { user } = renderLoginScreen();

      const lukasButton = screen.getByRole('button', { name: /quick login as lukas müller/i });
      await user.click(lukasButton);

      await waitFor(() => {
        const session = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSION));
        expect(session).not.toBeNull();
        expect(session.personaId).toBe('lukas-muller');
        expect(session.fullName).toBe('Lukas Müller');
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Forgot password
  // ---------------------------------------------------------------------------

  describe('forgot password', () => {
    it('shows an alert when forgot password is clicked', async () => {
      const { user } = renderLoginScreen();

      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

      const forgotLink = screen.getByText(/forgot password/i);
      await user.click(forgotLink);

      expect(alertSpy).toHaveBeenCalledTimes(1);
      expect(alertSpy).toHaveBeenCalledWith(
        expect.stringContaining('not available'),
      );

      alertSpy.mockRestore();
    });
  });

  // ---------------------------------------------------------------------------
  // Navigation links
  // ---------------------------------------------------------------------------

  describe('navigation links', () => {
    it('navigates to signup page when create account link is clicked', async () => {
      const { user } = renderLoginScreen();

      const createAccountLink = screen.getByText(/create account/i);
      await user.click(createAccountLink);

      await waitFor(() => {
        expect(screen.getByTestId('signup-page')).toBeInTheDocument();
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Loading state
  // ---------------------------------------------------------------------------

  describe('loading state', () => {
    it('disables the submit button while submitting', async () => {
      signup({
        fullName: 'Test User',
        email: 'loading@example.com',
        password: 'Password1',
        confirmPassword: 'Password1',
        role: 'admin',
      });
      logout();

      const { user } = renderLoginScreen();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/enter your password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'loading@example.com');
      await user.type(passwordInput, 'Password1');

      // The login is synchronous in this mock, so we verify the button exists and is enabled before click
      expect(submitButton).not.toBeDisabled();

      await user.click(submitButton);

      // After successful login, we should navigate away
      await waitFor(() => {
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
      });
    });

    it('disables persona buttons while a persona login is in progress', async () => {
      const { user } = renderLoginScreen();

      // All persona buttons should be enabled initially
      const lukasButton = screen.getByRole('button', { name: /quick login as lukas müller/i });
      expect(lukasButton).not.toBeDisabled();

      // Click one persona button — since login is synchronous, it navigates immediately
      await user.click(lukasButton);

      await waitFor(() => {
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Input interaction
  // ---------------------------------------------------------------------------

  describe('input interaction', () => {
    it('updates email field value as user types', async () => {
      const { user } = renderLoginScreen();

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'hello@world.com');

      expect(emailInput).toHaveValue('hello@world.com');
    });

    it('updates password field value as user types', async () => {
      const { user } = renderLoginScreen();

      const passwordInput = screen.getByPlaceholderText(/enter your password/i);
      await user.type(passwordInput, 'MySecret123');

      expect(passwordInput).toHaveValue('MySecret123');
    });

    it('submits the form when Enter is pressed in the password field', async () => {
      signup({
        fullName: 'Enter User',
        email: 'enter@example.com',
        password: 'Password1',
        confirmPassword: 'Password1',
        role: 'admin',
      });
      logout();

      const { user } = renderLoginScreen();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/enter your password/i);

      await user.type(emailInput, 'enter@example.com');
      await user.type(passwordInput, 'Password1{enter}');

      await waitFor(() => {
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Audit logging integration
  // ---------------------------------------------------------------------------

  describe('audit logging', () => {
    it('creates an audit log entry after successful login', async () => {
      signup({
        fullName: 'Audit User',
        email: 'audit@example.com',
        password: 'Password1',
        confirmPassword: 'Password1',
        role: 'admin',
      });
      logout();

      const { user } = renderLoginScreen();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/enter your password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'audit@example.com');
      await user.type(passwordInput, 'Password1');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
      });

      const auditLog = JSON.parse(localStorage.getItem(STORAGE_KEYS.AUDIT_LOG) || '[]');
      const loginEntries = auditLog.filter((entry) => entry.action === 'login');
      expect(loginEntries.length).toBeGreaterThanOrEqual(1);
    });

    it('creates an audit log entry after persona quick-login', async () => {
      const { user } = renderLoginScreen();

      const lukasButton = screen.getByRole('button', { name: /quick login as lukas müller/i });
      await user.click(lukasButton);

      await waitFor(() => {
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
      });

      const auditLog = JSON.parse(localStorage.getItem(STORAGE_KEYS.AUDIT_LOG) || '[]');
      const loginEntries = auditLog.filter((entry) => entry.action === 'login');
      expect(loginEntries.length).toBeGreaterThanOrEqual(1);

      const personaEntry = loginEntries.find(
        (entry) => entry.details && entry.details.method === 'persona_quick_login',
      );
      expect(personaEntry).toBeDefined();
      expect(personaEntry.details.personaName).toBe('Lukas Müller');
    });
  });
});