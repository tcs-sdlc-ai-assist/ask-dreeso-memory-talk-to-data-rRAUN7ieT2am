import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { signup, login, logout, getSession, isAuthenticated } from '../AuthService.js';
import { getItem, setItem, removeItem } from '../LocalStorageService.js';
import { STORAGE_KEYS, SESSION_TIMEOUT_MS } from '../../utils/constants.js';

describe('AuthService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  // ---------------------------------------------------------------------------
  // signup
  // ---------------------------------------------------------------------------

  describe('signup', () => {
    it('creates a new user account with valid inputs', () => {
      const result = signup({
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'Password1',
        confirmPassword: 'Password1',
        role: 'admin',
      });

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();

      const users = getItem(STORAGE_KEYS.USERS, []);
      expect(users).toHaveLength(1);
      expect(users[0].email).toBe('test@example.com');
      expect(users[0].fullName).toBe('Test User');
      expect(users[0].role).toBe('admin');

      const session = getItem(STORAGE_KEYS.SESSION, null);
      expect(session).not.toBeNull();
      expect(session.email).toBe('test@example.com');
      expect(session.fullName).toBe('Test User');
    });

    it('rejects signup with empty full name', () => {
      const result = signup({
        fullName: '',
        email: 'test@example.com',
        password: 'Password1',
        confirmPassword: 'Password1',
        role: 'admin',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('Name');
    });

    it('rejects signup with invalid email', () => {
      const result = signup({
        fullName: 'Test User',
        email: 'not-an-email',
        password: 'Password1',
        confirmPassword: 'Password1',
        role: 'admin',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error.toLowerCase()).toContain('email');
    });

    it('rejects signup with weak password (no uppercase)', () => {
      const result = signup({
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'password1',
        confirmPassword: 'password1',
        role: 'admin',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error.toLowerCase()).toContain('uppercase');
    });

    it('rejects signup with weak password (too short)', () => {
      const result = signup({
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'Pass1',
        confirmPassword: 'Pass1',
        role: 'admin',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error.toLowerCase()).toContain('8 characters');
    });

    it('rejects signup with weak password (no number)', () => {
      const result = signup({
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'Passwordd',
        confirmPassword: 'Passwordd',
        role: 'admin',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error.toLowerCase()).toContain('number');
    });

    it('rejects signup with mismatched passwords', () => {
      const result = signup({
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'Password1',
        confirmPassword: 'Password2',
        role: 'admin',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error.toLowerCase()).toContain('match');
    });

    it('rejects signup with invalid role', () => {
      const result = signup({
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'Password1',
        confirmPassword: 'Password1',
        role: 'superadmin',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error.toLowerCase()).toContain('role');
    });

    it('rejects signup with duplicate email', () => {
      signup({
        fullName: 'First User',
        email: 'test@example.com',
        password: 'Password1',
        confirmPassword: 'Password1',
        role: 'admin',
      });

      const result = signup({
        fullName: 'Second User',
        email: 'test@example.com',
        password: 'Password1',
        confirmPassword: 'Password1',
        role: 'admin',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error.toLowerCase()).toContain('already registered');
    });

    it('rejects signup with duplicate email (case-insensitive)', () => {
      signup({
        fullName: 'First User',
        email: 'test@example.com',
        password: 'Password1',
        confirmPassword: 'Password1',
        role: 'admin',
      });

      const result = signup({
        fullName: 'Second User',
        email: 'TEST@EXAMPLE.COM',
        password: 'Password1',
        confirmPassword: 'Password1',
        role: 'admin',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error.toLowerCase()).toContain('already registered');
    });

    it('creates a session after successful signup', () => {
      signup({
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'Password1',
        confirmPassword: 'Password1',
        role: 'admin',
      });

      const session = getSession();
      expect(session).not.toBeNull();
      expect(session.email).toBe('test@example.com');
      expect(session.role).toBe('admin');
      expect(session.personaId).toBeNull();
    });
  });

  // ---------------------------------------------------------------------------
  // login
  // ---------------------------------------------------------------------------

  describe('login', () => {
    beforeEach(() => {
      signup({
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'Password1',
        confirmPassword: 'Password1',
        role: 'admin',
      });
      // Clear the session created by signup so we can test login independently
      removeItem(STORAGE_KEYS.SESSION);
    });

    it('logs in with correct credentials', () => {
      const result = login({
        email: 'test@example.com',
        password: 'Password1',
      });

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();

      const session = getSession();
      expect(session).not.toBeNull();
      expect(session.email).toBe('test@example.com');
      expect(session.fullName).toBe('Test User');
    });

    it('rejects login with incorrect password', () => {
      const result = login({
        email: 'test@example.com',
        password: 'WrongPassword1',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error.toLowerCase()).toContain('invalid');
    });

    it('rejects login with non-existent email', () => {
      const result = login({
        email: 'nonexistent@example.com',
        password: 'Password1',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error.toLowerCase()).toContain('invalid');
    });

    it('rejects login with empty email', () => {
      const result = login({
        email: '',
        password: 'Password1',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('rejects login with empty password', () => {
      const result = login({
        email: 'test@example.com',
        password: '',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error.toLowerCase()).toContain('password');
    });

    it('rejects login with invalid email format', () => {
      const result = login({
        email: 'not-an-email',
        password: 'Password1',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('creates a session with personaId null after login', () => {
      login({
        email: 'test@example.com',
        password: 'Password1',
      });

      const session = getSession();
      expect(session).not.toBeNull();
      expect(session.personaId).toBeNull();
    });

    it('logs in with case-insensitive email', () => {
      const result = login({
        email: 'TEST@EXAMPLE.COM',
        password: 'Password1',
      });

      expect(result.success).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // logout
  // ---------------------------------------------------------------------------

  describe('logout', () => {
    it('clears the session from localStorage', () => {
      signup({
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'Password1',
        confirmPassword: 'Password1',
        role: 'admin',
      });

      expect(getSession()).not.toBeNull();

      logout();

      const session = getItem(STORAGE_KEYS.SESSION, null);
      expect(session).toBeNull();
    });

    it('does not throw when no session exists', () => {
      expect(() => logout()).not.toThrow();
    });

    it('results in isAuthenticated returning false', () => {
      signup({
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'Password1',
        confirmPassword: 'Password1',
        role: 'admin',
      });

      expect(isAuthenticated()).toBe(true);

      logout();

      expect(isAuthenticated()).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  // getSession
  // ---------------------------------------------------------------------------

  describe('getSession', () => {
    it('returns the session object when a valid session exists', () => {
      signup({
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'Password1',
        confirmPassword: 'Password1',
        role: 'admin',
      });

      const session = getSession();
      expect(session).not.toBeNull();
      expect(session.email).toBe('test@example.com');
      expect(session.fullName).toBe('Test User');
      expect(session.role).toBe('admin');
      expect(session.userId).toBeDefined();
      expect(session.loginTime).toBeDefined();
    });

    it('returns null when no session exists', () => {
      const session = getSession();
      expect(session).toBeNull();
    });

    it('returns null when session data is corrupted', () => {
      localStorage.setItem(STORAGE_KEYS.SESSION, 'not-valid-json{{{');
      const session = getSession();
      expect(session).toBeNull();
    });

    it('returns null when session is missing userId', () => {
      setItem(STORAGE_KEYS.SESSION, {
        email: 'test@example.com',
        loginTime: new Date().toISOString(),
      });

      const session = getSession();
      expect(session).toBeNull();
    });

    it('returns null when session is missing loginTime', () => {
      setItem(STORAGE_KEYS.SESSION, {
        userId: 'user_123',
        email: 'test@example.com',
      });

      const session = getSession();
      expect(session).toBeNull();
    });

    it('returns null when session has expired', () => {
      const expiredLoginTime = new Date(Date.now() - SESSION_TIMEOUT_MS - 1000).toISOString();

      setItem(STORAGE_KEYS.SESSION, {
        userId: 'user_123',
        fullName: 'Test User',
        email: 'test@example.com',
        role: 'admin',
        personaId: null,
        loginTime: expiredLoginTime,
      });

      const session = getSession();
      expect(session).toBeNull();
    });

    it('returns the session when it has not yet expired', () => {
      const recentLoginTime = new Date(Date.now() - 1000).toISOString();

      setItem(STORAGE_KEYS.SESSION, {
        userId: 'user_123',
        fullName: 'Test User',
        email: 'test@example.com',
        role: 'admin',
        personaId: null,
        loginTime: recentLoginTime,
      });

      const session = getSession();
      expect(session).not.toBeNull();
      expect(session.userId).toBe('user_123');
    });

    it('removes expired session from localStorage', () => {
      const expiredLoginTime = new Date(Date.now() - SESSION_TIMEOUT_MS - 1000).toISOString();

      setItem(STORAGE_KEYS.SESSION, {
        userId: 'user_123',
        fullName: 'Test User',
        email: 'test@example.com',
        role: 'admin',
        personaId: null,
        loginTime: expiredLoginTime,
      });

      getSession();

      const rawSession = getItem(STORAGE_KEYS.SESSION, null);
      expect(rawSession).toBeNull();
    });

    it('returns null when loginTime is invalid', () => {
      setItem(STORAGE_KEYS.SESSION, {
        userId: 'user_123',
        fullName: 'Test User',
        email: 'test@example.com',
        role: 'admin',
        personaId: null,
        loginTime: 'not-a-date',
      });

      const session = getSession();
      expect(session).toBeNull();
    });
  });

  // ---------------------------------------------------------------------------
  // isAuthenticated
  // ---------------------------------------------------------------------------

  describe('isAuthenticated', () => {
    it('returns true when a valid session exists', () => {
      signup({
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'Password1',
        confirmPassword: 'Password1',
        role: 'admin',
      });

      expect(isAuthenticated()).toBe(true);
    });

    it('returns false when no session exists', () => {
      expect(isAuthenticated()).toBe(false);
    });

    it('returns false after logout', () => {
      signup({
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'Password1',
        confirmPassword: 'Password1',
        role: 'admin',
      });

      logout();

      expect(isAuthenticated()).toBe(false);
    });

    it('returns false when session has expired', () => {
      const expiredLoginTime = new Date(Date.now() - SESSION_TIMEOUT_MS - 1000).toISOString();

      setItem(STORAGE_KEYS.SESSION, {
        userId: 'user_123',
        fullName: 'Test User',
        email: 'test@example.com',
        role: 'admin',
        personaId: null,
        loginTime: expiredLoginTime,
      });

      expect(isAuthenticated()).toBe(false);
    });

    it('returns true when session is within timeout window', () => {
      const recentLoginTime = new Date(Date.now() - 60000).toISOString();

      setItem(STORAGE_KEYS.SESSION, {
        userId: 'user_123',
        fullName: 'Test User',
        email: 'test@example.com',
        role: 'admin',
        personaId: null,
        loginTime: recentLoginTime,
      });

      expect(isAuthenticated()).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // Audit logging integration
  // ---------------------------------------------------------------------------

  describe('audit logging', () => {
    it('logs a signup action to the audit log', () => {
      signup({
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'Password1',
        confirmPassword: 'Password1',
        role: 'admin',
      });

      const auditLog = getItem(STORAGE_KEYS.AUDIT_LOG, []);
      expect(auditLog.length).toBeGreaterThanOrEqual(1);

      const signupEntry = auditLog.find((entry) => entry.action === 'signup');
      expect(signupEntry).toBeDefined();
      expect(signupEntry.details.email).toBe('test@example.com');
    });

    it('logs a login action to the audit log', () => {
      signup({
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'Password1',
        confirmPassword: 'Password1',
        role: 'admin',
      });

      removeItem(STORAGE_KEYS.SESSION);

      login({
        email: 'test@example.com',
        password: 'Password1',
      });

      const auditLog = getItem(STORAGE_KEYS.AUDIT_LOG, []);
      const loginEntries = auditLog.filter((entry) => entry.action === 'login');
      expect(loginEntries.length).toBeGreaterThanOrEqual(1);
    });

    it('logs a logout action to the audit log', () => {
      signup({
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'Password1',
        confirmPassword: 'Password1',
        role: 'admin',
      });

      logout();

      const auditLog = getItem(STORAGE_KEYS.AUDIT_LOG, []);
      const logoutEntries = auditLog.filter((entry) => entry.action === 'logout');
      expect(logoutEntries.length).toBeGreaterThanOrEqual(1);
    });
  });
});