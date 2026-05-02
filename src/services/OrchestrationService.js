import { processQuery, executeAction as executeActionMock, getSuggestedQueries } from '../data/mockData.js';
import { fetchFromMultipleSystems, determineTargetSystems, getSourceIndicators } from './SystemConnector.js';
import { aggregateResults, buildSourceMap, normalizeData } from './ResultAggregator.js';
import { logAction } from './AuditLogger.js';
import { INTELLIGENCE_CLUSTERS } from '../utils/constants.js';

/**
 * Central orchestration service for natural language query processing
 * and multi-system coordination.
 *
 * Provides:
 * - submitQuery: end-to-end query processing (NLP → system fetch → aggregation → CTA)
 * - executeAction: dispatches actions to target systems
 * - All operations are audit-logged via AuditLogger.
 */

// ---------------------------------------------------------------------------
// Rate limiting (in-memory, per-user)
// ---------------------------------------------------------------------------

/** @type {Map<string, { count: number, windowStart: number }>} */
const rateLimitMap = new Map();

/** Maximum queries per rate-limit window per user. */
const RATE_LIMIT_MAX = 10;

/** Rate-limit window duration in milliseconds (1 minute). */
const RATE_LIMIT_WINDOW_MS = 60000;

/**
 * Checks whether a user has exceeded the rate limit.
 * Increments the counter if within the window.
 *
 * @param {string} userId - The user identifier.
 * @returns {boolean} True if the request is allowed, false if rate-limited.
 */
function checkRateLimit(userId) {
  if (!userId) return true;

  const now = Date.now();
  const entry = rateLimitMap.get(userId);

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(userId, { count: 1, windowStart: now });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count += 1;
  return true;
}

// ---------------------------------------------------------------------------
// Query result cache (in-memory, per-user)
// ---------------------------------------------------------------------------

/** @type {Map<string, { result: object, timestamp: number }>} */
const queryCache = new Map();

/** Cache TTL in milliseconds (5 minutes). */
const CACHE_TTL_MS = 300000;

/**
 * Generates a cache key from userId and query string.
 *
 * @param {string} userId - The user identifier.
 * @param {string} query - The query string.
 * @returns {string} A cache key.
 */
function buildCacheKey(userId, query) {
  const normalizedQuery = (query || '').trim().toLowerCase();
  return `${userId || 'anon'}::${normalizedQuery}`;
}

/**
 * Retrieves a cached result if it exists and has not expired.
 *
 * @param {string} cacheKey - The cache key.
 * @returns {object|null} The cached result or null.
 */
function getCachedResult(cacheKey) {
  const entry = queryCache.get(cacheKey);
  if (!entry) return null;

  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    queryCache.delete(cacheKey);
    return null;
  }

  return entry.result;
}

/**
 * Stores a result in the cache.
 *
 * @param {string} cacheKey - The cache key.
 * @param {object} result - The result to cache.
 */
function setCachedResult(cacheKey, result) {
  queryCache.set(cacheKey, { result, timestamp: Date.now() });
}

/**
 * Clears all cached query results.
 * @returns {void}
 */
export function clearQueryCache() {
  queryCache.clear();
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Generates a unique orchestration ID.
 * @returns {string}
 */
function generateOrchestrationId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `orch_${timestamp}_${random}`;
}

/**
 * Validates a query string.
 *
 * @param {string} query - The query to validate.
 * @returns {{ valid: boolean, error: string|null }}
 */
function validateQuery(query) {
  if (!query || typeof query !== 'string') {
    return { valid: false, error: 'Query is required and must be a string.' };
  }

  const trimmed = query.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: 'Query must not be empty.' };
  }

  if (trimmed.length > 500) {
    return { valid: false, error: 'Query must not exceed 500 characters.' };
  }

  return { valid: true, error: null };
}

/**
 * Validates an action request.
 *
 * @param {object} action - The action request to validate.
 * @returns {{ valid: boolean, error: string|null }}
 */
function validateAction(action) {
  if (!action || typeof action !== 'object') {
    return { valid: false, error: 'Action is required and must be an object.' };
  }

  if (!action.actionId || typeof action.actionId !== 'string' || action.actionId.trim().length === 0) {
    return { valid: false, error: 'Action ID is required and must be a non-empty string.' };
  }

  return { valid: true, error: null };
}

/**
 * Generates contextual CTA (call-to-action) suggestions based on the
 * NLP response and intelligence cluster.
 *
 * @param {object|null} nlpResponse - The response from processQuery.
 * @param {string|null} clusterId - The intelligence cluster ID.
 * @param {string|null} personaId - The active persona ID.
 * @returns {string[]} An array of CTA suggestion strings.
 */
