import { INTELLIGENCE_CLUSTERS, PERSONAS, COLORS } from '../utils/constants.js';

// ---------------------------------------------------------------------------
// SAP Financial Data
// ---------------------------------------------------------------------------

export const SAP_COST_REPORTS = [
  {
    id: 'sap-cr-001',
    projectId: 'PRJ-2024-001',
    projectName: 'Zurich Tower Complex',
    reportDate: '2024-11-15',
    currency: 'CHF',
    totalBudget: 12500000,
    committedCost: 8750000,
    actualCost: 7200000,
    forecastAtCompletion: 12100000,
    variance: 400000,
    variancePercent: 3.2,
    status: 'on-track',
    lineItems: [
      { category: 'Structural Works', budget: 4500000, actual: 3200000, committed: 3800000 },
      { category: 'MEP Systems', budget: 3200000, actual: 2100000, committed: 2600000 },
      { category: 'Facade & Cladding', budget: 2800000, actual: 1200000, committed: 1500000 },
      { category: 'Interior Fit-Out', budget: 1200000, actual: 400000, committed: 550000 },
      { category: 'Preliminaries', budget: 800000, actual: 300000, committed: 300000 },
    ],
  },
  {
    id: 'sap-cr-002',
    projectId: 'PRJ-2024-002',
    projectName: 'Geneva Lakeside Residences',
    reportDate: '2024-11-15',
    currency: 'CHF',
    totalBudget: 8900000,
    committedCost: 6200000,
    actualCost: 5800000,
    forecastAtCompletion: 9350000,
    variance: -450000,
    variancePercent: -5.1,
    status: 'at-risk',
    lineItems: [
      { category: 'Structural Works', budget: 3100000, actual: 2800000, committed: 2900000 },
      { category: 'MEP Systems', budget: 2400000, actual: 1600000, committed: 1800000 },
      { category: 'Landscaping', budget: 1200000, actual: 700000, committed: 800000 },
      { category: 'Interior Fit-Out', budget: 1500000, actual: 500000, committed: 500000 },
      { category: 'Preliminaries', budget: 700000, actual: 200000, committed: 200000 },
    ],
  },
  {
    id: 'sap-cr-003',
    projectId: 'PRJ-2024-003',
    projectName: 'Basel Innovation Hub',
    reportDate: '2024-11-15',
    currency: 'CHF',
    totalBudget: 15800000,
    committedCost: 4200000,
    actualCost: 3100000,
    forecastAtCompletion: 15600000,
    variance: 200000,
    variancePercent: 1.3,
    status: 'on-track',
    lineItems: [
      { category: 'Structural Works', budget: 5500000, actual: 1500000, committed: 2000000 },
      { category: 'MEP Systems', budget: 4200000, actual: 800000, committed: 1000000 },
      { category: 'Facade & Cladding', budget: 3100000, actual: 400000, committed: 600000 },
      { category: 'Interior Fit-Out', budget: 2000000, actual: 200000, committed: 300000 },
      { category: 'Preliminaries', budget: 1000000, actual: 200000, committed: 300000 },
    ],
  },
];

export const SAP_INVOICES = [
  { id: 'INV-2024-0451', vendor: 'Steelworks AG', amount: 245000, currency: 'CHF', status: 'paid', dueDate: '2024-10-30', projectId: 'PRJ-2024-001' },
  { id: 'INV-2024-0452', vendor: 'ElectroPlan GmbH', amount: 128000, currency: 'CHF', status: 'pending', dueDate: '2024-11-30', projectId: 'PRJ-2024-001' },
  { id: 'INV-2024-0453', vendor: 'Concrete Solutions SA', amount: 312000, currency: 'CHF', status: 'overdue', dueDate: '2024-11-01', projectId: 'PRJ-2024-002' },
  { id: 'INV-2024-0454', vendor: 'GlassFront Ltd', amount: 189000, currency: 'CHF', status: 'pending', dueDate: '2024-12-15', projectId: 'PRJ-2024-001' },
  { id: 'INV-2024-0455', vendor: 'TerraForm Landscaping', amount: 76000, currency: 'CHF', status: 'paid', dueDate: '2024-10-15', projectId: 'PRJ-2024-002' },
  { id: 'INV-2024-0456', vendor: 'ArchDesign Partners', amount: 420000, currency: 'CHF', status: 'pending', dueDate: '2024-12-01', projectId: 'PRJ-2024-003' },
];

// ---------------------------------------------------------------------------
// Procore Project Data
// ---------------------------------------------------------------------------

export const PROCORE_PROJECTS = [
  {
    id: 'PRJ-2024-001',
    name: 'Zurich Tower Complex',
    status: 'active',
    percentComplete: 58,
    startDate: '2024-01-15',
    endDate: '2025-06-30',
    projectManager: 'Sophie Dubois',
    location: 'Zurich, Switzerland',
    client: 'Alpine Developments AG',
    totalArea: 42000,
    areaUnit: 'sqm',
  },
  {
    id: 'PRJ-2024-002',
    name: 'Geneva Lakeside Residences',
    status: 'active',
    percentComplete: 72,
    startDate: '2023-09-01',
    endDate: '2025-03-15',
    projectManager: 'Sophie Dubois',
    location: 'Geneva, Switzerland',
    client: 'Lac Léman Properties',
    totalArea: 28000,
    areaUnit: 'sqm',
  },
  {
    id: 'PRJ-2024-003',
    name: 'Basel Innovation Hub',
    status: 'active',
    percentComplete: 22,
    startDate: '2024-06-01',
    endDate: '2026-02-28',
    projectManager: 'Lukas Müller',
    location: 'Basel, Switzerland',
    client: 'Novartis Campus Fund',
    totalArea: 55000,
    areaUnit: 'sqm',
  },
];

