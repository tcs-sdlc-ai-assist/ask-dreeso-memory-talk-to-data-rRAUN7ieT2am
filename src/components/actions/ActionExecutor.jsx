import { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { executeAction, findActionById } from '../../services/ActionDispatcher.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { COLORS, ANIMATION } from '../../utils/constants.js';

/**
 * Returns a color for a given action category.
 * @param {string} category - The action category.
 * @returns {string} A hex color string.
 */
function getCategoryColor(category) {
  if (!category || typeof category !== 'string') return COLORS.ACCENT_BLUE;

  switch (category.trim().toLowerCase()) {
    case 'approval':
      return COLORS.SUCCESS;
    case 'financial':
      return COLORS.WARNING;
    case 'escalation':
      return COLORS.CRITICAL;
    case 'communication':
      return COLORS.ACCENT_BLUE_LIGHT;
    case 'reporting':
      return COLORS.ACCENT_BLUE;
    case 'scheduling':
      return COLORS.WARNING;
    default:
      return COLORS.ACCENT_BLUE;
  }
}

/**
 * Returns an icon SVG for a given action category.
 * @param {string} category - The action category.
 * @param {string} color - The icon color.
 * @returns {React.ReactElement} An SVG icon element.
 */
function CategoryIcon({ category, color }) {
  const iconColor = color || COLORS.ACCENT_BLUE;
  const normalized = (category || '').trim().toLowerCase();

  if (normalized === 'approval') {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={iconColor}
        className="w-6 h-6 shrink-0"
      >
        <path
          fillRule="evenodd"
          d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
          clipRule="evenodd"
        />
      </svg>
    );
  }

  if (normalized === 'financial') {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={iconColor}
        className="w-6 h-6 shrink-0"
      >
        <path d="M12 7.5a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z" />
        <path
          fillRule="evenodd"
          d="M1.5 4.875C1.5 3.839 2.34 3 3.375 3h17.25c1.035 0 1.875.84 1.875 1.875v9.75c0 1.036-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 011.5 14.625v-9.75zM8.25 9.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM18.75 9a.75.75 0 00-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 00.75-.75V9.75a.75.75 0 00-.75-.75h-.008zM4.5 9.75A.75.75 0 015.25 9h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H5.25a.75.75 0 01-.75-.75V9.75z"
          clipRule="evenodd"
        />
      </svg>
    );
  }

  if (normalized === 'escalation') {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={iconColor}
        className="w-6 h-6 shrink-0"
      >
        <path
          fillRule="evenodd"
          d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
          clipRule="evenodd"
        />
      </svg>
    );
  }

  if (normalized === 'communication') {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={iconColor}
        className="w-6 h-6 shrink-0"
      >
        <path
          fillRule="evenodd"
          d="M8.25 6.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM15.75 9.75a3 3 0 116 0 3 3 0 01-6 0zM2.25 9.75a3 3 0 116 0 3 3 0 01-6 0zM6.31 15.117A6.745 6.745 0 0112 12a6.745 6.745 0 016.709 7.498.75.75 0 01-.372.568A12.696 12.696 0 0112 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 01-.372-.568 6.787 6.787 0 011.019-4.38z"
          clipRule="evenodd"
        />
      </svg>
    );
  }

  // Default / reporting / scheduling
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={iconColor}
      className="w-6 h-6 shrink-0"
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

CategoryIcon.propTypes = {
  category: PropTypes.string,
  color: PropTypes.string,
};

/**
 * Returns a human-readable system label.
 * @param {string|null} systemId - The system identifier.
 * @returns {string} A formatted system label.
 */
