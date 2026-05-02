import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { COLORS, ANIMATION } from '../../utils/constants.js';

/**
 * Returns the color associated with a risk severity level.
 * @param {string} severity - The severity level (critical, high, medium, low).
 * @returns {string} A hex color string.
 */
function getSeverityColor(severity) {
  if (!severity || typeof severity !== 'string') return COLORS.ACCENT_BLUE_LIGHT;

  const normalized = severity.trim().toLowerCase();

  switch (normalized) {
    case 'critical':
      return COLORS.CRITICAL;
    case 'high':
      return COLORS.WARNING;
    case 'medium':
      return COLORS.ACCENT_BLUE;
    case 'low':
      return COLORS.SUCCESS;
    default:
      return COLORS.ACCENT_BLUE_LIGHT;
  }
}

/**
 * Returns a human-readable label for a severity level.
 * @param {string} severity - The severity level.
 * @returns {string} The formatted label.
 */
function getSeverityLabel(severity) {
  if (!severity || typeof severity !== 'string') return 'Unknown';
  return severity.trim().charAt(0).toUpperCase() + severity.trim().slice(1).toLowerCase();
}

/**
 * Returns an icon SVG path for a given severity level.
 * @param {string} severity - The severity level.
 * @returns {React.ReactElement} An SVG icon element.
 */
function SeverityIcon({ severity }) {
  const color = getSeverityColor(severity);
  const normalized = (severity || '').trim().toLowerCase();

  if (normalized === 'critical' || normalized === 'high') {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill={color}
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

  if (normalized === 'medium') {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill={color}
        className="w-5 h-5 shrink-0"
      >
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
          clipRule="evenodd"
        />
      </svg>
    );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill={color}
      className="w-5 h-5 shrink-0"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
        clipRule="evenodd"
      />
    </svg>
  );
}

SeverityIcon.propTypes = {
  severity: PropTypes.string,
};

/**
 * RiskSignalCard renders a single risk signal with severity badge,
 * description, affected areas, and recommended actions.
 *
 * @param {{ risk: object, index: number }} props
 * @returns {React.ReactElement}
 */
