import { create } from 'zustand'
import type { Shape } from '@/types/shapes'
import type { Viewport } from '@/types/canvas'

interface CanvasStore {
  // State
  shapes: Shape[]
  selectedIds: string[]
  viewport: Viewport
  editingTextId: string | null

  // Actions
  addShape: (shape: Shape) => void
  updateShape: (id: string, updates: Partial<Shape>) => void
  removeShape: (id: string) => void
  setShapes: (shapes: Shape[]) => void

  setSelectedIds: (ids: string[]) => void
  selectShape: (id: string) => void
  deselectShape: (id: string) => void
  clearSelection: () => void

  updateViewport: (viewport: Partial<Viewport>) => void
  resetViewport: () => void

  setEditingTextId: (id: string | null) => void
}

const DEFAULT_VIEWPORT: Viewport = {
  x: 0,
  y: 0,
  zoom: 1,
}

export const useCanvasStore = create<CanvasStore>((set) => ({
  // Initial state
  shapes: [],
  selectedIds: [],
  viewport: DEFAULT_VIEWPORT,
  editingTextId: null,

  // Shape actions
  addShape: (shape) =>
    set((state) => ({
      shapes: [...state.shapes, shape],
    })),

  updateShape: (id, updates) =>
    set((state) => ({
      shapes: state.shapes.map((shape) =>
        shape.id === id ? { ...shape, ...updates } as Shape : shape
      ),
    })),

  removeShape: (id) =>
    set((state) => ({
      shapes: state.shapes.filter((shape) => shape.id !== id),
      selectedIds: state.selectedIds.filter((selectedId) => selectedId !== id),
    })),

  setShapes: (shapes) => set({ shapes }),

  // Selection actions
  setSelectedIds: (ids) => set({ selectedIds: ids }),

  selectShape: (id) =>
    set((state) => ({
      selectedIds: [...state.selectedIds, id],
    })),

  deselectShape: (id) =>
    set((state) => ({
      selectedIds: state.selectedIds.filter((selectedId) => selectedId !== id),
    })),

  clearSelection: () => set({ selectedIds: [] }),

  // Viewport actions
  updateViewport: (viewport) =>
    set((state) => ({
      viewport: { ...state.viewport, ...viewport },
    })),

  resetViewport: () => set({ viewport: DEFAULT_VIEWPORT }),

  // Text editing actions
  setEditingTextId: (id) => set({ editingTextId: id }),
}))
