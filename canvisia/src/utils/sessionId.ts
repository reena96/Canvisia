/**
 * Generate or retrieve a unique session ID for this browser tab
 * Persisted in sessionStorage to survive HMR during development
 *
 * @returns Unique session ID for this tab
 */
export function getSessionId(): string {
  const STORAGE_KEY = 'canvisia-session-id'

  // Check if we already have a session ID
  const stored = sessionStorage.getItem(STORAGE_KEY)
  if (stored) {
    return stored
  }

  // Generate new session ID
  const newId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  sessionStorage.setItem(STORAGE_KEY, newId)

  return newId
}
