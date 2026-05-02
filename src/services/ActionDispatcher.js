import { executeAction as executeActionMock } from '../data/mockData.js';
import { fetchData, getSystemStatus, SYSTEMS } from './SystemConnector.js';
import { logAction } from './AuditLogger.js';

/**
 * Action execution dispatch service for enterprise systems.
 *
 * Handles action execution requests by validating inputs, dispatching
 * to the appropriate enterprise system via SystemConnector, and returning
 * structured confirmation/result objects.
 *
 * Supports actions such as approvals, updates, and status changes
 * across SAP, Procore, Salesforce, and Primavera.
 */

// ---------------------------------------------------------------------------
// Available actions registry
// ---------------------------------------------------------------------------

const AVAILABLE_ACTIONS = [
  {
    actionId: 'approve-change-order',
    label: 'Approve Change Order',
    description: 'Approves a pending change order in Procore and updates SAP financials.',
    targetSystem: SYSTEMS.PROCORE,
    requiredParams: ['changeOrderId'],
    category: 'approval',
  },
  {
    actionId: 'process-payment',
    label: 'Process Invoice Payment',
    description: 'Initiates payment processing for an invoice in SAP.',
    targetSystem: SYSTEMS.SAP,
    requiredParams: ['invoiceId'],
    category: 'financial',
  },
  {
    actionId: 'escalate-rfi',
    label: 'Escalate RFI',
    description: 'Escalates an RFI to a higher priority and reassigns in Procore.',
    targetSystem: SYSTEMS.PROCORE,
    requiredParams: ['rfiId'],
    category: 'escalation',
  },
  {
    actionId: 'schedule-meeting',
    label: 'Schedule Client Meeting',
    description: 'Schedules a meeting with a client contact via Salesforce.',
    targetSystem: SYSTEMS.SALESFORCE,
    requiredParams: ['clientId'],
    category: 'communication',
  },
  {
    actionId: 'generate-report',
    label: 'Generate Report',
    description: 'Generates a portfolio or project report from aggregated data.',
    targetSystem: null,
    requiredParams: [],
    category: 'reporting',
  },
  {
    actionId: 'add-weekend-shift',
    label: 'Add Weekend Shift',
    description: 'Schedules additional weekend shifts for a project in Primavera.',
    targetSystem: SYSTEMS.PRIMAVERA,
    requiredParams: ['projectId'],
    category: 'scheduling',
  },
];

// ---------------------------------------------------------------------------
// In-memory action execution history (per session)
// ---------------------------------------------------------------------------

/** @type {Map<string, { actionId: string, status: string, result: object|null, error: string|null, timestamp: string }>} */
const actionHistory = new Map();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Generates a unique dispatch ID.
 * @returns {string}
 */
function generateDispatchId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `dispatch_${timestamp}_${random}`;
}

/**
 * Validates an action request against the available actions registry.
 *
 * @param {string} actionId - The action identifier.
 * @param {object} params - The action parameters.
 * @returns {{ valid: boolean, error: string|null, actionDef: object|null }}
 */
function validateActionRequest(actionId, params) {
  if (!actionId || typeof actionId !== 'string' || actionId.trim().length === 0) {
    return { valid: false, error: 'Action ID is required and must be a non-empty string.', actionDef: null };
  }

  const trimmedId = actionId.trim();
  const actionDef = AVAILABLE_ACTIONS.find((a) => a.actionId === trimmedId);

  if (!actionDef) {
    const availableIds = AVAILABLE_ACTIONS.map((a) => a.actionId).join(', ');
    return {
      valid: false,
      error: `Unknown action: "${trimmedId}". Available actions: ${availableIds}`,
      actionDef: null,
    };
  }

  if (actionDef.requiredParams && actionDef.requiredParams.length > 0) {
    const safeParams = params && typeof params === 'object' ? params : {};
    for (const requiredParam of actionDef.requiredParams) {
      if (!(requiredParam in safeParams) || safeParams[requiredParam] === null || safeParams[requiredParam] === undefined) {
        return {
          valid: false,
          error: `Missing required parameter: "${requiredParam}" for action "${trimmedId}".`,
          actionDef,
        };
      }
    }
  }

  return { valid: true, error: null, actionDef };
}

/**
 * Checks whether the target system for an action is currently available.
 *
 * @param {string|null} targetSystem - The target system identifier.
 * @returns {{ available: boolean, error: string|null }}
 */
