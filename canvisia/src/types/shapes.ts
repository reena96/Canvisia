// Shape Types
export interface BaseShape {
  id: string;
  type: 'rectangle' | 'circle' | 'ellipse' | 'roundedRectangle' | 'cylinder' | 'line' | 'text' | 'image' | 'triangle' | 'pentagon' | 'hexagon' | 'star' | 'arrow' | 'bidirectionalArrow' | 'bentConnector';
  x: number;
  y: number;
  createdBy: string;
  updatedAt: Date | string;
  rotation: number; // Rotation in degrees (0-360)
  zIndex?: number;

  // Metadata for simulation and advanced features
  metadata?: {
    // Simulation node properties
    nodeType?: 'start' | 'process' | 'decision' | 'end' | 'queue';
    processTime?: number; // milliseconds
    capacity?: number; // max concurrent tokens
    successRate?: number; // % for decision nodes

    // Other extensions
    [key: string]: any;
  };
}

export interface Rectangle extends BaseShape {
  type: 'rectangle';
  width: number;
  height: number;
  fill: string;
  stroke?: string;
  strokeWidth?: number;
}

export interface Circle extends BaseShape {
  type: 'circle';
  radius: number;
  fill: string;
  stroke?: string;
  strokeWidth?: number;
}

export interface Ellipse extends BaseShape {
  type: 'ellipse';
  radiusX: number;
  radiusY: number;
  fill: string;
  stroke?: string;
  strokeWidth?: number;
}

export interface RoundedRectangle extends BaseShape {
  type: 'roundedRectangle';
  width: number;
  height: number;
  cornerRadius: number;
  fill: string;
  stroke?: string;
  strokeWidth?: number;
}

export interface Cylinder extends BaseShape {
  type: 'cylinder';
  width: number;
  height: number;
  fill: string;
  stroke?: string;
  strokeWidth?: number;
}

export interface Line extends BaseShape {
  type: 'line';
  x2: number;
  y2: number;
  stroke: string;
  strokeWidth: number;
}

export interface Text extends BaseShape {
  type: 'text';
  text: string;
  fontSize: number;
  fontFamily: string; // Now required
  fill: string;
  fontWeight: number; // 400 (normal), 700 (bold)
  fontStyle: 'normal' | 'italic';
  textDecoration: 'none' | 'underline' | 'line-through';
  align: 'left' | 'center' | 'right';
  lineHeight: number; // Multiplier: 1.0, 1.2, 1.5, etc.
  width: number; // Text box width for wrapping
  height: number; // Text box height
}

export interface Image extends BaseShape {
  type: 'image';
  src: string; // Image URL or data URL
  width: number;
  height: number;
  opacity?: number;
}

export interface Triangle extends BaseShape {
  type: 'triangle';
  radiusX: number; // Horizontal radius (distance from center to vertex)
  radiusY: number; // Vertical radius (distance from center to vertex)
  fill: string;
  stroke?: string;
  strokeWidth?: number;
}

export interface Pentagon extends BaseShape {
  type: 'pentagon';
  radiusX: number; // Horizontal radius
  radiusY: number; // Vertical radius
  fill: string;
  stroke?: string;
  strokeWidth?: number;
}

export interface Hexagon extends BaseShape {
  type: 'hexagon';
  radiusX: number; // Horizontal radius
  radiusY: number; // Vertical radius
  fill: string;
  stroke?: string;
  strokeWidth?: number;
}

export interface Star extends BaseShape {
  type: 'star';
  outerRadiusX: number; // Horizontal outer radius
  outerRadiusY: number; // Vertical outer radius
  innerRadiusX: number; // Horizontal inner radius
  innerRadiusY: number; // Vertical inner radius
  numPoints: number;
  fill: string;
  stroke?: string;
  strokeWidth?: number;
}

export interface Arrow extends BaseShape {
  type: 'arrow';
  x2: number;
  y2: number;
  stroke: string;
  strokeWidth: number;
  pointerLength?: number;
  pointerWidth?: number;

  // Track which shapes this arrow connects
  connections?: {
    fromShapeId?: string;
    toShapeId?: string;
  };
}

export interface BentConnector extends BaseShape {
  type: 'bentConnector';
  x2: number;
  y2: number;
  bendX: number; // X coordinate of the bend point
  bendY: number; // Y coordinate of the bend point
  stroke: string;
  strokeWidth: number;

  // Track which shapes this connector connects
  connections?: {
    fromShapeId?: string;
    toShapeId?: string;
  };
}

export interface BidirectionalArrow extends BaseShape {
  type: 'bidirectionalArrow';
  x2: number;
  y2: number;
  stroke: string;
  strokeWidth: number;
  pointerLength?: number;
  pointerWidth?: number;

  // Track which shapes this arrow connects
  connections?: {
    fromShapeId?: string;
    toShapeId?: string;
  };
}

export type Shape = Rectangle | Circle | Ellipse | RoundedRectangle | Cylinder | Line | Text | Image | Triangle | Pentagon | Hexagon | Star | Arrow | BidirectionalArrow | BentConnector;

// Annotation type for collaborative comments on shapes
export interface Annotation {
  id: string;
  shapeId: string; // ID of the shape this annotation is attached to
  userId: string;
  userName: string;
  userColor: string;
  comment: string;
  createdAt: Date | number;
  updatedAt: Date | number;
  // Position relative to shape (for manual repositioning)
  offsetX?: number;
  offsetY?: number;
  // Whether this annotation is resolved
  resolved?: boolean;
}