export const PROCORE_RFIS = [
  {
    id: 'RFI-001',
    projectId: 'PRJ-2024-001',
    subject: 'Structural steel connection detail at Level 12',
    status: 'open',
    priority: 'high',
    createdDate: '2024-11-10',
    dueDate: '2024-11-20',
    assignedTo: 'Structural Engineer',
    createdBy: 'Site Foreman',
  },
  {
    id: 'RFI-002',
    projectId: 'PRJ-2024-001',
    subject: 'MEP routing conflict in parking level B2',
    status: 'answered',
    priority: 'medium',
    createdDate: '2024-11-05',
    dueDate: '2024-11-15',
    assignedTo: 'MEP Coordinator',
    createdBy: 'Project Engineer',
  },
  {
    id: 'RFI-003',
    projectId: 'PRJ-2024-002',
    subject: 'Waterproofing specification for lakeside retaining wall',
    status: 'open',
    priority: 'critical',
    createdDate: '2024-11-12',
    dueDate: '2024-11-18',
    assignedTo: 'Architect',
    createdBy: 'Site Manager',
  },
  {
    id: 'RFI-004',
    projectId: 'PRJ-2024-002',
    subject: 'Window frame material substitution approval',
    status: 'closed',
    priority: 'low',
    createdDate: '2024-10-20',
    dueDate: '2024-10-30',
    assignedTo: 'Architect',
    createdBy: 'Procurement Manager',
  },
  {
    id: 'RFI-005',
    projectId: 'PRJ-2024-003',
    subject: 'Foundation pile depth adjustment based on soil report',
    status: 'open',
    priority: 'high',
    createdDate: '2024-11-14',
    dueDate: '2024-11-22',
    assignedTo: 'Geotechnical Engineer',
    createdBy: 'Project Director',
  },
];

export const PROCORE_CHANGE_ORDERS = [
  {
    id: 'CO-001',
    projectId: 'PRJ-2024-001',
    title: 'Additional fire-rated partitions at Level 8',
    amount: 85000,
    currency: 'CHF',
    status: 'approved',
    requestDate: '2024-10-15',
    approvedDate: '2024-10-28',
    reason: 'Regulatory compliance update',
  },
  {
    id: 'CO-002',
    projectId: 'PRJ-2024-002',
    title: 'Upgraded waterproofing system for underground levels',
    amount: 210000,
    currency: 'CHF',
    status: 'pending',
    requestDate: '2024-11-08',
    approvedDate: null,
    reason: 'Unforeseen ground water conditions',
  },
  {
    id: 'CO-003',
    projectId: 'PRJ-2024-001',
    title: 'Client-requested lobby redesign',
    amount: 145000,
    currency: 'CHF',
    status: 'pending',
    requestDate: '2024-11-12',
    approvedDate: null,
    reason: 'Client scope change',
  },
];

// ---------------------------------------------------------------------------
// Salesforce Pipeline & Client Data
// ---------------------------------------------------------------------------

export const SALESFORCE_PIPELINE = [
  {
    id: 'OPP-001',
    name: 'Bern Federal Quarter Renovation',
    client: 'Swiss Federal Government',
    value: 22000000,
    currency: 'CHF',
    stage: 'proposal',
    probability: 65,
    expectedCloseDate: '2025-02-28',
    owner: 'James Carter',
    lastActivity: '2024-11-10',
  },
  {
    id: 'OPP-002',
    name: 'Lausanne Tech Campus Phase 2',
    client: 'EPFL Foundation',
    value: 18500000,
    currency: 'CHF',
    stage: 'negotiation',
    probability: 80,
    expectedCloseDate: '2025-01-15',
    owner: 'James Carter',
    lastActivity: '2024-11-14',
  },
  {
    id: 'OPP-003',
    name: 'Lucerne Waterfront Hotel',
    client: 'Helvetia Hospitality Group',
    value: 31000000,
    currency: 'CHF',
    stage: 'qualification',
    probability: 35,
    expectedCloseDate: '2025-06-30',
    owner: 'James Carter',
    lastActivity: '2024-11-08',
  },
  {
    id: 'OPP-004',
    name: 'Winterthur Industrial Park',
    client: 'Sulzer Real Estate',
    value: 9800000,
    currency: 'CHF',
    stage: 'closed-won',
    probability: 100,
    expectedCloseDate: '2024-10-31',
    owner: 'James Carter',
    lastActivity: '2024-10-31',
  },
  {
    id: 'OPP-005',
    name: 'St. Gallen Mixed-Use Development',
    client: 'Raiffeisen Property Fund',
    value: 14200000,
    currency: 'CHF',
    stage: 'proposal',
    probability: 50,
    expectedCloseDate: '2025-04-15',
    owner: 'James Carter',
    lastActivity: '2024-11-06',
  },
];

export const SALESFORCE_CLIENTS = [
  {
    id: 'CLI-001',
    name: 'Alpine Developments AG',
    industry: 'Real Estate Development',
    totalRevenue: 12500000,
    activeProjects: 1,
    relationship: 'strategic',
    primaryContact: 'Hans Zimmermann',
    contactEmail: 'h.zimmermann@alpinedev.ch',
    lastMeeting: '2024-11-12',
  },
  {
    id: 'CLI-002',
    name: 'Lac Léman Properties',
    industry: 'Residential Development',
    totalRevenue: 8900000,
    activeProjects: 1,
    relationship: 'key',
    primaryContact: 'Marie Fontaine',
    contactEmail: 'm.fontaine@lacleman.ch',
    lastMeeting: '2024-11-08',
  },
  {
    id: 'CLI-003',
    name: 'Novartis Campus Fund',
    industry: 'Pharmaceutical / Corporate',
    totalRevenue: 15800000,
    activeProjects: 1,
    relationship: 'strategic',
    primaryContact: 'Dr. Thomas Keller',
    contactEmail: 't.keller@novartis.com',
    lastMeeting: '2024-11-14',
  },
  {
    id: 'CLI-004',
    name: 'EPFL Foundation',
    industry: 'Education / Research',
    totalRevenue: 0,
    activeProjects: 0,
    relationship: 'prospect',
    primaryContact: 'Prof. Alain Dupont',
    contactEmail: 'a.dupont@epfl.ch',
    lastMeeting: '2024-11-14',
  },
  {
    id: 'CLI-005',
    name: 'Swiss Federal Government',
    industry: 'Government',
    totalRevenue: 0,
    activeProjects: 0,
    relationship: 'prospect',
    primaryContact: 'Dr. Ursula Meier',
    contactEmail: 'u.meier@admin.ch',
    lastMeeting: '2024-11-10',
  },
];

