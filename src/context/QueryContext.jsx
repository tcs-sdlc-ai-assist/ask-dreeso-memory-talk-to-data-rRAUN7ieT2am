import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { submitQuery as orchestrationSubmitQuery, executeAction, getCTASuggestions } from '../services/OrchestrationService.js';
import { useAuth } from './AuthContext.jsx';

/**
 * @typedef {object} QueryHistoryEntry
 * @property {string} id - Unique identifier for the history entry.
 * @property {string} query - The original query string.
 * @property {object|null} response - The orchestration response object.
 * @property {string|null} clusterId - The resolved intelligence cluster ID.
 * @property {string} clusterLabel - The resolved intelligence cluster label.
 * @property {string} timestamp - ISO timestamp of when the query was submitted.
 */

/**
 * @typedef {object} QueryContextValue
 * @property {string} currentQuery - The current query string in the input.
 * @property {function} setCurrentQuery - Setter for the current query string.
 * @property {Array<QueryHistoryEntry>} queryHistory - Array of past query/response pairs.
 * @property {object|null} activeResponse - The most recent orchestration response.
 * @property {boolean} loading - Whether a query is currently being processed.
 * @property {string|null} error - The current error message, if any.
 * @property {string|null} selectedCluster - The currently selected intelligence cluster ID.
 * @property {string[]} ctaSuggestions - Current CTA suggestion strings.
 * @property {function} submitQuery - Submits a natural language query for processing.
 * @property {function} selectCluster - Sets the active intelligence cluster filter.
 * @property {function} clearHistory - Clears all query history and resets state.
 * @property {function} handleCTAClick - Handles a CTA suggestion click by submitting it as a query.
 */

const QueryContext = createContext(null);

/**
 * Generates a unique identifier for a query history entry.
 * @returns {string}
 */
function generateHistoryId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `qh_${timestamp}_${random}`;
}

/**
 * QueryProvider wraps children with global query state management.
 * Manages current query, query history, active response, loading state,
 * selected cluster, and CTA interactions.
 *
 * @param {{ children: React.ReactNode }} props
 * @returns {React.ReactElement}
 */
export function QueryProvider({ children }) {
  const { user, persona } = useAuth();

  const [currentQuery, setCurrentQuery] = useState('');
  const [queryHistory, setQueryHistory] = useState([]);
  const [activeResponse, setActiveResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCluster, setSelectedCluster] = useState(null);
  const [ctaSuggestions, setCtaSuggestions] = useState(() => {
    return getCTASuggestions(persona?.id || null, null);
  });

  /**
   * Builds a session context object from the current auth state.
   * @returns {object|null}
   */
  const buildSessionContext = useCallback(() => {
    if (!user) return null;

    return {
      userId: user.userId || null,
      role: user.role || null,
      personaId: user.personaId || persona?.id || null,
    };
  }, [user, persona]);

  /**
   * Submits a natural language query for processing via OrchestrationService.
   * Updates query history, active response, loading state, and CTA suggestions.
   *
   * @param {string} query - The natural language query string.
   * @returns {Promise<void>}
   */
  const submitQuery = useCallback(async (query) => {
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      setError('Please enter a query.');
      return;
    }

    const trimmedQuery = query.trim();

    setLoading(true);
    setError(null);
    setCurrentQuery(trimmedQuery);

    try {
      const session = buildSessionContext();
      const result = await orchestrationSubmitQuery(trimmedQuery, session);

      if (!result.success && result.error) {
        setError(result.error.details || result.error.message || 'Query processing failed.');
      } else {
        setError(null);
      }

      setActiveResponse(result);

      const historyEntry = {
        id: generateHistoryId(),
        query: trimmedQuery,
        response: result,
        clusterId: result.clusterId || null,
        clusterLabel: result.clusterLabel || 'General',
        timestamp: new Date().toISOString(),
      };

      setQueryHistory((prev) => [...prev, historyEntry]);

      // Update CTA suggestions from the response or fallback
      if (result.ctaSuggestions && result.ctaSuggestions.length > 0) {
        setCtaSuggestions(result.ctaSuggestions);
      } else {
        const personaId = session?.personaId || null;
        const clusterId = result.clusterId || selectedCluster || null;
        setCtaSuggestions(getCTASuggestions(personaId, clusterId));
      }

      // Update selected cluster if the response resolved one
      if (result.clusterId) {
        setSelectedCluster(result.clusterId);
      }
    } catch (err) {
      console.error('[QueryContext] submitQuery failed:', err);
      setError(err.message || 'An unexpected error occurred while processing your query.');
      setActiveResponse(null);
    } finally {
      setLoading(false);
    }
  }, [buildSessionContext, selectedCluster]);

  /**
   * Sets the active intelligence cluster filter.
   * Updates CTA suggestions based on the selected cluster and active persona.
   *
   * @param {string|null} clusterId - The intelligence cluster ID, or null to clear.
   */
  const selectCluster = useCallback((clusterId) => {
    setSelectedCluster(clusterId || null);

    const personaId = persona?.id || user?.personaId || null;
    setCtaSuggestions(getCTASuggestions(personaId, clusterId || null));
  }, [persona, user]);

  /**
   * Clears all query history and resets query-related state.
   */
  const clearHistory = useCallback(() => {
    setQueryHistory([]);
    setActiveResponse(null);
    setCurrentQuery('');
    setError(null);
    setSelectedCluster(null);

    const personaId = persona?.id || user?.personaId || null;
    setCtaSuggestions(getCTASuggestions(personaId, null));
  }, [persona, user]);

  /**
   * Handles a CTA suggestion click by submitting it as a new query.
   *
   * @param {string} suggestion - The CTA suggestion string to submit.
   * @returns {Promise<void>}
   */
  const handleCTAClick = useCallback(async (suggestion) => {
    if (!suggestion || typeof suggestion !== 'string' || suggestion.trim().length === 0) {
      return;
    }

    setCurrentQuery(suggestion.trim());
    await submitQuery(suggestion.trim());
  }, [submitQuery]);

  const value = useMemo(() => ({
    currentQuery,
    setCurrentQuery,
    queryHistory,
    activeResponse,
    loading,
    error,
    selectedCluster,
    ctaSuggestions,
    submitQuery,
    selectCluster,
    clearHistory,
    handleCTAClick,
  }), [
    currentQuery,
    queryHistory,
    activeResponse,
    loading,
    error,
    selectedCluster,
    ctaSuggestions,
    submitQuery,
    selectCluster,
    clearHistory,
    handleCTAClick,
  ]);

  return (
    <QueryContext.Provider value={value}>
      {children}
    </QueryContext.Provider>
  );
}

QueryProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Custom hook for accessing the QueryContext.
 * Must be used within a QueryProvider.
 *
 * @returns {QueryContextValue} The query context value.
 */
export function useQuery() {
  const context = useContext(QueryContext);

  if (context === null) {
    throw new Error('useQuery must be used within a QueryProvider.');
  }

  return context;
}

export default QueryContext;