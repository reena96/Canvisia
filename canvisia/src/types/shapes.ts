// Shape Types
export interface BaseShape {
  id: string;
  type: 'rectangle' | 'circle' | 'line' | 'text';
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

export type Shape = Rectangle | Circle | Line | Text;
