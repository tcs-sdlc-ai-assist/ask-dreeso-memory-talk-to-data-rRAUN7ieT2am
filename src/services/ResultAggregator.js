import { INTELLIGENCE_CLUSTERS } from '../utils/constants.js';
import { getSourceIndicators } from './SystemConnector.js';

/**
 * Multi-system result aggregation and normalization service.
 *
 * Aggregates results from multiple enterprise system connectors (SAP, Procore,
 * Salesforce, Primavera) into a unified response format suitable for rendering
 * in the UI. Provides source attribution for the SourceTransparencyPanel.
 */

// ---------------------------------------------------------------------------
// Field normalization maps — standardise field names across systems
// ---------------------------------------------------------------------------

const FIELD_NORMALIZATION_MAP = {
  // Cost / financial fields
  totalBudget: 'budget',
  total_budget: 'budget',
  committedCost: 'committed',
  committed_cost: 'committed',
  actualCost: 'actual',
  actual_cost: 'actual',
  forecastAtCompletion: 'forecast',
  forecast_at_completion: 'forecast',
  variancePercent: 'variancePercent',
  variance_percent: 'variancePercent',

  // Schedule fields
  baselineEndDate: 'baselineEnd',
  baseline_end_date: 'baselineEnd',
  forecastEndDate: 'forecastEnd',
  forecast_end_date: 'forecastEnd',
  delayDays: 'delayDays',
  delay_days: 'delayDays',
  spiValue: 'spi',
  spi_value: 'spi',
  criticalPathActivities: 'criticalPathCount',
  critical_path_activities: 'criticalPathCount',

  // Project fields
  percentComplete: 'completion',
  percent_complete: 'completion',
  projectName: 'name',
  project_name: 'name',
  projectId: 'projectId',
  project_id: 'projectId',

  // RFI / change order fields
  requestDate: 'requestDate',
  request_date: 'requestDate',
  approvedDate: 'approvedDate',
  approved_date: 'approvedDate',
  createdDate: 'createdDate',
  created_date: 'createdDate',
  dueDate: 'dueDate',
  due_date: 'dueDate',
  assignedTo: 'assignee',
  assigned_to: 'assignee',
  createdBy: 'creator',
  created_by: 'creator',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Generates a unique aggregation ID.
 * @returns {string}
 */
function generateAggregationId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `agg_${timestamp}_${random}`;
}

/**
 * Resolves the intelligence cluster label for a given cluster ID.
 * @param {string|null} clusterId - The cluster ID.
 * @returns {string} The cluster label or 'General'.
 */
function resolveClusterLabel(clusterId) {
  if (!clusterId) return 'General';
  const cluster = INTELLIGENCE_CLUSTERS.find((c) => c.id === clusterId);
  return cluster ? cluster.label : 'General';
}

/**
 * Deep-clones a JSON-serialisable value.
 * @param {*} value
 * @returns {*}
 */
function deepClone(value) {
  if (value === null || value === undefined) return value;
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return value;
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Normalizes a single data object by mapping known field names to their
 * standardised equivalents. Unknown fields are passed through unchanged.
 *
 * @param {object} record - The raw data record from a system connector.
 * @returns {object} A new object with normalised field names.
 */
export function normalizeRecord(record) {
  if (!record || typeof record !== 'object' || Array.isArray(record)) {
    return record;
  }

  const normalized = {};

  for (const [key, value] of Object.entries(record)) {
    const normalizedKey = FIELD_NORMALIZATION_MAP[key] || key;

    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      normalized[normalizedKey] = normalizeRecord(value);
    } else if (Array.isArray(value)) {
      normalized[normalizedKey] = value.map((item) =>
        item !== null && typeof item === 'object' ? normalizeRecord(item) : item,
      );
    } else {
      normalized[normalizedKey] = value;
    }
  }

  return normalized;
}

/**
 * Normalizes an array of data records or a single record.
 *
 * @param {Array<object>|object} data - The raw data from a system connector.
 * @returns {Array<object>|object} Normalised data.
 */
export function normalizeData(data) {
  if (data === null || data === undefined) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => normalizeRecord(item));
  }

  if (typeof data === 'object') {
    return normalizeRecord(data);
  }

  return data;
}

/**
 * Builds a source attribution map from an array of system fetch results.
 * Each entry indicates which system contributed data, whether it was
 * successful, and the data type returned.
 *
 * @param {Array<{ success: boolean, system: string, dataType: string, source: object, error: string|null }>} results
 *   The array of results from fetchData / fetchFromMultipleSystems.
 * @returns {Array<{ system: string, active: boolean, connected: boolean, dataType: string, success: boolean, error: string|null, timestamp: string }>}
 */
