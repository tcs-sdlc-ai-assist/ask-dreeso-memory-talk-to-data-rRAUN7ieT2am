import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

/**
 * ProtectedRoute is an authentication route guard component.
 *
 * Checks authentication status via the AuthContext. If the user is not
 * authenticated, redirects to /login via React Router's Navigate component.
 * If authenticated, renders the children.
 *
 * While the auth state is loading (initial session check), renders nothing
 * to avoid a flash of the login page before the session is verified.
 *
 * @param {{ children: React.ReactNode }} props
 * @returns {React.ReactElement|null}
 */
export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

ProtectedRoute.propTypes = {
  /** The child elements to render when the user is authenticated. */
  children: PropTypes.node.isRequired,
};

export default ProtectedRoute;