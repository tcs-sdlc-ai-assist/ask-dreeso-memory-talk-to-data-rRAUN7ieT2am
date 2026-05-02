import { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { useQuery } from '../../context/QueryContext.jsx';
import { INTELLIGENCE_CLUSTERS, COLORS, ANIMATION } from '../../utils/constants.js';
import { SUGGESTED_QUERIES } from '../../data/mockData.js';

/**
 * Returns an SVG icon element for a given intelligence cluster ID.
 * @param {string} clusterId - The cluster identifier.
 * @param {string} color - The accent color for the icon.
 * @returns {React.ReactElement} An SVG icon element.
 */
function ClusterIcon({ clusterId, color }) {
  const iconColor = color || COLORS.ACCENT_BLUE;

  switch (clusterId) {
    case 'cost-management':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill={iconColor}
          className="w-7 h-7 shrink-0"
        >
          <path d="M12 7.5a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z" />
          <path
            fillRule="evenodd"
            d="M1.5 4.875C1.5 3.839 2.34 3 3.375 3h17.25c1.035 0 1.875.84 1.875 1.875v9.75c0 1.036-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 011.5 14.625v-9.75zM8.25 9.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM18.75 9a.75.75 0 00-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 00.75-.75V9.75a.75.75 0 00-.75-.75h-.008zM4.5 9.75A.75.75 0 015.25 9h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H5.25a.75.75 0 01-.75-.75V9.75z"
            clipRule="evenodd"
          />
          <path d="M2.25 18a.75.75 0 000 1.5c5.4 0 10.63.722 15.6 2.075 1.19.324 2.4-.558 2.4-1.82V18.75a.75.75 0 00-.75-.75H2.25z" />
        </svg>
      );

    case 'schedule-tracking':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill={iconColor}
          className="w-7 h-7 shrink-0"
        >
          <path
            fillRule="evenodd"
            d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zm13.5 9a1.5 1.5 0 00-1.5-1.5H5.25a1.5 1.5 0 00-1.5 1.5v7.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-7.5z"
            clipRule="evenodd"
          />
        </svg>
      );

    case 'risk-assessment':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill={iconColor}
          className="w-7 h-7 shrink-0"
        >
          <path
            fillRule="evenodd"
            d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
            clipRule="evenodd"
          />
        </svg>
      );

    case 'quality-assurance':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill={iconColor}
          className="w-7 h-7 shrink-0"
        >
          <path
            fillRule="evenodd"
            d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
            clipRule="evenodd"
          />
        </svg>
      );

    case 'stakeholder-comms':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill={iconColor}
          className="w-7 h-7 shrink-0"
        >
          <path
            fillRule="evenodd"
            d="M8.25 6.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM15.75 9.75a3 3 0 116 0 3 3 0 01-6 0zM2.25 9.75a3 3 0 116 0 3 3 0 01-6 0zM6.31 15.117A6.745 6.745 0 0112 12a6.745 6.745 0 016.709 7.498.75.75 0 01-.372.568A12.696 12.696 0 0112 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 01-.372-.568 6.787 6.787 0 011.019-4.38z"
            clipRule="evenodd"
          />
          <path d="M5.082 14.254a8.287 8.287 0 00-1.308 5.135 9.687 9.687 0 01-1.764-.44l-.115-.04a.563.563 0 01-.373-.487l-.01-.121a3.75 3.75 0 013.57-4.047zM20.226 19.389a8.287 8.287 0 00-1.308-5.135 3.75 3.75 0 013.57 4.047l-.01.121a.563.563 0 01-.373.486l-.115.04c-.567.2-1.156.349-1.764.441z" />
        </svg>
      );

    default:
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill={iconColor}
          className="w-7 h-7 shrink-0"
        >
          <path
            fillRule="evenodd"
            d="M2.25 13.5a8.25 8.25 0 018.25-8.25.75.75 0 01.75.75v6.75H18a.75.75 0 01.75.75 8.25 8.25 0 01-16.5 0z"
            clipRule="evenodd"
          />
          <path
            fillRule="evenodd"
            d="M12.75 3a.75.75 0 01.75-.75 8.25 8.25 0 018.25 8.25.75.75 0 01-.75.75h-7.5a.75.75 0 01-.75-.75V3z"
            clipRule="evenodd"
          />
        </svg>
      );
  }
}

