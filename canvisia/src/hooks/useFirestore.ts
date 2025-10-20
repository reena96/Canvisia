import { useState, useEffect } from 'react'
import {
  createShape as createShapeInFirestore,
  updateShape as updateShapeInFirestore,
  deleteShape as deleteShapeInFirestore,
  subscribeToShapes,
} from '@/services/firestore'
import type { Shape } from '@/types/shapes'

/**
 * Hook for managing shapes in Firestore with real-time sync
 * @param canvasId - Canvas ID to subscribe to
 * @returns Object with shapes array and CRUD functions
 */
export function useFirestore(canvasId: string) {
  const [shapes, setShapes] = useState<Shape[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Subscribe to shapes from Firestore
  useEffect(() => {
    if (!canvasId) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const unsubscribe = subscribeToShapes(canvasId, (updatedShapes) => {
      setShapes(updatedShapes)
      setLoading(false)
    })

    // Cleanup subscription on unmount
    return () => {
      unsubscribe()
    }
  }, [canvasId])

  // Create a new shape
  const createShape = async (shape: Shape): Promise<void> => {
    try {
      await createShapeInFirestore(canvasId, shape)
    } catch (err) {
      console.error('Failed to create shape:', err)
      setError(err as Error)
      throw err
    }
  }

  // Update an existing shape
  const updateShape = async (
    shapeId: string,
    updates: Partial<Shape>
  ): Promise<void> => {
    try {
      await updateShapeInFirestore(canvasId, shapeId, updates)
    } catch (err) {
      console.error('Failed to update shape:', err)
      setError(err as Error)
      throw err
    }
  }

  // Delete a shape
  const deleteShape = async (shapeId: string): Promise<void> => {
    try {
      await deleteShapeInFirestore(canvasId, shapeId)
    } catch (err) {
      console.error('Failed to delete shape:', err)
      setError(err as Error)
      throw err
    }
  }

  return {
    shapes,
    loading,
    error,
    createShape,
    updateShape,
    deleteShape,
  }
}
