import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { COLORS, ANIMATION, APP_TITLE } from '../utils/constants.js';

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
 * NotFoundPage is the 404 error page displayed when a user navigates
 * to a route that does not exist.
 *
 * Features:
 * - Gradient background consistent with the design system
 * - Glassmorphism card with error message
 * - Large 404 heading with accent gradient text
 * - Descriptive message with Urbanist font
 * - Link back to home page with accent-blue styling
 * - Framer Motion entry animation
 * - Responsive layout
 *
 * @returns {React.ReactElement}
 */
export default function NotFoundPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-8 sm:px-6 md:px-8 font-urbanist">
      <motion.div
        className="glass-card w-full max-w-md text-center"
        style={{ padding: '40px 32px' }}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        {/* 404 icon */}
        <motion.div
          className="flex items-center justify-center mx-auto mb-6"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, delay: 0.1, ease: 'easeOut' }}
        >
          <div
            className="flex items-center justify-center w-16 h-16 rounded-2xl"
            style={{ backgroundColor: `${COLORS.WARNING}15` }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill={COLORS.WARNING}
              className="w-8 h-8"
            >
              <path
                fillRule="evenodd"
                d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </motion.div>

        {/* 404 heading */}
        <motion.h1
          className="text-6xl font-bold text-gradient mb-3 sm:text-7xl"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15, ease: 'easeOut' }}
        >
          404
        </motion.h1>

        {/* Title */}
        <motion.h2
          className="text-xl font-bold text-white mb-2 sm:text-2xl"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2, ease: 'easeOut' }}
        >
          Page Not Found
        </motion.h2>

        {/* Description */}
        <motion.p
          className="text-sm text-white/40 mb-8 leading-relaxed max-w-xs mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.25 }}
        >
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back to {APP_TITLE}.
        </motion.p>

        {/* Back to home link */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3, ease: 'easeOut' }}
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent-blue/30 hover:opacity-90"
            style={{ backgroundColor: COLORS.ACCENT_BLUE }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-4 h-4"
            >
              <path
                fillRule="evenodd"
                d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
                clipRule="evenodd"
              />
            </svg>
            <span>Back to Home</span>
          </Link>
        </motion.div>

        {/* Subtle divider */}
        <div className="flex items-center gap-3 mt-8">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-[10px] text-white/20 uppercase tracking-wider">
            {APP_TITLE}
          </span>
          <div className="flex-1 h-px bg-white/10" />
        </div>
      </motion.div>
    </div>
  );
}