// ---------------------------------------------------------------------------
// Primavera Schedule & Resource Data
// ---------------------------------------------------------------------------

export const PRIMAVERA_SCHEDULES = [
  {
    id: 'SCH-001',
    projectId: 'PRJ-2024-001',
    projectName: 'Zurich Tower Complex',
    baselineEndDate: '2025-06-30',
    forecastEndDate: '2025-07-15',
    delayDays: 15,
    criticalPathActivities: 12,
    totalActivities: 248,
    completedActivities: 144,
    spiValue: 0.96,
    milestones: [
      { name: 'Foundation Complete', plannedDate: '2024-04-30', actualDate: '2024-05-05', status: 'completed' },
      { name: 'Structure Topped Out', plannedDate: '2024-10-15', actualDate: '2024-10-28', status: 'completed' },
      { name: 'Facade Enclosed', plannedDate: '2025-01-31', actualDate: null, status: 'in-progress' },
      { name: 'MEP Rough-In Complete', plannedDate: '2025-03-15', actualDate: null, status: 'upcoming' },
      { name: 'Interior Fit-Out Complete', plannedDate: '2025-05-30', actualDate: null, status: 'upcoming' },
      { name: 'Practical Completion', plannedDate: '2025-06-30', actualDate: null, status: 'upcoming' },
    ],
  },
  {
    id: 'SCH-002',
    projectId: 'PRJ-2024-002',
    projectName: 'Geneva Lakeside Residences',
    baselineEndDate: '2025-03-15',
    forecastEndDate: '2025-04-30',
    delayDays: 46,
    criticalPathActivities: 8,
    totalActivities: 186,
    completedActivities: 134,
    spiValue: 0.88,
    milestones: [
      { name: 'Foundation Complete', plannedDate: '2024-01-15', actualDate: '2024-01-20', status: 'completed' },
      { name: 'Structure Complete', plannedDate: '2024-06-30', actualDate: '2024-07-18', status: 'completed' },
      { name: 'Waterproofing Complete', plannedDate: '2024-09-30', actualDate: '2024-10-25', status: 'completed' },
      { name: 'Interior Fit-Out Complete', plannedDate: '2025-02-15', actualDate: null, status: 'in-progress' },
      { name: 'Landscaping Complete', plannedDate: '2025-03-01', actualDate: null, status: 'upcoming' },
      { name: 'Practical Completion', plannedDate: '2025-03-15', actualDate: null, status: 'upcoming' },
    ],
  },
  {
    id: 'SCH-003',
    projectId: 'PRJ-2024-003',
    projectName: 'Basel Innovation Hub',
    baselineEndDate: '2026-02-28',
    forecastEndDate: '2026-02-28',
    delayDays: 0,
    criticalPathActivities: 15,
    totalActivities: 312,
    completedActivities: 69,
    spiValue: 1.02,
    milestones: [
      { name: 'Site Preparation Complete', plannedDate: '2024-08-15', actualDate: '2024-08-10', status: 'completed' },
      { name: 'Foundation Complete', plannedDate: '2024-12-31', actualDate: null, status: 'in-progress' },
      { name: 'Structure Topped Out', plannedDate: '2025-06-30', actualDate: null, status: 'upcoming' },
      { name: 'Facade Enclosed', plannedDate: '2025-10-15', actualDate: null, status: 'upcoming' },
      { name: 'Interior Fit-Out Complete', plannedDate: '2026-01-31', actualDate: null, status: 'upcoming' },
      { name: 'Practical Completion', plannedDate: '2026-02-28', actualDate: null, status: 'upcoming' },
    ],
  },
];

export const PRIMAVERA_RESOURCES = [
  {
    id: 'RES-001',
    projectId: 'PRJ-2024-001',
    resourceType: 'Labour',
    category: 'Structural Steel Workers',
    planned: 24,
    actual: 22,
    utilization: 91.7,
    unit: 'FTE',
  },
  {
    id: 'RES-002',
    projectId: 'PRJ-2024-001',
    resourceType: 'Labour',
    category: 'MEP Technicians',
    planned: 18,
    actual: 16,
    utilization: 88.9,
    unit: 'FTE',
  },
  {
    id: 'RES-003',
    projectId: 'PRJ-2024-002',
    resourceType: 'Labour',
    category: 'General Labourers',
    planned: 30,
    actual: 28,
    utilization: 93.3,
    unit: 'FTE',
  },
  {
    id: 'RES-004',
    projectId: 'PRJ-2024-002',
    resourceType: 'Equipment',
    category: 'Tower Crane',
    planned: 2,
    actual: 2,
    utilization: 100,
    unit: 'units',
  },
  {
    id: 'RES-005',
    projectId: 'PRJ-2024-003',
    resourceType: 'Labour',
    category: 'Piling Crew',
    planned: 12,
    actual: 12,
    utilization: 100,
    unit: 'FTE',
  },
  {
    id: 'RES-006',
    projectId: 'PRJ-2024-003',
    resourceType: 'Equipment',
    category: 'Excavator',
    planned: 3,
    actual: 3,
    utilization: 100,
    unit: 'units',
  },
];

// ---------------------------------------------------------------------------
// Risk Signals
// ---------------------------------------------------------------------------