function generateCTASuggestions(nlpResponse, clusterId, personaId) {
  const suggestions = [];

  // Pull follow-ups from the NLP response
  if (nlpResponse && nlpResponse.response && Array.isArray(nlpResponse.response.suggestedFollowUps)) {
    suggestions.push(...nlpResponse.response.suggestedFollowUps);
  }

  // Supplement with persona/cluster-specific suggestions
  const additional = getSuggestedQueries(personaId, clusterId);
  for (const s of additional) {
    if (!suggestions.includes(s)) {
      suggestions.push(s);
    }
    if (suggestions.length >= 6) break;
  }

  return suggestions.slice(0, 6);
}

/**
 * Resolves the cluster label for a given cluster ID.
 *
 * @param {string|null} clusterId - The cluster ID.
 * @returns {string} The cluster label or 'General'.
 */
function resolveClusterLabel(clusterId) {
  if (!clusterId) return 'General';
  const cluster = INTELLIGENCE_CLUSTERS.find((c) => c.id === clusterId);
  return cluster ? cluster.label : 'General';
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Processes a natural language query end-to-end.
 *
 * Steps:
 * 1. Validate query input
 * 2. Check rate limit
 * 3. Check cache
 * 4. Parse query via mock NLP (processQuery)
 * 5. Determine target systems from the resolved cluster
 * 6. Fetch data from target systems in parallel (SystemConnector)
 * 7. Aggregate results (ResultAggregator)
 * 8. Generate CTA suggestions
 * 9. Build source indicators
 * 10. Log the query via AuditLogger
 * 11. Cache and return the structured response
 *
 * @param {string} query - The natural language query string.
 * @param {object} [session=null] - The session context.
 * @param {string} [session.userId] - The user ID.
 * @param {string} [session.role] - The user's role.
 * @param {string} [session.personaId] - The active persona ID.
 * @returns {Promise<{ orchestrationId: string, success: boolean, query: string, clusterId: string|null, clusterLabel: string, nlpResponse: object|null, aggregatedData: object|null, sourceIndicators: Array<object>, ctaSuggestions: string[], error: object|null, timestamp: string }>}
 */
export async function submitQuery(query, session = null) {
  const orchestrationId = generateOrchestrationId();
  const timestamp = new Date().toISOString();
  const userId = session?.userId || null;
  const personaId = session?.personaId || null;

  // 1. Validate
  const validation = validateQuery(query);
  if (!validation.valid) {
    logAction('query', {
      userId,
      persona: personaId,
      details: { query, error: validation.error, orchestrationId },
    });

    return {
      orchestrationId,
      success: false,
      query: query || '',
      clusterId: null,
      clusterLabel: 'General',
      nlpResponse: null,
      aggregatedData: null,
      sourceIndicators: getSourceIndicators([]),
      ctaSuggestions: [],
      error: { code: 'ORCH-400', message: 'Invalid query.', details: validation.error },
      timestamp,
    };
  }

  // 2. Rate limit
  if (!checkRateLimit(userId)) {
    logAction('query', {
      userId,
      persona: personaId,
      details: { query: query.trim(), error: 'Rate limit exceeded', orchestrationId },
    });

    return {
      orchestrationId,
      success: false,
      query: query.trim(),
      clusterId: null,
      clusterLabel: 'General',
      nlpResponse: null,
      aggregatedData: null,
      sourceIndicators: getSourceIndicators([]),
      ctaSuggestions: [],
      error: { code: 'ORCH-429', message: 'Rate limit exceeded.', details: 'Maximum 10 queries per minute. Please wait and try again.' },
      timestamp,
    };
  }

  // 3. Check cache
  const cacheKey = buildCacheKey(userId, query);
  const cached = getCachedResult(cacheKey);
  if (cached) {
    return {
      ...cached,
      orchestrationId,
      timestamp: new Date().toISOString(),
    };
  }

  try {
    // 4. Parse query via mock NLP
    const nlpResult = processQuery(query.trim(), personaId);
    const clusterId = nlpResult.clusterId || null;
    const clusterLabel = resolveClusterLabel(clusterId);

    // 5. Determine target systems
    const targetSystems = clusterId ? determineTargetSystems(clusterId) : [];

    // 6. Fetch data from target systems in parallel
    let systemResults = [];
    if (targetSystems.length > 0) {
      const requests = targetSystems.map((target) => ({
        systemId: target.systemId,
        dataType: target.dataType,
        options: { session },
      }));

      systemResults = await fetchFromMultipleSystems(requests);
    }

    // 7. Aggregate results
    const aggregatedData = aggregateResults(systemResults, {
      clusterId,
      query: query.trim(),
      personaId,
    });

    // 8. Generate CTA suggestions
    const ctaSuggestions = generateCTASuggestions(nlpResult, clusterId, personaId);

    // 9. Build source indicators
    const activeSystems = systemResults
      .filter((r) => r.success)
      .map((r) => r.system);
    const sourceIndicators = getSourceIndicators(activeSystems);

    // 10. Log the query
    logAction('query', {
      userId,
      persona: personaId,
      details: {
        query: query.trim(),
        orchestrationId,
        clusterId,
        clusterLabel,
        systemsQueried: targetSystems.map((t) => t.systemId),
        systemsSucceeded: activeSystems,
        confidence: nlpResult.response?.confidence || null,
        responseType: nlpResult.response?.type || null,
      },
    });

    // 11. Build structured response
    const result = {
      orchestrationId,
      success: nlpResult.success,
      query: query.trim(),
      clusterId,
      clusterLabel,
      nlpResponse: nlpResult.response || null,
      aggregatedData,
      sourceIndicators,
      ctaSuggestions,
      error: null,
      timestamp: new Date().toISOString(),
    };

    // Cache the result
    setCachedResult(cacheKey, result);

    return result;
  } catch (error) {
    console.error('[OrchestrationService] submitQuery failed:', error);

    logAction('query', {
      userId,
      persona: personaId,
      details: {
        query: query.trim(),
        orchestrationId,
        error: error.message || 'Unknown error',
      },
    });

    return {
      orchestrationId,
      success: false,
      query: query.trim(),
      clusterId: null,
      clusterLabel: 'General',
      nlpResponse: null,
      aggregatedData: null,
      sourceIndicators: getSourceIndicators([]),
      ctaSuggestions: [],
      error: { code: 'ORCH-500', message: 'Query processing failed.', details: error.message || 'An unexpected error occurred.' },
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Dispatches an action to a target system and returns the execution result.
 *
 * Steps:
 * 1. Validate action input
 * 2. Execute the action via mock executeAction
 * 3. Log the action via AuditLogger
 * 4. Return the structured result
 *
 * @param {object} action - The action request.
 * @param {string} action.actionId - The action identifier (e.g. 'approve-change-order').
 * @param {object} [action.params={}] - Optional parameters for the action.
 * @param {string} [action.targetSystem=null] - The target system identifier.
 * @param {object} [session=null] - The session context.
 * @param {string} [session.userId] - The user ID.
 * @param {string} [session.personaId] - The active persona ID.
 * @returns {Promise<{ orchestrationId: string, success: boolean, action: string, result: object|null, error: object|null, timestamp: string }>}
 */
export async function executeAction(action, session = null) {
  const orchestrationId = generateOrchestrationId();
  const timestamp = new Date().toISOString();
  const userId = session?.userId || null;
  const personaId = session?.personaId || null;

  // 1. Validate
  const validation = validateAction(action);
  if (!validation.valid) {
    logAction('action_execution', {
      userId,
      persona: personaId,
      details: { action, error: validation.error, orchestrationId },
    });

    return {
      orchestrationId,
      success: false,
      action: action?.actionId || 'unknown',
      result: null,
      error: { code: 'ORCH-400', message: 'Invalid action.', details: validation.error },
      timestamp,
    };
  }

  try {
    const actionId = action.actionId.trim();
    const params = action.params || {};

    // 2. Execute the action via mock
    const executionResult = executeActionMock(actionId, params);

    // 3. Log the action
    logAction('action_execution', {
      userId,
      persona: personaId,
      details: {
        orchestrationId,
        actionId,
        targetSystem: action.targetSystem || null,
        params,
        success: executionResult.success,
        error: executionResult.error || null,
      },
    });

    // 4. Return structured result
    return {
      orchestrationId,
      success: executionResult.success,
      action: actionId,
      result: executionResult.result || null,
      error: executionResult.error
        ? { code: 'ORCH-404', message: 'Action execution failed.', details: executionResult.error }
        : null,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('[OrchestrationService] executeAction failed:', error);

    logAction('action_execution', {
      userId,
      persona: personaId,
      details: {
        orchestrationId,
        actionId: action.actionId,
        error: error.message || 'Unknown error',
      },
    });

    return {
      orchestrationId,
      success: false,
      action: action.actionId || 'unknown',
      result: null,
      error: { code: 'ORCH-500', message: 'Action execution failed.', details: error.message || 'An unexpected error occurred.' },
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Returns contextual CTA suggestions for a given persona and/or cluster.
 * Convenience wrapper around getSuggestedQueries from mockData.
 *
 * @param {string|null} [personaId=null] - The active persona ID.
 * @param {string|null} [clusterId=null] - The intelligence cluster ID.
 * @returns {string[]} An array of suggested query strings.
 */
export function getCTASuggestions(personaId = null, clusterId = null) {
  return getSuggestedQueries(personaId, clusterId);
}

/**
 * Returns the current health/status of all enterprise systems.
 * Convenience wrapper for UI consumption.
 *
 * @returns {Array<{ system: string, active: boolean, connected: boolean }>}
 */
export function getSystemHealthIndicators() {
  return getSourceIndicators([]);
}