function getSystemLabel(systemId) {
  if (!systemId || typeof systemId !== 'string') return 'Internal';

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
 * Formats parameter entries for display.
 * @param {object} params - The action parameters.
 * @returns {Array<{ key: string, value: string }>} Formatted parameter entries.
 */
function formatParams(params) {
  if (!params || typeof params !== 'object') return [];

  return Object.entries(params)
    .filter(([, value]) => value !== null && value !== undefined)
    .map(([key, value]) => ({
      key: key
        .replace(/([A-Z])/g, ' $1')
        .replace(/_/g, ' ')
        .replace(/^./, (s) => s.toUpperCase())
        .trim(),
      value: typeof value === 'number' ? value.toLocaleString() : String(value),
    }));
}

/**
 * Overlay backdrop animation variants.
 */
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

/**
 * Modal animation variants.
 */
const modalVariants = {
  hidden: { opacity: 0, scale: 0.92, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    scale: 0.92,
    y: 20,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
};

/**
 * ActionResultDisplay renders the result of an action execution.
 *
 * @param {{ result: object, actionLabel: string, categoryColor: string, onClose: function }} props
 * @returns {React.ReactElement}
 */
function ActionResultDisplay({ result, actionLabel, categoryColor, onClose }) {
  const isSuccess = result.success;
  const statusColor = isSuccess ? COLORS.SUCCESS : COLORS.CRITICAL;
  const statusLabel = isSuccess ? 'Success' : 'Failed';

  const details = result.result?.details || null;
  const message = result.result?.message || result.error?.details || result.error?.message || null;

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      {/* Status header */}
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center w-10 h-10 rounded-full shrink-0"
          style={{ backgroundColor: `${statusColor}20` }}
        >
          {isSuccess ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill={statusColor}
              className="w-6 h-6"
            >
              <path
                fillRule="evenodd"
                d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill={statusColor}
              className="w-6 h-6"
            >
              <path
                fillRule="evenodd"
                d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
        <div className="flex flex-col min-w-0">
          <h3 className="text-base font-bold text-white">{actionLabel}</h3>
          <span
            className="inline-flex items-center text-xs font-semibold uppercase px-2 py-0.5 rounded-full mt-0.5 w-fit"
            style={{
              backgroundColor: `${statusColor}20`,
              color: statusColor,
            }}
          >
            {statusLabel}
          </span>
        </div>
      </div>

      {/* Message */}
      {message && (
        <p className="text-sm text-white/60 leading-relaxed">{message}</p>
      )}

      {/* Details */}
      {details && typeof details === 'object' && (
        <div className="space-y-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-white/30">
            Details
          </span>
          <div className="glass-light rounded-xl px-4 py-3 space-y-1.5">
            {Object.entries(details)
              .filter(([, value]) => value !== null && value !== undefined && !Array.isArray(value))
              .map(([key, value]) => (
                <div key={key} className="flex items-center justify-between gap-2">
                  <span className="text-xs text-white/50 shrink-0">
                    {key
                      .replace(/([A-Z])/g, ' $1')
                      .replace(/_/g, ' ')
                      .replace(/^./, (s) => s.toUpperCase())
                      .trim()}
                  </span>
                  <span className="text-xs font-medium text-white/80 text-right truncate">
                    {typeof value === 'number' ? value.toLocaleString() : String(value)}
                  </span>
                </div>
              ))}
            {Object.entries(details)
              .filter(([, value]) => Array.isArray(value))
              .map(([key, value]) => (
                <div key={key} className="pt-1">
                  <span className="text-xs text-white/50">
                    {key
                      .replace(/([A-Z])/g, ' $1')
                      .replace(/_/g, ' ')
                      .replace(/^./, (s) => s.toUpperCase())
                      .trim()}
                  </span>
                  <ul className="mt-1 space-y-0.5">
                    {value.map((item, idx) => (
                      <li key={idx} className="text-xs text-white/40 flex items-start gap-1.5">
                        <span style={{ color: categoryColor }} className="mt-0.5">•</span>
                        <span>{String(item)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Dispatch ID */}
      {result.dispatchId && (
        <div className="flex items-center justify-end">
          <span className="text-[10px] text-white/20">
            Dispatch ID: {result.dispatchId}
          </span>
        </div>
      )}

      {/* Close button */}
      <div className="flex justify-end pt-2">
        <motion.button
          type="button"
          onClick={onClose}
          className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent-blue/30"
          style={{
            backgroundColor: `${categoryColor}20`,
            color: categoryColor,
          }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          aria-label="Close action result"
        >
          Done
        </motion.button>
      </div>
    </motion.div>
  );
}

ActionResultDisplay.propTypes = {
  result: PropTypes.object.isRequired,
  actionLabel: PropTypes.string.isRequired,
  categoryColor: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

/**
 * ActionExecutor provides a confirmation dialog before executing actions
 * in enterprise systems. Shows action type, target system, affected records,
 * and impact summary. Includes confirm/cancel buttons. On confirm, delegates
 * to ActionDispatcher and shows success/failure result.
 *
 * Features:
 * - Glassmorphism modal overlay with Framer Motion entry animation
 * - Action type icon and category badge
 * - Target system indicator
 * - Parameter summary display
 * - Confirm/Cancel buttons with appropriate styling
 * - Loading state during execution
 * - Success/failure result display after execution
 * - Keyboard accessible (Escape to close)
 * - Urbanist font throughout
 *
 * @param {{ actionId: string, params: object, isOpen: boolean, onClose: function, onComplete: function }} props
 * @returns {React.ReactElement|null}
 */
export function ActionExecutor({ actionId, params, isOpen, onClose, onComplete }) {
  const { user, persona } = useAuth();
  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState(null);

  const actionDef = useMemo(() => {
    if (!actionId || typeof actionId !== 'string') return null;
    return findActionById(actionId);
  }, [actionId]);

  const categoryColor = useMemo(() => {
    return getCategoryColor(actionDef?.category);
  }, [actionDef]);

  const formattedParams = useMemo(() => {
    return formatParams(params);
  }, [params]);

  const handleConfirm = useCallback(async () => {
    if (executing || !actionId) return;

    setExecuting(true);
    setResult(null);

    try {
      const session = {
        userId: user?.userId || null,
        personaId: user?.personaId || persona?.id || null,
      };

      const executionResult = await executeAction(actionId, params || {}, session);
      setResult(executionResult);

      if (typeof onComplete === 'function') {
        onComplete(executionResult);
      }
    } catch (error) {
      console.error('[ActionExecutor] Execution failed:', error);
      setResult({
        dispatchId: null,
        success: false,
        actionId: actionId,
        actionLabel: actionDef?.label || 'Unknown Action',
        targetSystem: actionDef?.targetSystem || null,
        result: null,
        error: {
          code: 'ACT-500',
          message: 'Action execution failed.',
          details: error.message || 'An unexpected error occurred.',
        },
        timestamp: new Date().toISOString(),
      });
    } finally {
      setExecuting(false);
    }
  }, [actionId, params, executing, user, persona, actionDef, onComplete]);

  const handleClose = useCallback(() => {
    if (executing) return;
    setResult(null);
    if (typeof onClose === 'function') {
      onClose();
    }
  }, [executing, onClose]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape' && !executing) {
      handleClose();
    }
  }, [executing, handleClose]);

  const handleOverlayClick = useCallback((e) => {
    if (e.target === e.currentTarget && !executing) {
      handleClose();
    }
  }, [executing, handleClose]);

  if (!actionId) return null;

  const actionLabel = actionDef?.label || actionId;
  const actionDescription = actionDef?.description || 'Execute this action in the target system.';
  const targetSystem = actionDef?.targetSystem || null;
  const category = actionDef?.category || 'general';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-6"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.2 }}
          onClick={handleOverlayClick}
          onKeyDown={handleKeyDown}
          role="dialog"
          aria-modal="true"
          aria-label={`Confirm action: ${actionLabel}`}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            className="glass-card relative w-full max-w-md font-urbanist"
            style={{ padding: '24px' }}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            {result ? (
              <ActionResultDisplay
                result={result}
                actionLabel={actionLabel}
                categoryColor={categoryColor}
                onClose={handleClose}
              />
            ) : (
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start gap-3">
                  <div
                    className="flex items-center justify-center w-11 h-11 rounded-xl shrink-0"
                    style={{ backgroundColor: `${categoryColor}15` }}
                  >
                    <CategoryIcon category={category} color={categoryColor} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <h3 className="text-base font-bold text-white sm:text-lg">
                      {actionLabel}
                    </h3>
                    <span
                      className="inline-flex items-center text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full mt-0.5 w-fit"
                      style={{
                        backgroundColor: `${categoryColor}20`,
                        color: categoryColor,
                      }}
                    >
                      {category}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-white/50 leading-relaxed">
                  {actionDescription}
                </p>

                {/* Gradient accent bar */}
                <div
                  className="w-full h-0.5 rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${categoryColor}60 0%, ${categoryColor}10 100%)`,
                  }}
                />

                {/* Target system */}
                {targetSystem && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/50">Target System</span>
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: COLORS.SUCCESS }}
                      />
                      <span className="text-xs font-medium text-white/80">
                        {getSystemLabel(targetSystem)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Parameters */}
                {formattedParams.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-white/30">
                      Parameters
                    </span>
                    <div className="glass-light rounded-xl px-4 py-3 space-y-1.5">
                      {formattedParams.map((param) => (
                        <div
                          key={param.key}
                          className="flex items-center justify-between gap-2"
                        >
                          <span className="text-xs text-white/50 shrink-0">
                            {param.key}
                          </span>
                          <span className="text-xs font-medium text-white/80 text-right truncate">
                            {param.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Impact warning */}
                <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill={COLORS.WARNING}
                    className="w-4 h-4 shrink-0 mt-0.5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-xs text-white/40 leading-relaxed">
                    This action will be executed in the{' '}
                    <span className="font-medium text-white/60">
                      {targetSystem ? getSystemLabel(targetSystem) : 'target'}
                    </span>{' '}
                    system. This operation cannot be undone.
                  </p>
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <motion.button
                    type="button"
                    onClick={handleClose}
                    disabled={executing}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-white/50 bg-white/5 border border-white/10 hover:text-white/70 hover:bg-white/10 hover:border-white/20 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent-blue/30 disabled:opacity-30 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    aria-label="Cancel action"
                  >
                    Cancel
                  </motion.button>

                  <motion.button
                    type="button"
                    onClick={handleConfirm}
                    disabled={executing}
                    className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent-blue/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    style={{
                      backgroundColor: categoryColor,
                    }}
                    whileHover={{ scale: executing ? 1 : 1.03 }}
                    whileTap={{ scale: executing ? 1 : 0.97 }}
                    aria-label={executing ? 'Executing action...' : 'Confirm and execute action'}
                  >
                    {executing ? (
                      <>
                        <svg
                          className="w-4 h-4 animate-spin"
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
                        <span>Executing…</span>
                      </>
                    ) : (
                      <span>Confirm</span>
                    )}
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

ActionExecutor.propTypes = {
  /** The action identifier (e.g. 'approve-change-order'). */
  actionId: PropTypes.string.isRequired,
  /** Optional parameters for the action. */
  params: PropTypes.object,
  /** Whether the confirmation dialog is open. */
  isOpen: PropTypes.bool.isRequired,
  /** Callback invoked when the dialog is closed/cancelled. */
  onClose: PropTypes.func.isRequired,
  /** Optional callback invoked after action execution completes. Receives the execution result. */
  onComplete: PropTypes.func,
};

export default ActionExecutor;