export const RISK_SIGNALS = [
  {
    id: 'RISK-001',
    projectId: 'PRJ-2024-002',
    projectName: 'Geneva Lakeside Residences',
    severity: 'critical',
    category: 'cost',
    title: 'Budget overrun on waterproofing scope',
    description: 'Unforeseen ground water conditions have led to a CHF 210,000 change order for upgraded waterproofing. Total project forecast now exceeds budget by 5.1%.',
    impact: 'CHF 450,000 potential overrun at completion',
    probability: 85,
    detectedDate: '2024-11-08',
    source: 'SAP + Procore',
    suggestedActions: [
      'Approve change order CO-002 for upgraded waterproofing',
      'Review remaining contingency allocation',
      'Schedule cost review meeting with client',
    ],
  },
  {
    id: 'RISK-002',
    projectId: 'PRJ-2024-002',
    projectName: 'Geneva Lakeside Residences',
    severity: 'high',
    category: 'schedule',
    title: 'Schedule delay of 46 days on critical path',
    description: 'Cumulative delays from waterproofing rework and material delivery issues have pushed the forecast completion to April 30, 2025 — 46 days beyond baseline.',
    impact: 'Potential liquidated damages and client dissatisfaction',
    probability: 90,
    detectedDate: '2024-11-10',
    source: 'Primavera',
    suggestedActions: [
      'Implement acceleration plan for interior fit-out',
      'Negotiate revised completion date with client',
      'Add weekend shifts for critical path activities',
    ],
  },
  {
    id: 'RISK-003',
    projectId: 'PRJ-2024-001',
    projectName: 'Zurich Tower Complex',
    severity: 'medium',
    category: 'schedule',
    title: 'Facade installation 15 days behind schedule',
    description: 'Facade cladding delivery delays from supplier have caused a 15-day slip on the facade enclosure milestone.',
    impact: 'May delay interior fit-out start if not recovered',
    probability: 60,
    detectedDate: '2024-11-12',
    source: 'Primavera + Procore',
    suggestedActions: [
      'Expedite remaining facade material deliveries',
      'Explore parallel working on lower floors',
      'Review float on downstream activities',
    ],
  },
  {
    id: 'RISK-004',
    projectId: 'PRJ-2024-001',
    projectName: 'Zurich Tower Complex',
    severity: 'low',
    category: 'quality',
    title: 'Open RFI on structural steel connection',
    description: 'RFI-001 regarding structural steel connection detail at Level 12 remains unanswered past its due date.',
    impact: 'Potential rework if installation proceeds without clarification',
    probability: 40,
    detectedDate: '2024-11-14',
    source: 'Procore',
    suggestedActions: [
      'Escalate RFI-001 to structural engineer',
      'Halt steel installation at Level 12 pending response',
    ],
  },
  {
    id: 'RISK-005',
    projectId: 'PRJ-2024-002',
    projectName: 'Geneva Lakeside Residences',
    severity: 'high',
    category: 'cost',
    title: 'Overdue invoice from Concrete Solutions SA',
    description: 'Invoice INV-2024-0453 for CHF 312,000 is overdue. Vendor has indicated potential work stoppage if not resolved.',
    impact: 'Work stoppage risk on remaining concrete works',
    probability: 70,
    detectedDate: '2024-11-14',
    source: 'SAP',
    suggestedActions: [
      'Process payment for INV-2024-0453 immediately',
      'Contact vendor to confirm continued works',
      'Review cash flow forecast for project',
    ],
  },
];

// ---------------------------------------------------------------------------
// Forecast Models
// ---------------------------------------------------------------------------

export const FORECAST_MODELS = {
  costForecast: {
    'PRJ-2024-001': {
      months: ['Jul 2024', 'Aug 2024', 'Sep 2024', 'Oct 2024', 'Nov 2024', 'Dec 2024', 'Jan 2025', 'Feb 2025', 'Mar 2025', 'Apr 2025', 'May 2025', 'Jun 2025'],
      planned: [4200000, 4900000, 5600000, 6400000, 7200000, 8100000, 9000000, 9900000, 10800000, 11500000, 12100000, 12500000],
      actual: [4100000, 4800000, 5500000, 6300000, 7200000, null, null, null, null, null, null, null],
      forecast: [4100000, 4800000, 5500000, 6300000, 7200000, 8000000, 8900000, 9700000, 10500000, 11300000, 11800000, 12100000],
    },
    'PRJ-2024-002': {
      months: ['Jul 2024', 'Aug 2024', 'Sep 2024', 'Oct 2024', 'Nov 2024', 'Dec 2024', 'Jan 2025', 'Feb 2025', 'Mar 2025'],
      planned: [3800000, 4400000, 5000000, 5600000, 6200000, 7000000, 7800000, 8400000, 8900000],
      actual: [3900000, 4600000, 5200000, 5500000, 5800000, null, null, null, null],
      forecast: [3900000, 4600000, 5200000, 5500000, 5800000, 6800000, 7800000, 8600000, 9350000],
    },
    'PRJ-2024-003': {
      months: ['Jul 2024', 'Aug 2024', 'Sep 2024', 'Oct 2024', 'Nov 2024', 'Dec 2024', 'Jan 2025', 'Feb 2025', 'Mar 2025', 'Apr 2025', 'May 2025', 'Jun 2025'],
      planned: [800000, 1200000, 1700000, 2200000, 2800000, 3500000, 4300000, 5200000, 6200000, 7300000, 8500000, 9800000],
      actual: [750000, 1100000, 1600000, 2100000, 3100000, null, null, null, null, null, null, null],
      forecast: [750000, 1100000, 1600000, 2100000, 3100000, 3800000, 4600000, 5500000, 6500000, 7600000, 8800000, 15600000],
    },
  },
  scheduleForecast: {
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
    'PRJ-2024-003': {
      spiTrend: [1.0, 1.01, 1.02, 1.02, 1.02],
      cpiTrend: [1.03, 1.04, 1.03, 1.02, 1.01],
      predictedCompletion: '2026-02-28',
      confidenceLevel: 88,
    },
  },
};

// ---------------------------------------------------------------------------
// Suggested Queries per Intelligence Cluster
// ---------------------------------------------------------------------------

