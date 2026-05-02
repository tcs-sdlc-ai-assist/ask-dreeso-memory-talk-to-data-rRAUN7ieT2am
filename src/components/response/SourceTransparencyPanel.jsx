import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { COLORS, ANIMATION } from '../../utils/constants.js';

/**
 * Returns a human-readable label for a system identifier.
 * @param {string} systemId - The system identifier (e.g. 'sap', 'procore').
 * @returns {string} A formatted system label.
 */
function getSystemLabel(systemId) {
  if (!systemId || typeof systemId !== 'string') return 'Unknown';

  const labels = {
    sap: 'SAP',
    procore: 'Procore',
    salesforce: 'Salesforce',
    primavera: 'Primavera',
  };

  const normalized = systemId.trim().toLowerCase();
  return labels[normalized] || systemId.charAt(0).toUpperCase() + systemId.slice(1);
}

/**
 * Returns the dot color based on system status.
 * @param {boolean} active - Whether the system actively contributed data.
 * @param {boolean} connected - Whether the system is connected.
 * @returns {string} A hex color string.
 */
function getStatusColor(active, connected) {
  if (active && connected) return COLORS.SUCCESS;
  if (connected) return COLORS.WARNING;
  return COLORS.CRITICAL;
}

/**
 * Returns a human-readable status label.
 * @param {boolean} active - Whether the system actively contributed data.
 * @param {boolean} connected - Whether the system is connected.
 * @returns {string} A status label string.
 */
function getStatusLabel(active, connected) {
  if (active && connected) return 'Active';
  if (connected) return 'Connected';
  return 'Unavailable';
}

/**
 * Formats a timestamp into a short relative or absolute time string.
 * @param {string|null} timestamp - An ISO timestamp string.
 * @returns {string} A formatted time string.
 */
function formatTimestamp(timestamp) {
  if (!timestamp || typeof timestamp !== 'string') return '—';

  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '—';

    const now = Date.now();
    const diffMs = now - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);

    if (diffSec < 5) return 'Just now';
    if (diffSec < 60) return `${diffSec}s ago`;
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  } catch {
    return '—';
  }
}

/**
 * Computes a contribution percentage for each active system.
 * Distributes evenly among active systems.
 * @param {Array<object>} indicators - The source indicator objects.
 * @returns {Map<string, number>} A map of system → contribution percentage.
 */
function computeContributions(indicators) {
  const contributions = new Map();

  if (!Array.isArray(indicators) || indicators.length === 0) {
    return contributions;
  }

  const activeCount = indicators.filter((ind) => ind.active && ind.connected).length;

  for (const indicator of indicators) {
    if (indicator.active && indicator.connected && activeCount > 0) {
      contributions.set(indicator.system, Math.round(100 / activeCount));
    } else {
      contributions.set(indicator.system, 0);
    }
  }

  return contributions;
}

/**
 * SourceIndicatorDot renders a single system indicator with colored dot,
 * system name, status, timestamp, and contribution percentage.
 *
 * @param {{ indicator: object, contribution: number, index: number }} props
 * @returns {React.ReactElement}
 */
