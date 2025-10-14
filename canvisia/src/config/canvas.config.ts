// Canvas Configuration
export const CANVAS_CONFIG = {
  // Canvas dimensions (5000x5000 as per PRD)
  WIDTH: 5000,
  HEIGHT: 5000,

  // Zoom limits (0.1x to 5.0x as per PRD)
  MIN_ZOOM: 0.1,
  MAX_ZOOM: 5.0,
  DEFAULT_ZOOM: 1.0,

  // Zoom controls
  ZOOM_STEP: 0.1,
  ZOOM_SENSITIVITY: 0.001,

  // Performance settings
  CURSOR_THROTTLE_MS: 50, // 20 updates/sec
  POSITION_THROTTLE_MS: 50, // ~20 updates/sec during drag
} as const;

// Default shape configurations
export const SHAPE_DEFAULTS = {
  rectangle: {
    width: 100,
    height: 100,
    fill: '#4285F4', // Blue
    stroke: '#000000',
    strokeWidth: 1,
  },
  circle: {
    radius: 50, // 100px diameter
    fill: '#DB4437', // Red
    stroke: '#000000',
    strokeWidth: 1,
  },
  line: {
    length: 150,
    stroke: '#000000',
    strokeWidth: 2,
  },
  text: {
    text: 'Hello World',
    fontSize: 16,
    fontFamily: 'Arial',
    fill: '#000000',
  },
} as const;
