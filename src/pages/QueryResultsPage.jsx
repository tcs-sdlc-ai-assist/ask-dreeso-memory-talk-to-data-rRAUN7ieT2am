import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import { useQuery } from '../context/QueryContext.jsx';
import { AppLayout } from '../components/layout/AppLayout.jsx';
import { QueryBar } from '../components/query/QueryBar.jsx';
import { ResponseCard } from '../components/response/ResponseCard.jsx';
import { RiskSignal } from '../components/response/RiskSignal.jsx';
import { ForecastModel } from '../components/response/ForecastModel.jsx';
import { DataTable } from '../components/response/DataTable.jsx';
import { SourceTransparencyPanel } from '../components/response/SourceTransparencyPanel.jsx';
import { CTABubble } from '../components/response/CTABubble.jsx';
import { ActionExecutor } from '../components/actions/ActionExecutor.jsx';
import { ErrorBanner } from '../components/common/ErrorBanner.jsx';
import { LoadingSpinner } from '../components/common/LoadingSpinner.jsx';
import { COLORS, ANIMATION } from '../utils/constants.js';

/**
 * Determines available actions based on the response type and data.
 * @param {object|null} response - The NLP response object.
 * @returns {Array<{ actionId: string, label: string, params: object }>}
 */
function deriveAvailableActions(response) {
  if (!response || typeof response !== 'object') return [];

  const actions = [];
  const type = response.type;
  const data = response.data;

  if (!data) return actions;

  if (type === 'change-order-summary' || type === 'cost-summary') {
    if (data.changeOrders && Array.isArray(data.changeOrders)) {
      const pending = data.changeOrders.filter((co) => co.status === 'pending');
      if (pending.length > 0) {
        actions.push({
          actionId: 'approve-change-order',
          label: 'Approve Change Order',
          params: { changeOrderId: pending[0].id },
        });
      }
    }
  }

  if (type === 'invoice-summary') {
    if (data.invoices && Array.isArray(data.invoices)) {
      const overdue = data.invoices.filter((inv) => inv.status === 'overdue');
      if (overdue.length > 0) {
        actions.push({
          actionId: 'process-payment',
          label: 'Process Payment',
          params: { invoiceId: overdue[0].id },
        });
      }
    }
  }

  if (type === 'rfi-summary') {
    if (data.rfis && Array.isArray(data.rfis)) {
      const openCritical = data.rfis.filter((rfi) => rfi.status === 'open' && (rfi.priority === 'critical' || rfi.priority === 'high'));
      if (openCritical.length > 0) {
        actions.push({
          actionId: 'escalate-rfi',
          label: 'Escalate RFI',
          params: { rfiId: openCritical[0].id },
        });
      }
    }
  }

  if (type === 'risk-summary') {
    if (data.risks && Array.isArray(data.risks)) {
      const scheduleRisks = data.risks.filter((r) => r.category === 'schedule');
      if (scheduleRisks.length > 0) {
        actions.push({
          actionId: 'add-weekend-shift',
          label: 'Add Weekend Shift',
          params: { projectId: scheduleRisks[0].projectId },
        });
      }
    }
  }

  if (type === 'schedule-alert') {
    if (data.delayedProjects && Array.isArray(data.delayedProjects) && data.delayedProjects.length > 0) {
      actions.push({
        actionId: 'generate-report',
        label: 'Generate Report',
        params: {},
      });
    }
  }

  if (actions.length === 0) {
    actions.push({
      actionId: 'generate-report',
      label: 'Generate Report',
      params: {},
    });
  }

  return actions;
}

/**
 * Formats a timestamp into a readable string.
 * @param {string} timestamp - An ISO timestamp string.
 * @returns {string} A formatted time string.
 */
