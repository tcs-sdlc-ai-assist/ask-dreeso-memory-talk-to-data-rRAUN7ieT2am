# Ask Dreeso Memory

A multi-system intelligence platform for Swiss construction project management. Built with React, Vite, and Tailwind CSS, Ask Dreeso Memory provides natural language query processing across enterprise systems (SAP, Procore, Salesforce, Primavera) with glassmorphism UI design and real-time analytical responses.

---

## Tech Stack

- **React 18** — Component-based UI with hooks and context providers
- **Vite 5** — Fast development server and optimized production builds
- **Tailwind CSS 3** — Utility-first styling with custom design tokens
- **Framer Motion 11** — Declarative animations and transitions
- **React Router 6** — Client-side routing with protected routes
- **Vitest** — Unit and component testing with jsdom environment
- **PropTypes** — Runtime prop validation for all components

---

## Features

### Authentication System
- User signup with full name, email, password, confirm password, and role selection
- Real-time field validation with inline error messages
- User login with email and password credentials
- Persona quick-login for four predefined personas (Lukas Müller, Elena Rossi, Sophie Dubois, James Carter)
- Session management with configurable timeout (default 30 minutes)
- Automatic session expiration check on a 60-second interval
- Protected route guard redirecting unauthenticated users to `/login`

### Intelligence Clusters
- Five intelligence cluster domains: Cost Management, Schedule Tracking, Risk Assessment, Quality Assurance, and Stakeholder Communications
- Responsive grid layout (3 columns desktop, 2 tablet, 1 mobile)
- Cluster selection/deselection with active state badge and filtering indicator
- Keyboard accessibility (Enter/Space to select, tab navigation)
- Staggered Framer Motion entry animations

### Natural Language Query Processing
- Bottom-aligned query input bar with microphone icon, submit button, and loading spinner
- Mock NLP query processor matching input against known patterns (budget, schedule, risk, pipeline, RFI, invoice, resource, change order, client, milestone)
- Cluster keyword fallback matching for unrecognized patterns
- No-match response with suggested alternative queries
- Query validation (non-empty, max 500 characters)

### Multi-System Orchestration
- Simulated connections to four enterprise systems: SAP, Procore, Salesforce, and Primavera
- Simulated network latency (150–600ms) for realistic UX
- Circuit breaker pattern with configurable threshold (3 failures) and cooldown (60 seconds)
- Retry logic with exponential backoff (up to 2 retries)
- Parallel data fetching across systems
- In-memory query result cache with 5-minute TTL
- Per-user rate limiting (10 queries per minute)

### Response Components
- Structured analytical output based on response type (cost-summary, schedule-alert, risk-summary, pipeline-summary, rfi-summary, invoice-summary, resource-summary, change-order-summary, client-summary, milestone-summary, general, no-match)
- Sortable data tables with zebra-striped rows, fixed headers (desktop), stacked cards (tablet), and horizontal carousel (mobile)
- Color-coded risk severity badges (critical, high, medium, low) with descriptions, affected areas, probability scores, and recommended actions
- SPI/CPI trend indicators, confidence meters, monthly forecast charts, delay tracking, and variance display
- Contextual follow-up query suggestion bubbles (CTA bubbles)
- Live source indicators with colored status dots (green = active, yellow = connected, red = unavailable) and pulsing animation

### Action Execution Layer
- Six registered actions: Approve Change Order, Process Invoice Payment, Escalate RFI, Schedule Client Meeting, Generate Report, and Add Weekend Shift
- Confirmation dialog with action type icon, category badge, target system indicator, parameter summary, and impact warning
- Loading state during execution and success/failure result display

### Audit Logging
- All user actions recorded to localStorage (signup, login, logout, query, action_execution, persona_switch)
- Configurable maximum entries (default 500) with automatic trimming
- Searchable, filterable audit log page with DataTable display
- Export audit log as JSON download
- Clear all entries with confirmation modal

