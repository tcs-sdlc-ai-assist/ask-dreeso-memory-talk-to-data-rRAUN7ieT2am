import { ROLE_OPTIONS } from './constants.js';

/**
 * Validates an email address using regex.
 * @param {string} email - The email address to validate.
 * @returns {{ isValid: boolean, errorMessage: string }}
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string' || email.trim().length === 0) {
    return { isValid: false, errorMessage: 'Email is required.' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { isValid: false, errorMessage: 'Invalid email format.' };
  }

  return { isValid: true, errorMessage: '' };
}

/**
 * Validates a password string.
 * Requirements: min 8 chars, at least one uppercase letter, one lowercase letter, and one number.
 * @param {string} password - The password to validate.
 * @returns {{ isValid: boolean, errorMessage: string }}
 */
export function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return { isValid: false, errorMessage: 'Password is required.' };
  }

  if (password.length < 8) {
    return { isValid: false, errorMessage: 'Password must be at least 8 characters.' };
  }

  if (!/[A-Z]/.test(password)) {
    return { isValid: false, errorMessage: 'Password must contain at least one uppercase letter.' };
  }

  if (!/[a-z]/.test(password)) {
    return { isValid: false, errorMessage: 'Password must contain at least one lowercase letter.' };
  }

  if (!/[0-9]/.test(password)) {
    return { isValid: false, errorMessage: 'Password must contain at least one number.' };
  }

  return { isValid: true, errorMessage: '' };
}

/**
 * Validates a full name string.
 * Requirements: non-empty, at least 2 characters after trimming.
 * @param {string} name - The name to validate.
 * @returns {{ isValid: boolean, errorMessage: string }}
 */
export function validateName(name) {
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return { isValid: false, errorMessage: 'Name is required.' };
  }

  if (name.trim().length < 2) {
    return { isValid: false, errorMessage: 'Name must be at least 2 characters.' };
  }

  return { isValid: true, errorMessage: '' };
}

/**
 * Validates that the confirm password matches the original password.
 * @param {string} password - The original password.
 * @param {string} confirmPassword - The confirmation password.
 * @returns {{ isValid: boolean, errorMessage: string }}
 */
export function validateConfirmPassword(password, confirmPassword) {
  if (!confirmPassword || typeof confirmPassword !== 'string' || confirmPassword.length === 0) {
    return { isValid: false, errorMessage: 'Please confirm your password.' };
  }

  if (password !== confirmPassword) {
    return { isValid: false, errorMessage: 'Passwords do not match.' };
  }

  return { isValid: true, errorMessage: '' };
}

/**
 * Validates that the role is one of the allowed roles defined in ROLE_OPTIONS.
 * @param {string} role - The role value to validate.
 * @returns {{ isValid: boolean, errorMessage: string }}
 */
export function validateRole(role) {
  if (!role || typeof role !== 'string' || role.trim().length === 0) {
    return { isValid: false, errorMessage: 'Role is required.' };
  }

  const allowedRoles = ROLE_OPTIONS.map((option) => option.value);
  if (!allowedRoles.includes(role)) {
    return { isValid: false, errorMessage: 'Invalid role selected.' };
  }

  return { isValid: true, errorMessage: '' };
}