function SourceIndicatorDot({ indicator, contribution, index }) {
  const color = getStatusColor(indicator.active, indicator.connected);
  const label = getSystemLabel(indicator.system);
  const statusLabel = getStatusLabel(indicator.active, indicator.connected);
  const timestamp = formatTimestamp(indicator.timestamp || null);

  return (
    <motion.div
      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/5 font-urbanist"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, delay: index * 0.05, ease: 'easeOut' }}
    >
      {/* Status dot */}
      <div className="relative shrink-0">
        <div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: color }}
        />
        {indicator.active && indicator.connected && (
          <motion.div
            className="absolute inset-0 w-2 h-2 rounded-full"
            style={{ backgroundColor: color }}
            animate={{ opacity: [0.6, 0], scale: [1, 2] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
          />
        )}
      </div>

      {/* System info */}
      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-white/70 truncate">
            {label}
          </span>
          {indicator.active && indicator.connected && contribution > 0 && (
            <span
              className="text-[9px] font-bold px-1 py-0.5 rounded-full"
              style={{
                backgroundColor: `${color}20`,
                color: color,
              }}
            >
              {contribution}%
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="text-[10px]"
            style={{ color: `${color}CC` }}
          >
            {statusLabel}
          </span>
          {indicator.active && indicator.connected && timestamp !== '—' && (
            <>
              <span className="text-[10px] text-white/20">·</span>
              <span className="text-[10px] text-white/30">
                {timestamp}
              </span>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

SourceIndicatorDot.propTypes = {
  indicator: PropTypes.shape({
    system: PropTypes.string.isRequired,
    active: PropTypes.bool,
    connected: PropTypes.bool,
    timestamp: PropTypes.string,
    dataType: PropTypes.string,
    success: PropTypes.bool,
    error: PropTypes.string,
  }).isRequired,
  contribution: PropTypes.number.isRequired,
  index: PropTypes.number.isRequired,
};

/**
 * SourceTransparencyPanel displays live source indicators as colored dots
 * for each enterprise system (SAP, Procore, Salesforce, Primavera).
 *
 * Features:
 * - Colored status dots: green = active, yellow = connected but inactive, red = unavailable
 * - Pulsing animation on active dots
 * - System name, connection status, data freshness timestamp
 * - Contribution percentage per active system
 * - Positioned at the bottom of ResponseCard
 * - Glassmorphism styling with Urbanist font
 * - Responsive layout: wraps on mobile, inline on desktop
 *
 * Accepts either:
 * - `sourceMap`: array of source indicator objects (from ResultAggregator buildSourceMap)
 * - `sources`: array of system name strings (simplified)
 * - `sourceIndicators`: array of indicator objects (from SystemConnector getSourceIndicators)
 *
 * @param {{ sourceMap: Array<object>, sources: Array<string>, sourceIndicators: Array<object> }} props
 * @returns {React.ReactElement|null}
 */
export function SourceTransparencyPanel({ sourceMap, sources, sourceIndicators }) {
  const indicators = useMemo(() => {
    // Prefer sourceMap (full detail from ResultAggregator)
    if (Array.isArray(sourceMap) && sourceMap.length > 0) {
      return sourceMap.map((entry) => ({
        system: entry.system || 'unknown',
        active: Boolean(entry.active),
        connected: Boolean(entry.connected),
        timestamp: entry.timestamp || null,
        dataType: entry.dataType || null,
        success: Boolean(entry.success),
        error: entry.error || null,
      }));
    }

    // Fall back to sourceIndicators (from SystemConnector)
    if (Array.isArray(sourceIndicators) && sourceIndicators.length > 0) {
      return sourceIndicators.map((entry) => ({
        system: entry.system || 'unknown',
        active: Boolean(entry.active),
        connected: Boolean(entry.connected),
        timestamp: entry.timestamp || null,
        dataType: null,
        success: Boolean(entry.active),
        error: null,
      }));
    }

    // Fall back to simple sources array (string names)
    if (Array.isArray(sources) && sources.length > 0) {
      return sources.map((s) => ({
        system: typeof s === 'string' ? s : 'unknown',
        active: true,
        connected: true,
        timestamp: new Date().toISOString(),
        dataType: null,
        success: true,
        error: null,
      }));
    }

    return [];
  }, [sourceMap, sources, sourceIndicators]);

  const contributions = useMemo(() => computeContributions(indicators), [indicators]);

  const activeCount = useMemo(
    () => indicators.filter((ind) => ind.active && ind.connected).length,
    [indicators],
  );

  if (indicators.length === 0) {
    return null;
  }

  return (
    <motion.div
      className="w-full font-urbanist pt-3 border-t border-white/5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={ANIMATION.EASE_OUT}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-white/30">
          Sources
        </span>
        {activeCount > 0 && (
          <span className="text-[10px] text-white/20">
            {activeCount} of {indicators.length} {activeCount === 1 ? 'system' : 'systems'} active
          </span>
        )}
      </div>

      {/* Indicator grid */}
      <div className="flex flex-wrap items-center gap-2">
        {indicators.map((indicator, idx) => (
          <SourceIndicatorDot
            key={indicator.system}
            indicator={indicator}
            contribution={contributions.get(indicator.system) || 0}
            index={idx}
          />
        ))}
      </div>
    </motion.div>
  );
}

SourceTransparencyPanel.propTypes = {
  /** Full source map from ResultAggregator buildSourceMap (preferred). */
  sourceMap: PropTypes.arrayOf(
    PropTypes.shape({
      system: PropTypes.string.isRequired,
      active: PropTypes.bool,
      connected: PropTypes.bool,
      dataType: PropTypes.string,
      success: PropTypes.bool,
      error: PropTypes.string,
      timestamp: PropTypes.string,
    }),
  ),
  /** Simple array of source system name strings. */
  sources: PropTypes.arrayOf(PropTypes.string),
  /** Source indicators from SystemConnector getSourceIndicators. */
  sourceIndicators: PropTypes.arrayOf(
    PropTypes.shape({
      system: PropTypes.string.isRequired,
      active: PropTypes.bool,
      connected: PropTypes.bool,
    }),
  ),
};

export default SourceTransparencyPanel;