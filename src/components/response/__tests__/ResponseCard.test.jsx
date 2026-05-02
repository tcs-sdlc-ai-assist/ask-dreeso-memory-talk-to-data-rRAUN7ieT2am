import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from '../../../context/AuthContext.jsx';
import { QueryProvider } from '../../../context/QueryContext.jsx';
import { ResponseCard } from '../ResponseCard.jsx';
import { quickLogin } from '../../../services/PersonaService.js';
import { COLORS } from '../../../utils/constants.js';

/**
 * Helper to render ResponseCard within the required providers.
 * @param {object} [props={}] - Props to pass to ResponseCard.
 * @returns {object} The render result plus a user-event instance.
 */
function renderResponseCard(props = {}) {
  const user = userEvent.setup();

  const result = render(
    <AuthProvider>
      <QueryProvider>
        <ResponseCard {...props} />
      </QueryProvider>
    </AuthProvider>,
  );

  return { ...result, user };
}

describe('ResponseCard', () => {
  beforeEach(() => {
    localStorage.clear();
    quickLogin('lukas-muller');
  });

  afterEach(() => {
    localStorage.clear();
  });

  // ---------------------------------------------------------------------------
  // Rendering — null / empty
  // ---------------------------------------------------------------------------

  describe('rendering with no data', () => {
    it('returns null when response is null', () => {
      const { container } = renderResponseCard({ response: null });

      expect(container.innerHTML).toBe('');
    });

    it('returns null when response is undefined', () => {
      const { container } = renderResponseCard({ response: undefined });

      expect(container.innerHTML).toBe('');
    });

    it('returns null when response is not an object', () => {
      const { container } = renderResponseCard({ response: 'not-an-object' });

      expect(container.innerHTML).toBe('');
    });
  });

  // ---------------------------------------------------------------------------
  // Rendering — title and confidence
  // ---------------------------------------------------------------------------

  describe('title and confidence', () => {
    it('renders the response title', () => {
      renderResponseCard({
        response: {
          type: 'general',
          title: 'Portfolio Overview',
          data: { message: 'Test message' },
        },
      });

      expect(screen.getByText('Portfolio Overview')).toBeInTheDocument();
    });

    it('renders the confidence badge when confidence is provided', () => {
      renderResponseCard({
        response: {
          type: 'general',
          title: 'Test',
          confidence: 0.92,
          data: { message: 'Test message' },
        },
      });

      expect(screen.getByText('92% confidence')).toBeInTheDocument();
    });

    it('does not render confidence badge when confidence is not provided', () => {
      renderResponseCard({
        response: {
          type: 'general',
          title: 'Test',
          data: { message: 'Test message' },
        },
      });

      expect(screen.queryByText(/confidence/i)).not.toBeInTheDocument();
    });

    it('renders confidence with success color for high confidence', () => {
      renderResponseCard({
        response: {
          type: 'general',
          title: 'Test',
          confidence: 0.95,
          data: { message: 'Test message' },
        },
      });

      const badge = screen.getByText('95% confidence');
      expect(badge).toBeInTheDocument();
    });

    it('renders confidence with warning color for medium confidence', () => {
      renderResponseCard({
        response: {
          type: 'general',
          title: 'Test',
          confidence: 0.75,
          data: { message: 'Test message' },
        },
      });

      const badge = screen.getByText('75% confidence');
      expect(badge).toBeInTheDocument();
    });

    it('renders confidence with critical color for low confidence', () => {
      renderResponseCard({
        response: {
          type: 'general',
          title: 'Test',
          confidence: 0.5,
          data: { message: 'Test message' },
        },
      });

      const badge = screen.getByText('50% confidence');
      expect(badge).toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------------------------
  // Table output — cost-summary
  // ---------------------------------------------------------------------------

  describe('table output — cost-summary', () => {
    const costSummaryResponse = {
      type: 'cost-summary',
      title: 'Portfolio Cost Summary',
      confidence: 0.94,
      data: {
        totalBudget: 37200000,
        totalActual: 16100000,
        totalForecast: 37050000,
        overallVariance: 150000,
        projects: [
          { name: 'Zurich Tower Complex', budget: 12500000, actual: 7200000, forecast: 12100000, variance: 400000, status: 'on-track' },
          { name: 'Geneva Lakeside Residences', budget: 8900000, actual: 5800000, forecast: 9350000, variance: -450000, status: 'at-risk' },
        ],
      },
      sources: ['SAP Financial Module'],
    };

    it('renders the cost summary title', () => {
      renderResponseCard({ response: costSummaryResponse });

      expect(screen.getByText('Portfolio Cost Summary')).toBeInTheDocument();
    });

    it('renders project names in the table', () => {
      renderResponseCard({ response: costSummaryResponse });

      expect(screen.getByText('Zurich Tower Complex')).toBeInTheDocument();
      expect(screen.getByText('Geneva Lakeside Residences')).toBeInTheDocument();
    });

    it('renders project data values', () => {
      renderResponseCard({ response: costSummaryResponse });

      expect(screen.getByText('on-track')).toBeInTheDocument();
      expect(screen.getByText('at-risk')).toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------------------------
  // Table output — invoice-summary
  // ---------------------------------------------------------------------------

  describe('table output — invoice-summary', () => {
    const invoiceSummaryResponse = {
      type: 'invoice-summary',
      title: 'Invoice Status Report',
      confidence: 0.89,
      data: {
        total: 2,
        invoices: [
          { id: 'INV-001', vendor: 'Steelworks AG', amount: 245000, status: 'paid', dueDate: '2024-10-30' },
          { id: 'INV-002', vendor: 'Concrete Solutions SA', amount: 312000, status: 'overdue', dueDate: '2024-11-01' },
        ],
      },
      sources: ['SAP Financial Module'],
    };

    it('renders invoice IDs', () => {
      renderResponseCard({ response: invoiceSummaryResponse });

      expect(screen.getByText('INV-001')).toBeInTheDocument();
      expect(screen.getByText('INV-002')).toBeInTheDocument();
    });

    it('renders vendor names', () => {
      renderResponseCard({ response: invoiceSummaryResponse });

      expect(screen.getByText('Steelworks AG')).toBeInTheDocument();
      expect(screen.getByText('Concrete Solutions SA')).toBeInTheDocument();
    });

    it('renders invoice statuses', () => {
      renderResponseCard({ response: invoiceSummaryResponse });

      expect(screen.getByText('paid')).toBeInTheDocument();
      expect(screen.getByText('overdue')).toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------------------------
  // Table output — rfi-summary
  // ---------------------------------------------------------------------------

  describe('table output — rfi-summary', () => {
    const rfiSummaryResponse = {
      type: 'rfi-summary',
      title: 'RFI Status Report',
      confidence: 0.90,
      data: {
        total: 2,
        rfis: [
          { id: 'RFI-001', subject: 'Steel connection detail', status: 'open', priority: 'high', projectId: 'PRJ-001' },
          { id: 'RFI-002', subject: 'MEP routing conflict', status: 'answered', priority: 'medium', projectId: 'PRJ-001' },
        ],
      },
      sources: ['Procore'],
    };

    it('renders RFI IDs', () => {
      renderResponseCard({ response: rfiSummaryResponse });

      expect(screen.getByText('RFI-001')).toBeInTheDocument();
      expect(screen.getByText('RFI-002')).toBeInTheDocument();
    });

    it('renders RFI subjects', () => {
      renderResponseCard({ response: rfiSummaryResponse });

      expect(screen.getByText('Steel connection detail')).toBeInTheDocument();
      expect(screen.getByText('MEP routing conflict')).toBeInTheDocument();
    });

    it('renders RFI statuses', () => {
      renderResponseCard({ response: rfiSummaryResponse });

      expect(screen.getByText('open')).toBeInTheDocument();
      expect(screen.getByText('answered')).toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------------------------
  // Table output — schedule-alert
  // ---------------------------------------------------------------------------

  describe('table output — schedule-alert', () => {
    const scheduleAlertResponse = {
      type: 'schedule-alert',
      title: 'Schedule Delay Report',
      confidence: 0.91,
      data: {
        delayedProjects: [
          { name: 'Geneva Lakeside', delayDays: 46, spi: 0.88, forecastEnd: '2025-04-30', baselineEnd: '2025-03-15' },
        ],
        onTrackProjects: [
          { name: 'Basel Innovation Hub', spi: 1.02, forecastEnd: '2026-02-28' },
        ],
      },
      sources: ['Primavera P6'],
    };

    it('renders the schedule alert title', () => {
      renderResponseCard({ response: scheduleAlertResponse });

      expect(screen.getByText('Schedule Delay Report')).toBeInTheDocument();
    });

    it('renders delayed project names', () => {
      renderResponseCard({ response: scheduleAlertResponse });

      expect(screen.getByText('Geneva Lakeside')).toBeInTheDocument();
    });

    it('renders on-track project names', () => {
      renderResponseCard({ response: scheduleAlertResponse });

      expect(screen.getByText('Basel Innovation Hub')).toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------------------------
  // Risk signal output
  // ---------------------------------------------------------------------------

  describe('risk signal output', () => {
    const riskSummaryResponse = {
      type: 'risk-summary',
      title: 'Active Risk Signals',
      confidence: 0.92,
      data: {
        totalRisks: 3,
        critical: 1,
        high: 1,
        medium: 1,
        risks: [
          {
            id: 'RISK-001',
            severity: 'critical',
            category: 'cost',
            title: 'Budget overrun on waterproofing scope',
            description: 'Unforeseen ground water conditions.',
            impact: 'CHF 450,000 potential overrun',
            suggestedActions: ['Approve change order', 'Review contingency'],
          },
          {
            id: 'RISK-002',
            severity: 'high',
            category: 'schedule',
            title: 'Schedule delay of 46 days',
            description: 'Cumulative delays from waterproofing rework.',
            impact: 'Potential liquidated damages',
            suggestedActions: ['Implement acceleration plan'],
          },
          {
            id: 'RISK-003',
            severity: 'medium',
            category: 'schedule',
            title: 'Facade installation behind schedule',
            description: 'Facade cladding delivery delays.',
            impact: 'May delay interior fit-out',
            suggestedActions: ['Expedite deliveries'],
          },
        ],
      },
      sources: ['SAP', 'Procore', 'Primavera P6'],
    };

    it('renders the risk summary title', () => {
      renderResponseCard({ response: riskSummaryResponse });

      expect(screen.getByText('Active Risk Signals')).toBeInTheDocument();
    });

    it('renders risk titles', () => {
      renderResponseCard({ response: riskSummaryResponse });

      expect(screen.getByText('Budget overrun on waterproofing scope')).toBeInTheDocument();
      expect(screen.getByText('Schedule delay of 46 days')).toBeInTheDocument();
      expect(screen.getByText('Facade installation behind schedule')).toBeInTheDocument();
    });

    it('renders severity badges', () => {
      renderResponseCard({ response: riskSummaryResponse });

      expect(screen.getByText('critical')).toBeInTheDocument();
      expect(screen.getByText('high')).toBeInTheDocument();
      expect(screen.getByText('medium')).toBeInTheDocument();
    });

    it('renders risk descriptions', () => {
      renderResponseCard({ response: riskSummaryResponse });

      expect(screen.getByText('Unforeseen ground water conditions.')).toBeInTheDocument();
      expect(screen.getByText('Cumulative delays from waterproofing rework.')).toBeInTheDocument();
    });

    it('renders risk impact text', () => {
      renderResponseCard({ response: riskSummaryResponse });

      expect(screen.getByText(/CHF 450,000 potential overrun/)).toBeInTheDocument();
      expect(screen.getByText(/Potential liquidated damages/)).toBeInTheDocument();
    });

    it('renders suggested actions', () => {
      renderResponseCard({ response: riskSummaryResponse });

      expect(screen.getByText('Approve change order')).toBeInTheDocument();
      expect(screen.getByText('Review contingency')).toBeInTheDocument();
      expect(screen.getByText('Implement acceleration plan')).toBeInTheDocument();
    });

    it('renders category badges', () => {
      renderResponseCard({ response: riskSummaryResponse });

      expect(screen.getAllByText('cost').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('schedule').length).toBeGreaterThanOrEqual(1);
    });
  });

  // ---------------------------------------------------------------------------
  // Forecast model output
  // ---------------------------------------------------------------------------

  describe('forecast model output', () => {
    const forecastResponse = {
      type: 'forecast',
      title: 'Schedule Forecast',
      confidence: 0.85,
      data: {
        'PRJ-2024-001': {
          spiTrend: [1.0, 0.99, 0.98, 0.97, 0.96],
          cpiTrend: [1.02, 1.01, 1.01, 1.0, 1.03],
          predictedCompletion: '2025-07-15',
          confidenceLevel: 78,
        },
        'PRJ-2024-002': {
          spiTrend: [0.95, 0.93, 0.91, 0.89, 0.88],
          cpiTrend: [0.97, 0.96, 0.95, 0.95, 0.95],
          predictedCompletion: '2025-04-30',
          confidenceLevel: 62,
        },
      },
      sources: ['Primavera P6'],
    };

    it('renders the forecast title', () => {
      renderResponseCard({ response: forecastResponse });

      expect(screen.getByText('Schedule Forecast')).toBeInTheDocument();
    });

    it('renders project keys as headers', () => {
      renderResponseCard({ response: forecastResponse });

      expect(screen.getByText('PRJ-2024-001')).toBeInTheDocument();
      expect(screen.getByText('PRJ-2024-002')).toBeInTheDocument();
    });

    it('renders predicted completion dates', () => {
      renderResponseCard({ response: forecastResponse });

      expect(screen.getByText('2025-07-15')).toBeInTheDocument();
      expect(screen.getByText('2025-04-30')).toBeInTheDocument();
    });

    it('renders confidence levels', () => {
      renderResponseCard({ response: forecastResponse });

      expect(screen.getByText('78%')).toBeInTheDocument();
      expect(screen.getByText('62%')).toBeInTheDocument();
    });

    it('renders SPI trend values', () => {
      renderResponseCard({ response: forecastResponse });

      // Check for at least one SPI value from each project
      expect(screen.getAllByText('0.96').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('0.88').length).toBeGreaterThanOrEqual(1);
    });

    it('renders CPI trend values', () => {
      renderResponseCard({ response: forecastResponse });

      expect(screen.getAllByText('1.03').length).toBeGreaterThanOrEqual(1);
    });
  });

  // ---------------------------------------------------------------------------
  // CTA bubble display
  // ---------------------------------------------------------------------------

  describe('CTA bubble display', () => {
    const responseWithFollowUps = {
      type: 'cost-summary',
      title: 'Cost Summary',
      confidence: 0.94,
      data: {
        projects: [
          { name: 'Test Project', budget: 1000000, actual: 500000, forecast: 950000, variance: 50000, status: 'on-track' },
        ],
      },
      sources: ['SAP'],
      suggestedFollowUps: [
        'Show me the cost breakdown',
        'What change orders are pending?',
        'What is driving the variance?',
      ],
    };

    it('renders CTA suggestion bubbles from suggestedFollowUps', () => {
      renderResponseCard({ response: responseWithFollowUps });

      expect(screen.getByText('Show me the cost breakdown')).toBeInTheDocument();
      expect(screen.getByText('What change orders are pending?')).toBeInTheDocument();
      expect(screen.getByText('What is driving the variance?')).toBeInTheDocument();
    });

    it('renders CTA suggestion bubbles from ctaSuggestions prop', () => {
      renderResponseCard({
        response: {
          type: 'general',
          title: 'Test',
          data: { message: 'Test' },
        },
        ctaSuggestions: ['Suggestion A', 'Suggestion B'],
      });

      expect(screen.getByText('Suggestion A')).toBeInTheDocument();
      expect(screen.getByText('Suggestion B')).toBeInTheDocument();
    });

    it('prefers ctaSuggestions prop over suggestedFollowUps', () => {
      renderResponseCard({
        response: {
          ...responseWithFollowUps,
        },
        ctaSuggestions: ['Custom suggestion 1', 'Custom suggestion 2'],
      });

      expect(screen.getByText('Custom suggestion 1')).toBeInTheDocument();
      expect(screen.getByText('Custom suggestion 2')).toBeInTheDocument();
      expect(screen.queryByText('Show me the cost breakdown')).not.toBeInTheDocument();
    });

    it('calls onCTAClick when a CTA bubble is clicked', async () => {
      const onCTAClick = vi.fn();
      const { user } = renderResponseCard({
        response: responseWithFollowUps,
        onCTAClick,
      });

      const bubble = screen.getByText('Show me the cost breakdown');
      await user.click(bubble);

      expect(onCTAClick).toHaveBeenCalledTimes(1);
      expect(onCTAClick).toHaveBeenCalledWith('Show me the cost breakdown');
    });

    it('does not render CTA bubbles when no suggestions are available', () => {
      renderResponseCard({
        response: {
          type: 'general',
          title: 'Test',
          data: { message: 'Test' },
        },
      });

      // No CTA buttons should be rendered (aside from any other buttons)
      const buttons = screen.queryAllByRole('button');
      // There should be no CTA-style buttons
      expect(buttons.length).toBe(0);
    });
  });

  // ---------------------------------------------------------------------------
  // Source transparency panel integration
  // ---------------------------------------------------------------------------

  describe('source transparency panel integration', () => {
    it('renders source indicators from the sources array', () => {
      renderResponseCard({
        response: {
          type: 'general',
          title: 'Test',
          data: { message: 'Test' },
          sources: ['SAP', 'Procore'],
        },
      });

      expect(screen.getByText('Sources:')).toBeInTheDocument();
      // Source labels should be rendered
      expect(screen.getByText(/SAP/i)).toBeInTheDocument();
      expect(screen.getByText(/Procore/i)).toBeInTheDocument();
    });

    it('renders source indicators from sourceIndicators prop', () => {
      renderResponseCard({
        response: {
          type: 'general',
          title: 'Test',
          data: { message: 'Test' },
        },
        sourceIndicators: [
          { system: 'sap', active: true, connected: true },
          { system: 'procore', active: false, connected: true },
          { system: 'primavera', active: true, connected: true },
        ],
      });

      expect(screen.getByText('Sources:')).toBeInTheDocument();
    });

    it('does not render source panel when no sources are provided', () => {
      renderResponseCard({
        response: {
          type: 'general',
          title: 'Test',
          data: { message: 'Test' },
        },
      });

      expect(screen.queryByText('Sources:')).not.toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------------------------
  // Glassmorphism styling verification
  // ---------------------------------------------------------------------------

  describe('glassmorphism styling', () => {
    it('renders with glass-card class', () => {
      const { container } = renderResponseCard({
        response: {
          type: 'general',
          title: 'Test',
          data: { message: 'Test' },
        },
      });

      const card = container.querySelector('.glass-card');
      expect(card).toBeInTheDocument();
    });

    it('renders with font-urbanist class', () => {
      const { container } = renderResponseCard({
        response: {
          type: 'general',
          title: 'Test',
          data: { message: 'Test' },
        },
      });

      const card = container.querySelector('.font-urbanist');
      expect(card).toBeInTheDocument();
    });

    it('renders with proper padding style', () => {
      const { container } = renderResponseCard({
        response: {
          type: 'general',
          title: 'Test',
          data: { message: 'Test' },
        },
      });

      const card = container.querySelector('.glass-card');
      expect(card).toHaveStyle({ padding: '24px' });
    });
  });

  // ---------------------------------------------------------------------------
  // General response type
  // ---------------------------------------------------------------------------

  describe('general response type', () => {
    it('renders a general message', () => {
      renderResponseCard({
        response: {
          type: 'general',
          title: 'General Insights',
          confidence: 0.72,
          data: {
            message: 'Here is a summary of relevant information.',
          },
        },
      });

      expect(screen.getByText('General Insights')).toBeInTheDocument();
      expect(screen.getByText('Here is a summary of relevant information.')).toBeInTheDocument();
    });

    it('renders related projects in a general response', () => {
      renderResponseCard({
        response: {
          type: 'general',
          title: 'General Insights',
          data: {
            message: 'Summary info.',
            relatedProjects: [
              { name: 'Project A', status: 'active', percentComplete: 50 },
              { name: 'Project B', status: 'active', percentComplete: 75 },
            ],
          },
        },
      });

      expect(screen.getByText('Project A')).toBeInTheDocument();
      expect(screen.getByText('Project B')).toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------------------------
  // No-match response type
  // ---------------------------------------------------------------------------

  describe('no-match response type', () => {
    it('renders the no-match message', () => {
      renderResponseCard({
        response: {
          type: 'no-match',
          title: 'Query Not Recognized',
          confidence: 0.3,
          data: {
            message: 'I wasn\'t able to find a specific match for your query.',
            suggestedQueries: [
              'What is the current budget status?',
              'Which projects are behind schedule?',
            ],
          },
        },
      });

      expect(screen.getByText('Query Not Recognized')).toBeInTheDocument();
      expect(screen.getByText(/wasn't able to find/)).toBeInTheDocument();
    });

    it('renders suggested queries in no-match response', () => {
      renderResponseCard({
        response: {
          type: 'no-match',
          title: 'Query Not Recognized',
          confidence: 0.3,
          data: {
            message: 'No match found.',
            suggestedQueries: [
              'What is the current budget status?',
              'Which projects are behind schedule?',
            ],
          },
        },
      });

      expect(screen.getByText('What is the current budget status?')).toBeInTheDocument();
      expect(screen.getByText('Which projects are behind schedule?')).toBeInTheDocument();
    });

    it('renders the "Try asking" label for suggested queries', () => {
      renderResponseCard({
        response: {
          type: 'no-match',
          title: 'Query Not Recognized',
          data: {
            message: 'No match.',
            suggestedQueries: ['Test query'],
          },
        },
      });

      expect(screen.getByText('Try asking:')).toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------------------------
  // Pipeline summary
  // ---------------------------------------------------------------------------

  describe('pipeline-summary response type', () => {
    it('renders pipeline summary data', () => {
      renderResponseCard({
        response: {
          type: 'pipeline-summary',
          title: 'Sales Pipeline Overview',
          confidence: 0.93,
          data: {
            totalValue: 95500000,
            totalOpportunities: 5,
            weightedValue: 52000000,
          },
          sources: ['Salesforce CRM'],
        },
      });

      expect(screen.getByText('Sales Pipeline Overview')).toBeInTheDocument();
      // The DataTable should render key-value pairs
      expect(screen.getByText(/Total Value/i)).toBeInTheDocument();
      expect(screen.getByText(/Total Opportunities/i)).toBeInTheDocument();
      expect(screen.getByText(/Weighted Value/i)).toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------------------------
  // Change order summary
  // ---------------------------------------------------------------------------

  describe('change-order-summary response type', () => {
    it('renders change order data', () => {
      renderResponseCard({
        response: {
          type: 'change-order-summary',
          title: 'Change Order Report',
          confidence: 0.91,
          data: {
            total: 2,
            changeOrders: [
              { id: 'CO-001', title: 'Fire-rated partitions', amount: 85000, status: 'approved', reason: 'Regulatory compliance' },
              { id: 'CO-002', title: 'Upgraded waterproofing', amount: 210000, status: 'pending', reason: 'Ground water conditions' },
            ],
          },
          sources: ['Procore'],
        },
      });

      expect(screen.getByText('Change Order Report')).toBeInTheDocument();
      expect(screen.getByText('CO-001')).toBeInTheDocument();
      expect(screen.getByText('CO-002')).toBeInTheDocument();
      expect(screen.getByText('Fire-rated partitions')).toBeInTheDocument();
      expect(screen.getByText('Upgraded waterproofing')).toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------------------------
  // Client summary
  // ---------------------------------------------------------------------------

  describe('client-summary response type', () => {
    it('renders client data', () => {
      renderResponseCard({
        response: {
          type: 'client-summary',
          title: 'Client Relationship Overview',
          confidence: 0.87,
          data: {
            totalClients: 2,
            clients: [
              { name: 'Alpine Developments AG', industry: 'Real Estate', relationship: 'strategic', activeProjects: 1, primaryContact: 'Hans Zimmermann' },
              { name: 'Lac Léman Properties', industry: 'Residential', relationship: 'key', activeProjects: 1, primaryContact: 'Marie Fontaine' },
            ],
          },
          sources: ['Salesforce CRM'],
        },
      });

      expect(screen.getByText('Client Relationship Overview')).toBeInTheDocument();
      expect(screen.getByText('Alpine Developments AG')).toBeInTheDocument();
      expect(screen.getByText('Lac Léman Properties')).toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------------------------
  // Milestone summary
  // ---------------------------------------------------------------------------

  describe('milestone-summary response type', () => {
    it('renders milestone data', () => {
      renderResponseCard({
        response: {
          type: 'milestone-summary',
          title: 'Upcoming Milestones',
          confidence: 0.90,
          data: {
            milestones: [
              { projectName: 'Zurich Tower', name: 'Facade Enclosed', plannedDate: '2025-01-31', status: 'in-progress' },
              { projectName: 'Basel Hub', name: 'Foundation Complete', plannedDate: '2024-12-31', status: 'in-progress' },
            ],
          },
          sources: ['Primavera P6'],
        },
      });

      expect(screen.getByText('Upcoming Milestones')).toBeInTheDocument();
      expect(screen.getByText('Zurich Tower')).toBeInTheDocument();
      expect(screen.getByText('Basel Hub')).toBeInTheDocument();
      expect(screen.getByText('Facade Enclosed')).toBeInTheDocument();
      expect(screen.getByText('Foundation Complete')).toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------------------------
  // Resource summary
  // ---------------------------------------------------------------------------

  describe('resource-summary response type', () => {
    it('renders resource data', () => {
      renderResponseCard({
        response: {
          type: 'resource-summary',
          title: 'Resource Utilization Report',
          confidence: 0.88,
          data: {
            totalResources: 2,
            resources: [
              { category: 'Structural Steel Workers', resourceType: 'Labour', planned: 24, actual: 22, utilization: 91.7 },
              { category: 'MEP Technicians', resourceType: 'Labour', planned: 18, actual: 16, utilization: 88.9 },
            ],
          },
          sources: ['Primavera P6'],
        },
      });

      expect(screen.getByText('Resource Utilization Report')).toBeInTheDocument();
      expect(screen.getByText('Structural Steel Workers')).toBeInTheDocument();
      expect(screen.getByText('MEP Technicians')).toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------------------------
  // Edge cases
  // ---------------------------------------------------------------------------

  describe('edge cases', () => {
    it('renders without crashing when data is null', () => {
      const { container } = renderResponseCard({
        response: {
          type: 'general',
          title: 'Test',
          data: null,
        },
      });

      expect(screen.getByText('Test')).toBeInTheDocument();
    });

    it('renders without crashing when data is an empty object', () => {
      renderResponseCard({
        response: {
          type: 'general',
          title: 'Test',
          data: {},
        },
      });

      expect(screen.getByText('Test')).toBeInTheDocument();
    });

    it('renders without crashing when type is unknown', () => {
      renderResponseCard({
        response: {
          type: 'unknown-type',
          title: 'Unknown',
          data: { someKey: 'someValue' },
        },
      });

      expect(screen.getByText('Unknown')).toBeInTheDocument();
    });

    it('renders without crashing when response has no title', () => {
      const { container } = renderResponseCard({
        response: {
          type: 'general',
          data: { message: 'No title response' },
        },
      });

      expect(screen.getByText('No title response')).toBeInTheDocument();
    });

    it('renders without crashing when sources is an empty array', () => {
      renderResponseCard({
        response: {
          type: 'general',
          title: 'Test',
          data: { message: 'Test' },
          sources: [],
        },
      });

      expect(screen.getByText('Test')).toBeInTheDocument();
      expect(screen.queryByText('Sources:')).not.toBeInTheDocument();
    });

    it('renders without crashing when suggestedFollowUps is an empty array', () => {
      renderResponseCard({
        response: {
          type: 'general',
          title: 'Test',
          data: { message: 'Test' },
          suggestedFollowUps: [],
        },
      });

      expect(screen.getByText('Test')).toBeInTheDocument();
    });

    it('renders risk-summary with empty risks array', () => {
      renderResponseCard({
        response: {
          type: 'risk-summary',
          title: 'No Risks',
          data: {
            risks: [],
          },
        },
      });

      expect(screen.getByText('No Risks')).toBeInTheDocument();
      expect(screen.getByText('No active risk signals.')).toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------------------------
  // Animation / entry
  // ---------------------------------------------------------------------------

  describe('animation entry', () => {
    it('renders the card after animation', async () => {
      renderResponseCard({
        response: {
          type: 'general',
          title: 'Animated Card',
          data: { message: 'Content here' },
        },
      });

      await waitFor(() => {
        expect(screen.getByText('Animated Card')).toBeInTheDocument();
        expect(screen.getByText('Content here')).toBeInTheDocument();
      });
    });

    it('renders the card container with w-full class', () => {
      const { container } = renderResponseCard({
        response: {
          type: 'general',
          title: 'Test',
          data: { message: 'Test' },
        },
      });

      const card = container.querySelector('.w-full');
      expect(card).toBeInTheDocument();
    });
  });
});