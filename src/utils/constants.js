/**
 * Application-wide constants and configuration values
 * for Ask Dreeso Memory
 */

// ---------------------------------------------------------------------------
// localStorage keys
// ---------------------------------------------------------------------------
export const STORAGE_KEYS = {
  USERS: 'ADM_USERS',
  SESSION: 'ADM_SESSION',
  PERSONAS: 'ADM_PERSONAS',
  AUDIT_LOG: 'ADM_AUDIT_LOG',
};

// ---------------------------------------------------------------------------
// Design-system color tokens (mirrors tailwind.config.js extend.colors)
// ---------------------------------------------------------------------------
export const COLORS = {
  ACCENT_BLUE: '#4E84C4',
  ACCENT_BLUE_LIGHT: '#6B9FD4',
  SUCCESS: '#54B948',
  SUCCESS_LIGHT: '#6FCF64',
  WARNING: '#FBB034',
  WARNING_LIGHT: '#FCC860',
  CRITICAL: '#F15A29',
  CRITICAL_LIGHT: '#F47D5A',
  BG_DARK: '#0A1A2F',
  BG_DARK_SECONDARY: '#1E2A44',
  WHITE: '#FFFFFF',
  TEXT_PRIMARY: '#FFFFFF',
  TEXT_SECONDARY: 'rgba(255, 255, 255, 0.7)',
  TEXT_MUTED: 'rgba(255, 255, 255, 0.4)',
  GLASS_BORDER: 'rgba(78, 132, 196, 0.15)',
  GLASS_BG: 'rgba(30, 42, 68, 0.6)',
};

// ---------------------------------------------------------------------------
// Persona definitions
// ---------------------------------------------------------------------------
export const PERSONAS = [
  {
    id: 'lukas-muller',
    name: 'Lukas Müller',
    role: 'Project Director',
    avatar: 'LM',
    color: COLORS.ACCENT_BLUE,
    description: 'Oversees project execution, resource allocation, and strategic planning across all active engagements.',
  },
  {
    id: 'elena-rossi',
    name: 'Elena Rossi',
    role: 'Senior QS',
    avatar: 'ER',
    color: COLORS.SUCCESS,
    description: 'Leads quantity surveying, cost estimation, and financial oversight for construction projects.',
  },
  {
    id: 'sophie-dubois',
    name: 'Sophie Dubois',
    role: 'Project Manager',
    avatar: 'SD',
    color: COLORS.WARNING,
    description: 'Manages day-to-day project operations, timelines, and stakeholder communication.',
  },
  {
    id: 'james-carter',
    name: 'James Carter',
    role: 'Sales Director',
    avatar: 'JC',
    color: COLORS.CRITICAL,
    description: 'Drives business development, client relationships, and revenue growth strategies.',
  },
];

// ---------------------------------------------------------------------------
// Intelligence cluster definitions
// ---------------------------------------------------------------------------
export const INTELLIGENCE_CLUSTERS = [
  {
    id: 'cost-management',
    label: 'Cost Management',
    color: COLORS.ACCENT_BLUE,
    keywords: ['budget', 'cost', 'expense', 'estimate', 'valuation', 'invoice'],
  },
  {
    id: 'schedule-tracking',
    label: 'Schedule Tracking',
    color: COLORS.WARNING,
    keywords: ['timeline', 'schedule', 'deadline', 'milestone', 'delay', 'progress'],
  },
  {
    id: 'risk-assessment',
    label: 'Risk Assessment',
    color: COLORS.CRITICAL,
    keywords: ['risk', 'issue', 'blocker', 'hazard', 'mitigation', 'contingency'],
  },
  {
    id: 'quality-assurance',
    label: 'Quality Assurance',
    color: COLORS.SUCCESS,
    keywords: ['quality', 'inspection', 'compliance', 'standard', 'defect', 'audit'],
  },
  {
    id: 'stakeholder-comms',
    label: 'Stakeholder Communications',
    color: COLORS.ACCENT_BLUE_LIGHT,
    keywords: ['client', 'stakeholder', 'meeting', 'report', 'update', 'communication'],
  },
];

// ---------------------------------------------------------------------------
// Role options (for user management)
// ---------------------------------------------------------------------------
export const ROLE_OPTIONS = [
  { value: 'admin', label: 'Administrator' },
  { value: 'manager', label: 'Manager' },
  { value: 'analyst', label: 'Analyst' },
  { value: 'viewer', label: 'Viewer' },
];

// ---------------------------------------------------------------------------
// Session & audit configuration
// ---------------------------------------------------------------------------
export const SESSION_TIMEOUT_MS = Number(
  import.meta.env.VITE_SESSION_TIMEOUT_MS ?? 1800000,
);

export const AUDIT_LOG_MAX_ENTRIES = Number(
  import.meta.env.VITE_AUDIT_LOG_MAX_ENTRIES ?? 500,
);

// ---------------------------------------------------------------------------
// NLP API
// ---------------------------------------------------------------------------
export const NLP_API_URL =
  import.meta.env.VITE_NLP_API_URL ?? 'http://localhost:3001/api/nlp';

// ---------------------------------------------------------------------------
// Animation timing values (seconds, for framer-motion)
// ---------------------------------------------------------------------------
export const ANIMATION = {
  FAST: 0.15,
  NORMAL: 0.3,
  SLOW: 0.5,
  SPRING: { type: 'spring', stiffness: 300, damping: 24 },
  EASE_OUT: { duration: 0.3, ease: 'easeOut' },
  EASE_IN_OUT: { duration: 0.3, ease: 'easeInOut' },
  FADE_IN: { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3 } },
  SLIDE_UP: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  SLIDE_DOWN: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  SCALE_IN: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.25, ease: 'easeOut' },
  },
  STAGGER_CHILDREN: { staggerChildren: 0.06 },
};

// ---------------------------------------------------------------------------
// App metadata
// ---------------------------------------------------------------------------
export const APP_TITLE = import.meta.env.VITE_APP_TITLE ?? 'Ask Dreeso Memory';