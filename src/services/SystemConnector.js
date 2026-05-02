import {
  SAP_COST_REPORTS,
  SAP_INVOICES,
  PROCORE_PROJECTS,
  PROCORE_RFIS,
  PROCORE_CHANGE_ORDERS,
  PRIMAVERA_SCHEDULES,
  PRIMAVERA_RESOURCES,
  SALESFORCE_PIPELINE,
  SALESFORCE_CLIENTS,
  RISK_SIGNALS,
  FORECAST_MODELS,
} from '../data/mockData.js';

/**
 * Mock enterprise system integration layer.
 *
 * Simulates API calls to SAP, Procore, Salesforce, and Primavera with
 * realistic latency and source metadata for the transparency panel.
 *
 * Each system connector returns data sourced from mockData.js and includes
 * metadata indicating the originating system, timestamp, and connection status.
 */

// ---------------------------------------------------------------------------
// Internal state — tracks system availability and failure counts
// ---------------------------------------------------------------------------

const systemState = {
  sap: { connected: true, failureCount: 0, unavailableUntil: 0 },
  procore: { connected: true, failureCount: 0, unavailableUntil: 0 },
  salesforce: { connected: true, failureCount: 0, unavailableUntil: 0 },
  primavera: { connected: true, failureCount: 0, unavailableUntil: 0 },
};

/** Maximum consecutive failures before circuit breaker trips. */
const CIRCUIT_BREAKER_THRESHOLD = 3;

/** Duration (ms) a system is marked unavailable after circuit breaker trips. */
const CIRCUIT_BREAKER_COOLDOWN_MS = 60000;

/** Maximum number of retry attempts per request. */
const MAX_RETRIES = 2;

/** Base delay (ms) between retries. */
const RETRY_BACKOFF_MS = 500;

// ---------------------------------------------------------------------------
// Supported system identifiers
// ---------------------------------------------------------------------------

export const SYSTEMS = {
  SAP: 'sap',
  PROCORE: 'procore',
  SALESFORCE: 'salesforce',
  PRIMAVERA: 'primavera',
};

/**
 * Returns the list of all supported system identifiers.
 * @returns {string[]}
 */
