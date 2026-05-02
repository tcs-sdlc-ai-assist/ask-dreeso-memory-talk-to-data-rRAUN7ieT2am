import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { submitQuery, executeAction, getCTASuggestions, getSystemHealthIndicators, clearQueryCache } from '../OrchestrationService.js';
import { STORAGE_KEYS } from '../../utils/constants.js';

// We need to mock SystemConnector and ResultAggregator
vi.mock('../SystemConnector.js', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    fetchFromMultipleSystems: vi.fn().mockResolvedValue([]),
    determineTargetSystems: vi.fn().mockReturnValue([]),
    getSourceIndicators: vi.fn().mockReturnValue([
      { system: 'sap', active: false, connected: true },
      { system: 'procore', active: false, connected: true },
      { system: 'salesforce', active: false, connected: true },
      { system: 'primavera', active: false, connected: true },
    ]),
  };
});

vi.mock('../ResultAggregator.js', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    aggregateResults: vi.fn().mockReturnValue({
      aggregationId: 'agg_test',
      success: true,
      clusterId: null,
      clusterLabel: 'General',
      query: null,
      personaId: null,
      data: {},
      sources: [],
      errors: [],
      metadata: {
        totalSystems: 0,
        successfulSystems: 0,
        failedSystems: 0,
        totalRecords: 0,
        aggregatedAt: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    }),
    buildSourceMap: vi.fn().mockReturnValue([]),
    normalizeData: vi.fn().mockImplementation((data) => data),
  };
});

// Import the mocked modules so we can configure them per test
import { fetchFromMultipleSystems, determineTargetSystems, getSourceIndicators } from '../SystemConnector.js';
import { aggregateResults, buildSourceMap } from '../ResultAggregator.js';

