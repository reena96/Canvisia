// Canvas Types
import type { Shape } from './shapes';

export interface Canvas {
  id: string;
  name: string;
  createdAt: Date | string;
  ownerId: string;
  lastModified: Date | string;
}

export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

export interface CanvasState {
  shapes: Shape[];
  selectedIds: string[];
  viewport: Viewport;
}

// Re-export Shape type for convenience
export type { Shape };
