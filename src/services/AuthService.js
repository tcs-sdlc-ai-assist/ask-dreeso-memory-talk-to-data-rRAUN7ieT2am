import { STORAGE_KEYS, SESSION_TIMEOUT_MS } from '../utils/constants.js';
import { getItem, setItem, removeItem } from './LocalStorageService.js';
import { validateEmail, validatePassword, validateName, validateConfirmPassword, validateRole } from '../utils/ValidationUtils.js';
import { logAction } from './AuditLogger.js';

/**
 * Frontend-only authentication service.
 *
 * Provides signup, login, logout, session retrieval, and authentication
 * check methods. All data is persisted in browser localStorage.
 *
 * Passwords are encoded with btoa() for demo purposes only —
 * this is NOT secure and should never be used in production.
 */

/**
 * Generates a unique user ID.
 * @returns {string} A unique ID string.
 */
function generateUserId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `user_${timestamp}_${random}`;
}

/**
 * Encodes a password using btoa for demo storage.
 * @param {string} password - The plaintext password.
 * @returns {string} The encoded password.
 */
function encodePassword(password) {
  return btoa(password);
}

/**
 * Decodes a btoa-encoded password for comparison.
 * @param {string} encoded - The encoded password.
 * @returns {string} The decoded plaintext password.
 */
function decodePassword(encoded) {
  try {
    return atob(encoded);
  } catch {
    return '';
  }
}

/**
 * Registers a new user account.
 *
 * @param {object} input - The signup input.
 * @param {string} input.fullName - The user's full name.
 * @param {string} input.email - The user's email address.
 * @param {string} input.password - The chosen password.
 * @param {string} input.confirmPassword - Password confirmation.
 * @param {string} input.role - The user's role.
 * @returns {{ success: boolean, error?: string }} Result of the signup operation.
 */
export function signup({ fullName, email, password, confirmPassword, role }) {
  try {
    const nameValidation = validateName(fullName);
    if (!nameValidation.isValid) {
      return { success: false, error: nameValidation.errorMessage };
    }

    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return { success: false, error: emailValidation.errorMessage };
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return { success: false, error: passwordValidation.errorMessage };
    }

    const confirmValidation = validateConfirmPassword(password, confirmPassword);
    if (!confirmValidation.isValid) {
      return { success: false, error: confirmValidation.errorMessage };
    }

    const roleValidation = validateRole(role);
    if (!roleValidation.isValid) {
      return { success: false, error: roleValidation.errorMessage };
    }

    const users = getItem(STORAGE_KEYS.USERS, []);

    if (!Array.isArray(users)) {
      return { success: false, error: 'User data is corrupted. Please clear your browser data.' };
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = users.find(
      (u) => u.email.toLowerCase() === normalizedEmail,
    );

    if (existingUser) {
      return { success: false, error: 'Email already registered.' };
    }

    const newUser = {
      id: generateUserId(),
      fullName: fullName.trim(),
      email: normalizedEmail,
      password: encodePassword(password),
      role: role.trim(),
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    const saved = setItem(STORAGE_KEYS.USERS, users);

    if (!saved) {
      return { success: false, error: 'Failed to save user data. Storage may be full.' };
    }

    const session = {
      userId: newUser.id,
      fullName: newUser.fullName,
      email: newUser.email,
      role: newUser.role,
      personaId: null,
      loginTime: new Date().toISOString(),
    };

    setItem(STORAGE_KEYS.SESSION, session);

    logAction('signup', {
      userId: newUser.id,
      details: { email: newUser.email, role: newUser.role },
    });

    return { success: true };
  } catch (error) {
    console.error('[AuthService] Signup failed:', error);
    return { success: false, error: 'An unexpected error occurred during signup.' };
  }
}

/**
 * Authenticates a user with email and password.
 *
 * @param {object} input - The login input.
 * @param {string} input.email - The user's email address.
 * @param {string} input.password - The user's password.
 * @returns {{ success: boolean, error?: string }} Result of the login operation.
 */
export function login({ email, password }) {
  try {
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return { success: false, error: emailValidation.errorMessage };
    }

    if (!password || typeof password !== 'string' || password.length === 0) {
      return { success: false, error: 'Password is required.' };
    }

    const users = getItem(STORAGE_KEYS.USERS, []);

    if (!Array.isArray(users)) {
      return { success: false, error: 'User data is corrupted. Please clear your browser data.' };
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = users.find(
      (u) => u.email.toLowerCase() === normalizedEmail,
    );

    if (!user) {
      return { success: false, error: 'Invalid credentials.' };
    }

    const storedPassword = decodePassword(user.password);
    if (storedPassword !== password) {
      return { success: false, error: 'Invalid credentials.' };
    }

    const session = {
      userId: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      personaId: null,
      loginTime: new Date().toISOString(),
    };

    setItem(STORAGE_KEYS.SESSION, session);

    logAction('login', {
      userId: user.id,
      details: { email: user.email },
    });

    return { success: true };
  } catch (error) {
    console.error('[AuthService] Login failed:', error);
    return { success: false, error: 'An unexpected error occurred during login.' };
  }
}

/**
 * Logs out the current user by clearing the session from localStorage.
 * @returns {void}
 */
export function logout() {
  try {
    const session = getItem(STORAGE_KEYS.SESSION, null);
    const userId = session?.userId ?? null;

    removeItem(STORAGE_KEYS.SESSION);

    logAction('logout', {
      userId,
      details: { logoutTime: new Date().toISOString() },
    });
  } catch (error) {
    console.error('[AuthService] Logout failed:', error);
    removeItem(STORAGE_KEYS.SESSION);
  }
}

/**
 * Retrieves the current session from localStorage.
 * Returns null if no session exists or if the session has expired
 * based on SESSION_TIMEOUT_MS.
 *
 * @returns {object|null} The session object, or null if not authenticated or expired.
 */
export function getSession() {
  try {
    const session = getItem(STORAGE_KEYS.SESSION, null);

    if (!session || typeof session !== 'object') {
      return null;
    }

    if (!session.userId || !session.loginTime) {
      return null;
    }

    const loginTime = new Date(session.loginTime).getTime();
    const now = Date.now();

    if (isNaN(loginTime)) {
      removeItem(STORAGE_KEYS.SESSION);
      return null;
    }

    if (now - loginTime > SESSION_TIMEOUT_MS) {
      logAction('logout', {
        userId: session.userId,
        details: { reason: 'session_expired' },
      });
      removeItem(STORAGE_KEYS.SESSION);
      return null;
    }

    return session;
  } catch (error) {
    console.error('[AuthService] Failed to retrieve session:', error);
    return null;
  }
}

/**
 * Checks whether a valid, non-expired session exists.
 *
 * @returns {boolean} True if the user is authenticated, false otherwise.
 */
export function isAuthenticated() {
  return getSession() !== null;
}