import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import { useQuery } from '../context/QueryContext.jsx';
import { AppLayout } from '../components/layout/AppLayout.jsx';
import { IntelligenceClusterPanel } from '../components/clusters/IntelligenceClusterPanel.jsx';
import { QueryBar } from '../components/query/QueryBar.jsx';
import { COLORS, ANIMATION } from '../utils/constants.js';

/**
 * Returns a greeting string based on the current time of day.
 * @returns {string} A greeting such as 'Good morning', 'Good afternoon', or 'Good evening'.
 */
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

/**
 * Formats a timestamp string into a short relative or absolute time label.
 * @param {string} timestamp - An ISO timestamp string.
 * @returns {string} A formatted time string.
 */
function formatTimestamp(timestamp) {
  if (!timestamp || typeof timestamp !== 'string') return '';

  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '';

    const now = Date.now();
    const diffMs = now - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);

    if (diffSec < 5) return 'Just now';
    if (diffSec < 60) return `${diffSec}s ago`;
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const day = date.getDate();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${day} ${months[date.getMonth()]} ${hours}:${minutes}`;
  } catch {
    return '';
  }
}

/**
 * Container animation variants for staggered children.
 */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.15,
    },
  },
};

/**
 * Child animation variants for staggered entry.
 */
const childVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: 'easeOut' },
  },
};

/**
 * RecentQueryItem renders a single recent query history entry.
 *
 * @param {{ entry: object, index: number, onQueryClick: function }} props
 * @returns {React.ReactElement}
 */
function RecentQueryItem({ entry, index, onQueryClick }) {
  const clusterColor = useMemo(() => {
    if (!entry.clusterId) return COLORS.ACCENT_BLUE;
    const clusterColors = {
      'cost-management': COLORS.ACCENT_BLUE,
      'schedule-tracking': COLORS.WARNING,
      'risk-assessment': COLORS.CRITICAL,
      'quality-assurance': COLORS.SUCCESS,
      'stakeholder-comms': COLORS.ACCENT_BLUE_LIGHT,
    };
    return clusterColors[entry.clusterId] || COLORS.ACCENT_BLUE;
  }, [entry.clusterId]);

  return (
    <motion.button
      type="button"
      onClick={() => onQueryClick(entry.query)}
      className="flex items-start gap-3 w-full text-left px-3 py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-white/10 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent-blue/30 font-urbanist"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.05, ease: 'easeOut' }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      aria-label={`Re-run query: ${entry.query}`}
    >
      {/* Cluster indicator dot */}
      <div
        className="w-2 h-2 rounded-full mt-1.5 shrink-0"
        style={{ backgroundColor: clusterColor }}
      />

      {/* Query info */}
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-xs text-white/70 truncate">
          {entry.query}
        </span>
        <div className="flex items-center gap-2 mt-0.5">
          <span
            className="text-[10px] font-medium"
            style={{ color: `${clusterColor}CC` }}
          >
            {entry.clusterLabel || 'General'}
          </span>
          {entry.timestamp && (
            <>
              <span className="text-[10px] text-white/20">·</span>
              <span className="text-[10px] text-white/30">
                {formatTimestamp(entry.timestamp)}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Arrow icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="w-3.5 h-3.5 text-white/20 shrink-0 mt-1"
      >
        <path
          fillRule="evenodd"
          d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
          clipRule="evenodd"
        />
      </svg>
    </motion.button>
  );
}

/**
 * HomePage is the main landing page displayed after login.
 *
 * Features:
 * - Welcome message with persona name and greeting based on time of day
 * - IntelligenceClusterPanel for domain selection
 * - Recent query history from QueryContext (last 5 entries)
 * - Bottom-aligned QueryBar for natural language input
 * - AppLayout wrapper with gradient background and PersonaBar
 * - Animated entry with Framer Motion stagger effect
 * - Responsive layout with Urbanist font
 *
 * @returns {React.ReactElement}
 */
export default function HomePage() {
  const { user, persona } = useAuth();
  const { queryHistory, submitQuery } = useQuery();

  const displayName = persona?.name || user?.fullName || 'User';
  const greeting = getGreeting();

  const recentQueries = useMemo(() => {
    if (!Array.isArray(queryHistory) || queryHistory.length === 0) return [];
    return queryHistory.slice(-5).reverse();
  }, [queryHistory]);

  return (
    <AppLayout>
      <motion.div
        className="w-full font-urbanist pb-28 sm:pb-32"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Welcome header */}
        <motion.div
          className="mb-8 sm:mb-10"
          variants={childVariants}
        >
          <h1 className="text-2xl font-bold text-white sm:text-3xl md:text-4xl">
            {greeting},{' '}
            <span className="text-gradient">
              {displayName}
            </span>
          </h1>
          <p className="text-sm text-white/40 mt-1.5 sm:text-base">
            What would you like to know about your projects today?
          </p>
        </motion.div>

        {/* Intelligence Cluster Panel */}
        <motion.div
          className="mb-8 sm:mb-10"
          variants={childVariants}
        >
          <IntelligenceClusterPanel />
        </motion.div>

        {/* Recent query history */}
        {recentQueries.length > 0 && (
          <motion.div
            className="w-full"
            variants={childVariants}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider">
                Recent Queries
              </h2>
              <span className="text-[10px] text-white/20">
                {recentQueries.length} of {queryHistory.length}
              </span>
            </div>

            <div className="space-y-2">
              {recentQueries.map((entry, idx) => (
                <RecentQueryItem
                  key={entry.id}
                  entry={entry}
                  index={idx}
                  onQueryClick={submitQuery}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Empty state when no query history */}
        {recentQueries.length === 0 && (
          <motion.div
            className="flex flex-col items-center justify-center py-8 sm:py-12"
            variants={childVariants}
          >
            <div
              className="flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
              style={{ backgroundColor: `${COLORS.ACCENT_BLUE}15` }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill={COLORS.ACCENT_BLUE}
                className="w-7 h-7"
              >
                <path
                  fillRule="evenodd"
                  d="M4.848 2.771A49.144 49.144 0 0112 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 01-3.476.383.39.39 0 00-.297.17l-2.755 4.133a.75.75 0 01-1.248 0l-2.755-4.133a.39.39 0 00-.297-.17 48.9 48.9 0 01-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97zM6.75 8.25a.75.75 0 01.75-.75h9a.75.75 0 010 1.5h-9a.75.75 0 01-.75-.75zm.75 2.25a.75.75 0 000 1.5H12a.75.75 0 000-1.5H7.5z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <p className="text-sm text-white/40 text-center max-w-xs">
              Start by selecting a cluster above or type a question in the query bar below.
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Bottom-aligned QueryBar */}
      <QueryBar />
    </AppLayout>
  );
}