ClusterIcon.propTypes = {
  clusterId: PropTypes.string.isRequired,
  color: PropTypes.string,
};

/**
 * Returns a gradient CSS string for a given cluster color.
 * @param {string} color - The base accent color.
 * @returns {string} A CSS linear-gradient string.
 */
function getClusterGradient(color) {
  if (!color) return `linear-gradient(135deg, ${COLORS.ACCENT_BLUE}20 0%, ${COLORS.ACCENT_BLUE}05 100%)`;
  return `linear-gradient(135deg, ${color}20 0%, ${color}05 100%)`;
}

/**
 * Returns a description for a given intelligence cluster ID.
 * @param {string} clusterId - The cluster identifier.
 * @returns {string} A human-readable description.
 */
function getClusterDescription(clusterId) {
  const descriptions = {
    'cost-management': 'Track budgets, forecasts, invoices, and cost variances across your portfolio. Monitor financial health in real time.',
    'schedule-tracking': 'Monitor timelines, milestones, delays, and resource allocation. Stay ahead of schedule risks and critical path changes.',
    'risk-assessment': 'Identify, assess, and mitigate risks across projects. View severity indicators, probability scores, and recommended actions.',
    'quality-assurance': 'Track RFIs, inspections, compliance status, and defect reports. Ensure quality standards are met across all projects.',
    'stakeholder-comms': 'Manage client relationships, sales pipeline, meetings, and stakeholder engagement. Drive business development insights.',
  };

  return descriptions[clusterId] || 'Explore insights and analytics for this intelligence domain.';
}

/**
 * Returns up to 4 suggested queries for a given cluster ID.
 * @param {string} clusterId - The cluster identifier.
 * @returns {string[]} An array of suggested query strings.
 */
function getClusterSuggestions(clusterId) {
  if (clusterId && SUGGESTED_QUERIES[clusterId]) {
    return SUGGESTED_QUERIES[clusterId].slice(0, 4);
  }
  return [];
}

/**
 * Container animation variants for staggered children.
 */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

/**
 * Card animation variants for staggered entry.
 */
const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.35,
      ease: 'easeOut',
    },
  },
};

/**
 * IntelligenceClusterCard renders a single intelligence cluster card
 * with icon, gradient accent, title, description, and suggested queries.
 *
 * @param {{ cluster: object, isSelected: boolean, onSelect: function, onQueryClick: function }} props
 * @returns {React.ReactElement}
 */