export function buildSourceMap(results) {
  if (!Array.isArray(results) || results.length === 0) {
    return getSourceIndicators([]).map((indicator) => ({
      ...indicator,
      dataType: null,
      success: false,
      error: null,
      timestamp: new Date().toISOString(),
    }));
  }

  const activeSystems = results
    .filter((r) => r.success)
    .map((r) => r.system);

  const indicators = getSourceIndicators(activeSystems);

  const resultsBySystem = {};
  for (const result of results) {
    const sys = result.system;
    if (!resultsBySystem[sys]) {
      resultsBySystem[sys] = [];
    }
    resultsBySystem[sys].push(result);
  }

  return indicators.map((indicator) => {
    const systemResults = resultsBySystem[indicator.system] || [];
    const hasSuccess = systemResults.some((r) => r.success);
    const firstError = systemResults.find((r) => !r.success);
    const dataTypes = systemResults.map((r) => r.dataType).filter(Boolean);

    return {
      system: indicator.system,
      active: indicator.active,
      connected: indicator.connected,
      dataType: dataTypes.length > 0 ? dataTypes.join(', ') : null,
      success: hasSuccess,
      error: firstError ? firstError.error : null,
      timestamp: new Date().toISOString(),
    };
  });
}

/**
 * Aggregates results from multiple system connectors into a unified
 * response object. Merges data, normalises field names, builds source
 * attribution, and generates metadata.
 *
 * @param {Array<{ success: boolean, system: string, dataType: string, data: *|null, source: object, error: string|null, timestamp: string }>} results
 *   The array of results from fetchData / fetchFromMultipleSystems.
 * @param {object} [options={}] - Optional aggregation parameters.
 * @param {string|null} [options.clusterId=null] - The intelligence cluster ID for context.
 * @param {string|null} [options.query=null] - The original query string.
 * @param {string|null} [options.personaId=null] - The active persona ID.
 * @returns {{ aggregationId: string, success: boolean, clusterId: string|null, clusterLabel: string, query: string|null, personaId: string|null, data: object, sources: Array<object>, errors: Array<object>, metadata: object, timestamp: string }}
 */
export function aggregateResults(results, options = {}) {
  const {
    clusterId = null,
    query = null,
    personaId = null,
  } = options;

  const aggregationId = generateAggregationId();
  const timestamp = new Date().toISOString();

  if (!Array.isArray(results) || results.length === 0) {
    return {
      aggregationId,
      success: false,
      clusterId,
      clusterLabel: resolveClusterLabel(clusterId),
      query,
      personaId,
      data: {},
      sources: buildSourceMap([]),
      errors: [],
      metadata: {
        totalSystems: 0,
        successfulSystems: 0,
        failedSystems: 0,
        totalRecords: 0,
        aggregatedAt: timestamp,
      },
      timestamp,
    };
  }

  const successfulResults = results.filter((r) => r.success && r.data !== null);
  const failedResults = results.filter((r) => !r.success);

  // Merge data from all successful results into a keyed object
  const mergedData = {};
  let totalRecords = 0;

  for (const result of successfulResults) {
    const key = `${result.system}_${result.dataType}`;
    const clonedData = deepClone(result.data);
    const normalizedResult = normalizeData(clonedData);

    mergedData[key] = {
      system: result.system,
      dataType: result.dataType,
      data: normalizedResult,
      source: result.source || null,
    };

    if (Array.isArray(normalizedResult)) {
      totalRecords += normalizedResult.length;
    } else if (normalizedResult && typeof normalizedResult === 'object') {
      totalRecords += Object.keys(normalizedResult).length;
    } else {
      totalRecords += 1;
    }
  }

  // Build source attribution
  const sources = buildSourceMap(results);

  // Collect errors
  const errors = failedResults.map((r) => ({
    system: r.system,
    dataType: r.dataType,
    error: r.error || 'Unknown error',
    timestamp: r.timestamp || timestamp,
  }));

  const uniqueSystems = new Set(results.map((r) => r.system));
  const successfulSystems = new Set(successfulResults.map((r) => r.system));

  return {
    aggregationId,
    success: successfulResults.length > 0,
    clusterId,
    clusterLabel: resolveClusterLabel(clusterId),
    query,
    personaId,
    data: mergedData,
    sources,
    errors,
    metadata: {
      totalSystems: uniqueSystems.size,
      successfulSystems: successfulSystems.size,
      failedSystems: uniqueSystems.size - successfulSystems.size,
      totalRecords,
      partialFailure: failedResults.length > 0 && successfulResults.length > 0,
      aggregatedAt: timestamp,
    },
    timestamp,
  };
}

/**
 * Extracts a flat array of data records from an aggregated result,
 * optionally filtered by system or data type.
 *
 * @param {object} aggregatedResult - The result from aggregateResults().
 * @param {object} [filters={}] - Optional filters.
 * @param {string} [filters.system] - Filter by system identifier.
 * @param {string} [filters.dataType] - Filter by data type.
 * @returns {Array<*>} A flat array of data records matching the filters.
 */
