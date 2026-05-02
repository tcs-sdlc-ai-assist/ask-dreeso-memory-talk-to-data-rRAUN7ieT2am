import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { COLORS, ANIMATION } from '../../utils/constants.js';

/**
 * Size configuration map for the spinner.
 * Each size defines the container dimensions and SVG stroke width.
 */
const SIZE_CONFIG = {
  sm: { container: 'w-5 h-5', svgSize: 20, strokeWidth: 3 },
  md: { container: 'w-8 h-8', svgSize: 32, strokeWidth: 3 },
  lg: { container: 'w-12 h-12', svgSize: 48, strokeWidth: 4 },
};

/**
 * Returns the size configuration for a given size key.
 * Falls back to 'md' if the key is not recognized.
 *
 * @param {string} size - The size key ('sm', 'md', or 'lg').
 * @returns {{ container: string, svgSize: number, strokeWidth: number }}
 */
function getSizeConfig(size) {
  if (size && typeof size === 'string' && SIZE_CONFIG[size]) {
    return SIZE_CONFIG[size];
  }
  return SIZE_CONFIG.md;
}

/**
 * LoadingSpinner is a reusable loading state indicator with smooth rotation
 * animation. Uses accent-blue color by default and supports configurable
 * sizes (sm/md/lg). Optionally displays loading text below the spinner.
 *
 * Features:
 * - Smooth CSS rotation animation via Tailwind animate-spin
 * - Accent-blue color (configurable via color prop)
 * - Three size variants: sm (20px), md (32px), lg (48px)
 * - Optional loading text displayed below the spinner
 * - Fade-in entry animation via Framer Motion
 * - Urbanist font for loading text
 * - Accessible with role="status" and aria-label
 *
 * @param {{ size: string, text: string, color: string, className: string }} props
 * @returns {React.ReactElement}
 */
export function LoadingSpinner({ size, text, color, className }) {
  const config = getSizeConfig(size);
  const spinnerColor = color || COLORS.ACCENT_BLUE;
  const radius = (config.svgSize - config.strokeWidth) / 2;
  const center = config.svgSize / 2;

  return (
    <motion.div
      className={`flex flex-col items-center justify-center gap-2 font-urbanist ${className || ''}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={ANIMATION.EASE_OUT}
      role="status"
      aria-label={text || 'Loading'}
    >
      <div className={`${config.container} shrink-0`}>
        <svg
          className="animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox={`0 0 ${config.svgSize} ${config.svgSize}`}
          width={config.svgSize}
          height={config.svgSize}
        >
          <circle
            className="opacity-25"
            cx={center}
            cy={center}
            r={radius}
            stroke={spinnerColor}
            strokeWidth={config.strokeWidth}
          />
          <path
            className="opacity-75"
            fill={spinnerColor}
            d={`M${center} ${config.strokeWidth / 2}a${radius} ${radius} 0 0 1 ${radius} ${radius}h-${config.strokeWidth}a${radius - config.strokeWidth} ${radius - config.strokeWidth} 0 0 0-${radius - config.strokeWidth}-${radius - config.strokeWidth}V${config.strokeWidth / 2}z`}
          />
        </svg>
      </div>
      {text && typeof text === 'string' && text.trim().length > 0 && (
        <span className="text-xs text-white/40 text-center">
          {text.trim()}
        </span>
      )}
    </motion.div>
  );
}

LoadingSpinner.propTypes = {
  /** Size variant of the spinner: 'sm', 'md', or 'lg'. Defaults to 'md'. */
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  /** Optional loading text displayed below the spinner. */
  text: PropTypes.string,
  /** Optional custom color for the spinner. Defaults to accent-blue. */
  color: PropTypes.string,
  /** Optional additional CSS class names for the container. */
  className: PropTypes.string,
};

export default LoadingSpinner;