function IntelligenceClusterCard({ cluster, isSelected, onSelect, onQueryClick }) {
  const description = getClusterDescription(cluster.id);
  const suggestions = getClusterSuggestions(cluster.id);
  const gradient = getClusterGradient(cluster.color);

  const handleSelect = useCallback(() => {
    onSelect(cluster.id);
  }, [cluster.id, onSelect]);

  const handleQueryClick = useCallback((e, query) => {
    e.stopPropagation();
    onQueryClick(query);
  }, [onQueryClick]);

  return (
    <motion.div
      variants={cardVariants}
      className={`glass-card cursor-pointer font-urbanist transition-all duration-200 ${
        isSelected
          ? 'ring-2'
          : 'hover:border-white/20'
      }`}
      style={{
        background: isSelected ? gradient : undefined,
        ringColor: isSelected ? cluster.color : undefined,
        borderColor: isSelected ? `${cluster.color}40` : undefined,
        padding: '20px',
      }}
      onClick={handleSelect}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      role="button"
      tabIndex={0}
      aria-label={`Select ${cluster.label} intelligence cluster`}
      aria-pressed={isSelected}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleSelect();
        }
      }}
    >
      {/* Header: Icon + Title */}
      <div className="flex items-start gap-3 mb-3">
        <div
          className="flex items-center justify-center w-11 h-11 rounded-xl shrink-0"
          style={{
            backgroundColor: `${cluster.color}15`,
          }}
        >
          <ClusterIcon clusterId={cluster.id} color={cluster.color} />
        </div>
        <div className="flex flex-col min-w-0">
          <h3 className="text-sm font-bold text-white sm:text-base truncate">
            {cluster.label}
          </h3>
          {isSelected && (
            <span
              className="inline-flex items-center text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full mt-0.5 w-fit"
              style={{
                backgroundColor: `${cluster.color}20`,
                color: cluster.color,
              }}
            >
              Active
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-white/50 leading-relaxed mb-3 line-clamp-2">
        {description}
      </p>

      {/* Gradient accent bar */}
      <div
        className="w-full h-0.5 rounded-full mb-3"
        style={{
          background: `linear-gradient(90deg, ${cluster.color}60 0%, ${cluster.color}10 100%)`,
        }}
      />

      {/* Suggested queries */}
      {suggestions.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-white/30">
            Suggested Queries
          </span>
          <div className="flex flex-col gap-1">
            {suggestions.map((query, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => handleQueryClick(e, query)}
                className="text-left text-xs text-white/40 hover:text-white/70 transition-colors duration-150 truncate focus:outline-none focus:text-white/70"
                title={query}
                aria-label={`Query: ${query}`}
              >
                <span className="mr-1.5" style={{ color: cluster.color }}>→</span>
                {query}
              </button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

IntelligenceClusterCard.propTypes = {
  cluster: PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
    keywords: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  isSelected: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
  onQueryClick: PropTypes.func.isRequired,
};

/**
 * IntelligenceClusterPanel renders a responsive grid of intelligence cluster
 * cards for domain-specific navigation.
 *
 * Features:
 * - Renders all intelligence clusters from constants.js
 * - Each card has a unique icon, gradient accent, domain title, description,
 *   and 3-4 suggested queries
 * - On cluster selection, updates QueryContext selectedCluster
 * - On suggested query click, submits the query via QueryContext
 * - Responsive grid: 3 columns desktop, 2 tablet, 1 mobile
 * - Animated entry with staggered Framer Motion
 * - Glassmorphism card styling with Urbanist font
 *
 * @param {{ title: string, showTitle: boolean }} props
 * @returns {React.ReactElement}
 */
export function IntelligenceClusterPanel({ title, showTitle }) {
  const { selectedCluster, selectCluster, submitQuery } = useQuery();

  const clusters = useMemo(() => {
    return INTELLIGENCE_CLUSTERS;
  }, []);

  const handleClusterSelect = useCallback((clusterId) => {
    if (selectedCluster === clusterId) {
      selectCluster(null);
    } else {
      selectCluster(clusterId);
    }
  }, [selectedCluster, selectCluster]);

  const handleQueryClick = useCallback((query) => {
    if (query && typeof query === 'string' && query.trim().length > 0) {
      submitQuery(query.trim());
    }
  }, [submitQuery]);

  const displayTitle = title || 'Intelligence Clusters';

  return (
    <motion.div
      className="w-full font-urbanist"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={ANIMATION.EASE_OUT}
    >
      {/* Header */}
      {showTitle !== false && (
        <motion.div
          className="flex items-center justify-between mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-bold text-white sm:text-xl">
              {displayTitle}
            </h2>
            <p className="text-xs text-white/40">
              Select a domain to explore insights and suggested queries
            </p>
          </div>
          {selectedCluster && (
            <motion.button
              type="button"
              onClick={() => selectCluster(null)}
              className="text-xs text-white/40 hover:text-white/70 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-accent-blue/30 px-2 py-1 rounded-lg"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              aria-label="Clear cluster selection"
            >
              Clear selection
            </motion.button>
          )}
        </motion.div>
      )}

      {/* Cluster grid */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {clusters.map((cluster) => (
          <IntelligenceClusterCard
            key={cluster.id}
            cluster={cluster}
            isSelected={selectedCluster === cluster.id}
            onSelect={handleClusterSelect}
            onQueryClick={handleQueryClick}
          />
        ))}
      </motion.div>

      {/* Active cluster indicator */}
      {selectedCluster && (
        <motion.div
          className="flex items-center gap-2 mt-4 pt-3 border-t border-white/5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          <div
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor: clusters.find((c) => c.id === selectedCluster)?.color || COLORS.ACCENT_BLUE,
            }}
          />
          <span className="text-xs text-white/40">
            Filtering by{' '}
            <span
              className="font-semibold"
              style={{
                color: clusters.find((c) => c.id === selectedCluster)?.color || COLORS.ACCENT_BLUE,
              }}
            >
              {clusters.find((c) => c.id === selectedCluster)?.label || 'Unknown'}
            </span>
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}

IntelligenceClusterPanel.propTypes = {
  /** Optional custom title for the panel header. */
  title: PropTypes.string,
  /** Whether to show the panel title and subtitle. Defaults to true. */
  showTitle: PropTypes.bool,
};

export default IntelligenceClusterPanel;