import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { QueryProvider } from './context/QueryContext.jsx';
import router from './router.jsx';

/**
 * Root application component.
 *
 * Serves as the composition root for all context providers and renders
 * the RouterProvider with the application router configuration.
 *
 * Provider hierarchy:
 * 1. AuthProvider — global authentication state
 * 2. QueryProvider — global query state (depends on AuthContext)
 * 3. RouterProvider — client-side routing
 *
 * @returns {React.ReactElement}
 */
export default function App() {
  return (
    <AuthProvider>
      <QueryProvider>
        <RouterProvider router={router} />
      </QueryProvider>
    </AuthProvider>
  );
}