export const SUGGESTED_QUERIES = {
  'cost-management': [
    'What is the current budget status across all projects?',
    'Show me the cost variance for Geneva Lakeside Residences',
    'Which invoices are overdue?',
    'What is the forecast at completion for Zurich Tower Complex?',
    'Compare committed costs vs actual costs for all projects',
    'Show me pending change orders and their financial impact',
  ],
  'schedule-tracking': [
    'Which projects are behind schedule?',
    'Show me the critical path for Zurich Tower Complex',
    'What milestones are coming up in the next 30 days?',
    'What is the schedule performance index across projects?',
    'How many days is Geneva Lakeside delayed?',
    'Show me the forecast completion dates for all projects',
  ],
  'risk-assessment': [
    'What are the top risks across all projects?',
    'Show me critical risk signals for Geneva Lakeside',
    'Are there any open RFIs that could cause delays?',
    'What mitigation actions are recommended?',
    'Which project has the highest risk exposure?',
    'Show me risks related to vendor performance',
  ],
  'quality-assurance': [
    'Are there any open quality issues?',
    'Show me the RFI status for all projects',
    'Which RFIs are overdue?',
    'What inspection results are pending?',
    'Show me compliance status across projects',
    'Are there any defect reports this month?',
  ],
  'stakeholder-comms': [
    'When was the last client meeting for each project?',
    'Show me the sales pipeline summary',
    'Which opportunities are in negotiation stage?',
    'What is the total pipeline value?',
    'Who are our strategic clients?',
    'Show me upcoming client engagement activities',
  ],
};

// ---------------------------------------------------------------------------
// Persona-specific Suggested Queries
// ---------------------------------------------------------------------------

export const PERSONA_SUGGESTED_QUERIES = {
  'lukas-muller': [
    'Give me a portfolio overview across all projects',
    'What are the top 3 risks I should focus on today?',
    'Show me resource utilization across projects',
    'Which project needs my attention most urgently?',
    'What is the overall schedule health of our portfolio?',
  ],
  'elena-rossi': [
    'What is the cost performance index for each project?',
    'Show me all pending change orders',
    'Which projects are over budget?',
    'What is the forecast at completion for Geneva Lakeside?',
    'Show me the invoice aging report',
  ],
  'sophie-dubois': [
    'What milestones are at risk this month?',
    'Show me open RFIs across my projects',
    'What is the schedule status for Zurich Tower?',
    'Are there any resource shortages I should know about?',
    'Show me the critical path activities for this week',
  ],
  'james-carter': [
    'What is the current pipeline value?',
    'Which deals are closest to closing?',
    'Show me client relationship health scores',
    'What new opportunities should I pursue?',
    'When are the next client meetings scheduled?',
  ],
};

// ---------------------------------------------------------------------------
// NLP Response Mappings (query pattern → mock response)
// ---------------------------------------------------------------------------

