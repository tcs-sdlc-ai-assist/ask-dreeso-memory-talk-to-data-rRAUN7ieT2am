import { useState, useMemo, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { ANIMATION } from '../../utils/constants.js';

/**
 * Formats a column header from a camelCase or snake_case key into a readable label.
 * @param {string} key - The column key.
 * @returns {string} A human-readable column header.
 */
function formatColumnHeader(key) {
  if (!key || typeof key !== 'string') return '';
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

/**
 * Formats a cell value for display.
 * @param {*} value - The cell value.
 * @returns {string} The formatted string.
 */
function formatCellValue(value) {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'number') return value.toLocaleString();
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value);
}

/**
 * Compares two values for sorting purposes.
 * @param {*} a - First value.
 * @param {*} b - Second value.
 * @param {'asc'|'desc'} direction - Sort direction.
 * @returns {number} Comparison result.
 */
function compareValues(a, b, direction) {
  const valA = a === null || a === undefined ? '' : a;
  const valB = b === null || b === undefined ? '' : b;

  let result = 0;

  if (typeof valA === 'number' && typeof valB === 'number') {
    result = valA - valB;
  } else {
    const strA = String(valA).toLowerCase();
    const strB = String(valB).toLowerCase();
    if (strA < strB) result = -1;
    else if (strA > strB) result = 1;
    else result = 0;
  }

  return direction === 'desc' ? -result : result;
}

/**
 * SortIcon renders an ascending/descending/neutral sort indicator.
 *
 * @param {{ active: boolean, direction: 'asc'|'desc'|null }} props
 * @returns {React.ReactElement}
 */
function SortIcon({ active, direction }) {
  if (!active || !direction) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="w-3.5 h-3.5 text-white/20 ml-1 shrink-0"
      >
        <path
          fillRule="evenodd"
          d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.76 9.2a.75.75 0 011.06.04l2.7 2.908 2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 01.04-1.06z"
          clipRule="evenodd"
        />
      </svg>
    );
  }

  if (direction === 'asc') {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="w-3.5 h-3.5 text-accent-blue ml-1 shrink-0"
      >
        <path
          fillRule="evenodd"
          d="M10 15a.75.75 0 01-.75-.75V7.612L7.29 9.77a.75.75 0 01-1.08-1.04l3.25-3.5a.75.75 0 011.08 0l3.25 3.5a.75.75 0 01-1.08 1.04l-1.96-2.158v6.638A.75.75 0 0110 15z"
          clipRule="evenodd"
        />
      </svg>
    );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="w-3.5 h-3.5 text-accent-blue ml-1 shrink-0"
    >
      <path
        fillRule="evenodd"
        d="M10 5a.75.75 0 01.75.75v6.638l1.96-2.158a.75.75 0 111.08 1.04l-3.25 3.5a.75.75 0 01-1.08 0l-3.25-3.5a.75.75 0 111.08-1.04l1.96 2.158V5.75A.75.75 0 0110 5z"
        clipRule="evenodd"
      />
    </svg>
  );
}

SortIcon.propTypes = {
  active: PropTypes.bool,
  direction: PropTypes.oneOf(['asc', 'desc', null]),
};

/**
 * StackedCard renders a single data row as a card for tablet viewports.
 *
 * @param {{ row: object, columns: Array<{ key: string, label: string }>, index: number }} props
 * @returns {React.ReactElement}
 */
function StackedCard({ row, columns, index }) {
  return (
    <motion.div
      className="glass-light rounded-xl px-4 py-3 space-y-2 font-urbanist"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.04 }}
    >
      {columns.map((col) => (
        <div
          key={col.key}
          className="flex items-center justify-between gap-2"
        >
          <span className="text-xs font-semibold uppercase tracking-wider text-white/50 shrink-0">
            {col.label}
          </span>
          <span className="text-sm text-white/80 text-right truncate">
            {formatCellValue(row[col.key])}
          </span>
        </div>
      ))}
    </motion.div>
  );
}

StackedCard.propTypes = {
  row: PropTypes.object.isRequired,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    }),
  ).isRequired,
  index: PropTypes.number.isRequired,
};

/**
 * CarouselCard renders a single data row as a card for mobile carousel viewports.
 *
 * @param {{ row: object, columns: Array<{ key: string, label: string }>, index: number }} props
 * @returns {React.ReactElement}
 */
function CarouselCard({ row, columns, index }) {
  return (
    <motion.div
      className="glass-light rounded-xl px-4 py-3 space-y-2 font-urbanist min-w-[260px] max-w-[300px] shrink-0 snap-start"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
    >
      {columns.map((col) => (
        <div
          key={col.key}
          className="flex items-center justify-between gap-2"
        >
          <span className="text-xs font-semibold uppercase tracking-wider text-white/50 shrink-0">
            {col.label}
          </span>
          <span className="text-sm text-white/80 text-right truncate">
            {formatCellValue(row[col.key])}
          </span>
        </div>
      ))}
    </motion.div>
  );
}

