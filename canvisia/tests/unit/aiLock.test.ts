import { describe, it, expect, beforeEach, vi } from 'vitest'
import { acquireAILock, releaseAILock } from '@/services/ai/lock'
import * as firebase from 'firebase/database'

// Mock Firebase database functions
vi.mock('firebase/database', async () => {
  const actual = await vi.importActual('firebase/database')
  let mockData: Record<string, any> = {}

  return {
    ...actual,
    ref: vi.fn((db: any, path: string) => ({ _path: path })),
    get: vi.fn(async (ref: any) => {
      const data = mockData[ref._path]
      return {
        exists: () => !!data,
        val: () => data
      }
    }),
    set: vi.fn(async (ref: any, value: any) => {
      mockData[ref._path] = value
    }),
    remove: vi.fn(async (ref: any) => {
      delete mockData[ref._path]
    }),
    onValue: vi.fn()
  }
})

describe('AI Lock System', () => {
  const canvasId = 'test-canvas'

  beforeEach(async () => {
    vi.clearAllMocks()
    // Reset mock data by removing the lock
    await releaseAILock(canvasId)
  })

  it('should acquire lock when none exists', async () => {
    const acquired = await acquireAILock(
      canvasId,
      'user1',
      'Alice',
      'Create a circle'
    )
    expect(acquired).toBe(true)
  })

  it('should fail to acquire when lock exists', async () => {
    await acquireAILock(canvasId, 'user1', 'Alice', 'Create a circle')

    const acquired = await acquireAILock(
      canvasId,
      'user2',
      'Bob',
      'Create a rectangle'
    )
    expect(acquired).toBe(false)
  })

  it('should release lock successfully', async () => {
    await acquireAILock(canvasId, 'user1', 'Alice', 'Create a circle')
    await releaseAILock(canvasId)

    const acquired = await acquireAILock(
      canvasId,
      'user2',
      'Bob',
      'Create a rectangle'
    )
    expect(acquired).toBe(true)
  })
})
