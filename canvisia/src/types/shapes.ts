// Shape Types
export interface BaseShape {
  id: string;
  type: 'rectangle' | 'circle' | 'line' | 'text' | 'triangle' | 'pentagon' | 'hexagon' | 'star';
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

export type Shape = Rectangle | Circle | Line | Text | Triangle | Pentagon | Hexagon | Star;