export const NLP_RESPONSE_MAPPINGS = [
  {
    patterns: ['budget', 'cost status', 'budget status', 'financial overview'],
    clusterId: 'cost-management',
    response: {
      type: 'cost-summary',
      title: 'Portfolio Cost Summary',
      confidence: 0.94,
      data: {
        totalBudget: 37200000,
        totalActual: 16100000,
        totalForecast: 37050000,
        overallVariance: 150000,
        projects: SAP_COST_REPORTS.map((r) => ({
          name: r.projectName,
          budget: r.totalBudget,
          actual: r.actualCost,
          forecast: r.forecastAtCompletion,
          variance: r.variance,
          status: r.status,
        })),
      },
      sources: ['SAP Financial Module'],
      suggestedFollowUps: [
        'Show me the cost breakdown for the at-risk project',
        'What change orders are pending approval?',
        'What is driving the variance on Geneva Lakeside?',
      ],
    },
  },
  {
    patterns: ['behind schedule', 'delayed', 'schedule delay', 'late'],
    clusterId: 'schedule-tracking',
    response: {
      type: 'schedule-alert',
      title: 'Schedule Delay Report',
      confidence: 0.91,
      data: {
        delayedProjects: PRIMAVERA_SCHEDULES.filter((s) => s.delayDays > 0).map((s) => ({
          name: s.projectName,
          delayDays: s.delayDays,
          spi: s.spiValue,
          forecastEnd: s.forecastEndDate,
          baselineEnd: s.baselineEndDate,
        })),
        onTrackProjects: PRIMAVERA_SCHEDULES.filter((s) => s.delayDays === 0).map((s) => ({
          name: s.projectName,
          spi: s.spiValue,
          forecastEnd: s.forecastEndDate,
        })),
      },
      sources: ['Primavera P6'],
      suggestedFollowUps: [
        'What is causing the delay on Geneva Lakeside?',
        'Show me the acceleration options',
        'What are the liquidated damages implications?',
      ],
    },
  },
  {
    patterns: ['risk', 'top risks', 'risk signals', 'risk exposure'],
    clusterId: 'risk-assessment',
    response: {
      type: 'risk-summary',
      title: 'Active Risk Signals',
      confidence: 0.92,
      data: {
        totalRisks: RISK_SIGNALS.length,
        critical: RISK_SIGNALS.filter((r) => r.severity === 'critical').length,
        high: RISK_SIGNALS.filter((r) => r.severity === 'high').length,
        medium: RISK_SIGNALS.filter((r) => r.severity === 'medium').length,
        low: RISK_SIGNALS.filter((r) => r.severity === 'low').length,
        risks: RISK_SIGNALS,
      },
      sources: ['SAP', 'Procore', 'Primavera P6'],
      suggestedFollowUps: [
        'Show me mitigation actions for the critical risk',
        'What is the financial impact of all active risks?',
        'Which risks are related to Geneva Lakeside?',
      ],
    },
  },
  {
    patterns: ['pipeline', 'sales pipeline', 'opportunities', 'deals'],
    clusterId: 'stakeholder-comms',
    response: {
      type: 'pipeline-summary',
      title: 'Sales Pipeline Overview',
      confidence: 0.93,
      data: {
        totalValue: SALESFORCE_PIPELINE.reduce((sum, o) => sum + o.value, 0),
        totalOpportunities: SALESFORCE_PIPELINE.length,
        weightedValue: SALESFORCE_PIPELINE.reduce((sum, o) => sum + (o.value * o.probability / 100), 0),
        byStage: {
          qualification: SALESFORCE_PIPELINE.filter((o) => o.stage === 'qualification'),
          proposal: SALESFORCE_PIPELINE.filter((o) => o.stage === 'proposal'),
          negotiation: SALESFORCE_PIPELINE.filter((o) => o.stage === 'negotiation'),
          closedWon: SALESFORCE_PIPELINE.filter((o) => o.stage === 'closed-won'),
        },
      },
      sources: ['Salesforce CRM'],
      suggestedFollowUps: [
        'Which deal is most likely to close next?',
        'Show me the details for Lausanne Tech Campus',
        'What is the weighted pipeline value?',
      ],
    },
  },
  {
    patterns: ['rfi', 'rfis', 'request for information'],
    clusterId: 'quality-assurance',
    response: {
      type: 'rfi-summary',
      title: 'RFI Status Report',
      confidence: 0.90,
      data: {
        total: PROCORE_RFIS.length,
        open: PROCORE_RFIS.filter((r) => r.status === 'open').length,
        answered: PROCORE_RFIS.filter((r) => r.status === 'answered').length,
        closed: PROCORE_RFIS.filter((r) => r.status === 'closed').length,
        critical: PROCORE_RFIS.filter((r) => r.priority === 'critical').length,
        rfis: PROCORE_RFIS,
      },
      sources: ['Procore'],
      suggestedFollowUps: [
        'Which RFIs are overdue?',
        'Show me the critical priority RFIs',
        'What is the average RFI response time?',
      ],
    },
  },
  {
    patterns: ['invoice', 'invoices', 'overdue', 'payment'],
    clusterId: 'cost-management',
    response: {
      type: 'invoice-summary',
      title: 'Invoice Status Report',
      confidence: 0.89,
      data: {
        total: SAP_INVOICES.length,
        paid: SAP_INVOICES.filter((i) => i.status === 'paid').length,
        pending: SAP_INVOICES.filter((i) => i.status === 'pending').length,
        overdue: SAP_INVOICES.filter((i) => i.status === 'overdue').length,
        totalOutstanding: SAP_INVOICES.filter((i) => i.status !== 'paid').reduce((sum, i) => sum + i.amount, 0),
        invoices: SAP_INVOICES,
      },
      sources: ['SAP Financial Module'],
      suggestedFollowUps: [
        'Process the overdue invoice payment',
        'Show me invoices due this month',
        'What is the total outstanding amount per project?',
      ],
    },
  },
  {
    patterns: ['resource', 'resources', 'utilization', 'allocation', 'staffing'],
    clusterId: 'schedule-tracking',
    response: {
      type: 'resource-summary',
      title: 'Resource Utilization Report',
      confidence: 0.88,
      data: {
        totalResources: PRIMAVERA_RESOURCES.length,
        averageUtilization: Math.round(PRIMAVERA_RESOURCES.reduce((sum, r) => sum + r.utilization, 0) / PRIMAVERA_RESOURCES.length * 10) / 10,
        resources: PRIMAVERA_RESOURCES,
        byProject: PROCORE_PROJECTS.map((p) => ({
          projectName: p.name,
          resources: PRIMAVERA_RESOURCES.filter((r) => r.projectId === p.id),
        })),
      },
      sources: ['Primavera P6'],
      suggestedFollowUps: [
        'Which resources are under-allocated?',
        'Show me resource conflicts across projects',
        'What additional resources does Geneva Lakeside need?',
      ],
    },
  },
  {
    patterns: ['change order', 'change orders', 'variation', 'scope change'],
    clusterId: 'cost-management',
    response: {
      type: 'change-order-summary',
      title: 'Change Order Report',
      confidence: 0.91,
      data: {
        total: PROCORE_CHANGE_ORDERS.length,
        approved: PROCORE_CHANGE_ORDERS.filter((co) => co.status === 'approved').length,
        pending: PROCORE_CHANGE_ORDERS.filter((co) => co.status === 'pending').length,
        totalApprovedValue: PROCORE_CHANGE_ORDERS.filter((co) => co.status === 'approved').reduce((sum, co) => sum + co.amount, 0),
        totalPendingValue: PROCORE_CHANGE_ORDERS.filter((co) => co.status === 'pending').reduce((sum, co) => sum + co.amount, 0),
        changeOrders: PROCORE_CHANGE_ORDERS,
      },
      sources: ['Procore'],
      suggestedFollowUps: [
        'Approve the pending change orders',
        'What is the cumulative impact on project budgets?',
        'Show me the reasons for each change order',
      ],
    },
  },
  {
    patterns: ['client', 'clients', 'relationship', 'strategic'],
    clusterId: 'stakeholder-comms',
    response: {
      type: 'client-summary',
      title: 'Client Relationship Overview',
      confidence: 0.87,
      data: {
        totalClients: SALESFORCE_CLIENTS.length,
        strategic: SALESFORCE_CLIENTS.filter((c) => c.relationship === 'strategic').length,
        key: SALESFORCE_CLIENTS.filter((c) => c.relationship === 'key').length,
        prospects: SALESFORCE_CLIENTS.filter((c) => c.relationship === 'prospect').length,
        clients: SALESFORCE_CLIENTS,
      },
      sources: ['Salesforce CRM'],
      suggestedFollowUps: [
        'When is the next meeting with Alpine Developments?',
        'Show me revenue by client',
        'Which prospects should we prioritize?',
      ],
    },
  },
  {
    patterns: ['milestone', 'milestones', 'upcoming'],
    clusterId: 'schedule-tracking',
    response: {
      type: 'milestone-summary',
      title: 'Upcoming Milestones',
      confidence: 0.90,
      data: {
        milestones: PRIMAVERA_SCHEDULES.flatMap((s) =>
          s.milestones
            .filter((m) => m.status === 'in-progress' || m.status === 'upcoming')
            .map((m) => ({
              ...m,
              projectName: s.projectName,
              projectId: s.projectId,
            })),
        ),
      },
      sources: ['Primavera P6'],
      suggestedFollowUps: [
        'Which milestones are at risk?',
        'Show me completed milestones this quarter',
        'What resources are needed for the next milestone?',
      ],
    },
  },
];

