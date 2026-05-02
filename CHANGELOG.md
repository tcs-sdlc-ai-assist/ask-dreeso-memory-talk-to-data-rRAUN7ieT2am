# Changelog

All notable changes to the **Ask Dreeso Memory** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [1.0.0] - 2024-11-15

### Added

#### Authentication System
- User signup with full name, email, password, confirm password, and role selection.
- Real-time field validation with inline error messages (email format, password strength, confirm match, role selection).
- User login with email and password credentials.
- Persona quick-login for four predefined personas: Lukas Müller (Project Director), Elena Rossi (Senior QS), Sophie Dubois (Project Manager), and James Carter (Sales Director).
- Session management with configurable timeout (`VITE_SESSION_TIMEOUT_MS`, default 30 minutes).
- Automatic session expiration check on a 60-second interval.
- Persona switching on active sessions via `PersonaService`.
- Protected route guard (`ProtectedRoute`) redirecting unauthenticated users to `/login`.
- `AuthContext` provider exposing `user`, `persona`, `isAuthenticated`, `loading`, `login`, `signup`, `logout`, `switchPersona`, `personaQuickLogin`, and `refreshSession`.

#### Intelligence Clusters
- Five intelligence cluster domains: Cost Management, Schedule Tracking, Risk Assessment, Quality Assurance, and Stakeholder Communications.
- `IntelligenceClusterPanel` with responsive grid layout (3 columns desktop, 2 tablet, 1 mobile).
- `ClusterCard` component with unique accent color, icon, gradient bar, description, and up to 4 suggested queries per domain.
- Cluster selection/deselection with active state badge and filtering indicator.
- Keyboard accessibility (Enter/Space to select, tab navigation).
- Staggered Framer Motion entry animations.

#### Natural Language Query Processing
- `QueryBar` component with bottom-aligned input, microphone icon, submit button, and loading spinner.
- Mock NLP query processor matching input against known patterns (budget, schedule, risk, pipeline, RFI, invoice, resource, change order, client, milestone).
- Cluster keyword fallback matching for unrecognized patterns.
- No-match response with suggested alternative queries.
- Query validation (non-empty, max 500 characters).
- `QueryContext` provider managing `currentQuery`, `queryHistory`, `activeResponse`, `loading`, `error`, `selectedCluster`, and `ctaSuggestions`.

#### Multi-System Orchestration
- `SystemConnector` service simulating connections to four enterprise systems: SAP, Procore, Salesforce, and Primavera.
- Simulated network latency (150–600ms) for realistic UX.
- Circuit breaker pattern with configurable threshold (3 failures) and cooldown (60 seconds).
- Retry logic with exponential backoff (up to 2 retries).
- `fetchFromMultipleSystems` for parallel data fetching across systems.
- `determineTargetSystems` mapping intelligence clusters to system/data-type pairs.
- `OrchestrationService` coordinating end-to-end query processing: validation → rate limiting → cache check → NLP parsing → system fetch → aggregation → CTA generation → source indicators → audit logging → caching.
- In-memory query result cache with 5-minute TTL.
- Per-user rate limiting (10 queries per minute).

#### Response Components
- `ResponseCard` rendering structured analytical output based on response type (cost-summary, schedule-alert, risk-summary, pipeline-summary, rfi-summary, invoice-summary, resource-summary, change-order-summary, client-summary, milestone-summary, general, no-match).
- `DataTable` component with sortable columns, zebra-striped rows, fixed headers (desktop), stacked cards (tablet), and horizontal carousel (mobile).
- `RiskSignal` component displaying color-coded severity badges (critical, high, medium, low), descriptions, affected areas, probability scores, and recommended actions.
- `ForecastModel` component with SPI/CPI trend indicators, confidence meters, monthly forecast charts (planned vs actual vs forecast), delay tracking, and variance display.
- `CTABubble` component for contextual follow-up query suggestions with hover/tap animations.
- `SourceTransparencyPanel` displaying live source indicators with colored status dots (green = active, yellow = connected, red = unavailable), pulsing animation, system labels, contribution percentages, and data freshness timestamps.

#### Action Execution Layer
- `ActionDispatcher` service with six registered actions: Approve Change Order, Process Invoice Payment, Escalate RFI, Schedule Client Meeting, Generate Report, and Add Weekend Shift.
- Action validation against available actions registry with required parameter checks.
- Target system availability verification before execution.
- `ActionExecutor` modal component with confirmation dialog, action type icon, category badge, target system indicator, parameter summary, impact warning, confirm/cancel buttons, loading state, and success/failure result display.
- In-memory action execution history with dispatch ID tracking.
- `getActionStatus` for querying previously dispatched actions.

