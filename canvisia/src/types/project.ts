import type { Timestamp } from 'firebase/firestore'

export interface Project {
  id: string
  name: string
  ownerId: string
  thumbnail: string | null
  createdAt: Date
  lastModified: Date
  lastAccessed: Date
}

export interface ProjectMetadata {
  id: string
  name: string
  order: number
  thumbnail: string | null
  settings: {
    backgroundColor: string
    gridEnabled: boolean
  }
  createdAt: Date
  lastModified: Date
}

export type PermissionRole = 'owner' | 'editor' | 'viewer'

export interface Permission {
  projectId: string
  userId: string
  userEmail: string
  role: PermissionRole
  invitedBy: string
  invitedAt: Date
  acceptedAt: Date | null
}
