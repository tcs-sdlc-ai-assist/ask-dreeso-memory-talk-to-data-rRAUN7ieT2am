import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import { AppLayout } from '../components/layout/AppLayout.jsx';
import { DataTable } from '../components/response/DataTable.jsx';
import { ErrorBanner } from '../components/common/ErrorBanner.jsx';
import { LoadingSpinner } from '../components/common/LoadingSpinner.jsx';
import { getAuditLog, clearAuditLog, exportAuditLog } from '../services/AuditLogger.js';
import { COLORS, ANIMATION } from '../utils/constants.js';

/**
 * Formats an ISO timestamp into a human-readable date/time string.
 * @param {string} timestamp - An ISO timestamp string.
 * @returns {string} A formatted date/time string.
 */
function formatTimestamp(timestamp) {
  if (!timestamp || typeof timestamp !== 'string') return '—';

  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '—';

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } catch {
    return '—';
  }
}

/**
 * Returns a human-readable label for an action type.
 * @param {string} action - The action type string.
 * @returns {string} A formatted action label.
 */
function formatActionLabel(action) {
  if (!action || typeof action !== 'string') return 'Unknown';

  const labels = {
    signup: 'Signup',
    login: 'Login',
    logout: 'Logout',
    query: 'Query',
    action_execution: 'Action Execution',
    persona_switch: 'Persona Switch',
  };

  return labels[action] || action.charAt(0).toUpperCase() + action.slice(1).replace(/_/g, ' ');
}

/**
 * Returns a color for a given action type.
 * @param {string} action - The action type string.
 * @returns {string} A hex color string.
 */
function getActionColor(action) {
  if (!action || typeof action !== 'string') return COLORS.ACCENT_BLUE;

  switch (action) {
    case 'signup':
      return COLORS.SUCCESS;
    case 'login':
      return COLORS.ACCENT_BLUE;
    case 'logout':
      return COLORS.WARNING;
    case 'query':
      return COLORS.ACCENT_BLUE_LIGHT;
    case 'action_execution':
      return COLORS.CRITICAL;
    case 'persona_switch':
      return COLORS.WARNING;
    default:
      return COLORS.ACCENT_BLUE;
  }
}

/**
 * Formats the details object into a short summary string.
 * @param {object|null} details - The details object from an audit log entry.
 * @returns {string} A short summary string.
 */
function formatDetails(details) {
  if (!details || typeof details !== 'object') return '—';

  const parts = [];

  if (details.query) {
    const truncated = details.query.length > 60
      ? details.query.substring(0, 60) + '…'
      : details.query;
    parts.push(`Query: "${truncated}"`);
  }

  if (details.email) {
    parts.push(`Email: ${details.email}`);
  }

  if (details.actionId) {
    parts.push(`Action: ${details.actionId}`);
  }

  if (details.personaName) {
    parts.push(`Persona: ${details.personaName}`);
  }

  if (details.method) {
    parts.push(`Method: ${details.method.replace(/_/g, ' ')}`);
  }

  if (details.reason) {
    parts.push(`Reason: ${details.reason}`);
  }

  if (details.status) {
    parts.push(`Status: ${details.status}`);
  }

  if (details.clusterId) {
    parts.push(`Cluster: ${details.clusterId}`);
  }

  if (details.error && typeof details.error === 'string') {
    const truncated = details.error.length > 50
      ? details.error.substring(0, 50) + '…'
      : details.error;
    parts.push(`Error: ${truncated}`);
  }

  if (parts.length === 0) {
    const keys = Object.keys(details).slice(0, 3);
    for (const key of keys) {
      const value = details[key];
      if (value !== null && value !== undefined && typeof value !== 'object') {
        parts.push(`${key}: ${String(value)}`);
      }
    }
  }

  return parts.length > 0 ? parts.join(' · ') : '—';
}

/**
 * Returns the unique action types from a list of audit log entries.
 * @param {Array<object>} entries - The audit log entries.
 * @returns {string[]} An array of unique action type strings.
 */
function getUniqueActionTypes(entries) {
  if (!Array.isArray(entries) || entries.length === 0) return [];
  const types = new Set(entries.map((e) => e.action).filter(Boolean));
  return [...types].sort();
}

