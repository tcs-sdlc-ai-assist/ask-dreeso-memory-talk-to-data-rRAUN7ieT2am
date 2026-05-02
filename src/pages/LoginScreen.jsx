import { useState, useCallback, useMemo } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import { validateEmail } from '../utils/ValidationUtils.js';
import { COLORS, ANIMATION, PERSONAS, APP_TITLE } from '../utils/constants.js';

/**
 * Returns the appropriate border color for a field based on its validation state.
 * @param {boolean} touched - Whether the field has been interacted with.
 * @param {string} error - The current error message for the field.
 * @returns {string} A CSS border-color value.
 */
function getFieldBorderColor(touched, error) {
  if (!touched) return 'rgba(78, 132, 196, 0.25)';
  if (error) return `${COLORS.CRITICAL}80`;
  return `${COLORS.SUCCESS}80`;
}

/**
 * FieldError renders an inline validation error message below a form field.
 *
 * @param {{ message: string }} props
 * @returns {React.ReactElement|null}
 */
function FieldError({ message }) {
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.p
        className="text-xs mt-1 font-urbanist"
        style={{ color: COLORS.CRITICAL }}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.2 }}
      >
        {message.trim()}
      </motion.p>
    </AnimatePresence>
  );
}

/**
 * Card animation variants.
 */
const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

/**
 * Container animation variants for staggered persona buttons.
 */
const personaContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

/**
 * Persona button animation variants.
 */
const personaButtonVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.25, ease: 'easeOut' },
  },
};

/**
 * LoginScreen is the user authentication page with a centered glassmorphism card
 * on a gradient background.
 *
 * Features:
 * - Email and password input fields with real-time validation
 * - Login button with accent-blue styling and loading state
 * - Forgot password link (shows alert for demo)
 * - Persona quick-login section with 4 persona buttons (Lukas, Elena, Sophie, James)
 * - Link to signup page
 * - Urbanist typography throughout
 * - Glassmorphism card styling
 * - On successful login, redirects to home/dashboard
 * - Shows success message if redirected from signup
 * - Responsive layout
 *
 * @returns {React.ReactElement}
 */
