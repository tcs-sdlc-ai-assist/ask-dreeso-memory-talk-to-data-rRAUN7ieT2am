import { STORAGE_KEYS, PERSONAS } from '../utils/constants.js';
import { getItem, setItem } from './LocalStorageService.js';
import { logAction } from './AuditLogger.js';

/**
 * Persona management service providing quick-login, switching,
 * and retrieval of predefined personas.
 *
 * Personas are predefined in constants.js and do not require
 * user registration. Quick-login creates a lightweight session
 * tied to the selected persona.
 */

/**
 * Generates a unique session ID for persona quick-login sessions.
 * @returns {string} A unique ID string.
 */
function generatePersonaSessionId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `persona_${timestamp}_${random}`;
}

/**
 * Returns the full list of predefined personas.
 *
 * @returns {Array<object>} The array of persona objects from constants.
 */
export function getPersonas() {
  return PERSONAS;
}

/**
 * Finds a persona by its ID.
 *
 * @param {string} personaId - The persona ID to look up.
 * @returns {object|null} The matching persona object, or null if not found.
 */
export function findPersonaById(personaId) {
  if (!personaId || typeof personaId !== 'string' || personaId.trim().length === 0) {
    return null;
  }

  const persona = PERSONAS.find((p) => p.id === personaId.trim());
  return persona || null;
}

/**
 * Performs a quick login as a predefined persona.
 * Creates a session in localStorage tied to the selected persona.
 *
 * @param {string} personaId - The ID of the persona to log in as.
 * @returns {{ success: boolean, error?: string }} Result of the quick-login operation.
 */
export function quickLogin(personaId) {
  try {
    if (!personaId || typeof personaId !== 'string' || personaId.trim().length === 0) {
      return { success: false, error: 'Persona ID is required.' };
    }

    const persona = findPersonaById(personaId);

    if (!persona) {
      return { success: false, error: 'Persona not found.' };
    }

    const sessionId = generatePersonaSessionId();

    const session = {
      userId: sessionId,
      fullName: persona.name,
      email: `${persona.id}@dreeso.com`,
      role: persona.role,
      personaId: persona.id,
      loginTime: new Date().toISOString(),
    };

    const saved = setItem(STORAGE_KEYS.SESSION, session);

    if (!saved) {
      return { success: false, error: 'Failed to create session. Storage may be full.' };
    }

    logAction('login', {
      userId: sessionId,
      persona: persona.id,
      details: { method: 'persona_quick_login', personaName: persona.name, personaRole: persona.role },
    });

    return { success: true };
  } catch (error) {
    console.error('[PersonaService] Quick login failed:', error);
    return { success: false, error: 'An unexpected error occurred during persona login.' };
  }
}

/**
 * Switches the active persona on the current session.
 * Updates the session's personaId and logs the switch action.
 *
 * @param {string} personaId - The ID of the persona to switch to.
 * @returns {{ success: boolean, error?: string }} Result of the switch operation.
 */
export function switchPersona(personaId) {
  try {
    if (!personaId || typeof personaId !== 'string' || personaId.trim().length === 0) {
      return { success: false, error: 'Persona ID is required.' };
    }

    const persona = findPersonaById(personaId);

    if (!persona) {
      return { success: false, error: 'Persona not found.' };
    }

    const session = getItem(STORAGE_KEYS.SESSION, null);

    if (!session || typeof session !== 'object' || !session.userId) {
      return { success: false, error: 'No active session. Please log in first.' };
    }

    const previousPersonaId = session.personaId || null;

    const updatedSession = {
      ...session,
      personaId: persona.id,
    };

    const saved = setItem(STORAGE_KEYS.SESSION, updatedSession);

    if (!saved) {
      return { success: false, error: 'Failed to update session. Storage may be full.' };
    }

    logAction('persona_switch', {
      userId: session.userId,
      persona: persona.id,
      details: {
        previousPersonaId,
        newPersonaId: persona.id,
        personaName: persona.name,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('[PersonaService] Switch persona failed:', error);
    return { success: false, error: 'An unexpected error occurred while switching persona.' };
  }
}

/**
 * Retrieves the currently active persona based on the session's personaId.
 *
 * @returns {object|null} The current persona object, or null if no persona is active or no session exists.
 */
export function getCurrentPersona() {
  try {
    const session = getItem(STORAGE_KEYS.SESSION, null);

    if (!session || typeof session !== 'object' || !session.personaId) {
      return null;
    }

    return findPersonaById(session.personaId);
  } catch (error) {
    console.error('[PersonaService] Failed to get current persona:', error);
    return null;
  }
}