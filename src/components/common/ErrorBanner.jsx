import { useCallback } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { COLORS, ANIMATION } from '../../utils/constants.js';

/**
 * Returns an icon SVG for the error type.
 * @param {string} type - The error type ('error', 'warning', 'session').
 * @returns {React.ReactElement} An SVG icon element.
 */
function ErrorIcon({ type }) {
  const normalized = (type || '').trim().toLowerCase();

  if (normalized === 'warning') {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill={COLORS.WARNING}
        className="w-5 h-5 shrink-0"
      >
        <path
          fillRule="evenodd"
          d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z"
          clipRule="evenodd"
        />
      </svg>
    );
  }

  if (normalized === 'session') {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill={COLORS.CRITICAL}
        className="w-5 h-5 shrink-0"
      >
        <path
          fillRule="evenodd"
          d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
          clipRule="evenodd"
        />
      </svg>
    );
  }

  // Default error icon
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill={COLORS.CRITICAL}
      className="w-5 h-5 shrink-0"
    >
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
        clipRule="evenodd"
      />
    </svg>
  );
}

ErrorIcon.propTypes = {
  type: PropTypes.string,
};

/**
 * Returns the accent color for a given error type.
 * @param {string} type - The error type.
 * @returns {string} A hex color string.
 */
function getTypeColor(type) {
  const normalized = (type || '').trim().toLowerCase();

  switch (normalized) {
    case 'warning':
      return COLORS.WARNING;
    case 'session':
      return COLORS.CRITICAL;
    case 'error':
    default:
      return COLORS.CRITICAL;
  }
}

/**
 * Banner animation variants.
 */
const bannerVariants = {
  hidden: { opacity: 0, y: -12, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    y: -12,
    scale: 0.97,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
};

/**
 * ErrorBanner is an error notification display component with a colored
 * background, error icon, message text, and optional retry/dismiss buttons.
 *
 * Features:
 * - Critical-red (or warning-yellow) background based on error type
 * - Animated entry/exit with Framer Motion (slide-down + fade)
 * - Error icon matching the error type (error, warning, session)
 * - Message text with Urbanist font
 * - Optional retry button with hover animation
 * - Optional dismiss button (X icon)
 * - Glassmorphism styling consistent with the design system
 * - Keyboard accessible
 * - Supports visibility toggle via `visible` prop with AnimatePresence
 *
 * @param {{ message: string, type: string, visible: boolean, onRetry: function, onDismiss: function, className: string }} props
 * @returns {React.ReactElement}
 */
export function ErrorBanner({ message, type, visible, onRetry, onDismiss, className }) {
  const accentColor = getTypeColor(type);
  const isVisible = visible !== false;

  const handleRetry = useCallback(() => {
    if (typeof onRetry === 'function') {
      onRetry();
    }
  }, [onRetry]);

  const handleDismiss = useCallback(() => {
    if (typeof onDismiss === 'function') {
      onDismiss();
    }
  }, [onDismiss]);

  const displayMessage = message && typeof message === 'string' && message.trim().length > 0
    ? message.trim()
    : 'An unexpected error occurred. Please try again.';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`w-full font-urbanist ${className || ''}`}
          variants={bannerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          role="alert"
          aria-live="assertive"
        >
          <div
            className="flex items-start gap-3 rounded-xl px-4 py-3 sm:px-5 sm:py-3.5"
            style={{
              backgroundColor: `${accentColor}15`,
              border: `1px solid ${accentColor}30`,
            }}
          >
            {/* Error icon */}
            <div className="flex items-center justify-center mt-0.5 shrink-0">
              <ErrorIcon type={type} />
            </div>

            {/* Message */}
            <div className="flex-1 min-w-0">
              <p
                className="text-sm leading-relaxed"
                style={{ color: `${accentColor}` }}
              >
                {displayMessage}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Retry button */}
              {typeof onRetry === 'function' && (
                <motion.button
                  type="button"
                  onClick={handleRetry}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0"
                  style={{
                    backgroundColor: `${accentColor}20`,
                    color: accentColor,
                    focusRingColor: `${accentColor}40`,
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Retry"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-3.5 h-3.5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H4.598a.75.75 0 00-.75.75v3.634a.75.75 0 001.5 0v-2.033l.312.311a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm-9.624-2.848a.75.75 0 00.726.943h3.634a.75.75 0 000-1.5H7.615l.312-.311a5.5 5.5 0 019.201-2.466.75.75 0 101.449-.39A7 7 0 006.865 8.265l-.312.311V6.543a.75.75 0 00-1.5 0v3.634a.75.75 0 00.035.399z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Retry</span>
                </motion.button>
              )}

              {/* Dismiss button */}
              {typeof onDismiss === 'function' && (
                <motion.button
                  type="button"
                  onClick={handleDismiss}
                  className="flex items-center justify-center w-7 h-7 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0"
                  style={{
                    color: `${accentColor}80`,
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Dismiss error"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-4 h-4"
                  >
                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                  </svg>
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

ErrorBanner.propTypes = {
  /** The error message to display. Falls back to a generic message if empty. */
  message: PropTypes.string,
  /** The error type: 'error' (default), 'warning', or 'session'. Controls icon and color. */
  type: PropTypes.oneOf(['error', 'warning', 'session']),
  /** Whether the banner is visible. Defaults to true. Set to false to animate out. */
  visible: PropTypes.bool,
  /** Optional retry callback. If provided, a retry button is shown. */
  onRetry: PropTypes.func,
  /** Optional dismiss callback. If provided, a dismiss (X) button is shown. */
  onDismiss: PropTypes.func,
  /** Optional additional CSS class names for the outer container. */
  className: PropTypes.string,
};

export default ErrorBanner;