function checkSystemAvailability(targetSystem) {
  if (!targetSystem) {
    // Actions without a target system (e.g. report generation) are always available
    return { available: true, error: null };
  }

  const status = getSystemStatus(targetSystem);

  if (!status || status.error) {
    return {
      available: false,
      error: `Target system "${targetSystem}" is unknown or unavailable.`,
    };
  }

  if (!status.connected || status.circuitOpen) {
    return {
      available: false,
      error: `Target system "${targetSystem}" is temporarily unavailable (circuit breaker open). Please try again later.`,
    };
  }

  return { available: true, error: null };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Executes an action against an enterprise system.
 *
 * Steps:
 * 1. Validate the action request
 * 2. Check target system availability
 * 3. Execute the action via mock data layer
 * 4. Record the result in action history
 * 5. Log the action via AuditLogger
 * 6. Return the structured result
 *
 * @param {string} actionId - The action identifier (e.g. 'approve-change-order').
 * @param {object} [params={}] - Optional parameters for the action.
 * @param {object} [session=null] - The session context.
 * @param {string} [session.userId] - The user ID.
 * @param {string} [session.personaId] - The active persona ID.
 * @returns {Promise<{ dispatchId: string, success: boolean, actionId: string, actionLabel: string, targetSystem: string|null, result: object|null, error: object|null, timestamp: string }>}
 */
export async function executeAction(actionId, params = {}, session = null) {
  const dispatchId = generateDispatchId();
  const timestamp = new Date().toISOString();
  const userId = session?.userId || null;
  const personaId = session?.personaId || null;

  // 1. Validate
  const validation = validateActionRequest(actionId, params);
  if (!validation.valid) {
    const errorResult = {
      dispatchId,
      success: false,
      actionId: actionId || 'unknown',
      actionLabel: validation.actionDef?.label || 'Unknown Action',
      targetSystem: validation.actionDef?.targetSystem || null,
      result: null,
      error: { code: 'ACT-400', message: 'Invalid action request.', details: validation.error },
      timestamp,
    };

    actionHistory.set(dispatchId, {
      actionId: actionId || 'unknown',
      status: 'failed',
      result: null,
      error: validation.error,
      timestamp,
    });

    logAction('action_execution', {
      userId,
      persona: personaId,
      details: {
        dispatchId,
        actionId: actionId || 'unknown',
        error: validation.error,
        status: 'validation_failed',
      },
    });

    return errorResult;
  }

  const actionDef = validation.actionDef;
  const trimmedActionId = actionId.trim();

  // 2. Check system availability
  const availability = checkSystemAvailability(actionDef.targetSystem);
  if (!availability.available) {
    const errorResult = {
      dispatchId,
      success: false,
      actionId: trimmedActionId,
      actionLabel: actionDef.label,
      targetSystem: actionDef.targetSystem,
      result: null,
      error: { code: 'ACT-503', message: 'Target system unavailable.', details: availability.error },
      timestamp,
    };

    actionHistory.set(dispatchId, {
      actionId: trimmedActionId,
      status: 'system_unavailable',
      result: null,
      error: availability.error,
      timestamp,
    });

    logAction('action_execution', {
      userId,
      persona: personaId,
      details: {
        dispatchId,
        actionId: trimmedActionId,
        targetSystem: actionDef.targetSystem,
        error: availability.error,
        status: 'system_unavailable',
      },
    });

    return errorResult;
  }

  try {
    // 3. Execute the action via mock
    const executionResult = executeActionMock(trimmedActionId, params || {});

    // 4. Record in action history
    actionHistory.set(dispatchId, {
      actionId: trimmedActionId,
      status: executionResult.success ? 'completed' : 'failed',
      result: executionResult.result || null,
      error: executionResult.error || null,
      timestamp: new Date().toISOString(),
    });

    // 5. Log the action
    logAction('action_execution', {
      userId,
      persona: personaId,
      details: {
        dispatchId,
        actionId: trimmedActionId,
        actionLabel: actionDef.label,
        targetSystem: actionDef.targetSystem,
        category: actionDef.category,
        params: params || {},
        success: executionResult.success,
        error: executionResult.error || null,
        status: executionResult.success ? 'completed' : 'failed',
      },
    });

    // 6. Return structured result
    return {
      dispatchId,
      success: executionResult.success,
      actionId: trimmedActionId,
      actionLabel: actionDef.label,
      targetSystem: actionDef.targetSystem,
      result: executionResult.result || null,
      error: executionResult.error
        ? { code: 'ACT-500', message: 'Action execution failed.', details: executionResult.error }
        : null,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('[ActionDispatcher] executeAction failed:', error);

    actionHistory.set(dispatchId, {
      actionId: trimmedActionId,
      status: 'error',
      result: null,
      error: error.message || 'Unknown error',
      timestamp: new Date().toISOString(),
    });

    logAction('action_execution', {
      userId,
      persona: personaId,
      details: {
        dispatchId,
        actionId: trimmedActionId,
        targetSystem: actionDef.targetSystem,
        error: error.message || 'Unknown error',
        status: 'error',
      },
    });

    return {
      dispatchId,
      success: false,
      actionId: trimmedActionId,
      actionLabel: actionDef.label,
      targetSystem: actionDef.targetSystem,
      result: null,
      error: { code: 'ACT-500', message: 'Action execution failed.', details: error.message || 'An unexpected error occurred.' },
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Retrieves the status of a previously dispatched action.
 *
 * @param {string} dispatchId - The dispatch ID returned from executeAction.
 * @returns {{ found: boolean, dispatchId: string, actionId: string|null, status: string|null, result: object|null, error: string|null, timestamp: string|null }}
 */
export function getActionStatus(dispatchId) {
  if (!dispatchId || typeof dispatchId !== 'string' || dispatchId.trim().length === 0) {
    return {
      found: false,
      dispatchId: dispatchId || 'unknown',
      actionId: null,
      status: null,
      result: null,
      error: 'Dispatch ID is required.',
      timestamp: null,
    };
  }

  const entry = actionHistory.get(dispatchId.trim());

  if (!entry) {
    return {
      found: false,
      dispatchId: dispatchId.trim(),
      actionId: null,
      status: null,
      result: null,
      error: `No action found with dispatch ID: ${dispatchId.trim()}`,
      timestamp: null,
    };
  }

  return {
    found: true,
    dispatchId: dispatchId.trim(),
    actionId: entry.actionId,
    status: entry.status,
    result: entry.result,
    error: entry.error,
    timestamp: entry.timestamp,
  };
}

/**
 * Returns the list of all available actions, optionally filtered by category
 * or target system.
 *
 * @param {object} [filters={}] - Optional filters.
 * @param {string} [filters.category] - Filter by action category (e.g. 'approval', 'financial').
 * @param {string} [filters.targetSystem] - Filter by target system (e.g. 'sap', 'procore').
 * @returns {Array<{ actionId: string, label: string, description: string, targetSystem: string|null, requiredParams: string[], category: string, systemAvailable: boolean }>}
 */
export function getAvailableActions(filters = {}) {
  const { category, targetSystem } = filters;

  let actions = [...AVAILABLE_ACTIONS];

  if (category && typeof category === 'string' && category.trim().length > 0) {
    const normalizedCategory = category.trim().toLowerCase();
    actions = actions.filter((a) => a.category === normalizedCategory);
  }

  if (targetSystem && typeof targetSystem === 'string' && targetSystem.trim().length > 0) {
    const normalizedSystem = targetSystem.trim().toLowerCase();
    actions = actions.filter((a) => a.targetSystem === normalizedSystem);
  }

  return actions.map((a) => {
    const availability = checkSystemAvailability(a.targetSystem);
    return {
      actionId: a.actionId,
      label: a.label,
      description: a.description,
      targetSystem: a.targetSystem,
      requiredParams: a.requiredParams,
      category: a.category,
      systemAvailable: availability.available,
    };
  });
}

/**
 * Returns the list of supported action categories.
 *
 * @returns {string[]} An array of unique category strings.
 */
export function getActionCategories() {
  const categories = new Set(AVAILABLE_ACTIONS.map((a) => a.category));
  return [...categories];
}

/**
 * Finds an action definition by its ID.
 *
 * @param {string} actionId - The action identifier.
 * @returns {object|null} The action definition object, or null if not found.
 */
export function findActionById(actionId) {
  if (!actionId || typeof actionId !== 'string' || actionId.trim().length === 0) {
    return null;
  }

  const action = AVAILABLE_ACTIONS.find((a) => a.actionId === actionId.trim());
  return action || null;
}

/**
 * Returns the full action execution history.
 *
 * @returns {Array<{ dispatchId: string, actionId: string, status: string, result: object|null, error: string|null, timestamp: string }>}
 */
export function getActionHistory() {
  const entries = [];

  for (const [dispatchId, entry] of actionHistory.entries()) {
    entries.push({
      dispatchId,
      actionId: entry.actionId,
      status: entry.status,
      result: entry.result,
      error: entry.error,
      timestamp: entry.timestamp,
    });
  }

  return entries;
}

/**
 * Clears the in-memory action execution history.
 * Useful for testing or session reset.
 * @returns {void}
 */
export function clearActionHistory() {
  actionHistory.clear();
}