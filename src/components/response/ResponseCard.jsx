import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { ANIMATION, COLORS } from '../../utils/constants.js';

/**
 * Renders a tabular data display for structured analytical output.
 *
 * @param {{ data: object }} props
 * @returns {React.ReactElement}
 */
function DataTable({ data }) {
  if (!data) return null;

  // Handle array of objects
  if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object') {
    const columns = Object.keys(data[0]);

    return (
      <div className="w-full overflow-x-auto rounded-xl">
        <table className="w-full text-sm text-left text-white/80">
          <thead>
            <tr className="border-b border-white/10">
              {columns.map((col) => (
                <th
                  key={col}
                  className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-white/50"
                >
                  {col.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                className="border-b border-white/5 hover:bg-white/5 transition-colors duration-150"
              >
                {columns.map((col) => (
                  <td key={col} className="px-3 py-2 text-sm text-white/70">
                    {typeof row[col] === 'number'
                      ? row[col].toLocaleString()
                      : String(row[col] ?? '—')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Handle key-value object
  if (typeof data === 'object' && !Array.isArray(data)) {
    const entries = Object.entries(data).filter(
      ([, value]) => typeof value !== 'object' || value === null,
    );

    if (entries.length === 0) return null;

    return (
      <div className="w-full space-y-1">
        {entries.map(([key, value]) => (
          <div
            key={key}
            className="flex items-center justify-between px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors duration-150"
          >
            <span className="text-sm text-white/50">
              {key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
            </span>
            <span className="text-sm font-medium text-white/80">
              {typeof value === 'number' ? value.toLocaleString() : String(value ?? '—')}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return null;
}

DataTable.propTypes = {
  data: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
};

/**
 * Severity badge color mapping.
 * @param {string} severity
 * @returns {string}
 */
function getSeverityColor(severity) {
  switch (severity) {
    case 'critical':
      return COLORS.CRITICAL;
    case 'high':
      return COLORS.WARNING;
    case 'medium':
      return COLORS.ACCENT_BLUE;
    case 'low':
      return COLORS.SUCCESS;
    default:
      return COLORS.ACCENT_BLUE_LIGHT;
  }
}

/**
 * Renders risk signal indicators with severity badges.
 *
 * @param {{ risks: Array<object> }} props
 * @returns {React.ReactElement}
 */
function RiskSignal({ risks }) {
  if (!Array.isArray(risks) || risks.length === 0) {
    return (
      <p className="text-sm text-white/40 italic">No active risk signals.</p>
    );
  }

  return (
    <div className="space-y-3">
      {risks.map((risk, idx) => {
        const color = getSeverityColor(risk.severity);
        return (
          <div
            key={risk.id || idx}
            className="glass-light rounded-xl px-4 py-3 space-y-1.5"
          >
            <div className="flex items-center gap-2">
              <span
                className="inline-flex items-center text-xs font-bold uppercase px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: `${color}20`,
                  color: color,
                }}
              >
                {risk.severity || 'unknown'}
              </span>
              <span
                className="inline-flex items-center text-xs font-medium px-1.5 py-0.5 rounded-full bg-white/5 text-white/50"
              >
                {risk.category || 'general'}
              </span>
            </div>
            <h4 className="text-sm font-semibold text-white">{risk.title}</h4>
            {risk.description && (
              <p className="text-xs text-white/50 leading-relaxed">{risk.description}</p>
            )}
            {risk.impact && (
              <p className="text-xs text-white/40">
                <span className="font-medium text-white/60">Impact:</span> {risk.impact}
              </p>
            )}
            {Array.isArray(risk.suggestedActions) && risk.suggestedActions.length > 0 && (
              <div className="pt-1">
                <p className="text-xs font-medium text-white/50 mb-1">Suggested Actions:</p>
                <ul className="space-y-0.5">
                  {risk.suggestedActions.map((action, actionIdx) => (
                    <li key={actionIdx} className="text-xs text-white/40 flex items-start gap-1.5">
                      <span className="text-accent-blue mt-0.5">•</span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

RiskSignal.propTypes = {
  risks: PropTypes.array,
};

/**
 * Renders forecast/projection data with trend indicators.
 *
 * @param {{ forecast: object }} props
 * @returns {React.ReactElement}
 */
function ForecastModel({ forecast }) {
  if (!forecast || typeof forecast !== 'object') {
    return (
      <p className="text-sm text-white/40 italic">No forecast data available.</p>
    );
  }

  // Handle projects keyed by project ID
  const entries = Object.entries(forecast);

  return (
    <div className="space-y-3">
      {entries.map(([key, value]) => {
        if (!value || typeof value !== 'object') return null;

        return (
          <div key={key} className="glass-light rounded-xl px-4 py-3 space-y-2">
            <h4 className="text-sm font-semibold text-white">{key}</h4>
            {value.predictedCompletion && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/50">Predicted Completion</span>
                <span className="text-xs font-medium text-white/80">{value.predictedCompletion}</span>
              </div>
            )}
            {typeof value.confidenceLevel === 'number' && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/50">Confidence</span>
                <span
                  className="text-xs font-bold"
                  style={{
                    color: value.confidenceLevel >= 75
                      ? COLORS.SUCCESS
                      : value.confidenceLevel >= 50
                        ? COLORS.WARNING
                        : COLORS.CRITICAL,
                  }}
                >
                  {value.confidenceLevel}%
                </span>
              </div>
            )}
            {Array.isArray(value.spiTrend) && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/50">SPI Trend</span>
                <div className="flex items-center gap-1">
                  {value.spiTrend.map((spi, i) => (
                    <span
                      key={i}
                      className="text-xs font-mono"
                      style={{
                        color: spi >= 1.0 ? COLORS.SUCCESS : spi >= 0.9 ? COLORS.WARNING : COLORS.CRITICAL,
                      }}
                    >
                      {spi.toFixed(2)}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {Array.isArray(value.cpiTrend) && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/50">CPI Trend</span>
                <div className="flex items-center gap-1">
                  {value.cpiTrend.map((cpi, i) => (
                    <span
                      key={i}
                      className="text-xs font-mono"
                      style={{
                        color: cpi >= 1.0 ? COLORS.SUCCESS : cpi >= 0.95 ? COLORS.WARNING : COLORS.CRITICAL,
                      }}
                    >
                      {cpi.toFixed(2)}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {Array.isArray(value.months) && Array.isArray(value.planned) && (
              <div className="pt-1">
                <p className="text-xs font-medium text-white/50 mb-1">Monthly Forecast</p>
                <div className="overflow-x-auto">
                  <div className="flex gap-2">
                    {value.months.map((month, i) => (
                      <div key={i} className="flex flex-col items-center min-w-[60px]">
                        <span className="text-[10px] text-white/30">{month}</span>
                        <span className="text-[10px] text-white/50">
                          {value.planned[i] != null ? (value.planned[i] / 1000000).toFixed(1) + 'M' : '—'}
                        </span>
                        {Array.isArray(value.forecast) && (
                          <span
                            className="text-[10px] font-medium"
                            style={{
                              color: COLORS.ACCENT_BLUE,
                            }}
                          >
                            {value.forecast[i] != null ? (value.forecast[i] / 1000000).toFixed(1) + 'M' : '—'}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

ForecastModel.propTypes = {
  forecast: PropTypes.object,
};

/**
 * Renders source transparency indicators showing which systems contributed data.
 *
 * @param {{ sources: Array<string>, sourceIndicators: Array<object> }} props
 * @returns {React.ReactElement}
 */
function SourceTransparencyPanel({ sources, sourceIndicators }) {
  const indicators = useMemo(() => {
    if (Array.isArray(sourceIndicators) && sourceIndicators.length > 0) {
      return sourceIndicators;
    }

    if (Array.isArray(sources) && sources.length > 0) {
      return sources.map((s) => ({
        system: s,
        active: true,
        connected: true,
      }));
    }

    return [];
  }, [sources, sourceIndicators]);

  if (indicators.length === 0) return null;

  return (
    <div className="flex items-center gap-3 pt-3 border-t border-white/5">
      <span className="text-xs text-white/30 shrink-0">Sources:</span>
      <div className="flex flex-wrap items-center gap-2">
        {indicators.map((indicator) => (
          <div
            key={indicator.system}
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5"
          >
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{
                backgroundColor: indicator.active && indicator.connected
                  ? COLORS.SUCCESS
                  : indicator.connected
                    ? COLORS.WARNING
                    : COLORS.CRITICAL,
              }}
            />
            <span className="text-xs text-white/50 capitalize">{indicator.system}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

SourceTransparencyPanel.propTypes = {
  sources: PropTypes.arrayOf(PropTypes.string),
  sourceIndicators: PropTypes.arrayOf(
    PropTypes.shape({
      system: PropTypes.string,
      active: PropTypes.bool,
      connected: PropTypes.bool,
    }),
  ),
};

/**
 * Renders a row of CTA (call-to-action) suggestion bubbles.
 *
 * @param {{ suggestions: Array<string>, onCTAClick: function }} props
 * @returns {React.ReactElement}
 */
function CTABubbleRow({ suggestions, onCTAClick }) {
  if (!Array.isArray(suggestions) || suggestions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 pt-3">
      {suggestions.map((suggestion, idx) => (
        <motion.button
          key={idx}
          type="button"
          onClick={() => onCTAClick && onCTAClick(suggestion)}
          className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium text-accent-blue bg-accent-blue/10 border border-accent-blue/20 hover:bg-accent-blue/20 hover:border-accent-blue/30 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent-blue/30"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          {suggestion}
        </motion.button>
      ))}
    </div>
  );
}

CTABubbleRow.propTypes = {
  suggestions: PropTypes.arrayOf(PropTypes.string),
  onCTAClick: PropTypes.func,
};

/**
 * Determines the response type and renders the appropriate content component.
 *
 * @param {{ response: object }} props
 * @returns {React.ReactElement|null}
 */
function ResponseContent({ response }) {
  if (!response || typeof response !== 'object') return null;

  const { type, data } = response;

  if (!data) return null;

  switch (type) {
    case 'risk-summary':
      return <RiskSignal risks={data.risks || []} />;

    case 'schedule-alert': {
      const tableData = [];
      if (Array.isArray(data.delayedProjects)) {
        data.delayedProjects.forEach((p) => {
          tableData.push({
            project: p.name,
            delay: `${p.delayDays} days`,
            spi: p.spi,
            forecast: p.forecastEnd,
            status: 'delayed',
          });
        });
      }
      if (Array.isArray(data.onTrackProjects)) {
        data.onTrackProjects.forEach((p) => {
          tableData.push({
            project: p.name,
            delay: '0 days',
            spi: p.spi,
            forecast: p.forecastEnd,
            status: 'on-track',
          });
        });
      }
      return <DataTable data={tableData.length > 0 ? tableData : data} />;
    }

    case 'cost-summary': {
      if (Array.isArray(data.projects)) {
        const tableData = data.projects.map((p) => ({
          project: p.name,
          budget: p.budget,
          actual: p.actual,
          forecast: p.forecast,
          variance: p.variance,
          status: p.status,
        }));
        return <DataTable data={tableData} />;
      }
      return <DataTable data={data} />;
    }

    case 'pipeline-summary': {
      const summaryData = {
        totalValue: data.totalValue,
        totalOpportunities: data.totalOpportunities,
        weightedValue: data.weightedValue,
      };
      return <DataTable data={summaryData} />;
    }

    case 'rfi-summary': {
      if (Array.isArray(data.rfis)) {
        const tableData = data.rfis.map((rfi) => ({
          id: rfi.id,
          subject: rfi.subject,
          status: rfi.status,
          priority: rfi.priority,
          project: rfi.projectId,
        }));
        return <DataTable data={tableData} />;
      }
      return <DataTable data={data} />;
    }

    case 'invoice-summary': {
      if (Array.isArray(data.invoices)) {
        const tableData = data.invoices.map((inv) => ({
          id: inv.id,
          vendor: inv.vendor,
          amount: inv.amount,
          status: inv.status,
          dueDate: inv.dueDate,
        }));
        return <DataTable data={tableData} />;
      }
      return <DataTable data={data} />;
    }

    case 'resource-summary': {
      if (Array.isArray(data.resources)) {
        const tableData = data.resources.map((r) => ({
          category: r.category,
          type: r.resourceType,
          planned: r.planned,
          actual: r.actual,
          utilization: `${r.utilization}%`,
        }));
        return <DataTable data={tableData} />;
      }
      return <DataTable data={data} />;
    }

    case 'change-order-summary': {
      if (Array.isArray(data.changeOrders)) {
        const tableData = data.changeOrders.map((co) => ({
          id: co.id,
          title: co.title,
          amount: co.amount,
          status: co.status,
          reason: co.reason,
        }));
        return <DataTable data={tableData} />;
      }
      return <DataTable data={data} />;
    }

    case 'client-summary': {
      if (Array.isArray(data.clients)) {
        const tableData = data.clients.map((c) => ({
          name: c.name,
          industry: c.industry,
          relationship: c.relationship,
          activeProjects: c.activeProjects,
          contact: c.primaryContact,
        }));
        return <DataTable data={tableData} />;
      }
      return <DataTable data={data} />;
    }

    case 'milestone-summary': {
      if (Array.isArray(data.milestones)) {
        const tableData = data.milestones.map((m) => ({
          project: m.projectName,
          milestone: m.name,
          planned: m.plannedDate,
          status: m.status,
        }));
        return <DataTable data={tableData} />;
      }
      return <DataTable data={data} />;
    }

    case 'general': {
      return (
        <div className="space-y-3">
          {data.message && (
            <p className="text-sm text-white/70 leading-relaxed">{data.message}</p>
          )}
          {Array.isArray(data.relatedProjects) && data.relatedProjects.length > 0 && (
            <DataTable data={data.relatedProjects} />
          )}
        </div>
      );
    }

    case 'no-match': {
      return (
        <div className="space-y-3">
          {data.message && (
            <p className="text-sm text-white/60 leading-relaxed">{data.message}</p>
          )}
          {Array.isArray(data.suggestedQueries) && data.suggestedQueries.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-white/40">Try asking:</p>
              <ul className="space-y-1">
                {data.suggestedQueries.map((q, i) => (
                  <li key={i} className="text-xs text-accent-blue/80 flex items-start gap-1.5">
                    <span className="text-accent-blue mt-0.5">→</span>
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
    }

    default: {
      // Attempt to render forecast-like data
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        const keys = Object.keys(data);
        const looksLikeForecast = keys.some(
          (k) => data[k] && typeof data[k] === 'object' && (data[k].spiTrend || data[k].months || data[k].predictedCompletion),
        );
        if (looksLikeForecast) {
          return <ForecastModel forecast={data} />;
        }
      }

      if (Array.isArray(data)) {
        return <DataTable data={data} />;
      }

      return <DataTable data={data} />;
    }
  }
}

ResponseContent.propTypes = {
  response: PropTypes.object,
};

/**
 * ResponseCard is a glassmorphism card that displays structured analytical output.
 *
 * Renders different output types based on the response type:
 * - DataTable for tabular data (cost summaries, invoices, RFIs, etc.)
 * - RiskSignal for risk indicators
 * - ForecastModel for projections
 *
 * Includes a SourceTransparencyPanel at the bottom showing which enterprise
 * systems contributed data, and a CTABubble row for follow-up suggestions.
 *
 * Entry animation: fade-in + slide-up, 300ms via Framer Motion.
 *
 * @param {{ response: object, sourceIndicators: Array<object>, ctaSuggestions: Array<string>, onCTAClick: function }} props
 * @returns {React.ReactElement|null}
 */
export function ResponseCard({ response, sourceIndicators, ctaSuggestions, onCTAClick }) {
  if (!response || typeof response !== 'object') {
    return null;
  }

  const {
    title,
    confidence,
    sources,
    suggestedFollowUps,
  } = response;

  const displaySuggestions = useMemo(() => {
    if (Array.isArray(ctaSuggestions) && ctaSuggestions.length > 0) {
      return ctaSuggestions;
    }
    if (Array.isArray(suggestedFollowUps) && suggestedFollowUps.length > 0) {
      return suggestedFollowUps;
    }
    return [];
  }, [ctaSuggestions, suggestedFollowUps]);

  return (
    <motion.div
      className="glass-card w-full font-urbanist"
      style={{ padding: '24px' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {/* Header */}
      {(title || typeof confidence === 'number') && (
        <div className="flex items-start justify-between gap-3 mb-4">
          {title && (
            <h3 className="text-base font-bold text-white sm:text-lg">{title}</h3>
          )}
          {typeof confidence === 'number' && (
            <span
              className="inline-flex items-center shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: confidence >= 0.85
                  ? `${COLORS.SUCCESS}20`
                  : confidence >= 0.7
                    ? `${COLORS.WARNING}20`
                    : `${COLORS.CRITICAL}20`,
                color: confidence >= 0.85
                  ? COLORS.SUCCESS
                  : confidence >= 0.7
                    ? COLORS.WARNING
                    : COLORS.CRITICAL,
              }}
            >
              {Math.round(confidence * 100)}% confidence
            </span>
          )}
        </div>
      )}

      {/* Response content */}
      <div className="mb-4">
        <ResponseContent response={response} />
      </div>

      {/* CTA Bubble Row */}
      <CTABubbleRow suggestions={displaySuggestions} onCTAClick={onCTAClick} />

      {/* Source Transparency Panel */}
      <SourceTransparencyPanel
        sources={sources}
        sourceIndicators={sourceIndicators}
      />
    </motion.div>
  );
}

ResponseCard.propTypes = {
  response: PropTypes.shape({
    type: PropTypes.string,
    title: PropTypes.string,
    confidence: PropTypes.number,
    data: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
    sources: PropTypes.arrayOf(PropTypes.string),
    suggestedFollowUps: PropTypes.arrayOf(PropTypes.string),
  }),
  sourceIndicators: PropTypes.arrayOf(
    PropTypes.shape({
      system: PropTypes.string,
      active: PropTypes.bool,
      connected: PropTypes.bool,
    }),
  ),
  ctaSuggestions: PropTypes.arrayOf(PropTypes.string),
  onCTAClick: PropTypes.func,
};

export default ResponseCard;