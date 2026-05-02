import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext.jsx';
import { COLORS, ANIMATION } from '../../utils/constants.js';

/**
 * Formats a Date object into a human-readable time string (HH:MM:SS).
 * @param {Date} date - The date to format.
 * @returns {string} The formatted time string.
 */
function formatTime(date) {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

/**
 * Formats a Date object into a short date string (e.g. "Mon, 15 Nov").
 * @param {Date} date - The date to format.
 * @returns {string} The formatted date string.
 */
function formatDate(date) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dayName = days[date.getDay()];
  const day = date.getDate();
  const month = months[date.getMonth()];
  return `${dayName}, ${day} ${month}`;
}

/**
 * Returns a Tailwind-compatible color class for a given role string.
 * @param {string|null} role - The user role.
 * @returns {string} A hex color string for the role badge.
 */
function getRoleBadgeColor(role) {
  if (!role || typeof role !== 'string') return COLORS.ACCENT_BLUE;

  const normalizedRole = role.trim().toLowerCase();

  switch (normalizedRole) {
    case 'project director':
    case 'admin':
    case 'administrator':
      return COLORS.ACCENT_BLUE;
    case 'senior qs':
    case 'analyst':
      return COLORS.SUCCESS;
    case 'project manager':
    case 'manager':
      return COLORS.WARNING;
    case 'sales director':
    case 'viewer':
      return COLORS.CRITICAL;
    default:
      return COLORS.ACCENT_BLUE_LIGHT;
  }
}

/**
 * PersonaBar displays the current user's name, role, and a real-time clock.
 * Includes a logout button with hover animation.
 * Styled with glassmorphism background and Urbanist font.
 *
 * @returns {React.ReactElement}
 */
export function PersonaBar() {
  const { user, persona, isAuthenticated, logout } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  if (!isAuthenticated || !user) {
    return null;
  }

  const displayName = persona?.name || user.fullName || 'User';
  const displayRole = persona?.role || user.role || 'Member';
  const avatarInitials = persona?.avatar || displayName
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
  const roleBadgeColor = persona?.color || getRoleBadgeColor(displayRole);

  return (
    <motion.div
      className="glass flex items-center gap-4 rounded-2xl px-4 py-2.5 font-urbanist"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={ANIMATION.EASE_OUT}
    >
      {/* Real-time clock */}
      <div className="hidden sm:flex flex-col items-end mr-2">
        <span className="text-sm font-semibold text-white tracking-wide">
          {formatTime(currentTime)}
        </span>
        <span className="text-xs text-white/40">
          {formatDate(currentTime)}
        </span>
      </div>

      {/* Divider */}
      <div className="hidden sm:block w-px h-8 bg-white/10" />

      {/* Avatar */}
      <div
        className="flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold text-white shrink-0"
        style={{ backgroundColor: roleBadgeColor }}
      >
        {avatarInitials}
      </div>

      {/* User info */}
      <div className="flex flex-col items-start min-w-0">
        <span className="text-sm font-semibold text-white truncate max-w-[140px]">
          {displayName}
        </span>
        <span
          className="inline-flex items-center text-xs font-medium px-1.5 py-0.5 rounded-full mt-0.5"
          style={{
            backgroundColor: `${roleBadgeColor}20`,
            color: roleBadgeColor,
          }}
        >
          {displayRole}
        </span>
      </div>

      {/* Logout button */}
      <motion.button
        onClick={handleLogout}
        className="ml-2 flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 hover:border-white/20 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent-blue/30"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Logout"
        title="Logout"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-4 h-4"
        >
          <path
            fillRule="evenodd"
            d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z"
            clipRule="evenodd"
          />
          <path
            fillRule="evenodd"
            d="M19 10a.75.75 0 00-.75-.75H8.704l1.048-.943a.75.75 0 10-1.004-1.114l-2.5 2.25a.75.75 0 000 1.114l2.5 2.25a.75.75 0 101.004-1.114l-1.048-.943h9.546A.75.75 0 0019 10z"
            clipRule="evenodd"
          />
        </svg>
      </motion.button>
    </motion.div>
  );
}

PersonaBar.propTypes = {};

export default PersonaBar;