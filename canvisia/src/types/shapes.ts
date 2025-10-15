// Shape Types
export interface BaseShape {
  id: string;
  type: 'rectangle' | 'circle' | 'ellipse' | 'roundedRectangle' | 'cylinder' | 'diamond' | 'line' | 'text' | 'image' | 'triangle' | 'pentagon' | 'hexagon' | 'star' | 'arrow' | 'bidirectionalArrow' | 'bentConnector';
  x: number;
  y: number;
  createdBy: string;
  updatedAt: Date | string;
  rotation?: number;
  zIndex?: number;
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

export interface Diamond extends BaseShape {
  type: 'diamond';
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
  fontFamily?: string;
  fill: string;
  fontStyle?: 'normal' | 'bold' | 'italic';
  textDecoration?: 'none' | 'underline' | 'line-through';
  align?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'middle' | 'bottom';
  width?: number; // For text wrapping
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
  radius: number; // Size (distance from center to vertex)
  fill: string;
  stroke?: string;
  strokeWidth?: number;
}

export interface Pentagon extends BaseShape {
  type: 'pentagon';
  radius: number;
  fill: string;
  stroke?: string;
  strokeWidth?: number;
}

export interface Hexagon extends BaseShape {
  type: 'hexagon';
  radius: number;
  fill: string;
  stroke?: string;
  strokeWidth?: number;
}

export interface Star extends BaseShape {
  type: 'star';
  outerRadius: number;
  innerRadius: number;
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
}

export interface BentConnector extends BaseShape {
  type: 'bentConnector';
  x2: number;
  y2: number;
  bendX: number; // X coordinate of the bend point
  bendY: number; // Y coordinate of the bend point
  stroke: string;
  strokeWidth: number;
}

export interface BidirectionalArrow extends BaseShape {
  type: 'bidirectionalArrow';
  x2: number;
  y2: number;
  stroke: string;
  strokeWidth: number;
  pointerLength?: number;
  pointerWidth?: number;
}

export type Shape = Rectangle | Circle | Ellipse | RoundedRectangle | Cylinder | Diamond | Line | Text | Image | Triangle | Pentagon | Hexagon | Star | Arrow | BidirectionalArrow | BentConnector;
