import { useCallback } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { useQuery } from '../../context/QueryContext.jsx';

/**
 * CTABubble is a contextual follow-up query suggestion bubble.
 *
 * Features:
 * - Rounded corners (20px / rounded-bubble)
 * - Accent-blue border with translucent background
 * - White text with Urbanist font
 * - Hover scale animation (1.05x, 200ms) via Framer Motion
 * - Tap scale animation (0.97x) for tactile feedback
 * - On click, triggers the query via QueryContext handleCTAClick
 *
 * @param {{ label: string, query: string, onClick: function }} props
 * @returns {React.ReactElement|null}
 */
export function CTABubble({ label, query, onClick }) {
  const { handleCTAClick } = useQuery();

  const handleClick = useCallback(() => {
    const queryText = query || label;

    if (!queryText || typeof queryText !== 'string' || queryText.trim().length === 0) {
      return;
    }

    if (typeof onClick === 'function') {
      onClick(queryText.trim());
    } else {
      handleCTAClick(queryText.trim());
    }
  }, [query, label, onClick, handleCTAClick]);

  const displayText = label || query;

  if (!displayText || typeof displayText !== 'string' || displayText.trim().length === 0) {
    return null;
  }

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      className="inline-flex items-center px-4 py-2 rounded-bubble text-xs font-medium text-white bg-accent-blue/10 border border-accent-blue/20 hover:bg-accent-blue/20 hover:border-accent-blue/30 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent-blue/30 font-urbanist"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      aria-label={`Follow-up query: ${displayText.trim()}`}
    >
      {displayText.trim()}
    </motion.button>
  );
}

CTABubble.propTypes = {
  /** The display text for the bubble. Falls back to query if not provided. */
  label: PropTypes.string,
  /** The query string to submit when clicked. Falls back to label if not provided. */
  query: PropTypes.string,
  /** Optional custom click handler. If not provided, uses QueryContext handleCTAClick. */
  onClick: PropTypes.func,
};

export default CTABubble;