import { useState, useCallback, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import { validateEmail, validatePassword, validateName, validateConfirmPassword, validateRole } from '../utils/ValidationUtils.js';
import { COLORS, ANIMATION, ROLE_OPTIONS, APP_TITLE } from '../utils/constants.js';

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
 * SignupScreen is the user registration page with a centered glassmorphism card
 * on a gradient background.
 *
 * Features:
 * - Full name, email, password, confirm password, and role selection fields
 * - Real-time validation with error messages below each field
 * - Submit button with accent-blue styling and loading state
 * - Link to login page
 * - Urbanist typography throughout
 * - Glassmorphism card styling
 * - On successful signup, redirects to login with success message
 * - Responsive layout
 *
 * @returns {React.ReactElement}
 */
export default function SignupScreen() {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('');

  const [touched, setTouched] = useState({
    fullName: false,
    email: false,
    password: false,
    confirmPassword: false,
    role: false,
  });

  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  const errors = useMemo(() => {
    const nameResult = validateName(fullName);
    const emailResult = validateEmail(email);
    const passwordResult = validatePassword(password);
    const confirmResult = validateConfirmPassword(password, confirmPassword);
    const roleResult = validateRole(role);

    return {
      fullName: nameResult.isValid ? '' : nameResult.errorMessage,
      email: emailResult.isValid ? '' : emailResult.errorMessage,
      password: passwordResult.isValid ? '' : passwordResult.errorMessage,
      confirmPassword: confirmResult.isValid ? '' : confirmResult.errorMessage,
      role: roleResult.isValid ? '' : roleResult.errorMessage,
    };
  }, [fullName, email, password, confirmPassword, role]);

  const isFormValid = useMemo(() => {
    return (
      errors.fullName === '' &&
      errors.email === '' &&
      errors.password === '' &&
      errors.confirmPassword === '' &&
      errors.role === '' &&
      fullName.trim().length > 0 &&
      email.trim().length > 0 &&
      password.length > 0 &&
      confirmPassword.length > 0 &&
      role.length > 0
    );
  }, [errors, fullName, email, password, confirmPassword, role]);

  const handleBlur = useCallback((field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    setTouched({
      fullName: true,
      email: true,
      password: true,
      confirmPassword: true,
      role: true,
    });

    if (!isFormValid) {
      return;
    }

    setSubmitting(true);
    setServerError(null);

    try {
      const result = signup({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        confirmPassword,
        role,
      });

      if (result.success) {
        navigate('/login', { state: { signupSuccess: true } });
      } else {
        setServerError(result.error || 'Signup failed. Please try again.');
      }
    } catch (error) {
      console.error('[SignupScreen] Signup failed:', error);
      setServerError('An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [isFormValid, fullName, email, password, confirmPassword, role, signup, navigate]);

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
            Create Account
          </motion.h1>
          <motion.p
            className="text-sm text-white/40 mt-1 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            Join {APP_TITLE} to get started
          </motion.p>
        </div>

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
          {/* Full Name */}
          <div>
            <label
              htmlFor="signup-fullname"
              className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-1.5"
            >
              Full Name
            </label>
            <input
              id="signup-fullname"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              onBlur={() => handleBlur('fullName')}
              placeholder="Enter your full name"
              disabled={submitting}
              className="glass-input w-full px-4 py-2.5 text-sm text-white placeholder-white/30 font-urbanist disabled:opacity-50"
              style={{
                borderColor: getFieldBorderColor(touched.fullName, errors.fullName),
              }}
              autoComplete="name"
              aria-invalid={touched.fullName && errors.fullName ? 'true' : 'false'}
              aria-describedby={touched.fullName && errors.fullName ? 'signup-fullname-error' : undefined}
            />
            {touched.fullName && errors.fullName && (
              <div id="signup-fullname-error">
                <FieldError message={errors.fullName} />
              </div>
            )}
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="signup-email"
              className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-1.5"
            >
              Email
            </label>
            <input
              id="signup-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => handleBlur('email')}
              placeholder="Enter your email address"
              disabled={submitting}
              className="glass-input w-full px-4 py-2.5 text-sm text-white placeholder-white/30 font-urbanist disabled:opacity-50"
              style={{
                borderColor: getFieldBorderColor(touched.email, errors.email),
              }}
              autoComplete="email"
              aria-invalid={touched.email && errors.email ? 'true' : 'false'}
              aria-describedby={touched.email && errors.email ? 'signup-email-error' : undefined}
            />
            {touched.email && errors.email && (
              <div id="signup-email-error">
                <FieldError message={errors.email} />
              </div>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="signup-password"
              className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-1.5"
            >
              Password
            </label>
            <input
              id="signup-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => handleBlur('password')}
              placeholder="Min 8 chars, uppercase, lowercase, number"
              disabled={submitting}
              className="glass-input w-full px-4 py-2.5 text-sm text-white placeholder-white/30 font-urbanist disabled:opacity-50"
              style={{
                borderColor: getFieldBorderColor(touched.password, errors.password),
              }}
              autoComplete="new-password"
              aria-invalid={touched.password && errors.password ? 'true' : 'false'}
              aria-describedby={touched.password && errors.password ? 'signup-password-error' : undefined}
            />
            {touched.password && errors.password && (
              <div id="signup-password-error">
                <FieldError message={errors.password} />
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="signup-confirm-password"
              className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-1.5"
            >
              Confirm Password
            </label>
            <input
              id="signup-confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => handleBlur('confirmPassword')}
              placeholder="Re-enter your password"
              disabled={submitting}
              className="glass-input w-full px-4 py-2.5 text-sm text-white placeholder-white/30 font-urbanist disabled:opacity-50"
              style={{
                borderColor: getFieldBorderColor(touched.confirmPassword, errors.confirmPassword),
              }}
              autoComplete="new-password"
              aria-invalid={touched.confirmPassword && errors.confirmPassword ? 'true' : 'false'}
              aria-describedby={touched.confirmPassword && errors.confirmPassword ? 'signup-confirm-password-error' : undefined}
            />
            {touched.confirmPassword && errors.confirmPassword && (
              <div id="signup-confirm-password-error">
                <FieldError message={errors.confirmPassword} />
              </div>
            )}
          </div>

          {/* Role */}
          <div>
            <label
              htmlFor="signup-role"
              className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-1.5"
            >
              Role
            </label>
            <select
              id="signup-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              onBlur={() => handleBlur('role')}
              disabled={submitting}
              className="glass-input w-full px-4 py-2.5 text-sm text-white font-urbanist disabled:opacity-50 appearance-none cursor-pointer"
              style={{
                borderColor: getFieldBorderColor(touched.role, errors.role),
                backgroundColor: 'rgba(10, 26, 47, 0.4)',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='rgba(255,255,255,0.4)'%3E%3Cpath fill-rule='evenodd' d='M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z' clip-rule='evenodd'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
                backgroundSize: '16px',
                paddingRight: '36px',
              }}
              aria-invalid={touched.role && errors.role ? 'true' : 'false'}
              aria-describedby={touched.role && errors.role ? 'signup-role-error' : undefined}
            >
              <option value="" disabled className="bg-bg-dark text-white/30">
                Select your role
              </option>
              {ROLE_OPTIONS.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  className="bg-bg-dark text-white"
                >
                  {option.label}
                </option>
              ))}
            </select>
            {touched.role && errors.role && (
              <div id="signup-role-error">
                <FieldError message={errors.role} />
              </div>
            )}
          </div>

          {/* Submit button */}
          <motion.button
            type="submit"
            disabled={submitting}
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
                <span>Creating Account…</span>
              </>
            ) : (
              <span>Create Account</span>
            )}
          </motion.button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-xs text-white/30">or</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Link to login */}
        <p className="text-center text-sm text-white/40">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-accent-blue hover:text-accent-blue/80 transition-colors duration-200 focus:outline-none focus:underline"
          >
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}