export function extractData(aggregatedResult, filters = {}) {
  if (
    !aggregatedResult ||
    typeof aggregatedResult !== 'object' ||
    !aggregatedResult.data ||
    typeof aggregatedResult.data !== 'object'
  ) {
    return [];
  }

  const { system, dataType } = filters;
  const entries = Object.values(aggregatedResult.data);
  const records = [];

  for (const entry of entries) {
    if (system && entry.system !== system) {
      continue;
    }
    if (dataType && entry.dataType !== dataType) {
      continue;
    }

    if (Array.isArray(entry.data)) {
      records.push(...entry.data);
    } else if (entry.data !== null && entry.data !== undefined) {
      records.push(entry.data);
    }
  }

  return records;
}

/**
 * Merges two aggregated results into a single combined result.
 * Useful when orchestrating queries that span multiple clusters.
 *
 * @param {object} resultA - First aggregated result.
 * @param {object} resultB - Second aggregated result.
 * @returns {object} A merged aggregated result.
 */
export function mergeAggregatedResults(resultA, resultB) {
  if (!resultA || typeof resultA !== 'object') return resultB || createEmptyResult();
  if (!resultB || typeof resultB !== 'object') return resultA;

  const mergedData = {
    ...(resultA.data || {}),
    ...(resultB.data || {}),
  };

  const mergedErrors = [
    ...(resultA.errors || []),
    ...(resultB.errors || []),
  ];

  // Merge sources — deduplicate by system
  const sourceMap = new Map();
  for (const source of [...(resultA.sources || []), ...(resultB.sources || [])]) {
    const existing = sourceMap.get(source.system);
    if (!existing || source.active) {
      sourceMap.set(source.system, source);
    }
  }
  const mergedSources = Array.from(sourceMap.values());

  const metaA = resultA.metadata || {};
  const metaB = resultB.metadata || {};

  return {
    aggregationId: generateAggregationId(),
    success: resultA.success || resultB.success,
    clusterId: resultA.clusterId || resultB.clusterId,
    clusterLabel: resultA.clusterLabel || resultB.clusterLabel,
    query: resultA.query || resultB.query,
    personaId: resultA.personaId || resultB.personaId,
    data: mergedData,
    sources: mergedSources,
    errors: mergedErrors,
    metadata: {
      totalSystems: (metaA.totalSystems || 0) + (metaB.totalSystems || 0),
      successfulSystems: (metaA.successfulSystems || 0) + (metaB.successfulSystems || 0),
      failedSystems: (metaA.failedSystems || 0) + (metaB.failedSystems || 0),
      totalRecords: (metaA.totalRecords || 0) + (metaB.totalRecords || 0),
      partialFailure: (metaA.partialFailure || false) || (metaB.partialFailure || false),
      aggregatedAt: new Date().toISOString(),
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Creates an empty aggregated result object.
 * Useful as a default / initial state.
 *
 * @param {object} [options={}] - Optional context.
 * @param {string|null} [options.clusterId=null] - The intelligence cluster ID.
 * @param {string|null} [options.query=null] - The original query string.
 * @param {string|null} [options.personaId=null] - The active persona ID.
 * @returns {object} An empty aggregated result.
 */
export function createEmptyResult(options = {}) {
  const { clusterId = null, query = null, personaId = null } = options;
  const timestamp = new Date().toISOString();

  return {
    aggregationId: generateAggregationId(),
    success: false,
    clusterId,
    clusterLabel: resolveClusterLabel(clusterId),
    query,
    personaId,
    data: {},
    sources: buildSourceMap([]),
    errors: [],
    metadata: {
      totalSystems: 0,
      successfulSystems: 0,
      failedSystems: 0,
      totalRecords: 0,
      partialFailure: false,
      aggregatedAt: timestamp,
    },
    timestamp,
  };
}

/**
 * Computes a summary of the aggregated data suitable for dashboard display.
 * Counts records per system and data type.
 *
 * @param {object} aggregatedResult - The result from aggregateResults().
 * @returns {{ systemBreakdown: Array<{ system: string, dataType: string, recordCount: number }>, totalRecords: number, systemCount: number }}
 */
export function summarizeAggregation(aggregatedResult) {
  if (
    !aggregatedResult ||
    typeof aggregatedResult !== 'object' ||
    !aggregatedResult.data ||
    typeof aggregatedResult.data !== 'object'
  ) {
    return {
      systemBreakdown: [],
      totalRecords: 0,
      systemCount: 0,
    };
  }

  const breakdown = [];
  let totalRecords = 0;
  const systems = new Set();

  for (const entry of Object.values(aggregatedResult.data)) {
    let recordCount = 0;

    if (Array.isArray(entry.data)) {
      recordCount = entry.data.length;
    } else if (entry.data !== null && typeof entry.data === 'object') {
      recordCount = Object.keys(entry.data).length;
    } else if (entry.data !== null && entry.data !== undefined) {
      recordCount = 1;
    }

    breakdown.push({
      system: entry.system,
      dataType: entry.dataType,
      recordCount,
    });

    totalRecords += recordCount;
    systems.add(entry.system);
  }

  return {
    systemBreakdown: breakdown,
    totalRecords,
    systemCount: systems.size,
  };
}