export function getSupportedSystems() {
  return Object.values(SYSTEMS);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Simulates network latency by waiting a random duration.
 * @param {number} [minMs=150] - Minimum delay in milliseconds.
 * @param {number} [maxMs=600] - Maximum delay in milliseconds.
 * @returns {Promise<void>}
 */
function simulateLatency(minMs = 150, maxMs = 600) {
  const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
}

/**
 * Checks whether a system's circuit breaker is currently open (unavailable).
 * @param {string} systemId - The system identifier.
 * @returns {boolean} True if the system is currently unavailable.
 */
function isCircuitOpen(systemId) {
  const state = systemState[systemId];
  if (!state) return false;
  if (state.unavailableUntil > Date.now()) {
    return true;
  }
  // Reset if cooldown has elapsed
  if (state.unavailableUntil > 0 && Date.now() >= state.unavailableUntil) {
    state.unavailableUntil = 0;
    state.failureCount = 0;
    state.connected = true;
  }
  return false;
}

/**
 * Records a failure for a system and trips the circuit breaker if threshold is reached.
 * @param {string} systemId - The system identifier.
 */
function recordFailure(systemId) {
  const state = systemState[systemId];
  if (!state) return;
  state.failureCount += 1;
  if (state.failureCount >= CIRCUIT_BREAKER_THRESHOLD) {
    state.connected = false;
    state.unavailableUntil = Date.now() + CIRCUIT_BREAKER_COOLDOWN_MS;
  }
}

/**
 * Records a successful call for a system, resetting its failure count.
 * @param {string} systemId - The system identifier.
 */
function recordSuccess(systemId) {
  const state = systemState[systemId];
  if (!state) return;
  state.failureCount = 0;
  state.connected = true;
}

/**
 * Wraps a fetch function with retry logic and exponential backoff.
 * @param {Function} fn - The async function to execute.
 * @param {string} systemId - The system identifier (for failure tracking).
 * @param {number} [retries=MAX_RETRIES] - Number of retries remaining.
 * @returns {Promise<*>} The result of the function.
 */
async function withRetry(fn, systemId, retries = MAX_RETRIES) {
  try {
    const result = await fn();
    recordSuccess(systemId);
    return result;
  } catch (error) {
    if (retries > 0) {
      const backoff = RETRY_BACKOFF_MS * (MAX_RETRIES - retries + 1);
      await new Promise((resolve) => {
        setTimeout(resolve, backoff);
      });
      return withRetry(fn, systemId, retries - 1);
    }
    recordFailure(systemId);
    throw error;
  }
}

/**
 * Builds a standardised source metadata object.
 * @param {string} systemId - The system identifier.
 * @param {string} dataType - A label describing the data returned.
 * @returns {{ system: string, active: boolean, dataType: string, timestamp: string }}
 */
function buildSourceMeta(systemId, dataType) {
  return {
    system: systemId,
    active: true,
    dataType,
    timestamp: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Data maps — keyed by system, then by data type / intent
// ---------------------------------------------------------------------------

const SAP_DATA_MAP = {
  'cost-reports': () => SAP_COST_REPORTS,
  'invoices': () => SAP_INVOICES,
  'cost-forecast': () => FORECAST_MODELS.costForecast,
};

const PROCORE_DATA_MAP = {
  'projects': () => PROCORE_PROJECTS,
  'rfis': () => PROCORE_RFIS,
  'change-orders': () => PROCORE_CHANGE_ORDERS,
};

const SALESFORCE_DATA_MAP = {
  'pipeline': () => SALESFORCE_PIPELINE,
  'clients': () => SALESFORCE_CLIENTS,
};

const PRIMAVERA_DATA_MAP = {
  'schedules': () => PRIMAVERA_SCHEDULES,
  'resources': () => PRIMAVERA_RESOURCES,
  'schedule-forecast': () => FORECAST_MODELS.scheduleForecast,
};

const SYSTEM_DATA_MAPS = {
  [SYSTEMS.SAP]: SAP_DATA_MAP,
  [SYSTEMS.PROCORE]: PROCORE_DATA_MAP,
  [SYSTEMS.SALESFORCE]: SALESFORCE_DATA_MAP,
  [SYSTEMS.PRIMAVERA]: PRIMAVERA_DATA_MAP,
};

// ---------------------------------------------------------------------------
// Cross-system data — risks span multiple systems
// ---------------------------------------------------------------------------

/**
 * Returns risk signals, optionally filtered by project ID.
 * @param {string|null} [projectId=null] - Optional project ID filter.
 * @returns {Array<object>}
 */
function getRiskSignals(projectId = null) {
  if (projectId) {
    return RISK_SIGNALS.filter((r) => r.projectId === projectId);
  }
  return RISK_SIGNALS;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Simulates connecting to an enterprise system and returns its connection status.
 *
 * @param {string} systemId - The system identifier (e.g. 'sap', 'procore').
 * @returns {Promise<{ system: string, connected: boolean, latencyMs: number, timestamp: string }>}
 */
export async function connectToSystem(systemId) {
  if (!systemId || typeof systemId !== 'string') {
    return {
      system: systemId || 'unknown',
      connected: false,
      latencyMs: 0,
      timestamp: new Date().toISOString(),
      error: 'System ID is required and must be a string.',
    };
  }

  const normalised = systemId.trim().toLowerCase();

  if (!systemState[normalised]) {
    return {
      system: normalised,
      connected: false,
      latencyMs: 0,
      timestamp: new Date().toISOString(),
      error: `Unknown system: ${normalised}. Supported systems: ${getSupportedSystems().join(', ')}`,
    };
  }

  const start = Date.now();
  await simulateLatency(100, 400);
  const latencyMs = Date.now() - start;

  if (isCircuitOpen(normalised)) {
    return {
      system: normalised,
      connected: false,
      latencyMs,
      timestamp: new Date().toISOString(),
      error: `System ${normalised} is temporarily unavailable (circuit breaker open).`,
    };
  }

  return {
    system: normalised,
    connected: true,
    latencyMs,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Fetches mock data from a specific enterprise system.
 *
 * @param {string} systemId - The system identifier (e.g. 'sap', 'procore').
 * @param {string} dataType - The type of data to fetch (e.g. 'cost-reports', 'projects').
 * @param {object} [options={}] - Optional parameters.
 * @param {string|null} [options.projectId=null] - Filter results by project ID.
 * @param {object|null} [options.session=null] - The session context for audit purposes.
 * @returns {Promise<{ success: boolean, system: string, dataType: string, data: *|null, source: object, error: string|null, timestamp: string }>}
 */
export async function fetchData(systemId, dataType, options = {}) {
  const timestamp = new Date().toISOString();

  if (!systemId || typeof systemId !== 'string') {
    return {
      success: false,
      system: systemId || 'unknown',
      dataType: dataType || 'unknown',
      data: null,
      source: { system: systemId || 'unknown', active: false, dataType: dataType || 'unknown', timestamp },
      error: 'System ID is required.',
      timestamp,
    };
  }

  if (!dataType || typeof dataType !== 'string') {
    return {
      success: false,
      system: systemId,
      dataType: dataType || 'unknown',
      data: null,
      source: { system: systemId, active: false, dataType: dataType || 'unknown', timestamp },
      error: 'Data type is required.',
      timestamp,
    };
  }

  const normalised = systemId.trim().toLowerCase();
  const normalisedDataType = dataType.trim().toLowerCase();
  const { projectId = null } = options;

  // Check circuit breaker
  if (isCircuitOpen(normalised)) {
    return {
      success: false,
      system: normalised,
      dataType: normalisedDataType,
      data: null,
      source: { system: normalised, active: false, dataType: normalisedDataType, timestamp },
      error: `System ${normalised} is temporarily unavailable (circuit breaker open).`,
      timestamp,
    };
  }

  // Handle cross-system risk data
  if (normalisedDataType === 'risks' || normalisedDataType === 'risk-signals') {
    try {
      const result = await withRetry(async () => {
        await simulateLatency(200, 500);
        return getRiskSignals(projectId);
      }, normalised);

      return {
        success: true,
        system: normalised,
        dataType: normalisedDataType,
        data: result,
        source: buildSourceMeta(normalised, normalisedDataType),
        error: null,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        system: normalised,
        dataType: normalisedDataType,
        data: null,
        source: { system: normalised, active: false, dataType: normalisedDataType, timestamp },
        error: `Failed to fetch ${normalisedDataType} from ${normalised}: ${error.message || 'Unknown error'}`,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Look up the data map for the requested system
  const dataMap = SYSTEM_DATA_MAPS[normalised];

  if (!dataMap) {
    return {
      success: false,
      system: normalised,
      dataType: normalisedDataType,
      data: null,
      source: { system: normalised, active: false, dataType: normalisedDataType, timestamp },
      error: `Unknown system: ${normalised}. Supported systems: ${getSupportedSystems().join(', ')}`,
      timestamp,
    };
  }

  const dataFn = dataMap[normalisedDataType];

  if (!dataFn) {
    const availableTypes = Object.keys(dataMap).join(', ');
    return {
      success: false,
      system: normalised,
      dataType: normalisedDataType,
      data: null,
      source: { system: normalised, active: false, dataType: normalisedDataType, timestamp },
      error: `Unknown data type "${normalisedDataType}" for system ${normalised}. Available types: ${availableTypes}`,
      timestamp,
    };
  }

  try {
    const result = await withRetry(async () => {
      await simulateLatency(200, 600);
      let data = dataFn();

      // Apply project ID filter if applicable and data is an array
      if (projectId && Array.isArray(data)) {
        const filtered = data.filter((item) => item.projectId === projectId);
        if (filtered.length > 0) {
          data = filtered;
        }
      }

      // If data is an object keyed by project ID (e.g. forecast models)
      if (projectId && data && typeof data === 'object' && !Array.isArray(data) && data[projectId]) {
        data = { [projectId]: data[projectId] };
      }

      return data;
    }, normalised);

    return {
      success: true,
      system: normalised,
      dataType: normalisedDataType,
      data: result,
      source: buildSourceMeta(normalised, normalisedDataType),
      error: null,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      success: false,
      system: normalised,
      dataType: normalisedDataType,
      data: null,
      source: { system: normalised, active: false, dataType: normalisedDataType, timestamp },
      error: `Failed to fetch ${normalisedDataType} from ${normalised}: ${error.message || 'Unknown error'}`,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Fetches data from multiple systems in parallel.
 *
 * @param {Array<{ systemId: string, dataType: string, options?: object }>} requests - Array of fetch requests.
 * @returns {Promise<Array<{ success: boolean, system: string, dataType: string, data: *|null, source: object, error: string|null, timestamp: string }>>}
 */
export async function fetchFromMultipleSystems(requests) {
  if (!Array.isArray(requests) || requests.length === 0) {
    return [];
  }

  const promises = requests.map((req) =>
    fetchData(req.systemId, req.dataType, req.options || {}),
  );

  try {
    const results = await Promise.all(promises);
    return results;
  } catch (error) {
    console.error('[SystemConnector] Multi-system fetch failed:', error);
    return requests.map((req) => ({
      success: false,
      system: req.systemId || 'unknown',
      dataType: req.dataType || 'unknown',
      data: null,
      source: { system: req.systemId || 'unknown', active: false, dataType: req.dataType || 'unknown', timestamp: new Date().toISOString() },
      error: `Multi-system fetch error: ${error.message || 'Unknown error'}`,
      timestamp: new Date().toISOString(),
    }));
  }
}

/**
 * Returns the current connection/health status for a specific system or all systems.
 *
 * @param {string|null} [systemId=null] - Optional system identifier. If null, returns status for all systems.
 * @returns {{ system: string, connected: boolean, failureCount: number, circuitOpen: boolean }|Array<{ system: string, connected: boolean, failureCount: number, circuitOpen: boolean }>}
 */
export function getSystemStatus(systemId = null) {
  if (systemId && typeof systemId === 'string') {
    const normalised = systemId.trim().toLowerCase();
    const state = systemState[normalised];

    if (!state) {
      return {
        system: normalised,
        connected: false,
        failureCount: 0,
        circuitOpen: false,
        error: `Unknown system: ${normalised}`,
      };
    }

    const circuitOpen = isCircuitOpen(normalised);

    return {
      system: normalised,
      connected: state.connected && !circuitOpen,
      failureCount: state.failureCount,
      circuitOpen,
    };
  }

  return getSupportedSystems().map((sys) => {
    const state = systemState[sys];
    const circuitOpen = isCircuitOpen(sys);
    return {
      system: sys,
      connected: state.connected && !circuitOpen,
      failureCount: state.failureCount,
      circuitOpen,
    };
  });
}

/**
 * Returns source indicator objects for all systems, indicating which are active.
 * Useful for the SourceTransparencyPanel.
 *
 * @param {string[]} [activeSystems=[]] - Array of system IDs that were queried.
 * @returns {Array<{ system: string, active: boolean, connected: boolean }>}
 */
export function getSourceIndicators(activeSystems = []) {
  const activeSet = new Set(
    (activeSystems || []).map((s) => (typeof s === 'string' ? s.trim().toLowerCase() : '')),
  );

  return getSupportedSystems().map((sys) => {
    const state = systemState[sys];
    const circuitOpen = isCircuitOpen(sys);
    return {
      system: sys,
      active: activeSet.has(sys),
      connected: state.connected && !circuitOpen,
    };
  });
}

/**
 * Resets the internal state for all systems (useful for testing).
 * @returns {void}
 */
export function resetSystemState() {
  for (const sys of getSupportedSystems()) {
    systemState[sys] = { connected: true, failureCount: 0, unavailableUntil: 0 };
  }
}

/**
 * Determines which systems should be queried based on a parsed intent or cluster ID.
 *
 * @param {string} clusterId - The intelligence cluster ID.
 * @returns {Array<{ systemId: string, dataType: string }>} Array of system/dataType pairs to query.
 */
export function determineTargetSystems(clusterId) {
  if (!clusterId || typeof clusterId !== 'string') {
    return [];
  }

  const normalised = clusterId.trim().toLowerCase();

  const clusterSystemMap = {
    'cost-management': [
      { systemId: SYSTEMS.SAP, dataType: 'cost-reports' },
      { systemId: SYSTEMS.SAP, dataType: 'invoices' },
      { systemId: SYSTEMS.PROCORE, dataType: 'change-orders' },
    ],
    'schedule-tracking': [
      { systemId: SYSTEMS.PRIMAVERA, dataType: 'schedules' },
      { systemId: SYSTEMS.PRIMAVERA, dataType: 'resources' },
      { systemId: SYSTEMS.PROCORE, dataType: 'projects' },
    ],
    'risk-assessment': [
      { systemId: SYSTEMS.SAP, dataType: 'cost-reports' },
      { systemId: SYSTEMS.PROCORE, dataType: 'rfis' },
      { systemId: SYSTEMS.PRIMAVERA, dataType: 'schedules' },
    ],
    'quality-assurance': [
      { systemId: SYSTEMS.PROCORE, dataType: 'rfis' },
      { systemId: SYSTEMS.PROCORE, dataType: 'projects' },
    ],
    'stakeholder-comms': [
      { systemId: SYSTEMS.SALESFORCE, dataType: 'pipeline' },
      { systemId: SYSTEMS.SALESFORCE, dataType: 'clients' },
    ],
  };

  return clusterSystemMap[normalised] || [];
}