export default function LoginScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, personaQuickLogin } = useAuth();

  const signupSuccess = location.state?.signupSuccess === true;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  const [submitting, setSubmitting] = useState(false);
  const [personaLoading, setPersonaLoading] = useState(null);
  const [serverError, setServerError] = useState(null);
  const [showSignupSuccess, setShowSignupSuccess] = useState(signupSuccess);

  const errors = useMemo(() => {
    const emailResult = validateEmail(email);
    const passwordError = (!password || typeof password !== 'string' || password.length === 0)
      ? 'Password is required.'
      : '';

    return {
      email: emailResult.isValid ? '' : emailResult.errorMessage,
      password: passwordError,
    };
  }, [email, password]);

  const isFormValid = useMemo(() => {
    return (
      errors.email === '' &&
      errors.password === '' &&
      email.trim().length > 0 &&
      password.length > 0
    );
  }, [errors, email, password]);

  const handleBlur = useCallback((field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    setTouched({
      email: true,
      password: true,
    });

    if (!isFormValid) {
      return;
    }

    setSubmitting(true);
    setServerError(null);
    setShowSignupSuccess(false);

    try {
      const result = login({
        email: email.trim(),
        password,
      });

      if (result.success) {
        navigate('/', { replace: true });
      } else {
        setServerError(result.error || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('[LoginScreen] Login failed:', error);
      setServerError('An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [isFormValid, email, password, login, navigate]);

  const handlePersonaQuickLogin = useCallback(async (personaId) => {
    if (submitting || personaLoading) return;

    setPersonaLoading(personaId);
    setServerError(null);
    setShowSignupSuccess(false);

    try {
      const result = personaQuickLogin(personaId);

      if (result.success) {
        navigate('/', { replace: true });
      } else {
        setServerError(result.error || 'Persona login failed. Please try again.');
      }
    } catch (error) {
      console.error('[LoginScreen] Persona quick login failed:', error);
      setServerError('An unexpected error occurred. Please try again.');
    } finally {
      setPersonaLoading(null);
    }
  }, [submitting, personaLoading, personaQuickLogin, navigate]);

  const handleForgotPassword = useCallback((e) => {
    e.preventDefault();
    alert('Password reset is not available in this demo. Please use persona quick-login or create a new account.');
  }, []);

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-8 sm:px-6 md:px-8 font-urbanist">
      <motion.div
        className="glass-card w-full max-w-md"
        style={{ padding: '32px' }}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <motion.h1
            className="text-2xl font-bold text-white sm:text-3xl text-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1, ease: 'easeOut' }}
          >
            Welcome Back
          </motion.h1>
          <motion.p
            className="text-sm text-white/40 mt-1 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            Sign in to {APP_TITLE}
          </motion.p>
        </div>

        {/* Signup success message */}
        <AnimatePresence>
          {showSignupSuccess && (
            <motion.div
              className="flex items-start gap-2 rounded-xl px-4 py-3 mb-4"
              style={{
                backgroundColor: `${COLORS.SUCCESS}15`,
                border: `1px solid ${COLORS.SUCCESS}30`,
              }}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              role="status"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill={COLORS.SUCCESS}
                className="w-5 h-5 shrink-0 mt-0.5"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-sm" style={{ color: COLORS.SUCCESS }}>
                Account created successfully! Please sign in.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Server error */}
        <AnimatePresence>
          {serverError && (
            <motion.div
              className="flex items-start gap-2 rounded-xl px-4 py-3 mb-4"
              style={{
                backgroundColor: `${COLORS.CRITICAL}15`,
                border: `1px solid ${COLORS.CRITICAL}30`,
              }}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              role="alert"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill={COLORS.CRITICAL}
                className="w-5 h-5 shrink-0 mt-0.5"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-sm" style={{ color: COLORS.CRITICAL }}>
                {serverError}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Email */}
          <div>
            <label
              htmlFor="login-email"
              className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-1.5"
            >
              Email
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => handleBlur('email')}
              placeholder="Enter your email address"
              disabled={submitting || personaLoading !== null}
              className="glass-input w-full px-4 py-2.5 text-sm text-white placeholder-white/30 font-urbanist disabled:opacity-50"
              style={{
                borderColor: getFieldBorderColor(touched.email, errors.email),
              }}
              autoComplete="email"
              aria-invalid={touched.email && errors.email ? 'true' : 'false'}
              aria-describedby={touched.email && errors.email ? 'login-email-error' : undefined}
            />
            {touched.email && errors.email && (
              <div id="login-email-error">
                <FieldError message={errors.email} />
              </div>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="login-password"
                className="block text-xs font-semibold uppercase tracking-wider text-white/50"
              >
                Password
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-xs text-accent-blue hover:text-accent-blue/80 transition-colors duration-200 focus:outline-none focus:underline"
              >
                Forgot password?
              </button>
            </div>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => handleBlur('password')}
              placeholder="Enter your password"
              disabled={submitting || personaLoading !== null}
              className="glass-input w-full px-4 py-2.5 text-sm text-white placeholder-white/30 font-urbanist disabled:opacity-50"
              style={{
                borderColor: getFieldBorderColor(touched.password, errors.password),
              }}
              autoComplete="current-password"
              aria-invalid={touched.password && errors.password ? 'true' : 'false'}
              aria-describedby={touched.password && errors.password ? 'login-password-error' : undefined}
            />
            {touched.password && errors.password && (
              <div id="login-password-error">
                <FieldError message={errors.password} />
              </div>
            )}
          </div>

          {/* Submit button */}
          <motion.button
            type="submit"
            disabled={submitting || personaLoading !== null}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent-blue/30 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            style={{
              backgroundColor: COLORS.ACCENT_BLUE,
            }}
            whileHover={{ scale: submitting ? 1 : 1.02 }}
            whileTap={{ scale: submitting ? 1 : 0.98 }}
          >
            {submitting ? (
              <>
                <svg
                  className="w-4 h-4 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Signing In…</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </motion.button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-xs text-white/30">or continue as</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Persona quick-login */}
        <motion.div
          className="space-y-3"
          variants={personaContainerVariants}
          initial="hidden"
          animate="visible"
        >
          <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30 text-center">
            Quick Login as Persona
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            {PERSONAS.map((persona) => (
              <motion.button
                key={persona.id}
                type="button"
                onClick={() => handlePersonaQuickLogin(persona.id)}
                disabled={submitting || personaLoading !== null}
                variants={personaButtonVariants}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent-blue/30 disabled:opacity-40 disabled:cursor-not-allowed"
                whileHover={{ scale: (submitting || personaLoading !== null) ? 1 : 1.03 }}
                whileTap={{ scale: (submitting || personaLoading !== null) ? 1 : 0.97 }}
                aria-label={`Quick login as ${persona.name}`}
              >
                {/* Avatar */}
                <div
                  className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold text-white shrink-0"
                  style={{ backgroundColor: persona.color }}
                >
                  {personaLoading === persona.id ? (
                    <svg
                      className="w-4 h-4 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  ) : (
                    persona.avatar
                  )}
                </div>

                {/* Info */}
                <div className="flex flex-col items-start min-w-0">
                  <span className="text-xs font-semibold text-white truncate max-w-[90px]">
                    {persona.name}
                  </span>
                  <span
                    className="text-[10px] font-medium truncate max-w-[90px]"
                    style={{ color: `${persona.color}CC` }}
                  >
                    {persona.role}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-xs text-white/30">or</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Link to signup */}
        <p className="text-center text-sm text-white/40">
          Don&apos;t have an account?{' '}
          <Link
            to="/signup"
            className="font-semibold text-accent-blue hover:text-accent-blue/80 transition-colors duration-200 focus:outline-none focus:underline"
          >
            Create account
          </Link>
        </p>
      </motion.div>
    </div>
  );
}