function formatTimestamp(timestamp) {
  if (!timestamp || typeof timestamp !== 'string') return '';

  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '';

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
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
      delayChildren: 0.1,
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
 * QueryResultsPage displays the analytical response after a query is submitted.
 *
 * Features:
 * - Shows the original query text with timestamp
 * - ResponseCard with structured output (table/risk/forecast)
 * - Dedicated RiskSignal, ForecastModel, DataTable rendering based on response type
 * - SourceTransparencyPanel showing which systems contributed data
 * - CTABubble row with 3-4 contextual follow-up suggestions
 * - ActionExecutor modal for available actions
 * - Bottom-aligned QueryBar for follow-up queries
 * - Loading state with spinner during query processing
 * - Error state with ErrorBanner and retry capability
 * - AppLayout wrapper with gradient background and PersonaBar
 * - Animated entry with Framer Motion stagger effect
 * - Responsive layout with Urbanist font
 *
 * @returns {React.ReactElement}
 */
export default function QueryResultsPage() {
  const { persona } = useAuth();
  const {
    activeResponse,
    loading,
    error,
    currentQuery,
    ctaSuggestions,
    submitQuery,
    handleCTAClick,
  } = useQuery();

  const [actionExecutorOpen, setActionExecutorOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [errorDismissed, setErrorDismissed] = useState(false);

  const nlpResponse = useMemo(() => {
    if (!activeResponse || typeof activeResponse !== 'object') return null;
    return activeResponse.nlpResponse || null;
  }, [activeResponse]);

  const sourceIndicators = useMemo(() => {
    if (!activeResponse || !Array.isArray(activeResponse.sourceIndicators)) return [];
    return activeResponse.sourceIndicators;
  }, [activeResponse]);

  const displaySuggestions = useMemo(() => {
    if (Array.isArray(ctaSuggestions) && ctaSuggestions.length > 0) {
      return ctaSuggestions.slice(0, 4);
    }
    if (nlpResponse && Array.isArray(nlpResponse.suggestedFollowUps) && nlpResponse.suggestedFollowUps.length > 0) {
      return nlpResponse.suggestedFollowUps.slice(0, 4);
    }
    return [];
  }, [ctaSuggestions, nlpResponse]);

  const availableActions = useMemo(() => {
    return deriveAvailableActions(nlpResponse);
  }, [nlpResponse]);

  const queryText = useMemo(() => {
    if (activeResponse && activeResponse.query) return activeResponse.query;
    return currentQuery || '';
  }, [activeResponse, currentQuery]);

  const queryTimestamp = useMemo(() => {
    if (activeResponse && activeResponse.timestamp) {
      return formatTimestamp(activeResponse.timestamp);
    }
    return '';
  }, [activeResponse]);

  const clusterLabel = useMemo(() => {
    if (activeResponse && activeResponse.clusterLabel) return activeResponse.clusterLabel;
    return 'General';
  }, [activeResponse]);

  const clusterId = useMemo(() => {
    if (activeResponse && activeResponse.clusterId) return activeResponse.clusterId;
    return null;
  }, [activeResponse]);

  const clusterColor = useMemo(() => {
    const clusterColors = {
      'cost-management': COLORS.ACCENT_BLUE,
      'schedule-tracking': COLORS.WARNING,
      'risk-assessment': COLORS.CRITICAL,
      'quality-assurance': COLORS.SUCCESS,
      'stakeholder-comms': COLORS.ACCENT_BLUE_LIGHT,
    };
    return clusterId ? (clusterColors[clusterId] || COLORS.ACCENT_BLUE) : COLORS.ACCENT_BLUE;
  }, [clusterId]);

  const handleActionClick = useCallback((action) => {
    setSelectedAction(action);
    setActionExecutorOpen(true);
  }, []);

  const handleActionClose = useCallback(() => {
    setActionExecutorOpen(false);
    setSelectedAction(null);
  }, []);

  const handleActionComplete = useCallback(() => {
    // Action completed — keep modal open to show result
  }, []);

  const handleRetry = useCallback(() => {
    if (queryText && queryText.trim().length > 0) {
      setErrorDismissed(false);
      submitQuery(queryText.trim());
    }
  }, [queryText, submitQuery]);

  const handleDismissError = useCallback(() => {
    setErrorDismissed(true);
  }, []);

  const handleCTABubbleClick = useCallback((suggestion) => {
    handleCTAClick(suggestion);
  }, [handleCTAClick]);

  const showError = error && !errorDismissed && !loading;
  const showLoading = loading;
  const showResults = !loading && !showError && activeResponse && nlpResponse;
  const showEmpty = !loading && !showError && (!activeResponse || !nlpResponse);

  return (
    <AppLayout>
      <motion.div
        className="w-full font-urbanist pb-28 sm:pb-32"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Query header */}
        {queryText && (
          <motion.div
            className="mb-6 sm:mb-8"
            variants={childVariants}
          >
            <div className="flex items-start gap-3">
              {/* Query icon */}
              <div
                className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0 mt-0.5"
                style={{ backgroundColor: `${clusterColor}15` }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill={clusterColor}
                  className="w-5 h-5"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.848 2.771A49.144 49.144 0 0112 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 01-3.476.383.39.39 0 00-.297.17l-2.755 4.133a.75.75 0 01-1.248 0l-2.755-4.133a.39.39 0 00-.297-.17 48.9 48.9 0 01-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97zM6.75 8.25a.75.75 0 01.75-.75h9a.75.75 0 010 1.5h-9a.75.75 0 01-.75-.75zm.75 2.25a.75.75 0 000 1.5H12a.75.75 0 000-1.5H7.5z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>

              {/* Query text and metadata */}
              <div className="flex flex-col min-w-0 flex-1">
                <p className="text-base font-semibold text-white sm:text-lg leading-relaxed">
                  {queryText}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className="inline-flex items-center text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full"
                    style={{
                      backgroundColor: `${clusterColor}20`,
                      color: clusterColor,
                    }}
                  >
                    {clusterLabel}
                  </span>
                  {queryTimestamp && (
                    <>
                      <span className="text-[10px] text-white/20">·</span>
                      <span className="text-[10px] text-white/30">{queryTimestamp}</span>
                    </>
                  )}
                  {nlpResponse && typeof nlpResponse.confidence === 'number' && (
                    <>
                      <span className="text-[10px] text-white/20">·</span>
                      <span
                        className="text-[10px] font-semibold"
                        style={{
                          color: nlpResponse.confidence >= 0.85
                            ? COLORS.SUCCESS
                            : nlpResponse.confidence >= 0.7
                              ? COLORS.WARNING
                              : COLORS.CRITICAL,
                        }}
                      >
                        {Math.round(nlpResponse.confidence * 100)}% confidence
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Error banner */}
        <AnimatePresence>
          {showError && (
            <motion.div
              className="mb-6"
              variants={childVariants}
            >
              <ErrorBanner
                message={error}
                type="error"
                visible={true}
                onRetry={handleRetry}
                onDismiss={handleDismissError}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading state */}
        <AnimatePresence>
          {showLoading && (
            <motion.div
              className="flex flex-col items-center justify-center py-16 sm:py-24"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <LoadingSpinner
                size="lg"
                text="Analyzing your query across enterprise systems..."
                color={clusterColor}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        {showResults && (
          <>
            {/* Response card */}
            <motion.div
              className="mb-6"
              variants={childVariants}
            >
              <ResponseCard
                response={nlpResponse}
                sourceIndicators={sourceIndicators}
                ctaSuggestions={displaySuggestions}
                onCTAClick={handleCTABubbleClick}
              />
            </motion.div>

            {/* CTA suggestions row */}
            {displaySuggestions.length > 0 && (
              <motion.div
                className="mb-6"
                variants={childVariants}
              >
                <div className="space-y-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-white/30">
                    Follow-up Suggestions
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {displaySuggestions.map((suggestion, idx) => (
                      <CTABubble
                        key={idx}
                        label={suggestion}
                        query={suggestion}
                        onClick={handleCTABubbleClick}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Available actions */}
            {availableActions.length > 0 && (
              <motion.div
                className="mb-6"
                variants={childVariants}
              >
                <div className="space-y-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-white/30">
                    Available Actions
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {availableActions.map((action) => (
                      <motion.button
                        key={action.actionId}
                        type="button"
                        onClick={() => handleActionClick(action)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent-blue/30 font-urbanist"
                        style={{
                          backgroundColor: `${clusterColor}20`,
                          color: clusterColor,
                          border: `1px solid ${clusterColor}30`,
                        }}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        aria-label={`Execute action: ${action.label}`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="w-3.5 h-3.5"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>{action.label}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Source transparency panel */}
            {sourceIndicators.length > 0 && (
              <motion.div
                className="mb-6"
                variants={childVariants}
              >
                <SourceTransparencyPanel
                  sourceIndicators={sourceIndicators}
                />
              </motion.div>
            )}
          </>
        )}

        {/* Empty state — no active response */}
        {showEmpty && (
          <motion.div
            className="flex flex-col items-center justify-center py-16 sm:py-24"
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
                  d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-white mb-1">No Results Yet</h2>
            <p className="text-sm text-white/40 text-center max-w-xs">
              Submit a query using the bar below to see analytical results from your enterprise systems.
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Bottom-aligned QueryBar */}
      <QueryBar />

      {/* Action executor modal */}
      {selectedAction && (
        <ActionExecutor
          actionId={selectedAction.actionId}
          params={selectedAction.params}
          isOpen={actionExecutorOpen}
          onClose={handleActionClose}
          onComplete={handleActionComplete}
        />
      )}
    </AppLayout>
  );
}