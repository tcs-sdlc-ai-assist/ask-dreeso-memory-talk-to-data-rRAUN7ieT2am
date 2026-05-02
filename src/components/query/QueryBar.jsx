import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '../../context/QueryContext.jsx';
import { ANIMATION } from '../../utils/constants.js';

/**
 * QueryBar is the natural language query input component.
 *
 * Features:
 * - Bottom-aligned query input bar
 * - Expands on focus with smooth 300ms animation
 * - Glassmorphism background with border-radius 16px
 * - Text input with placeholder, submit button (accent-blue), microphone icon
 * - Loading spinner during query processing
 * - Responsive: full-width on mobile, centered with max-width on desktop
 *
 * @returns {React.ReactElement}
 */
export function QueryBar() {
  const { currentQuery, setCurrentQuery, submitQuery, loading } = useQuery();
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  const handleChange = useCallback((e) => {
    setCurrentQuery(e.target.value);
  }, [setCurrentQuery]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!currentQuery || currentQuery.trim().length === 0 || loading) {
      return;
    }
    await submitQuery(currentQuery.trim());
  }, [currentQuery, loading, submitQuery]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!currentQuery || currentQuery.trim().length === 0 || loading) {
        return;
      }
      submitQuery(currentQuery.trim());
    }
  }, [currentQuery, loading, submitQuery]);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-4 sm:px-6 sm:pb-6 md:px-8 md:pb-8">
      <motion.form
        onSubmit={handleSubmit}
        className="mx-auto w-full max-w-3xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={ANIMATION.EASE_OUT}
      >
        <motion.div
          className="glass flex items-center gap-2 rounded-2xl px-4 py-3 font-urbanist sm:gap-3 sm:px-5 sm:py-3.5"
          animate={{
            scale: isFocused ? 1.02 : 1,
            borderColor: isFocused
              ? 'rgba(78, 132, 196, 0.4)'
              : 'rgba(78, 132, 196, 0.15)',
          }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          style={{ borderRadius: '16px' }}
        >
          {/* Microphone icon */}
          <button
            type="button"
            className="flex shrink-0 items-center justify-center w-8 h-8 rounded-lg text-white/40 hover:text-white/70 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent-blue/30"
            aria-label="Voice input"
            tabIndex={-1}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
              <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
            </svg>
          </button>

          {/* Text input */}
          <input
            ref={inputRef}
            type="text"
            value={currentQuery}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder="Ask Dreeso anything about your projects..."
            disabled={loading}
            className="flex-1 min-w-0 bg-transparent text-sm text-white placeholder-white/30 font-urbanist focus:outline-none disabled:opacity-50 sm:text-base"
            aria-label="Query input"
            autoComplete="off"
          />

          {/* Loading spinner or submit button */}
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="spinner"
                className="flex shrink-0 items-center justify-center w-9 h-9"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <svg
                  className="w-5 h-5 text-accent-blue animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </motion.div>
            ) : (
              <motion.button
                key="submit"
                type="submit"
                disabled={!currentQuery || currentQuery.trim().length === 0}
                className="flex shrink-0 items-center justify-center w-9 h-9 rounded-xl bg-accent-blue text-white transition-colors duration-200 hover:bg-accent-blue/80 focus:outline-none focus:ring-2 focus:ring-accent-blue/30 disabled:opacity-30 disabled:cursor-not-allowed"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Submit query"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-4 h-4"
                >
                  <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
                </svg>
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.form>
    </div>
  );
}

export default QueryBar;