### UI/UX Design System
- Glassmorphism card styling with backdrop blur and translucent borders
- Gradient background (#0A1A2F → #1E2A44) with fixed attachment
- Urbanist font family (weights 300–800) loaded via Google Fonts
- Custom scrollbar styling with accent-blue thumb
- Framer Motion animations: fade-in, slide-up, slide-down, scale-in, spring, stagger children

---

## Folder Structure

```
ask-dreeso-memory/
├── index.html                          # HTML entry point
├── package.json                        # Dependencies and scripts
├── vite.config.js                      # Vite configuration
├── vitest.config.js                    # Vitest test configuration
├── tailwind.config.js                  # Tailwind CSS configuration
├── postcss.config.js                   # PostCSS configuration
├── vercel.json                         # Vercel SPA rewrite rules
├── .env.example                        # Environment variable template
├── CHANGELOG.md                        # Project changelog
├── README.md                           # Project documentation
└── src/
    ├── main.jsx                        # React DOM entry point
    ├── App.jsx                         # Root component with providers
    ├── router.jsx                      # Client-side routing configuration
    ├── index.css                       # Global styles and Tailwind directives
    ├── components/
    │   ├── actions/
    │   │   └── ActionExecutor.jsx      # Action confirmation and execution modal
    │   ├── clusters/
    │   │   ├── ClusterCard.jsx         # Single intelligence cluster card
    │   │   ├── IntelligenceClusterPanel.jsx  # Cluster grid panel
    │   │   └── __tests__/
    │   │       └── IntelligenceClusterPanel.test.jsx
    │   ├── common/
    │   │   ├── ErrorBanner.jsx         # Error notification banner
    │   │   ├── LoadingSpinner.jsx      # Loading state indicator
    │   │   └── ProtectedRoute.jsx      # Authentication route guard
    │   ├── layout/
    │   │   ├── AppLayout.jsx           # Main application layout wrapper
    │   │   └── PersonaBar.jsx          # User info bar with clock and logout
    │   ├── query/
    │   │   └── QueryBar.jsx            # Natural language query input
    │   └── response/
    │       ├── CTABubble.jsx           # Follow-up query suggestion bubble
    │       ├── DataTable.jsx           # Responsive sortable data table
    │       ├── ForecastModel.jsx       # Forecast and projection display
    │       ├── ResponseCard.jsx        # Structured analytical output card
    │       ├── RiskSignal.jsx          # Risk severity indicator display
    │       ├── SourceTransparencyPanel.jsx  # System source indicators
    │       └── __tests__/
    │           └── ResponseCard.test.jsx
    ├── context/
    │   ├── AuthContext.jsx             # Authentication state provider
    │   └── QueryContext.jsx            # Query state provider
    ├── data/
    │   └── mockData.js                 # Mock data for all enterprise systems
    ├── pages/
    │   ├── AuditLogPage.jsx            # Audit log viewer page
    │   ├── HomePage.jsx                # Main landing page
    │   ├── LoginScreen.jsx             # Login page
    │   ├── NotFoundPage.jsx            # 404 error page
    │   ├── QueryResultsPage.jsx        # Query results display page
    │   ├── SignupScreen.jsx            # Registration page
    │   └── __tests__/
    │       └── LoginScreen.test.jsx
    ├── services/
    │   ├── ActionDispatcher.js         # Action execution dispatch service
    │   ├── AuditLogger.js              # Audit logging service
    │   ├── AuthService.js              # Authentication service
    │   ├── LocalStorageService.js      # localStorage abstraction layer
    │   ├── OrchestrationService.js     # Central query orchestration service
    │   ├── PersonaService.js           # Persona management service
    │   ├── ResultAggregator.js         # Multi-system result aggregation
    │   ├── SystemConnector.js          # Enterprise system integration layer
    │   └── __tests__/
    │       ├── AuthService.test.js
    │       └── OrchestrationService.test.js
    ├── test/
    │   └── setup.js                    # Test setup with jest-dom and localStorage mock
    └── utils/
        ├── constants.js                # Application-wide constants and tokens
        └── ValidationUtils.js          # Form validation utilities
```

---

## Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x (or equivalent package manager)

---

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd ask-dreeso-memory
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example environment file and adjust values as needed:

```bash
cp .env.example .env
```

Available environment variables:

| Variable | Default | Description |
|---|---|---|
| `VITE_APP_TITLE` | `Ask Dreeso Memory` | Application title displayed in the UI |
| `VITE_NLP_API_URL` | `http://localhost:3001/api/nlp` | NLP API endpoint (unused in mock mode) |
| `VITE_SESSION_TIMEOUT_MS` | `1800000` | Session timeout in milliseconds (30 minutes) |
| `VITE_AUDIT_LOG_MAX_ENTRIES` | `500` | Maximum audit log entries before trimming |

### 4. Start the development server

```bash
npm run dev
```

The application will be available at [http://localhost:5173](http://localhost:5173).

### 5. Quick start with persona login

On the login screen, use one of the four persona quick-login buttons to immediately access the application without creating an account:

- **Lukas Müller** — Project Director
- **Elena Rossi** — Senior QS
- **Sophie Dubois** — Project Manager
- **James Carter** — Sales Director

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite development server with hot module replacement |
| `npm run build` | Build the production bundle to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run test` | Run all tests with Vitest |
| `npm run lint` | Run ESLint across all `.js` and `.jsx` files |

---

## Building for Production

```bash
npm run build
```

This generates an optimized production build in the `dist/` directory. The output includes:

- Minified JavaScript bundles with code splitting
- Optimized CSS with Tailwind purging
- Static assets with content hashing

To preview the production build locally:

```bash
npm run preview
```

---

## Deployment

### Vercel

The project includes a `vercel.json` configuration for SPA routing. Deploy directly from the repository:

1. Connect the repository to Vercel
2. Set the build command to `npm run build`
3. Set the output directory to `dist`
4. Configure environment variables in the Vercel dashboard

### Other Platforms

For any static hosting platform, build the project and serve the `dist/` directory. Ensure all routes are rewritten to `index.html` for client-side routing to work correctly.

---

## Testing

The project uses [Vitest](https://vitest.dev/) with [Testing Library](https://testing-library.com/) for unit and component tests.

### Run all tests

```bash
npm run test
```

### Run tests in watch mode

```bash
npx vitest --watch
```

### Run tests with coverage

```bash
npx vitest --coverage
```

### Test structure

- **Service tests** (`src/services/__tests__/`) — Unit tests for AuthService, OrchestrationService, and other service modules
- **Component tests** (`src/components/**/__tests__/`) — Component tests for IntelligenceClusterPanel, ResponseCard, and other UI components
- **Page tests** (`src/pages/__tests__/`) — Integration tests for LoginScreen and other page components

### Test configuration

- **Environment:** jsdom
- **Setup file:** `src/test/setup.js` (includes `@testing-library/jest-dom` matchers and localStorage mock)
- **Coverage provider:** v8

---

## Routing

| Path | Component | Auth Required | Description |
|---|---|---|---|
| `/` | `RootRedirect` | No | Redirects to `/home` or `/login` based on auth state |
| `/login` | `LoginScreen` | No | User login and persona quick-login |
| `/signup` | `SignupScreen` | No | User registration |
| `/home` | `HomePage` | Yes | Main landing page with clusters and query bar |
| `/results` | `QueryResultsPage` | Yes | Query results with response cards and actions |
| `/audit` | `AuditLogPage` | Yes | Audit log viewer with search and export |
| `*` | `NotFoundPage` | No | 404 error page |

---

## Data Layer

All data is mocked locally — no external API calls are required. The mock data layer includes:

- **SAP:** Cost reports, invoices, cost forecasts for 3 Swiss construction projects
- **Procore:** Projects, RFIs, change orders
- **Salesforce:** Sales pipeline opportunities, client records
- **Primavera:** Schedules, resources, schedule forecasts
- **Risk signals:** 5 risk signals across cost, schedule, and quality categories
- **Forecast models:** Cost and schedule forecasts with monthly projections

### Projects

| ID | Name | Status | Completion |
|---|---|---|---|
| PRJ-2024-001 | Zurich Tower Complex | Active | 58% |
| PRJ-2024-002 | Geneva Lakeside Residences | Active | 72% |
| PRJ-2024-003 | Basel Innovation Hub | Active | 22% |

---

## License

This project is private and proprietary.