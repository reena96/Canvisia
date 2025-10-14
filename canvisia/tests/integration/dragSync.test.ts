import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFirestore } from '@/hooks/useFirestore'

// Mock the Firestore service
vi.mock('@/services/firestore', () => ({
  createShape: vi.fn().mockResolvedValue(undefined),
  updateShape: vi.fn().mockResolvedValue(undefined),
  deleteShape: vi.fn().mockResolvedValue(undefined),
  subscribeToShapes: vi.fn((canvasId, callback) => {
    // Call callback immediately with empty array
    callback([])
    // Return unsubscribe function
    return vi.fn()
  }),
}))

describe('Drag and Sync Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should update shape position via updateShape', async () => {
    const { result } = renderHook(() => useFirestore('test-canvas-id'))

    // Wait for initial load
    await act(async () => {
      await new Promise((r) => setTimeout(r, 100))
    })

    const shapeId = 'test-shape-1'
    const newX = 200
    const newY = 300

    // Update shape position
    await act(async () => {
      await result.current.updateShape(shapeId, { x: newX, y: newY })
    })

    // Verify updateShape was called with correct arguments
    const { updateShape } = await import('@/services/firestore')
    expect(updateShape).toHaveBeenCalledWith('test-canvas-id', shapeId, {
      x: newX,
      y: newY,
    })
  })

  it('should expose updateShape function from hook', () => {
    const { result } = renderHook(() => useFirestore('test-canvas-id'))

    expect(result.current.updateShape).toBeDefined()
    expect(typeof result.current.updateShape).toBe('function')
  })
})
