import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/common/ProtectedRoute.jsx';
import LoginScreen from './pages/LoginScreen.jsx';
import SignupScreen from './pages/SignupScreen.jsx';
import HomePage from './pages/HomePage.jsx';
import QueryResultsPage from './pages/QueryResultsPage.jsx';
import AuditLogPage from './pages/AuditLogPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

/**
 * AuthRedirect renders a Navigate to /home if the user is authenticated,
 * or to /login if not. Used as the index route element.
 *
 * Because this component is rendered inside the RouterProvider (not inside
 * AuthProvider directly), we lazily import useAuth and handle the check
 * at render time.
 */
function AuthRedirect() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { useAuth } = require('./context/AuthContext.jsx');
  // We cannot use a hook from a require — instead we inline the logic below.
  // Actually, we need a proper React component approach.
  return null;
}

// We need a small wrapper component that can use hooks.
// Since we cannot use require() with hooks, we create a proper component.

import { useAuth } from './context/AuthContext.jsx';

/**
 * RootRedirect checks authentication status and redirects accordingly.
 * - Authenticated users are sent to /home.
 * - Unauthenticated users are sent to /login.
 * - While loading, renders nothing to avoid flash.
 *
 * @returns {React.ReactElement|null}
 */
function RootRedirect() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return <Navigate to="/login" replace />;
}

/**
 * Application router configuration using createBrowserRouter.
 *
 * Routes:
 * - /          → Redirects to /home (authenticated) or /login (unauthenticated)
 * - /login     → LoginScreen
 * - /signup    → SignupScreen
 * - /home      → HomePage (protected)
 * - /results   → QueryResultsPage (protected)
 * - /audit     → AuditLogPage (protected)
 * - *          → NotFoundPage
 */
const router = createBrowserRouter([
  {
    path: '/',
    element: <RootRedirect />,
  },
  {
    path: '/login',
    element: <LoginScreen />,
  },
  {
    path: '/signup',
    element: <SignupScreen />,
  },
  {
    path: '/home',
    element: (
      <ProtectedRoute>
        <HomePage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/results',
    element: (
      <ProtectedRoute>
        <QueryResultsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/audit',
    element: (
      <ProtectedRoute>
        <AuditLogPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

export default router;