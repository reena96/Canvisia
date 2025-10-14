/**
 * Shared user color configuration for dev test users
 * Used across DevLogin, cursors, and shapes for consistent identification
 */

export interface UserColorConfig {
  displayName: string
  color: string
}

export const DEV_USER_COLORS: UserColorConfig[] = [
  {
    displayName: 'Alice',
    color: '#FF6B6B', // Red
  },
  {
    displayName: 'Bob',
    color: '#4ECDC4', // Teal
  },
  {
    displayName: 'Charlie',
    color: '#45B7D1', // Blue
  },
]

/**
 * Get user color by display name
 * Returns the configured color for dev users, or generates a hash-based color for others
 */
export function getUserColor(userName: string): string {
  // Check if user is a dev test user
  const devUser = DEV_USER_COLORS.find((u) => u.displayName === userName)
  if (devUser) {
    return devUser.color
  }

  // Fallback: generate color from hash for non-dev users
  const colors = [
    '#FFA07A', // Light Salmon
    '#98D8C8', // Mint
    '#F7DC6F', // Yellow
    '#BB8FCE', // Purple
    '#85C1E2', // Sky Blue
    '#F8B739', // Orange
    '#52B788', // Green
  ]

  let hash = 0
  for (let i = 0; i < userName.length; i++) {
    hash = userName.charCodeAt(i) + ((hash << 5) - hash)
  }

  const index = Math.abs(hash) % colors.length
  return colors[index]
}
