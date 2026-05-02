import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { COLORS, ANIMATION } from '../../utils/constants.js';

/**
 * Returns a trend direction based on an array of numeric values.
 * @param {number[]} values - Array of trend values.
 * @returns {'up'|'down'|'stable'} The trend direction.
 */
function getTrendDirection(values) {
  if (!Array.isArray(values) || values.length < 2) return 'stable';

  const last = values[values.length - 1];
  const prev = values[values.length - 2];

  if (last > prev + 0.005) return 'up';
  if (last < prev - 0.005) return 'down';
  return 'stable';
}

/**
 * Returns a color based on a numeric value and threshold.
 * @param {number} value - The value to evaluate.
 * @param {number} [goodThreshold=1.0] - Values at or above this are good.
 * @param {number} [warnThreshold=0.95] - Values at or above this are warnings.
 * @returns {string} A hex color string.
 */
function getValueColor(value, goodThreshold = 1.0, warnThreshold = 0.95) {
  if (typeof value !== 'number') return COLORS.TEXT_MUTED;
  if (value >= goodThreshold) return COLORS.SUCCESS;
  if (value >= warnThreshold) return COLORS.WARNING;
  return COLORS.CRITICAL;
}

/**
 * Returns a color for a confidence level percentage.
 * @param {number} confidence - The confidence level (0–100).
 * @returns {string} A hex color string.
 */
function getConfidenceColor(confidence) {
  if (typeof confidence !== 'number') return COLORS.TEXT_MUTED;
  if (confidence >= 75) return COLORS.SUCCESS;
  if (confidence >= 50) return COLORS.WARNING;
  return COLORS.CRITICAL;
}

/**
 * Returns a color for a variance value.
 * Positive variance (under budget / ahead of schedule) is green.
 * Negative variance is red.
 * @param {number} value - The variance value.
 * @returns {string} A hex color string.
 */
function getVarianceColor(value) {
  if (typeof value !== 'number') return COLORS.TEXT_MUTED;
  if (value > 0) return COLORS.SUCCESS;
  if (value < 0) return COLORS.CRITICAL;
  return COLORS.WARNING;
}

/**
 * TrendArrow renders an up, down, or stable trend indicator arrow.
 *
 * @param {{ direction: 'up'|'down'|'stable', color: string }} props
 * @returns {React.ReactElement}
 */
function TrendArrow({ direction, color }) {
  if (direction === 'up') {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill={color || COLORS.SUCCESS}
        className="w-4 h-4 shrink-0"
      >
        <path
          fillRule="evenodd"
          d="M10 15a.75.75 0 01-.75-.75V7.612L7.29 9.77a.75.75 0 01-1.08-1.04l3.25-3.5a.75.75 0 011.08 0l3.25 3.5a.75.75 0 01-1.08 1.04l-1.96-2.158v6.638A.75.75 0 0110 15z"
          clipRule="evenodd"
        />
      </svg>
    );
  }

  if (direction === 'down') {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill={color || COLORS.CRITICAL}
        className="w-4 h-4 shrink-0"
      >
        <path
          fillRule="evenodd"
          d="M10 5a.75.75 0 01.75.75v6.638l1.96-2.158a.75.75 0 111.08 1.04l-3.25 3.5a.75.75 0 01-1.08 0l-3.25-3.5a.75.75 0 111.08-1.04l1.96 2.158V5.75A.75.75 0 0110 5z"
          clipRule="evenodd"
        />
      </svg>
    );
  }

  // stable
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill={color || COLORS.WARNING}
      className="w-4 h-4 shrink-0"
    >
      <path
        fillRule="evenodd"
        d="M4 10a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H4.75A.75.75 0 014 10z"
        clipRule="evenodd"
      />
    </svg>
  );
}

TrendArrow.propTypes = {
  direction: PropTypes.oneOf(['up', 'down', 'stable']).isRequired,
  color: PropTypes.string,
};

/**
 * TrendValues renders a row of trend values (SPI or CPI) with color coding.
 *
 * @param {{ label: string, values: number[], goodThreshold: number, warnThreshold: number }} props
 * @returns {React.ReactElement|null}
 */
function TrendValues({ label, values, goodThreshold, warnThreshold }) {
  if (!Array.isArray(values) || values.length === 0) return null;

  const direction = getTrendDirection(values);
  const latestValue = values[values.length - 1];
  const latestColor = getValueColor(latestValue, goodThreshold, warnThreshold);
  const arrowColor = direction === 'up' ? COLORS.SUCCESS : direction === 'down' ? COLORS.CRITICAL : COLORS.WARNING;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/50">{label}</span>
        <div className="flex items-center gap-1">
          <TrendArrow direction={direction} color={arrowColor} />
          <span
            className="text-xs font-bold font-mono"
            style={{ color: latestColor }}
          >
            {latestValue.toFixed(2)}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        {values.map((val, i) => (
          <span
            key={i}
            className="text-[10px] font-mono px-1 py-0.5 rounded bg-white/5"
            style={{
              color: getValueColor(val, goodThreshold, warnThreshold),
            }}
          >
            {val.toFixed(2)}
          </span>
        ))}
      </div>
    </div>
  );
}