#### Result Aggregation
- `ResultAggregator` service normalizing field names across systems (e.g., `totalBudget` → `budget`, `spiValue` → `spi`).
- `buildSourceMap` generating source attribution for the transparency panel.
- `aggregateResults` merging data from multiple system connectors with metadata (total systems, successful/failed counts, record counts).
- `extractData` for filtered data retrieval from aggregated results.
- `mergeAggregatedResults` for combining results across clusters.

#### Audit Logging
- `AuditLogger` service recording all user actions to localStorage.
- Supported action types: `signup`, `login`, `logout`, `query`, `action_execution`, `persona_switch`.
- Configurable maximum entries (`VITE_AUDIT_LOG_MAX_ENTRIES`, default 500) with automatic trimming.
- `AuditLogPage` with searchable, filterable DataTable display.
- Action type filter dropdown and summary badges with counts.
- Export audit log as JSON download.
- Clear all entries with confirmation modal.
- Refresh, export, and clear action buttons.

#### UI/UX Design System
- Glassmorphism card styling (`glass`, `glass-light`, `glass-card`, `glass-input`) with backdrop blur and translucent borders.
- Gradient background (#0A1A2F → #1E2A44) with fixed attachment.
- Urbanist font family (weights 300–800) loaded via Google Fonts.
- Design token constants: `COLORS`, `ANIMATION`, `PERSONAS`, `INTELLIGENCE_CLUSTERS`, `ROLE_OPTIONS`.
- Tailwind CSS configuration with custom colors (`accent-blue`, `success`, `warning`, `critical`, `bg-dark`), border radius (`card`, `bubble`), and font family (`urbanist`).
- Custom scrollbar styling with accent-blue thumb.
- Framer Motion animations: fade-in, slide-up, slide-down, scale-in, spring, stagger children.
- `LoadingSpinner` component with three size variants (sm/md/lg) and optional loading text.
- `ErrorBanner` component with error/warning/session types, retry button, and dismiss button.
- `PersonaBar` with real-time clock, avatar, role badge, and logout button.
- `AppLayout` with 12-column grid, responsive spacing, and fixed PersonaBar.

#### Pages
- `LoginScreen` with email/password form, persona quick-login grid, forgot password alert, and signup link.
- `SignupScreen` with full name, email, password, confirm password, and role selection form.
- `HomePage` with welcome greeting (time-based), intelligence cluster panel, recent query history (last 5), and bottom-aligned query bar.
- `QueryResultsPage` with query header, response card, CTA suggestions, available actions, source transparency panel, and query bar.
- `AuditLogPage` with search, filter, export, clear, and DataTable display.
- `NotFoundPage` (404) with gradient text, warning icon, and back-to-home link.

#### Routing
- Client-side routing via `react-router-dom` v6 with `createBrowserRouter`.
- Routes: `/` (redirect), `/login`, `/signup`, `/home` (protected), `/results` (protected), `/audit` (protected), `*` (404).
- `RootRedirect` component checking auth state for index route.
- Vercel SPA rewrite configuration (`vercel.json`).

#### Testing
- Unit tests for `AuthService` (signup, login, logout, session management, expiration, audit logging).
- Unit tests for `OrchestrationService` (query validation, NLP processing, multi-system orchestration, caching, rate limiting, action execution, CTA suggestions, system health).
- Component tests for `IntelligenceClusterPanel` (rendering, selection, keyboard accessibility, suggested queries).
- Component tests for `ResponseCard` (all response types, CTA bubbles, source transparency, glassmorphism styling).
- Component tests for `LoginScreen` (rendering, validation, login flow, persona quick-login, navigation, audit logging).
- Test setup with `@testing-library/jest-dom`, `@testing-library/react`, `@testing-library/user-event`, and localStorage mock.
- Vitest configuration with jsdom environment and v8 coverage provider.

#### Data Layer
- Mock data for SAP (cost reports, invoices), Procore (projects, RFIs, change orders), Salesforce (pipeline, clients), and Primavera (schedules, resources).
- Three Swiss construction projects: Zurich Tower Complex, Geneva Lakeside Residences, Basel Innovation Hub.
- Five risk signals across cost, schedule, and quality categories.
- Cost and schedule forecast models with monthly projections.
- Suggested queries per intelligence cluster and per persona.
- Mock action execution results for all six registered actions.