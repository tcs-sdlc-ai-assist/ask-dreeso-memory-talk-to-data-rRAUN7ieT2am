import { STORAGE_KEYS, AUDIT_LOG_MAX_ENTRIES } from '../utils/constants.js';
import { getItem, setItem, appendToArray, removeItem } from './LocalStorageService.js';

/**
 * Audit logging service that records all user actions to localStorage.
 *
 * Supported actions: signup, login, logout, query, action_execution,
 * persona_switch, and any custom action string.
 *
 * Each log entry follows the shape:
 * { id: string, action: string, timestamp: string, userId: string|null, persona: string|null, details: object|null }
 */

/**
 * Generates a unique identifier for an audit log entry.
 * Uses a combination of timestamp and random hex to avoid collisions.
 * @returns {string} A unique ID string.
 */
function generateId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `audit_${timestamp}_${random}`;
}

/**
 * Records a user action to the audit log in localStorage.
 *
 * @param {string} action - The action type (e.g. 'signup', 'login', 'logout', 'query', 'action_execution', 'persona_switch').
 * @param {object} [options={}] - Additional options for the log entry.
 * @param {string|null} [options.userId=null] - The ID of the user performing the action.
 * @param {string|null} [options.persona=null] - The active persona ID at the time of the action.
 * @param {object|null} [options.details=null] - Arbitrary details about the action.
 * @returns {{ success: boolean, entry: object|null }} The result of the logging operation and the created entry.
 */
export function logAction(action, options = {}) {
  try {
    if (!action || typeof action !== 'string' || action.trim().length === 0) {
      console.error('[AuditLogger] Action is required and must be a non-empty string.');
      return { success: false, entry: null };
    }

    const { userId = null, persona = null, details = null } = options;

    const entry = {
      id: generateId(),
      action: action.trim(),
      timestamp: new Date().toISOString(),
      userId,
      persona,
      details,
    };

    const success = appendToArray(STORAGE_KEYS.AUDIT_LOG, entry, AUDIT_LOG_MAX_ENTRIES);

    return { success, entry: success ? entry : null };
  } catch (error) {
    console.error('[AuditLogger] Failed to log action:', error);
    return { success: false, entry: null };
  }
}

/**
 * Retrieves the full audit log from localStorage.
 *
 * @param {object} [filters={}] - Optional filters to narrow results.
 * @param {string} [filters.action] - Filter by action type.
 * @param {string} [filters.userId] - Filter by user ID.
 * @param {string} [filters.persona] - Filter by persona ID.
 * @param {string} [filters.startDate] - ISO date string; only entries on or after this date.
 * @param {string} [filters.endDate] - ISO date string; only entries on or before this date.
 * @returns {Array<object>} The array of audit log entries (newest last), filtered if applicable.
 */
export function getAuditLog(filters = {}) {
  try {
    const log = getItem(STORAGE_KEYS.AUDIT_LOG, []);

    if (!Array.isArray(log)) {
      console.error('[AuditLogger] Audit log data is corrupted; returning empty array.');
      return [];
    }

    const { action, userId, persona, startDate, endDate } = filters;

    if (!action && !userId && !persona && !startDate && !endDate) {
      return log;
    }

    return log.filter((entry) => {
      if (action && entry.action !== action) {
        return false;
      }
      if (userId && entry.userId !== userId) {
        return false;
      }
      if (persona && entry.persona !== persona) {
        return false;
      }
      if (startDate) {
        const entryDate = new Date(entry.timestamp);
        const start = new Date(startDate);
        if (entryDate < start) {
          return false;
        }
      }
      if (endDate) {
        const entryDate = new Date(entry.timestamp);
        const end = new Date(endDate);
        if (entryDate > end) {
          return false;
        }
      }
      return true;
    });
  } catch (error) {
    console.error('[AuditLogger] Failed to retrieve audit log:', error);
    return [];
  }
}

/**
 * Clears all entries from the audit log in localStorage.
 * @returns {boolean} True if the operation succeeded, false otherwise.
 */
export function clearAuditLog() {
  try {
    return removeItem(STORAGE_KEYS.AUDIT_LOG);
  } catch (error) {
    console.error('[AuditLogger] Failed to clear audit log:', error);
    return false;
  }
}

/**
 * Exports the audit log as a JSON string, suitable for download or transfer.
 *
 * @param {object} [filters={}] - Optional filters (same shape as getAuditLog filters).
 * @returns {{ success: boolean, data: string|null, count: number }} The exported JSON string and entry count.
 */
export function exportAuditLog(filters = {}) {
  try {
    const entries = getAuditLog(filters);

    const exportPayload = {
      exportedAt: new Date().toISOString(),
      totalEntries: entries.length,
      entries,
    };

    const data = JSON.stringify(exportPayload, null, 2);

    return { success: true, data, count: entries.length };
  } catch (error) {
    console.error('[AuditLogger] Failed to export audit log:', error);
    return { success: false, data: null, count: 0 };
  }
}