TrendValues.propTypes = {
  label: PropTypes.string.isRequired,
  values: PropTypes.arrayOf(PropTypes.number),
  goodThreshold: PropTypes.number,
  warnThreshold: PropTypes.number,
};

/**
 * ConfidenceMeter renders a visual confidence level indicator bar.
 *
 * @param {{ level: number }} props
 * @returns {React.ReactElement|null}
 */
function ConfidenceMeter({ level }) {
  if (typeof level !== 'number') return null;

  const color = getConfidenceColor(level);
  const clampedLevel = Math.max(0, Math.min(100, level));

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/50">Confidence</span>
        <span
          className="text-xs font-bold"
          style={{ color }}
        >
          {clampedLevel}%
        </span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${clampedLevel}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

ConfidenceMeter.propTypes = {
  level: PropTypes.number,
};

/**
 * MonthlyForecastChart renders a simplified monthly forecast comparison
 * showing planned vs actual vs forecast values.
 *
 * @param {{ months: string[], planned: number[], actual: number[], forecast: number[] }} props
 * @returns {React.ReactElement|null}
 */
function MonthlyForecastChart({ months, planned, actual, forecast }) {
  if (!Array.isArray(months) || months.length === 0) return null;
  if (!Array.isArray(planned) || planned.length === 0) return null;

  return (
    <div className="pt-2 space-y-1.5">
      <p className="text-xs font-medium text-white/50">Monthly Forecast</p>
      <div className="overflow-x-auto no-scrollbar">
        <div className="flex gap-2 pb-1">
          {months.map((month, i) => {
            const plannedVal = planned[i];
            const actualVal = Array.isArray(actual) ? actual[i] : null;
            const forecastVal = Array.isArray(forecast) ? forecast[i] : null;

            const variance = actualVal != null && plannedVal != null
              ? actualVal - plannedVal
              : forecastVal != null && plannedVal != null
                ? forecastVal - plannedVal
                : null;

            return (
              <div key={i} className="flex flex-col items-center min-w-[64px] gap-0.5">
                <span className="text-[10px] text-white/30 whitespace-nowrap">{month}</span>
                <span className="text-[10px] text-white/50">
                  {plannedVal != null ? `${(plannedVal / 1000000).toFixed(1)}M` : '—'}
                </span>
                {actualVal != null && (
                  <span className="text-[10px] font-medium text-white/70">
                    {(actualVal / 1000000).toFixed(1)}M
                  </span>
                )}
                {actualVal == null && forecastVal != null && (
                  <span
                    className="text-[10px] font-medium"
                    style={{ color: COLORS.ACCENT_BLUE }}
                  >
                    {(forecastVal / 1000000).toFixed(1)}M
                  </span>
                )}
                {variance != null && (
                  <span
                    className="text-[9px] font-mono"
                    style={{ color: getVarianceColor(-variance) }}
                  >
                    {variance >= 0 ? '+' : ''}{(variance / 1000000).toFixed(1)}M
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {/* Legend */}
      <div className="flex items-center gap-3 pt-1">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-white/50" />
          <span className="text-[10px] text-white/30">Planned</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-white/70" />
          <span className="text-[10px] text-white/30">Actual</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS.ACCENT_BLUE }} />
          <span className="text-[10px] text-white/30">Forecast</span>
        </div>
      </div>
    </div>
  );
}

MonthlyForecastChart.propTypes = {
  months: PropTypes.arrayOf(PropTypes.string),
  planned: PropTypes.arrayOf(PropTypes.number),
  actual: PropTypes.arrayOf(PropTypes.number),
  forecast: PropTypes.arrayOf(PropTypes.number),
};

/**
 * ForecastProjectCard renders forecast data for a single project.
 *
 * @param {{ projectKey: string, data: object, index: number }} props
 * @returns {React.ReactElement|null}
 */
function ForecastProjectCard({ projectKey, data, index }) {
  if (!data || typeof data !== 'object') return null;

  const hasTrends = Array.isArray(data.spiTrend) || Array.isArray(data.cpiTrend);
  const hasMonthly = Array.isArray(data.months) && Array.isArray(data.planned);

  return (
    <motion.div
      className="glass-light rounded-xl px-4 py-3 space-y-3 font-urbanist"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.08, ease: 'easeOut' }}
    >
      {/* Project header */}
      <h4 className="text-sm font-semibold text-white">{projectKey}</h4>

      {/* Predicted completion */}
      {data.predictedCompletion && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/50">Predicted Completion</span>
          <span className="text-xs font-medium text-white/80">{data.predictedCompletion}</span>
        </div>
      )}

      {/* Confidence meter */}
      {typeof data.confidenceLevel === 'number' && (
        <ConfidenceMeter level={data.confidenceLevel} />
      )}

      {/* SPI Trend */}
      {Array.isArray(data.spiTrend) && data.spiTrend.length > 0 && (
        <TrendValues
          label="SPI Trend"
          values={data.spiTrend}
          goodThreshold={1.0}
          warnThreshold={0.9}
        />
      )}

      {/* CPI Trend */}
      {Array.isArray(data.cpiTrend) && data.cpiTrend.length > 0 && (
        <TrendValues
          label="CPI Trend"
          values={data.cpiTrend}
          goodThreshold={1.0}
          warnThreshold={0.95}
        />
      )}

      {/* Monthly forecast chart */}
      {hasMonthly && (
        <MonthlyForecastChart
          months={data.months}
          planned={data.planned}
          actual={data.actual}
          forecast={data.forecast}
        />
      )}

      {/* Delay days */}
      {typeof data.delayDays === 'number' && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/50">Delay</span>
          <span
            className="text-xs font-bold"
            style={{ color: data.delayDays > 0 ? COLORS.CRITICAL : COLORS.SUCCESS }}
          >
            {data.delayDays > 0 ? `${data.delayDays} days` : 'On track'}
          </span>
        </div>
      )}

      {/* Variance */}
      {typeof data.variance === 'number' && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/50">Variance</span>
          <div className="flex items-center gap-1">
            <TrendArrow
              direction={data.variance > 0 ? 'up' : data.variance < 0 ? 'down' : 'stable'}
              color={getVarianceColor(data.variance)}
            />
            <span
              className="text-xs font-bold font-mono"
              style={{ color: getVarianceColor(data.variance) }}
            >
              {data.variance >= 0 ? '+' : ''}{typeof data.variance === 'number' && Math.abs(data.variance) >= 1000
                ? `${(data.variance / 1000000).toFixed(2)}M`
                : data.variance.toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
}

ForecastProjectCard.propTypes = {
  projectKey: PropTypes.string.isRequired,
  data: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
};

/**
 * ForecastModel displays forecast and projection data with trend indicators,
 * confidence intervals, and time horizons.
 *
 * Supports multiple data shapes:
 * - Object keyed by project ID/name, each containing forecast data
 * - Single forecast object with spiTrend, cpiTrend, months, planned, etc.
 * - Array of forecast objects
 *
 * Uses color coding:
 * - Positive trends / good values → SUCCESS green
 * - Negative trends / bad values → CRITICAL red
 * - Neutral / warning → WARNING yellow
 *
 * Glassmorphism card styling with Framer Motion entry animations.
 *
 * @param {{ forecast: object|Array<object> }} props
 * @returns {React.ReactElement}
 */
export function ForecastModel({ forecast }) {
  const entries = useMemo(() => {
    if (!forecast) return [];

    // Array of forecast objects
    if (Array.isArray(forecast)) {
      return forecast.map((item, idx) => ({
        key: item.projectName || item.name || item.projectId || `Forecast ${idx + 1}`,
        data: item,
      }));
    }

    // Single forecast object with trend data directly
    if (typeof forecast === 'object') {
      const keys = Object.keys(forecast);

      // Check if this is a single forecast (has spiTrend, months, etc. at top level)
      const isSingleForecast = keys.some(
        (k) => k === 'spiTrend' || k === 'cpiTrend' || k === 'months' || k === 'predictedCompletion' || k === 'confidenceLevel',
      );

      if (isSingleForecast) {
        return [{
          key: forecast.projectName || forecast.name || 'Forecast',
          data: forecast,
        }];
      }

      // Object keyed by project ID/name
      return keys
        .filter((k) => forecast[k] && typeof forecast[k] === 'object')
        .map((k) => ({
          key: k,
          data: forecast[k],
        }));
    }

    return [];
  }, [forecast]);

  if (entries.length === 0) {
    return (
      <motion.div
        className="font-urbanist"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={ANIMATION.EASE_OUT}
      >
        <p className="text-sm text-white/40 italic">No forecast data available.</p>
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
      {/* Summary header */}
      {entries.length > 1 && (
        <motion.div
          className="flex items-center gap-2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          <span className="text-xs text-white/30">
            {entries.length} {entries.length === 1 ? 'projection' : 'projections'}
          </span>
        </motion.div>
      )}

      {/* Forecast cards */}
      <div className="space-y-3">
        {entries.map((entry, idx) => (
          <ForecastProjectCard
            key={entry.key}
            projectKey={entry.key}
            data={entry.data}
            index={idx}
          />
        ))}
      </div>
    </motion.div>
  );
}

ForecastModel.propTypes = {
  forecast: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.arrayOf(PropTypes.object),
  ]),
};

export default ForecastModel;