// ---------------------------------------------------------------------------
// Mock Action Execution Results
// ---------------------------------------------------------------------------

export const ACTION_EXECUTION_RESULTS = {
  'approve-change-order': {
    success: true,
    action: 'Approve Change Order',
    message: 'Change order CO-002 has been approved. Notification sent to project team and finance department.',
    timestamp: new Date().toISOString(),
    details: {
      changeOrderId: 'CO-002',
      amount: 210000,
      currency: 'CHF',
      approvedBy: 'Current User',
      notifiedParties: ['Project Manager', 'Finance Team', 'Client Representative'],
    },
  },
  'process-payment': {
    success: true,
    action: 'Process Invoice Payment',
    message: 'Payment for invoice INV-2024-0453 (CHF 312,000) has been initiated. Expected processing time: 2 business days.',
    timestamp: new Date().toISOString(),
    details: {
      invoiceId: 'INV-2024-0453',
      vendor: 'Concrete Solutions SA',
      amount: 312000,
      currency: 'CHF',
      paymentMethod: 'Bank Transfer',
      estimatedArrival: '2024-11-18',
    },
  },
  'escalate-rfi': {
    success: true,
    action: 'Escalate RFI',
    message: 'RFI-001 has been escalated to the structural engineering lead. Priority upgraded to critical.',
    timestamp: new Date().toISOString(),
    details: {
      rfiId: 'RFI-001',
      previousPriority: 'high',
      newPriority: 'critical',
      escalatedTo: 'Dr. Martin Weber, Structural Engineering Lead',
      deadline: '2024-11-17',
    },
  },
  'schedule-meeting': {
    success: true,
    action: 'Schedule Client Meeting',
    message: 'Meeting with Lac Léman Properties has been scheduled for November 20, 2024 at 10:00 AM.',
    timestamp: new Date().toISOString(),
    details: {
      client: 'Lac Léman Properties',
      contact: 'Marie Fontaine',
      date: '2024-11-20',
      time: '10:00',
      location: 'Geneva Office - Conference Room A',
      agenda: ['Project status update', 'Schedule recovery plan', 'Change order discussion'],
    },
  },
  'generate-report': {
    success: true,
    action: 'Generate Report',
    message: 'Monthly portfolio report has been generated and is ready for download.',
    timestamp: new Date().toISOString(),
    details: {
      reportType: 'Monthly Portfolio Summary',
      period: 'November 2024',
      format: 'PDF',
      pages: 24,
      sections: ['Executive Summary', 'Cost Performance', 'Schedule Performance', 'Risk Register', 'Upcoming Milestones'],
    },
  },
  'add-weekend-shift': {
    success: true,
    action: 'Add Weekend Shift',
    message: 'Weekend shifts have been scheduled for Geneva Lakeside Residences interior fit-out crew for the next 4 weekends.',
    timestamp: new Date().toISOString(),
    details: {
      projectId: 'PRJ-2024-002',
      projectName: 'Geneva Lakeside Residences',
      activity: 'Interior Fit-Out',
      weekends: 4,
      additionalCost: 48000,
      currency: 'CHF',
      expectedRecovery: '18 days',
    },
  },
};

// ---------------------------------------------------------------------------
// Mock NLP Query Processor
// ---------------------------------------------------------------------------

/**
 * Simulates an NLP query by matching the input against known patterns.
 * Returns a mock response object with data, sources, and follow-up suggestions.
 *
 * @param {string} query - The natural language query string.
 * @param {string|null} [personaId=null] - The active persona ID for context.
 * @returns {{ success: boolean, query: string, clusterId: string|null, response: object|null, timestamp: string }}
 */
