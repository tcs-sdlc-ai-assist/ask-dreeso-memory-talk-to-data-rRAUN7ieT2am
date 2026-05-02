import { STORAGE_KEYS, AUDIT_LOG_MAX_ENTRIES } from '../utils/constants.js';

/**
 * Abstraction layer over browser localStorage providing JSON-aware
 * CRUD helpers and graceful error handling.
 *
 * All public methods are synchronous (localStorage is synchronous).
 */

/**
 * Retrieves a value from localStorage and parses it as JSON.
 * @param {string} key - The localStorage key.
 * @param {*} [defaultValue=null] - Value returned when the key does not exist or parsing fails.
 * @returns {*} The parsed value, or defaultValue on failure.
 */
export function getItem(key, defaultValue = null) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) {
      return defaultValue;
    }
    return JSON.parse(raw);
  } catch (error) {
    console.error(`[LocalStorageService] Failed to read key "${key}":`, error);
    return defaultValue;
  }
}

/**
 * Serialises a value to JSON and stores it in localStorage.
 * @param {string} key - The localStorage key.
 * @param {*} value - The value to store (must be JSON-serialisable).
 * @returns {boolean} True if the write succeeded, false otherwise.
 */
export function setItem(key, value) {
  try {
    const serialised = JSON.stringify(value);
    localStorage.setItem(key, serialised);
    return true;
  } catch (error) {
    console.error(`[LocalStorageService] Failed to write key "${key}":`, error);
    return false;
  }
}

/**
 * Removes a single key from localStorage.
 * @param {string} key - The localStorage key to remove.
 * @returns {boolean} True if the removal succeeded, false otherwise.
 */
export function removeItem(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`[LocalStorageService] Failed to remove key "${key}":`, error);
    return false;
  }
}

/**
 * Removes all application-specific keys defined in STORAGE_KEYS from localStorage.
 * Does NOT call localStorage.clear() to avoid wiping unrelated data.
 * @returns {boolean} True if all removals succeeded, false if any failed.
 */
export function clearAll() {
  try {
    const keys = Object.values(STORAGE_KEYS);
    keys.forEach((key) => {
      localStorage.removeItem(key);
    });
    return true;
  } catch (error) {
    console.error('[LocalStorageService] Failed to clear all keys:', error);
    return false;
  }
}

/**
 * Appends an item to an array stored at the given localStorage key.
 * If the key does not exist yet, a new array is created.
 * For the audit-log key the array is automatically trimmed to
 * AUDIT_LOG_MAX_ENTRIES (most-recent entries kept).
 *
 * @param {string} key - The localStorage key whose value is an array.
 * @param {*} item - The item to append.
 * @param {number} [maxLength=0] - Optional max length. 0 means unlimited.
 *   When the key equals STORAGE_KEYS.AUDIT_LOG and maxLength is not provided,
 *   AUDIT_LOG_MAX_ENTRIES is used automatically.
 * @returns {boolean} True if the operation succeeded, false otherwise.
 */
export function appendToArray(key, item, maxLength = 0) {
  try {
    const existing = getItem(key, []);
    if (!Array.isArray(existing)) {
      console.error(`[LocalStorageService] Value at key "${key}" is not an array.`);
      return false;
    }

    existing.push(item);

    let limit = maxLength;
    if (limit === 0 && key === STORAGE_KEYS.AUDIT_LOG) {
      limit = AUDIT_LOG_MAX_ENTRIES;
    }

    const trimmed = limit > 0 ? existing.slice(-limit) : existing;

    return setItem(key, trimmed);
  } catch (error) {
    console.error(`[LocalStorageService] Failed to append to key "${key}":`, error);
    return false;
  }
}