/**
 * Container animation variants for staggered children.
 */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
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
 * AuditLogPage displays all logged user actions in a searchable, filterable
 * table. Shows timestamp, user, action type, and details. Includes clear log
 * and export buttons.
 *
 * Features:
 * - Displays all audit log entries from AuditLogger
 * - Search/filter by action type, user ID, or free text
 * - DataTable component for tabular display with sorting
 * - Export audit log as JSON download
 * - Clear all audit log entries with confirmation
 * - AppLayout wrapper with gradient background and PersonaBar
 * - Animated entry with Framer Motion stagger effect
 * - Responsive layout with Urbanist font
 * - Error handling for log retrieval failures
 *
 * @returns {React.ReactElement}
 */
export default function AuditLogPage() {
  const { user } = useAuth();

  const [searchText, setSearchText] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const rawEntries = useMemo(() => {
    try {
      const log = getAuditLog();
      return Array.isArray(log) ? log : [];
    } catch (err) {
      console.error('[AuditLogPage] Failed to load audit log:', err);
      setError('Failed to load audit log.');
      return [];
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  const actionTypes = useMemo(() => {
    return getUniqueActionTypes(rawEntries);
  }, [rawEntries]);

  const filteredEntries = useMemo(() => {
    let entries = [...rawEntries];

    if (actionFilter && actionFilter.trim().length > 0) {
      entries = entries.filter((e) => e.action === actionFilter);
    }

    if (searchText && searchText.trim().length > 0) {
      const query = searchText.trim().toLowerCase();
      entries = entries.filter((e) => {
        const actionMatch = (e.action || '').toLowerCase().includes(query);
        const userMatch = (e.userId || '').toLowerCase().includes(query);
        const personaMatch = (e.persona || '').toLowerCase().includes(query);
        const detailsStr = e.details ? JSON.stringify(e.details).toLowerCase() : '';
        const detailsMatch = detailsStr.includes(query);
        const timestampMatch = (e.timestamp || '').toLowerCase().includes(query);
        return actionMatch || userMatch || personaMatch || detailsMatch || timestampMatch;
      });
    }

    return entries.reverse();
  }, [rawEntries, actionFilter, searchText]);

  const tableData = useMemo(() => {
    return filteredEntries.map((entry) => ({
      timestamp: formatTimestamp(entry.timestamp),
      action: formatActionLabel(entry.action),
      user: entry.userId || '—',
      persona: entry.persona || '—',
      details: formatDetails(entry.details),
    }));
  }, [filteredEntries]);

  const tableColumns = useMemo(() => [
    { key: 'timestamp', label: 'Timestamp', sortable: true },
    { key: 'action', label: 'Action', sortable: true },
    { key: 'user', label: 'User ID', sortable: true },
    { key: 'persona', label: 'Persona', sortable: true },
    { key: 'details', label: 'Details', sortable: false },
  ], []);

  const handleSearchChange = useCallback((e) => {
    setSearchText(e.target.value);
  }, []);

  const handleActionFilterChange = useCallback((e) => {
    setActionFilter(e.target.value);
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
    setError(null);
    setSuccessMessage(null);
  }, []);

  const handleExport = useCallback(() => {
    try {
      const filters = {};
      if (actionFilter) {
        filters.action = actionFilter;
      }

      const result = exportAuditLog(filters);

      if (!result.success || !result.data) {
        setError('Failed to export audit log.');
        return;
      }

      const blob = new Blob([result.data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit-log-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSuccessMessage(`Exported ${result.count} entries.`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('[AuditLogPage] Export failed:', err);
      setError('Failed to export audit log.');
    }
  }, [actionFilter]);

  const handleClearRequest = useCallback(() => {
    setShowClearConfirm(true);
  }, []);

  const handleClearCancel = useCallback(() => {
    setShowClearConfirm(false);
  }, []);

  const handleClearConfirm = useCallback(() => {
    try {
      const success = clearAuditLog();
      if (success) {
        setRefreshKey((prev) => prev + 1);
        setSuccessMessage('Audit log cleared successfully.');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError('Failed to clear audit log.');
      }
    } catch (err) {
      console.error('[AuditLogPage] Clear failed:', err);
      setError('Failed to clear audit log.');
    } finally {
      setShowClearConfirm(false);
    }
  }, []);

  const handleDismissError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <AppLayout>
      <motion.div
        className="w-full font-urbanist pb-12 sm:pb-16"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Page header */}
        <motion.div
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8"
          variants={childVariants}
        >
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-white sm:text-3xl">
              Audit Log
            </h1>
            <p className="text-sm text-white/40">
              Review all user actions and system events
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Refresh button */}
            <motion.button
              type="button"
              onClick={handleRefresh}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white/60 bg-white/5 border border-white/10 hover:text-white/80 hover:bg-white/10 hover:border-white/20 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent-blue/30"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              aria-label="Refresh audit log"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-3.5 h-3.5"
              >
                <path
                  fillRule="evenodd"
                  d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H4.598a.75.75 0 00-.75.75v3.634a.75.75 0 001.5 0v-2.033l.312.311a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm-9.624-2.848a.75.75 0 00.726.943h3.634a.75.75 0 000-1.5H7.615l.312-.311a5.5 5.5 0 019.201-2.466.75.75 0 101.449-.39A7 7 0 006.865 8.265l-.312.311V6.543a.75.75 0 00-1.5 0v3.634a.75.75 0 00.035.399z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Refresh</span>
            </motion.button>

            {/* Export button */}
            <motion.button
              type="button"
              onClick={handleExport}
              disabled={rawEntries.length === 0}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent-blue/30 disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                backgroundColor: `${COLORS.ACCENT_BLUE}20`,
                color: COLORS.ACCENT_BLUE,
                border: `1px solid ${COLORS.ACCENT_BLUE}30`,
              }}
              whileHover={{ scale: rawEntries.length === 0 ? 1 : 1.03 }}
              whileTap={{ scale: rawEntries.length === 0 ? 1 : 0.97 }}
              aria-label="Export audit log"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-3.5 h-3.5"
              >
                <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
                <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
              </svg>
              <span>Export</span>
            </motion.button>

            {/* Clear button */}
            <motion.button
              type="button"
              onClick={handleClearRequest}
              disabled={rawEntries.length === 0}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent-blue/30 disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                backgroundColor: `${COLORS.CRITICAL}20`,
                color: COLORS.CRITICAL,
                border: `1px solid ${COLORS.CRITICAL}30`,
              }}
              whileHover={{ scale: rawEntries.length === 0 ? 1 : 1.03 }}
              whileTap={{ scale: rawEntries.length === 0 ? 1 : 0.97 }}
              aria-label="Clear audit log"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-3.5 h-3.5"
              >
                <path
                  fillRule="evenodd"
                  d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.519.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Clear</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Error banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              className="mb-4"
              variants={childVariants}
            >
              <ErrorBanner
                message={error}
                type="error"
                visible={true}
                onDismiss={handleDismissError}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success message */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              className="flex items-start gap-2 rounded-xl px-4 py-3 mb-4"
              style={{
                backgroundColor: `${COLORS.SUCCESS}15`,
                border: `1px solid ${COLORS.SUCCESS}30`,
              }}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              role="status"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill={COLORS.SUCCESS}
                className="w-5 h-5 shrink-0 mt-0.5"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-sm" style={{ color: COLORS.SUCCESS }}>
                {successMessage}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filters */}
        <motion.div
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6"
          variants={childVariants}
        >
          {/* Search input */}
          <div className="flex-1 min-w-0">
            <div className="glass-input flex items-center gap-2 px-3 py-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4 text-white/30 shrink-0"
              >
                <path
                  fillRule="evenodd"
                  d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                  clipRule="evenodd"
                />
              </svg>
              <input
                type="text"
                value={searchText}
                onChange={handleSearchChange}
                placeholder="Search audit log..."
                className="flex-1 min-w-0 bg-transparent text-sm text-white placeholder-white/30 font-urbanist focus:outline-none"
                aria-label="Search audit log"
              />
            </div>
          </div>

          {/* Action type filter */}
          <div className="shrink-0">
            <select
              value={actionFilter}
              onChange={handleActionFilterChange}
              className="glass-input w-full sm:w-auto px-3 py-2 text-sm text-white font-urbanist appearance-none cursor-pointer"
              style={{
                backgroundColor: 'rgba(10, 26, 47, 0.4)',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='rgba(255,255,255,0.4)'%3E%3Cpath fill-rule='evenodd' d='M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z' clip-rule='evenodd'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 10px center',
                backgroundSize: '14px',
                paddingRight: '32px',
                minWidth: '160px',
              }}
              aria-label="Filter by action type"
            >
              <option value="" className="bg-bg-dark text-white/50">
                All Actions
              </option>
              {actionTypes.map((type) => (
                <option
                  key={type}
                  value={type}
                  className="bg-bg-dark text-white"
                >
                  {formatActionLabel(type)}
                </option>
              ))}
            </select>
          </div>

          {/* Entry count */}
          <div className="flex items-center shrink-0">
            <span className="text-xs text-white/30">
              {filteredEntries.length} of {rawEntries.length} {rawEntries.length === 1 ? 'entry' : 'entries'}
            </span>
          </div>
        </motion.div>

        {/* Summary badges */}
        {rawEntries.length > 0 && (
          <motion.div
            className="flex flex-wrap items-center gap-2 mb-6"
            variants={childVariants}
          >
            {actionTypes.map((type) => {
              const count = rawEntries.filter((e) => e.action === type).length;
              const color = getActionColor(type);
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setActionFilter(actionFilter === type ? '' : type)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent-blue/30 cursor-pointer ${
                    actionFilter === type ? 'ring-1' : ''
                  }`}
                  style={{
                    backgroundColor: `${color}20`,
                    color: color,
                    ringColor: actionFilter === type ? color : 'transparent',
                  }}
                  aria-label={`Filter by ${formatActionLabel(type)}`}
                  aria-pressed={actionFilter === type}
                >
                  <span>{formatActionLabel(type)}</span>
                  <span
                    className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold"
                    style={{ backgroundColor: `${color}30` }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </motion.div>
        )}

        {/* Data table */}
        <motion.div
          variants={childVariants}
        >
          {filteredEntries.length > 0 ? (
            <DataTable
              data={tableData}
              columns={tableColumns}
            />
          ) : rawEntries.length > 0 ? (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16">
              <div
                className="flex items-center justify-center w-12 h-12 rounded-2xl mb-3"
                style={{ backgroundColor: `${COLORS.WARNING}15` }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill={COLORS.WARNING}
                  className="w-6 h-6"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <p className="text-sm text-white/40 text-center">
                No entries match your search criteria.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 sm:py-24">
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
                    d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a1.875 1.875 0 01-1.875-1.875V5.25A3.75 3.75 0 009 1.5H5.625zM7.5 15a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 017.5 15zm.75 2.25a.75.75 0 000 1.5H12a.75.75 0 000-1.5H8.25z"
                    clipRule="evenodd"
                  />
                  <path d="M12.971 1.816A5.23 5.23 0 0114.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 013.434 1.279 9.768 9.768 0 00-6.963-6.963z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-white mb-1">No Audit Entries</h2>
              <p className="text-sm text-white/40 text-center max-w-xs">
                The audit log is empty. User actions will appear here as they occur.
              </p>
            </div>
          )}
        </motion.div>

        {/* Clear confirmation modal */}
        <AnimatePresence>
          {showClearConfirm && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={handleClearCancel}
              role="dialog"
              aria-modal="true"
              aria-label="Confirm clear audit log"
            >
              {/* Backdrop */}
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

              {/* Modal */}
              <motion.div
                className="glass-card relative w-full max-w-sm font-urbanist"
                style={{ padding: '24px' }}
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 20 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start gap-3 mb-4">
                  <div
                    className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0"
                    style={{ backgroundColor: `${COLORS.CRITICAL}15` }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill={COLORS.CRITICAL}
                      className="w-6 h-6"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <h3 className="text-base font-bold text-white">
                      Clear Audit Log
                    </h3>
                    <p className="text-sm text-white/50 mt-1 leading-relaxed">
                      This will permanently delete all {rawEntries.length} audit log {rawEntries.length === 1 ? 'entry' : 'entries'}. This action cannot be undone.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <motion.button
                    type="button"
                    onClick={handleClearCancel}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-white/50 bg-white/5 border border-white/10 hover:text-white/70 hover:bg-white/10 hover:border-white/20 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent-blue/30"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    aria-label="Cancel clear"
                  >
                    Cancel
                  </motion.button>

                  <motion.button
                    type="button"
                    onClick={handleClearConfirm}
                    className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent-blue/30"
                    style={{ backgroundColor: COLORS.CRITICAL }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    aria-label="Confirm clear audit log"
                  >
                    Clear All
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AppLayout>
  );
}