import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext.jsx';
import { PersonaBar } from './PersonaBar.jsx';
import { ANIMATION } from '../../utils/constants.js';

/**
 * AppLayout is the main application layout wrapper for all authenticated pages.
 *
 * Provides:
 * - Gradient background (#0A1A2F → #1E2A44)
 * - 12-column grid structure
 * - PersonaBar positioned top-right (fixed)
 * - Content area with proper spacing (48–96px)
 * - Responsive breakpoints via Tailwind
 *
 * @param {{ children: React.ReactNode }} props
 * @returns {React.ReactElement}
 */
export function AppLayout({ children }) {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    document.body.style.background = 'linear-gradient(135deg, #0A1A2F 0%, #1E2A44 100%)';
    document.body.style.backgroundAttachment = 'fixed';

    return () => {
      document.body.style.background = '';
      document.body.style.backgroundAttachment = '';
    };
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-full font-urbanist">
        {children}
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full font-urbanist">
      {/* PersonaBar — fixed top-right */}
      <div className="fixed top-4 right-4 z-50 sm:top-5 sm:right-6 md:top-6 md:right-8">
        <PersonaBar />
      </div>

      {/* Main content area */}
      <motion.main
        className="relative w-full min-h-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={ANIMATION.EASE_OUT}
      >
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 md:px-8 lg:px-12">
          {/* 12-column grid container */}
          <div className="grid grid-cols-4 sm:grid-cols-8 md:grid-cols-12 gap-4 sm:gap-5 md:gap-6">
            <div className="col-span-4 sm:col-span-8 md:col-span-12 pt-12 pb-12 sm:pt-16 sm:pb-16 md:pt-24 md:pb-24">
              {children}
            </div>
          </div>
        </div>
      </motion.main>
    </div>
  );
}

AppLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AppLayout;