function RiskSignalCard({ risk, index }) {
  const color = getSeverityColor(risk.severity);

  return (
    <motion.div
      className="glass-light rounded-xl px-4 py-3 space-y-2 font-urbanist"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.08, ease: 'easeOut' }}
    >
      {/* Header: severity badge + category */}
      <div className="flex items-center gap-2 flex-wrap">
        <SeverityIcon severity={risk.severity} />
        <span
          className="inline-flex items-center text-xs font-bold uppercase px-2 py-0.5 rounded-full"
          style={{
            backgroundColor: `${color}20`,
            color: color,
          }}
        >
          {getSeverityLabel(risk.severity)}
        </span>
        {risk.category && (
          <span className="inline-flex items-center text-xs font-medium px-1.5 py-0.5 rounded-full bg-white/5 text-white/50">
            {risk.category}
          </span>
        )}
        {typeof risk.probability === 'number' && (
          <span className="text-xs text-white/40 ml-auto shrink-0">
            {risk.probability}% probability
          </span>
        )}
      </div>

      {/* Title */}
      {risk.title && (
        <h4 className="text-sm font-semibold text-white">{risk.title}</h4>
      )}

      {/* Description */}
      {risk.description && (
        <p className="text-xs text-white/50 leading-relaxed">{risk.description}</p>
      )}

      {/* Impact / affected areas */}
      {risk.impact && (
        <div className="flex items-start gap-1.5">
          <span className="text-xs font-medium text-white/60 shrink-0">Impact:</span>
          <span className="text-xs text-white/40">{risk.impact}</span>
        </div>
      )}

      {/* Affected areas */}
      {Array.isArray(risk.affectedAreas) && risk.affectedAreas.length > 0 && (
        <div className="flex items-start gap-1.5 flex-wrap">
          <span className="text-xs font-medium text-white/60 shrink-0">Affected Areas:</span>
          <div className="flex flex-wrap gap-1">
            {risk.affectedAreas.map((area, areaIdx) => (
              <span
                key={areaIdx}
                className="inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-white/5 text-white/40"
              >
                {area}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Project name */}
      {risk.projectName && (
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-white/60 shrink-0">Project:</span>
          <span className="text-xs text-white/40">{risk.projectName}</span>
        </div>
      )}

      {/* Source */}
      {risk.source && (
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-white/60 shrink-0">Source:</span>
          <span className="text-xs text-white/40">{risk.source}</span>
        </div>
      )}

      {/* Suggested / recommended actions */}
      {Array.isArray(risk.suggestedActions) && risk.suggestedActions.length > 0 && (
        <div className="pt-1">
          <p className="text-xs font-medium text-white/50 mb-1">Recommended Actions:</p>
          <ul className="space-y-0.5">
            {risk.suggestedActions.map((action, actionIdx) => (
              <li key={actionIdx} className="text-xs text-white/40 flex items-start gap-1.5">
                <span className="text-accent-blue mt-0.5">•</span>
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Detected date */}
      {risk.detectedDate && (
        <div className="flex items-center justify-end pt-1">
          <span className="text-[10px] text-white/20">
            Detected: {risk.detectedDate}
          </span>
        </div>
      )}
    </motion.div>
  );
}

RiskSignalCard.propTypes = {
  risk: PropTypes.shape({
    id: PropTypes.string,
    severity: PropTypes.string,
    category: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    impact: PropTypes.string,
    probability: PropTypes.number,
    projectId: PropTypes.string,
    projectName: PropTypes.string,
    source: PropTypes.string,
    detectedDate: PropTypes.string,
    affectedAreas: PropTypes.arrayOf(PropTypes.string),
    suggestedActions: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  index: PropTypes.number.isRequired,
};

/**
 * RiskSignal displays a list of risk signal indicators with color-coded
 * severity badges, descriptions, affected areas, and recommended actions.
 *
 * Severity levels and their colors:
 * - critical → COLORS.CRITICAL (red)
 * - high → COLORS.WARNING (yellow/orange)
 * - medium → COLORS.ACCENT_BLUE (blue)
 * - low → COLORS.SUCCESS (green)
 *
 * Supports both a single risk object and an array of risks.
 * Entry animation: staggered fade-in + slide-up via Framer Motion.
 *
 * @param {{ risks: Array<object>|object }} props
 * @returns {React.ReactElement}
 */
export function RiskSignal({ risks }) {
  const riskList = useMemo(() => {
    if (!risks) return [];
    if (Array.isArray(risks)) return risks;
    if (typeof risks === 'object') return [risks];
    return [];
  }, [risks]);

  const summary = useMemo(() => {
    if (riskList.length === 0) return null;

    const counts = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    };

    for (const risk of riskList) {
      const severity = (risk.severity || '').trim().toLowerCase();
      if (severity in counts) {
        counts[severity] += 1;
      }
    }

    return counts;
  }, [riskList]);

  if (riskList.length === 0) {
    return (
      <motion.div
        className="font-urbanist"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={ANIMATION.EASE_OUT}
      >
        <p className="text-sm text-white/40 italic">No active risk signals.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="w-full font-urbanist space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={ANIMATION.EASE_OUT}
    >
      {/* Summary bar */}
      {summary && riskList.length > 1 && (
        <motion.div
          className="flex items-center gap-3 flex-wrap"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          <span className="text-xs text-white/30 shrink-0">
            {riskList.length} {riskList.length === 1 ? 'signal' : 'signals'}:
          </span>
          {summary.critical > 0 && (
            <span
              className="inline-flex items-center text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full"
              style={{ backgroundColor: `${COLORS.CRITICAL}20`, color: COLORS.CRITICAL }}
            >
              {summary.critical} Critical
            </span>
          )}
          {summary.high > 0 && (
            <span
              className="inline-flex items-center text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full"
              style={{ backgroundColor: `${COLORS.WARNING}20`, color: COLORS.WARNING }}
            >
              {summary.high} High
            </span>
          )}
          {summary.medium > 0 && (
            <span
              className="inline-flex items-center text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full"
              style={{ backgroundColor: `${COLORS.ACCENT_BLUE}20`, color: COLORS.ACCENT_BLUE }}
            >
              {summary.medium} Medium
            </span>
          )}
          {summary.low > 0 && (
            <span
              className="inline-flex items-center text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full"
              style={{ backgroundColor: `${COLORS.SUCCESS}20`, color: COLORS.SUCCESS }}
            >
              {summary.low} Low
            </span>
          )}
        </motion.div>
      )}

      {/* Risk signal cards */}
      <div className="space-y-3">
        {riskList.map((risk, idx) => (
          <RiskSignalCard
            key={risk.id || idx}
            risk={risk}
            index={idx}
          />
        ))}
      </div>
    </motion.div>
  );
}

RiskSignal.propTypes = {
  risks: PropTypes.oneOfType([
    PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        severity: PropTypes.string,
        category: PropTypes.string,
        title: PropTypes.string,
        description: PropTypes.string,
        impact: PropTypes.string,
        probability: PropTypes.number,
        projectId: PropTypes.string,
        projectName: PropTypes.string,
        source: PropTypes.string,
        detectedDate: PropTypes.string,
        affectedAreas: PropTypes.arrayOf(PropTypes.string),
        suggestedActions: PropTypes.arrayOf(PropTypes.string),
      }),
    ),
    PropTypes.shape({
      id: PropTypes.string,
      severity: PropTypes.string,
      category: PropTypes.string,
      title: PropTypes.string,
      description: PropTypes.string,
      impact: PropTypes.string,
      probability: PropTypes.number,
      projectId: PropTypes.string,
      projectName: PropTypes.string,
      source: PropTypes.string,
      detectedDate: PropTypes.string,
      affectedAreas: PropTypes.arrayOf(PropTypes.string),
      suggestedActions: PropTypes.arrayOf(PropTypes.string),
    }),
  ]),
};

export default RiskSignal;