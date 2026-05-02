import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { signup as authSignup, login as authLogin, logout as authLogout, getSession, isAuthenticated as checkIsAuthenticated } from '../services/AuthService.js';
import { quickLogin, switchPersona as personaSwitchService, getCurrentPersona, findPersonaById } from '../services/PersonaService.js';

/**
 * @typedef {object} AuthContextValue
 * @property {object|null} user - The current user/session object.
 * @property {object|null} persona - The currently active persona object.
 * @property {boolean} isAuthenticated - Whether a valid session exists.
 * @property {boolean} loading - Whether the auth state is being initialised.
 * @property {function} login - Login with email and password.
 * @property {function} signup - Register a new user.
 * @property {function} logout - Log out the current user.
 * @property {function} switchPersona - Switch the active persona.
 * @property {function} personaQuickLogin - Quick login as a predefined persona.
 * @property {function} refreshSession - Manually refresh session state from localStorage.
 */

const AuthContext = createContext(null);

/** Session expiration check interval in milliseconds (60 seconds). */
const SESSION_CHECK_INTERVAL_MS = 60000;

/**
 * AuthContextProvider wraps children with global authentication state.
 * Manages session lifecycle, persona context, and expiration checks.
 *
 * @param {{ children: React.ReactNode }} props
 * @returns {React.ReactElement}
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [persona, setPersona] = useState(null);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  /**
   * Reads the current session and persona from localStorage and
   * updates React state accordingly.
   */
  const refreshSession = useCallback(() => {
    try {
      const session = getSession();

      if (session) {
        setUser(session);
        setIsAuth(true);

        if (session.personaId) {
          const currentPersona = findPersonaById(session.personaId);
          setPersona(currentPersona || null);
        } else {
          setPersona(null);
        }
      } else {
        setUser(null);
        setPersona(null);
        setIsAuth(false);
      }
    } catch (error) {
      console.error('[AuthContext] Failed to refresh session:', error);
      setUser(null);
      setPersona(null);
      setIsAuth(false);
    }
  }, []);

  // Initialise session state on mount
  useEffect(() => {
    refreshSession();
    setLoading(false);
  }, [refreshSession]);

  // Periodically check for session expiration
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (isAuth) {
        const session = getSession();
        if (!session) {
          setUser(null);
          setPersona(null);
          setIsAuth(false);
        }
      }
    }, SESSION_CHECK_INTERVAL_MS);

    return () => {
      clearInterval(intervalId);
    };
  }, [isAuth]);

  /**
   * Logs in a user with email and password.
   *
   * @param {{ email: string, password: string }} credentials
   * @returns {{ success: boolean, error?: string }}
   */
  const login = useCallback((credentials) => {
    try {
      const result = authLogin(credentials);

      if (result.success) {
        const session = getSession();
        setUser(session);
        setIsAuth(true);

        if (session && session.personaId) {
          const p = findPersonaById(session.personaId);
          setPersona(p || null);
        } else {
          setPersona(null);
        }
      }

      return result;
    } catch (error) {
      console.error('[AuthContext] Login failed:', error);
      return { success: false, error: 'An unexpected error occurred during login.' };
    }
  }, []);

  /**
   * Registers a new user account.
   *
   * @param {{ fullName: string, email: string, password: string, confirmPassword: string, role: string }} input
   * @returns {{ success: boolean, error?: string }}
   */
  const signup = useCallback((input) => {
    try {
      const result = authSignup(input);

      if (result.success) {
        const session = getSession();
        setUser(session);
        setIsAuth(true);
        setPersona(null);
      }

      return result;
    } catch (error) {
      console.error('[AuthContext] Signup failed:', error);
      return { success: false, error: 'An unexpected error occurred during signup.' };
    }
  }, []);

  /**
   * Logs out the current user and clears all auth state.
   */
  const logout = useCallback(() => {
    try {
      authLogout();
    } catch (error) {
      console.error('[AuthContext] Logout failed:', error);
    } finally {
      setUser(null);
      setPersona(null);
      setIsAuth(false);
    }
  }, []);

  /**
   * Switches the active persona on the current session.
   *
   * @param {string} personaId - The persona ID to switch to.
   * @returns {{ success: boolean, error?: string }}
   */
  const switchPersona = useCallback((personaId) => {
    try {
      const result = personaSwitchService(personaId);

      if (result.success) {
        const session = getSession();
        setUser(session);

        const p = findPersonaById(personaId);
        setPersona(p || null);
      }

      return result;
    } catch (error) {
      console.error('[AuthContext] Switch persona failed:', error);
      return { success: false, error: 'An unexpected error occurred while switching persona.' };
    }
  }, []);

  /**
   * Performs a quick login as a predefined persona.
   *
   * @param {string} personaId - The persona ID to log in as.
   * @returns {{ success: boolean, error?: string }}
   */
  const personaQuickLogin = useCallback((personaId) => {
    try {
      const result = quickLogin(personaId);

      if (result.success) {
        const session = getSession();
        setUser(session);
        setIsAuth(true);

        const p = findPersonaById(personaId);
        setPersona(p || null);
      }

      return result;
    } catch (error) {
      console.error('[AuthContext] Persona quick login failed:', error);
      return { success: false, error: 'An unexpected error occurred during persona login.' };
    }
  }, []);

  const value = useMemo(() => ({
    user,
    persona,
    isAuthenticated: isAuth,
    loading,
    login,
    signup,
    logout,
    switchPersona,
    personaQuickLogin,
    refreshSession,
  }), [user, persona, isAuth, loading, login, signup, logout, switchPersona, personaQuickLogin, refreshSession]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Custom hook for accessing the AuthContext.
 * Must be used within an AuthProvider.
 *
 * @returns {AuthContextValue} The authentication context value.
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }

  return context;
}

export default AuthContext;