export function processQuery(query, personaId = null) {
  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    return {
      success: false,
      query: '',
      clusterId: null,
      response: null,
      timestamp: new Date().toISOString(),
    };
  }

  const normalizedQuery = query.trim().toLowerCase();

  for (const mapping of NLP_RESPONSE_MAPPINGS) {
    const matched = mapping.patterns.some((pattern) => normalizedQuery.includes(pattern));
    if (matched) {
      return {
        success: true,
        query: query.trim(),
        clusterId: mapping.clusterId,
        response: {
          ...mapping.response,
          persona: personaId,
          processedAt: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Fallback: try matching against intelligence cluster keywords
  for (const cluster of INTELLIGENCE_CLUSTERS) {
    const keywordMatch = cluster.keywords.some((kw) => normalizedQuery.includes(kw));
    if (keywordMatch) {
      return {
        success: true,
        query: query.trim(),
        clusterId: cluster.id,
        response: {
          type: 'general',
          title: `${cluster.label} Insights`,
          confidence: 0.72,
          data: {
            message: `Based on your query about ${cluster.label.toLowerCase()}, here is a summary of relevant information across your portfolio.`,
            relatedProjects: PROCORE_PROJECTS.map((p) => ({
              name: p.name,
              status: p.status,
              percentComplete: p.percentComplete,
            })),
          },
          sources: ['SAP', 'Procore', 'Primavera P6', 'Salesforce CRM'],
          suggestedFollowUps: SUGGESTED_QUERIES[cluster.id]?.slice(0, 3) || [],
          persona: personaId,
          processedAt: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      };
    }
  }

  // No match found
  return {
    success: true,
    query: query.trim(),
    clusterId: null,
    response: {
      type: 'no-match',
      title: 'Query Not Recognized',
      confidence: 0.3,
      data: {
        message: 'I wasn\'t able to find a specific match for your query. Try asking about budgets, schedules, risks, RFIs, or the sales pipeline.',
        suggestedQueries: [
          'What is the current budget status across all projects?',
          'Which projects are behind schedule?',
          'What are the top risks across all projects?',
          'Show me the sales pipeline summary',
          'Are there any open RFIs?',
        ],
      },
      sources: [],
      suggestedFollowUps: [],
      persona: personaId,
      processedAt: new Date().toISOString(),
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Simulates executing an action and returns a mock result.
 *
 * @param {string} actionId - The action identifier (e.g. 'approve-change-order').
 * @param {object} [params={}] - Optional parameters for the action.
 * @returns {{ success: boolean, result: object|null, error: string|null, timestamp: string }}
 */
export function executeAction(actionId, params = {}) {
  if (!actionId || typeof actionId !== 'string' || actionId.trim().length === 0) {
    return {
      success: false,
      result: null,
      error: 'Action ID is required.',
      timestamp: new Date().toISOString(),
    };
  }

  const result = ACTION_EXECUTION_RESULTS[actionId.trim()];

  if (!result) {
    return {
      success: false,
      result: null,
      error: `Unknown action: ${actionId}. Available actions: ${Object.keys(ACTION_EXECUTION_RESULTS).join(', ')}`,
      timestamp: new Date().toISOString(),
    };
  }

  return {
    success: true,
    result: {
      ...result,
      params,
      executedAt: new Date().toISOString(),
    },
    error: null,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Returns suggested queries based on the active persona and/or intelligence cluster.
 *
 * @param {string|null} [personaId=null] - The active persona ID.
 * @param {string|null} [clusterId=null] - The intelligence cluster ID.
 * @returns {string[]} An array of suggested query strings.
 */
export function getSuggestedQueries(personaId = null, clusterId = null) {
  const suggestions = [];

  if (personaId && PERSONA_SUGGESTED_QUERIES[personaId]) {
    suggestions.push(...PERSONA_SUGGESTED_QUERIES[personaId]);
  }

  if (clusterId && SUGGESTED_QUERIES[clusterId]) {
    suggestions.push(...SUGGESTED_QUERIES[clusterId]);
  }

  if (suggestions.length === 0) {
    suggestions.push(
      'What is the current budget status across all projects?',
      'Which projects are behind schedule?',
      'What are the top risks across all projects?',
      'Show me the sales pipeline summary',
      'Are there any open RFIs?',
    );
  }

  // Deduplicate
  return [...new Set(suggestions)];
}

/**
 * Returns a project summary by project ID.
 *
 * @param {string} projectId - The project ID to look up.
 * @returns {object|null} A combined summary object or null if not found.
 */
export function getProjectSummary(projectId) {
  if (!projectId || typeof projectId !== 'string') {
    return null;
  }

  const project = PROCORE_PROJECTS.find((p) => p.id === projectId);
  if (!project) {
    return null;
  }

  const costReport = SAP_COST_REPORTS.find((r) => r.projectId === projectId) || null;
  const schedule = PRIMAVERA_SCHEDULES.find((s) => s.projectId === projectId) || null;
  const resources = PRIMAVERA_RESOURCES.filter((r) => r.projectId === projectId);
  const rfis = PROCORE_RFIS.filter((r) => r.projectId === projectId);
  const changeOrders = PROCORE_CHANGE_ORDERS.filter((co) => co.projectId === projectId);
  const invoices = SAP_INVOICES.filter((i) => i.projectId === projectId);
  const risks = RISK_SIGNALS.filter((r) => r.projectId === projectId);

  return {
    project,
    costReport,
    schedule,
    resources,
    rfis,
    changeOrders,
    invoices,
    risks,
  };
}

/**
 * Returns a dashboard summary with key metrics across all projects.
 *
 * @returns {object} An object containing portfolio-level KPIs.
 */
export function getDashboardSummary() {
  const totalBudget = SAP_COST_REPORTS.reduce((sum, r) => sum + r.totalBudget, 0);
  const totalActual = SAP_COST_REPORTS.reduce((sum, r) => sum + r.actualCost, 0);
  const totalForecast = SAP_COST_REPORTS.reduce((sum, r) => sum + r.forecastAtCompletion, 0);
  const totalVariance = SAP_COST_REPORTS.reduce((sum, r) => sum + r.variance, 0);

  const activeProjects = PROCORE_PROJECTS.filter((p) => p.status === 'active').length;
  const avgCompletion = Math.round(PROCORE_PROJECTS.reduce((sum, p) => sum + p.percentComplete, 0) / PROCORE_PROJECTS.length);

  const openRfis = PROCORE_RFIS.filter((r) => r.status === 'open').length;
  const pendingChangeOrders = PROCORE_CHANGE_ORDERS.filter((co) => co.status === 'pending').length;
  const overdueInvoices = SAP_INVOICES.filter((i) => i.status === 'overdue').length;

  const criticalRisks = RISK_SIGNALS.filter((r) => r.severity === 'critical').length;
  const highRisks = RISK_SIGNALS.filter((r) => r.severity === 'high').length;

  const pipelineValue = SALESFORCE_PIPELINE.reduce((sum, o) => sum + o.value, 0);
  const weightedPipeline = Math.round(SALESFORCE_PIPELINE.reduce((sum, o) => sum + (o.value * o.probability / 100), 0));

  return {
    financial: {
      totalBudget,
      totalActual,
      totalForecast,
      totalVariance,
      currency: 'CHF',
    },
    projects: {
      activeProjects,
      avgCompletion,
      totalProjects: PROCORE_PROJECTS.length,
    },
    issues: {
      openRfis,
      pendingChangeOrders,
      overdueInvoices,
    },
    risks: {
      total: RISK_SIGNALS.length,
      critical: criticalRisks,
      high: highRisks,
    },
    pipeline: {
      totalValue: pipelineValue,
      weightedValue: weightedPipeline,
      totalOpportunities: SALESFORCE_PIPELINE.length,
      currency: 'CHF',
    },
  };
}