describe('OrchestrationService', () => {
  beforeEach(() => {
    localStorage.clear();
    clearQueryCache();
    vi.clearAllMocks();

    // Reset default mock implementations
    getSourceIndicators.mockReturnValue([
      { system: 'sap', active: false, connected: true },
      { system: 'procore', active: false, connected: true },
      { system: 'salesforce', active: false, connected: true },
      { system: 'primavera', active: false, connected: true },
    ]);

    determineTargetSystems.mockReturnValue([]);
    fetchFromMultipleSystems.mockResolvedValue([]);
    aggregateResults.mockReturnValue({
      aggregationId: 'agg_test',
      success: true,
      clusterId: null,
      clusterLabel: 'General',
      query: null,
      personaId: null,
      data: {},
      sources: [],
      errors: [],
      metadata: {
        totalSystems: 0,
        successfulSystems: 0,
        failedSystems: 0,
        totalRecords: 0,
        aggregatedAt: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    });
  });

  afterEach(() => {
    localStorage.clear();
    clearQueryCache();
    vi.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  // submitQuery — validation
  // ---------------------------------------------------------------------------

  describe('submitQuery', () => {
    it('returns an error for an empty query string', async () => {
      const result = await submitQuery('', null);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error.code).toBe('ORCH-400');
      expect(result.error.details).toContain('empty');
      expect(result.nlpResponse).toBeNull();
    });

    it('returns an error for a null query', async () => {
      const result = await submitQuery(null, null);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error.code).toBe('ORCH-400');
      expect(result.nlpResponse).toBeNull();
    });

    it('returns an error for a non-string query', async () => {
      const result = await submitQuery(123, null);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error.code).toBe('ORCH-400');
    });

    it('returns an error for a query exceeding 500 characters', async () => {
      const longQuery = 'a'.repeat(501);
      const result = await submitQuery(longQuery, null);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error.code).toBe('ORCH-400');
      expect(result.error.details).toContain('500');
    });

    it('returns an error for a whitespace-only query', async () => {
      const result = await submitQuery('   ', null);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error.code).toBe('ORCH-400');
    });

    // -------------------------------------------------------------------------
    // submitQuery — successful single-system query
    // -------------------------------------------------------------------------

    it('processes a valid budget query and returns a cost-summary response', async () => {
      const result = await submitQuery('What is the current budget status across all projects?', null);

      expect(result.success).toBe(true);
      expect(result.query).toBe('What is the current budget status across all projects?');
      expect(result.clusterId).toBe('cost-management');
      expect(result.clusterLabel).toBe('Cost Management');
      expect(result.nlpResponse).not.toBeNull();
      expect(result.nlpResponse.type).toBe('cost-summary');
      expect(result.nlpResponse.title).toBeDefined();
      expect(result.nlpResponse.confidence).toBeGreaterThan(0);
      expect(result.error).toBeNull();
      expect(result.orchestrationId).toBeDefined();
      expect(result.timestamp).toBeDefined();
    });

    it('processes a valid risk query and returns a risk-summary response', async () => {
      const result = await submitQuery('What are the top risks across all projects?', null);

      expect(result.success).toBe(true);
      expect(result.clusterId).toBe('risk-assessment');
      expect(result.clusterLabel).toBe('Risk Assessment');
      expect(result.nlpResponse).not.toBeNull();
      expect(result.nlpResponse.type).toBe('risk-summary');
    });

    it('processes a valid schedule query and returns a schedule-alert response', async () => {
      const result = await submitQuery('Which projects are behind schedule?', null);

      expect(result.success).toBe(true);
      expect(result.clusterId).toBe('schedule-tracking');
      expect(result.clusterLabel).toBe('Schedule Tracking');
      expect(result.nlpResponse).not.toBeNull();
      expect(result.nlpResponse.type).toBe('schedule-alert');
    });

    it('processes a valid pipeline query and returns a pipeline-summary response', async () => {
      const result = await submitQuery('Show me the sales pipeline summary', null);

      expect(result.success).toBe(true);
      expect(result.clusterId).toBe('stakeholder-comms');
      expect(result.clusterLabel).toBe('Stakeholder Communications');
      expect(result.nlpResponse).not.toBeNull();
      expect(result.nlpResponse.type).toBe('pipeline-summary');
    });

    it('processes a valid RFI query and returns an rfi-summary response', async () => {
      const result = await submitQuery('Show me the RFI status for all projects', null);

      expect(result.success).toBe(true);
      expect(result.clusterId).toBe('quality-assurance');
      expect(result.nlpResponse).not.toBeNull();
      expect(result.nlpResponse.type).toBe('rfi-summary');
    });

    // -------------------------------------------------------------------------
    // submitQuery — multi-system query
    // -------------------------------------------------------------------------

    it('calls determineTargetSystems when a cluster is resolved', async () => {
      determineTargetSystems.mockReturnValue([
        { systemId: 'sap', dataType: 'cost-reports' },
        { systemId: 'sap', dataType: 'invoices' },
        { systemId: 'procore', dataType: 'change-orders' },
      ]);

      fetchFromMultipleSystems.mockResolvedValue([
        { success: true, system: 'sap', dataType: 'cost-reports', data: [], source: {}, error: null, timestamp: new Date().toISOString() },
        { success: true, system: 'sap', dataType: 'invoices', data: [], source: {}, error: null, timestamp: new Date().toISOString() },
        { success: true, system: 'procore', dataType: 'change-orders', data: [], source: {}, error: null, timestamp: new Date().toISOString() },
      ]);

      getSourceIndicators.mockReturnValue([
        { system: 'sap', active: true, connected: true },
        { system: 'procore', active: true, connected: true },
        { system: 'salesforce', active: false, connected: true },
        { system: 'primavera', active: false, connected: true },
      ]);

      const result = await submitQuery('What is the current budget status?', null);

      expect(result.success).toBe(true);
      expect(result.clusterId).toBe('cost-management');
      expect(determineTargetSystems).toHaveBeenCalledWith('cost-management');
      expect(fetchFromMultipleSystems).toHaveBeenCalledTimes(1);

      const fetchArgs = fetchFromMultipleSystems.mock.calls[0][0];
      expect(fetchArgs).toHaveLength(3);
      expect(fetchArgs[0].systemId).toBe('sap');
      expect(fetchArgs[0].dataType).toBe('cost-reports');
    });

    it('calls aggregateResults with system fetch results', async () => {
      determineTargetSystems.mockReturnValue([
        { systemId: 'primavera', dataType: 'schedules' },
      ]);

      const mockSystemResults = [
        { success: true, system: 'primavera', dataType: 'schedules', data: [{ id: 'SCH-001' }], source: {}, error: null, timestamp: new Date().toISOString() },
      ];

      fetchFromMultipleSystems.mockResolvedValue(mockSystemResults);

      await submitQuery('Which projects are behind schedule?', null);

      expect(aggregateResults).toHaveBeenCalledTimes(1);
      const aggregateArgs = aggregateResults.mock.calls[0];
      expect(aggregateArgs[0]).toEqual(mockSystemResults);
      expect(aggregateArgs[1]).toEqual(expect.objectContaining({
        clusterId: 'schedule-tracking',
        query: 'Which projects are behind schedule?',
      }));
    });

    // -------------------------------------------------------------------------
    // submitQuery — source indicators
    // -------------------------------------------------------------------------

    it('includes source indicators in the response', async () => {
      getSourceIndicators.mockReturnValue([
        { system: 'sap', active: true, connected: true },
        { system: 'procore', active: false, connected: true },
        { system: 'salesforce', active: false, connected: true },
        { system: 'primavera', active: false, connected: true },
      ]);

      const result = await submitQuery('What is the budget status?', null);

      expect(result.sourceIndicators).toBeDefined();
      expect(Array.isArray(result.sourceIndicators)).toBe(true);
      expect(result.sourceIndicators.length).toBeGreaterThan(0);
      expect(result.sourceIndicators[0]).toHaveProperty('system');
      expect(result.sourceIndicators[0]).toHaveProperty('active');
      expect(result.sourceIndicators[0]).toHaveProperty('connected');
    });

    // -------------------------------------------------------------------------
    // submitQuery — CTA suggestions
    // -------------------------------------------------------------------------

    it('includes CTA suggestions in the response', async () => {
      const result = await submitQuery('What is the budget status?', null);

      expect(result.ctaSuggestions).toBeDefined();
      expect(Array.isArray(result.ctaSuggestions)).toBe(true);
      expect(result.ctaSuggestions.length).toBeGreaterThan(0);
      expect(result.ctaSuggestions.length).toBeLessThanOrEqual(6);
    });

    it('includes follow-up suggestions from the NLP response', async () => {
      const result = await submitQuery('What are the top risks?', null);

      expect(result.ctaSuggestions).toBeDefined();
      expect(result.ctaSuggestions.length).toBeGreaterThan(0);
      // The risk-summary response has suggestedFollowUps
      expect(result.ctaSuggestions.some((s) => typeof s === 'string' && s.length > 0)).toBe(true);
    });

    // -------------------------------------------------------------------------
    // submitQuery — no-match query
    // -------------------------------------------------------------------------

    it('returns a no-match response for an unrecognized query', async () => {
      const result = await submitQuery('Tell me about the weather today', null);

      expect(result.success).toBe(true);
      expect(result.nlpResponse).not.toBeNull();
      expect(result.nlpResponse.type).toBe('no-match');
      expect(result.nlpResponse.data.suggestedQueries).toBeDefined();
      expect(Array.isArray(result.nlpResponse.data.suggestedQueries)).toBe(true);
    });

    // -------------------------------------------------------------------------
    // submitQuery — session context
    // -------------------------------------------------------------------------

    it('passes session context through to the NLP processor', async () => {
      const session = {
        userId: 'user_123',
        role: 'admin',
        personaId: 'lukas-muller',
      };

      const result = await submitQuery('What is the budget status?', session);

      expect(result.success).toBe(true);
      expect(result.nlpResponse).not.toBeNull();
      // The NLP response should include the persona context
      expect(result.nlpResponse.persona).toBe('lukas-muller');
    });

    // -------------------------------------------------------------------------
    // submitQuery — caching
    // -------------------------------------------------------------------------

    it('returns cached results for identical queries', async () => {
      const query = 'What is the budget status?';

      const result1 = await submitQuery(query, null);
      const result2 = await submitQuery(query, null);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result1.clusterId).toBe(result2.clusterId);
      expect(result1.nlpResponse.type).toBe(result2.nlpResponse.type);
      // The second call should have a different orchestrationId but same data
      expect(result2.orchestrationId).toBeDefined();
    });

    it('clears cache when clearQueryCache is called', async () => {
      const query = 'What is the budget status?';

      await submitQuery(query, null);
      clearQueryCache();

      // After clearing, the query should be processed again
      const result = await submitQuery(query, null);
      expect(result.success).toBe(true);
    });

    // -------------------------------------------------------------------------
    // submitQuery — rate limiting
    // -------------------------------------------------------------------------

    it('enforces rate limiting after 10 queries per minute for the same user', async () => {
      const session = { userId: 'rate_limit_test_user', personaId: null };

      // Clear cache between each call to avoid cache hits
      for (let i = 0; i < 10; i++) {
        clearQueryCache();
        const result = await submitQuery(`budget query number ${i}`, session);
        expect(result.success).toBe(true);
      }

      clearQueryCache();
      const rateLimitedResult = await submitQuery('one more budget query', session);

      expect(rateLimitedResult.success).toBe(false);
      expect(rateLimitedResult.error).toBeDefined();
      expect(rateLimitedResult.error.code).toBe('ORCH-429');
      expect(rateLimitedResult.error.details).toContain('Rate limit');
    });

    // -------------------------------------------------------------------------
    // submitQuery — audit logging
    // -------------------------------------------------------------------------

    it('logs the query to the audit log', async () => {
      const session = { userId: 'audit_test_user', personaId: 'lukas-muller' };

      await submitQuery('What is the budget status?', session);

      const auditLog = JSON.parse(localStorage.getItem(STORAGE_KEYS.AUDIT_LOG) || '[]');
      const queryEntries = auditLog.filter((entry) => entry.action === 'query');

      expect(queryEntries.length).toBeGreaterThanOrEqual(1);

      const lastEntry = queryEntries[queryEntries.length - 1];
      expect(lastEntry.userId).toBe('audit_test_user');
      expect(lastEntry.persona).toBe('lukas-muller');
      expect(lastEntry.details.query).toBe('What is the budget status?');
      expect(lastEntry.details.orchestrationId).toBeDefined();
    });

    // -------------------------------------------------------------------------
    // submitQuery — response structure
    // -------------------------------------------------------------------------

    it('returns a well-structured response object', async () => {
      const result = await submitQuery('What is the budget status?', null);

      expect(result).toHaveProperty('orchestrationId');
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('query');
      expect(result).toHaveProperty('clusterId');
      expect(result).toHaveProperty('clusterLabel');
      expect(result).toHaveProperty('nlpResponse');
      expect(result).toHaveProperty('aggregatedData');
      expect(result).toHaveProperty('sourceIndicators');
      expect(result).toHaveProperty('ctaSuggestions');
      expect(result).toHaveProperty('error');
      expect(result).toHaveProperty('timestamp');

      expect(typeof result.orchestrationId).toBe('string');
      expect(typeof result.success).toBe('boolean');
      expect(typeof result.query).toBe('string');
      expect(typeof result.timestamp).toBe('string');
      expect(Array.isArray(result.sourceIndicators)).toBe(true);
      expect(Array.isArray(result.ctaSuggestions)).toBe(true);
    });

    it('trims the query string before processing', async () => {
      const result = await submitQuery('  What is the budget status?  ', null);

      expect(result.success).toBe(true);
      expect(result.query).toBe('What is the budget status?');
    });
  });

  // ---------------------------------------------------------------------------
  // executeAction
  // ---------------------------------------------------------------------------

  describe('executeAction', () => {
    it('executes a valid action and returns a success result', async () => {
      const action = {
        actionId: 'approve-change-order',
        params: { changeOrderId: 'CO-002' },
      };

      const result = await executeAction(action, null);

      expect(result.success).toBe(true);
      expect(result.action).toBe('approve-change-order');
      expect(result.result).not.toBeNull();
      expect(result.error).toBeNull();
      expect(result.orchestrationId).toBeDefined();
      expect(result.timestamp).toBeDefined();
    });

    it('returns an error for a null action', async () => {
      const result = await executeAction(null, null);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error.code).toBe('ORCH-400');
    });

    it('returns an error for an action without actionId', async () => {
      const result = await executeAction({}, null);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error.code).toBe('ORCH-400');
      expect(result.error.details).toContain('Action ID');
    });

    it('returns an error for an action with empty actionId', async () => {
      const result = await executeAction({ actionId: '' }, null);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error.code).toBe('ORCH-400');
    });

    it('returns an error for an unknown action ID', async () => {
      const action = {
        actionId: 'nonexistent-action',
        params: {},
      };

      const result = await executeAction(action, null);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('executes process-payment action successfully', async () => {
      const action = {
        actionId: 'process-payment',
        params: { invoiceId: 'INV-2024-0453' },
      };

      const result = await executeAction(action, null);

      expect(result.success).toBe(true);
      expect(result.action).toBe('process-payment');
      expect(result.result).not.toBeNull();
    });

    it('executes escalate-rfi action successfully', async () => {
      const action = {
        actionId: 'escalate-rfi',
        params: { rfiId: 'RFI-001' },
      };

      const result = await executeAction(action, null);

      expect(result.success).toBe(true);
      expect(result.action).toBe('escalate-rfi');
      expect(result.result).not.toBeNull();
    });

    it('executes generate-report action successfully', async () => {
      const action = {
        actionId: 'generate-report',
        params: {},
      };

      const result = await executeAction(action, null);

      expect(result.success).toBe(true);
      expect(result.action).toBe('generate-report');
      expect(result.result).not.toBeNull();
    });

    it('logs the action execution to the audit log', async () => {
      const session = { userId: 'action_test_user', personaId: 'elena-rossi' };
      const action = {
        actionId: 'approve-change-order',
        params: { changeOrderId: 'CO-002' },
      };

      await executeAction(action, session);

      const auditLog = JSON.parse(localStorage.getItem(STORAGE_KEYS.AUDIT_LOG) || '[]');
      const actionEntries = auditLog.filter((entry) => entry.action === 'action_execution');

      expect(actionEntries.length).toBeGreaterThanOrEqual(1);

      const lastEntry = actionEntries[actionEntries.length - 1];
      expect(lastEntry.userId).toBe('action_test_user');
      expect(lastEntry.persona).toBe('elena-rossi');
      expect(lastEntry.details.actionId).toBe('approve-change-order');
      expect(lastEntry.details.orchestrationId).toBeDefined();
    });

    it('returns a well-structured action result object', async () => {
      const action = {
        actionId: 'generate-report',
        params: {},
      };

      const result = await executeAction(action, null);

      expect(result).toHaveProperty('orchestrationId');
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('action');
      expect(result).toHaveProperty('result');
      expect(result).toHaveProperty('error');
      expect(result).toHaveProperty('timestamp');

      expect(typeof result.orchestrationId).toBe('string');
      expect(typeof result.success).toBe('boolean');
      expect(typeof result.action).toBe('string');
      expect(typeof result.timestamp).toBe('string');
    });
  });

  // ---------------------------------------------------------------------------
  // getCTASuggestions
  // ---------------------------------------------------------------------------

  describe('getCTASuggestions', () => {
    it('returns suggestions for a given persona ID', () => {
      const suggestions = getCTASuggestions('lukas-muller', null);

      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.every((s) => typeof s === 'string')).toBe(true);
    });

    it('returns suggestions for a given cluster ID', () => {
      const suggestions = getCTASuggestions(null, 'cost-management');

      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some((s) => s.toLowerCase().includes('budget') || s.toLowerCase().includes('cost'))).toBe(true);
    });

    it('returns suggestions for both persona and cluster', () => {
      const suggestions = getCTASuggestions('elena-rossi', 'cost-management');

      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBeGreaterThan(0);
    });

    it('returns default suggestions when no persona or cluster is provided', () => {
      const suggestions = getCTASuggestions(null, null);

      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBeGreaterThan(0);
    });

    it('returns deduplicated suggestions', () => {
      const suggestions = getCTASuggestions('lukas-muller', 'cost-management');

      const uniqueSuggestions = [...new Set(suggestions)];
      expect(suggestions.length).toBe(uniqueSuggestions.length);
    });
  });

  // ---------------------------------------------------------------------------
  // getSystemHealthIndicators
  // ---------------------------------------------------------------------------

  describe('getSystemHealthIndicators', () => {
    it('returns an array of system health indicators', () => {
      const indicators = getSystemHealthIndicators();

      expect(Array.isArray(indicators)).toBe(true);
      expect(indicators.length).toBeGreaterThan(0);
    });

    it('returns indicators with the expected shape', () => {
      const indicators = getSystemHealthIndicators();

      for (const indicator of indicators) {
        expect(indicator).toHaveProperty('system');
        expect(indicator).toHaveProperty('active');
        expect(indicator).toHaveProperty('connected');
        expect(typeof indicator.system).toBe('string');
        expect(typeof indicator.active).toBe('boolean');
        expect(typeof indicator.connected).toBe('boolean');
      }
    });

    it('includes all four enterprise systems', () => {
      const indicators = getSystemHealthIndicators();
      const systems = indicators.map((i) => i.system);

      expect(systems).toContain('sap');
      expect(systems).toContain('procore');
      expect(systems).toContain('salesforce');
      expect(systems).toContain('primavera');
    });
  });

  // ---------------------------------------------------------------------------
  // Source map generation (via submitQuery)
  // ---------------------------------------------------------------------------

  describe('source map generation', () => {
    it('generates source indicators with active systems marked correctly', async () => {
      determineTargetSystems.mockReturnValue([
        { systemId: 'sap', dataType: 'cost-reports' },
      ]);

      fetchFromMultipleSystems.mockResolvedValue([
        { success: true, system: 'sap', dataType: 'cost-reports', data: [], source: {}, error: null, timestamp: new Date().toISOString() },
      ]);

      getSourceIndicators.mockReturnValue([
        { system: 'sap', active: true, connected: true },
        { system: 'procore', active: false, connected: true },
        { system: 'salesforce', active: false, connected: true },
        { system: 'primavera', active: false, connected: true },
      ]);

      const result = await submitQuery('What is the budget status?', null);

      expect(result.sourceIndicators).toBeDefined();
      const sapIndicator = result.sourceIndicators.find((i) => i.system === 'sap');
      expect(sapIndicator).toBeDefined();
      expect(sapIndicator.active).toBe(true);
      expect(sapIndicator.connected).toBe(true);
    });

    it('passes active systems to getSourceIndicators', async () => {
      determineTargetSystems.mockReturnValue([
        { systemId: 'sap', dataType: 'cost-reports' },
        { systemId: 'procore', dataType: 'change-orders' },
      ]);

      fetchFromMultipleSystems.mockResolvedValue([
        { success: true, system: 'sap', dataType: 'cost-reports', data: [], source: {}, error: null, timestamp: new Date().toISOString() },
        { success: false, system: 'procore', dataType: 'change-orders', data: null, source: {}, error: 'Connection failed', timestamp: new Date().toISOString() },
      ]);

      await submitQuery('What is the budget status?', null);

      expect(getSourceIndicators).toHaveBeenCalled();
      const lastCall = getSourceIndicators.mock.calls[getSourceIndicators.mock.calls.length - 1];
      const activeSystems = lastCall[0];
      expect(activeSystems).toContain('sap');
      expect(activeSystems).not.toContain('procore');
    });
  });

  // ---------------------------------------------------------------------------
  // Result aggregation (via submitQuery)
  // ---------------------------------------------------------------------------

  describe('result aggregation', () => {
    it('passes the correct options to aggregateResults', async () => {
      const session = { userId: 'user_agg', personaId: 'sophie-dubois' };

      determineTargetSystems.mockReturnValue([
        { systemId: 'primavera', dataType: 'schedules' },
      ]);

      fetchFromMultipleSystems.mockResolvedValue([
        { success: true, system: 'primavera', dataType: 'schedules', data: [], source: {}, error: null, timestamp: new Date().toISOString() },
      ]);

      await submitQuery('Which projects are delayed?', session);

      expect(aggregateResults).toHaveBeenCalledTimes(1);
      const options = aggregateResults.mock.calls[0][1];
      expect(options.clusterId).toBe('schedule-tracking');
      expect(options.query).toBe('Which projects are delayed?');
      expect(options.personaId).toBe('sophie-dubois');
    });

    it('includes aggregated data in the response', async () => {
      const mockAggregated = {
        aggregationId: 'agg_mock',
        success: true,
        clusterId: 'cost-management',
        clusterLabel: 'Cost Management',
        query: 'budget',
        personaId: null,
        data: { sap_cost_reports: { system: 'sap', dataType: 'cost-reports', data: [{ id: 'test' }] } },
        sources: [],
        errors: [],
        metadata: {
          totalSystems: 1,
          successfulSystems: 1,
          failedSystems: 0,
          totalRecords: 1,
          aggregatedAt: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      };

      aggregateResults.mockReturnValue(mockAggregated);

      const result = await submitQuery('What is the budget status?', null);

      expect(result.aggregatedData).toBeDefined();
      expect(result.aggregatedData).toEqual(mockAggregated);
    });

    it('does not call fetchFromMultipleSystems when no target systems are determined', async () => {
      determineTargetSystems.mockReturnValue([]);

      await submitQuery('Tell me something random about construction', null);

      expect(fetchFromMultipleSystems).not.toHaveBeenCalled();
    });
  });
});