CarouselCard.propTypes = {
  row: PropTypes.object.isRequired,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    }),
  ).isRequired,
  index: PropTypes.number.isRequired,
};

/**
 * DataTable is a responsive data table component with zebra-striped rows,
 * fixed headers, and sortable columns.
 *
 * Responsive behavior:
 * - Desktop (md+): Full table with fixed header and zebra-striped rows
 * - Tablet (sm to md): Stacked card layout
 * - Mobile (<sm): Horizontal carousel of cards
 *
 * @param {{ data: Array<object>, columns: Array<{ key: string, label: string, sortable?: boolean }> }} props
 * @returns {React.ReactElement|null}
 */
export function DataTable({ data, columns }) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDirection, setSortDirection] = useState(null);
  const carouselRef = useRef(null);

  // Derive columns from data if not explicitly provided
  const resolvedColumns = useMemo(() => {
    if (Array.isArray(columns) && columns.length > 0) {
      return columns.map((col) => ({
        key: col.key,
        label: col.label || formatColumnHeader(col.key),
        sortable: col.sortable !== false,
      }));
    }

    if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object' && data[0] !== null) {
      return Object.keys(data[0]).map((key) => ({
        key,
        label: formatColumnHeader(key),
        sortable: true,
      }));
    }

    return [];
  }, [columns, data]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return [];

    if (!sortKey || !sortDirection) return [...data];

    return [...data].sort((a, b) => compareValues(a[sortKey], b[sortKey], sortDirection));
  }, [data, sortKey, sortDirection]);

  const handleSort = useCallback((key, sortable) => {
    if (!sortable) return;

    if (sortKey === key) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortKey(null);
        setSortDirection(null);
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  }, [sortKey, sortDirection]);

  if (!Array.isArray(data) || data.length === 0 || resolvedColumns.length === 0) {
    return (
      <p className="text-sm text-white/40 italic font-urbanist">No data available.</p>
    );
  }

  // Handle key-value object (single object, not array)
  if (!Array.isArray(data) && typeof data === 'object') {
    return null;
  }

  return (
    <motion.div
      className="w-full font-urbanist"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={ANIMATION.EASE_OUT}
    >
      {/* Desktop: Full table (md and above) */}
      <div className="hidden md:block w-full overflow-x-auto rounded-xl">
        <table className="w-full text-sm text-left">
          <thead className="sticky top-0 z-10">
            <tr className="border-b border-white/10 bg-white/5">
              {resolvedColumns.map((col) => (
                <th
                  key={col.key}
                  className={`px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-white/50 whitespace-nowrap ${
                    col.sortable ? 'cursor-pointer select-none hover:text-white/70 transition-colors duration-150' : ''
                  }`}
                  onClick={() => handleSort(col.key, col.sortable)}
                >
                  <div className="flex items-center">
                    <span>{col.label}</span>
                    {col.sortable && (
                      <SortIcon
                        active={sortKey === col.key}
                        direction={sortKey === col.key ? sortDirection : null}
                      />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                className={`border-b border-white/5 transition-colors duration-150 hover:bg-white/10 ${
                  rowIdx % 2 === 0 ? 'bg-white/[0.02]' : 'bg-white/[0.06]'
                }`}
              >
                {resolvedColumns.map((col) => (
                  <td
                    key={col.key}
                    className="px-3 py-2 text-sm text-white/70 whitespace-nowrap"
                  >
                    {formatCellValue(row[col.key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tablet: Stacked cards (sm to md) */}
      <div className="hidden sm:flex md:hidden flex-col gap-3">
        {sortedData.map((row, rowIdx) => (
          <StackedCard
            key={rowIdx}
            row={row}
            columns={resolvedColumns}
            index={rowIdx}
          />
        ))}
      </div>

      {/* Mobile: Horizontal carousel (<sm) */}
      <div className="sm:hidden w-full">
        <div
          ref={carouselRef}
          className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory no-scrollbar"
        >
          {sortedData.map((row, rowIdx) => (
            <CarouselCard
              key={rowIdx}
              row={row}
              columns={resolvedColumns}
              index={rowIdx}
            />
          ))}
        </div>
        {sortedData.length > 1 && (
          <div className="flex items-center justify-center gap-1.5 pt-2">
            {sortedData.map((_, idx) => (
              <div
                key={idx}
                className="w-1.5 h-1.5 rounded-full bg-white/20"
              />
            ))}
          </div>
        )}
      </div>

      {/* Row count */}
      <div className="flex items-center justify-end pt-2">
        <span className="text-xs text-white/30">
          {sortedData.length} {sortedData.length === 1 ? 'row' : 'rows'}
        </span>
      </div>
    </motion.div>
  );
}

DataTable.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string,
      sortable: PropTypes.bool,
    }),
  ),
};

export default DataTable;