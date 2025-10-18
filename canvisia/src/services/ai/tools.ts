// System prompt for Claude
export const SYSTEM_PROMPT = `You are Vega, a helpful AI assistant for Canvisia, a collaborative canvas application.
You are friendly, creative, and eager to help users create visual content.

When users ask who you are or what your name is, respond as "Vega" - that's your name and identity.
Do not mention Claude, Anthropic, or any other AI system names.

You can create and manipulate shapes, text, and arrows on the canvas.
When creating shapes, use reasonable default sizes if not specified.
Coordinates are in pixels, with (0,0) at the top-left corner.
Default canvas center is around (1000, 1000).

Keep your responses concise and friendly. Focus on helping users visualize their ideas.`

// Tool schemas for Claude function calling
export const AI_TOOLS = [
  {
    name: 'create_shape',
    description: 'Create a geometric shape (rectangle, circle, ellipse, etc.) on the canvas',
    input_schema: {
      type: 'object',
      properties: {
        shapeType: {
          type: 'string',
          enum: ['rectangle', 'circle', 'ellipse', 'roundedRectangle', 'cylinder', 'triangle', 'pentagon', 'hexagon', 'star'],
          description: 'The type of shape to create'
        },
        x: {
          type: 'number',
          description: 'X coordinate (pixels)'
        },
        y: {
          type: 'number',
          description: 'Y coordinate (pixels)'
        },
        width: {
          type: 'number',
          description: 'Width in pixels (for rectangle, roundedRectangle, cylinder)'
        },
        height: {
          type: 'number',
          description: 'Height in pixels (for rectangle, roundedRectangle, cylinder)'
        },
        radius: {
          type: 'number',
          description: 'Radius in pixels (for circle)'
        },
        radiusX: {
          type: 'number',
          description: 'Horizontal radius (for ellipse, triangle, pentagon, hexagon)'
        },
        radiusY: {
          type: 'number',
          description: 'Vertical radius (for ellipse, triangle, pentagon, hexagon)'
        },
        color: {
          type: 'string',
          description: 'Fill color (hex code, e.g., #FF0000 for red)'
        },
        cornerRadius: {
          type: 'number',
          description: 'Corner radius for roundedRectangle'
        }
      },
      required: ['shapeType', 'x', 'y']
    }
  },
  {
    name: 'create_text',
    description: 'Create a text label on the canvas',
    input_schema: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          description: 'The text content'
        },
        x: {
          type: 'number',
          description: 'X coordinate (pixels)'
        },
        y: {
          type: 'number',
          description: 'Y coordinate (pixels)'
        },
        fontSize: {
          type: 'number',
          description: 'Font size in pixels (default: 16)'
        },
        color: {
          type: 'string',
          description: 'Text color (hex code, default: #000000)'
        },
        fontFamily: {
          type: 'string',
          description: 'Font family (default: Arial)'
        }
      },
      required: ['text', 'x', 'y']
    }
  },
  {
    name: 'create_arrow',
    description: 'Create an arrow connecting two points on the canvas',
    input_schema: {
      type: 'object',
      properties: {
        x1: {
          type: 'number',
          description: 'Start X coordinate'
        },
        y1: {
          type: 'number',
          description: 'Start Y coordinate'
        },
        x2: {
          type: 'number',
          description: 'End X coordinate'
        },
        y2: {
          type: 'number',
          description: 'End Y coordinate'
        },
        color: {
          type: 'string',
          description: 'Arrow color (hex code, default: #000000)'
        },
        arrowType: {
          type: 'string',
          enum: ['arrow', 'bidirectionalArrow'],
          description: 'Type of arrow (default: arrow)'
        }
      },
      required: ['x1', 'y1', 'x2', 'y2']
    }
  },
  {
    name: 'move_element',
    description: 'Move a shape or text element to a new position',
    input_schema: {
      type: 'object',
      properties: {
        elementId: {
          type: 'string',
          description: 'ID of the element to move'
        },
        x: {
          type: 'number',
          description: 'New X coordinate'
        },
        y: {
          type: 'number',
          description: 'New Y coordinate'
        }
      },
      required: ['elementId', 'x', 'y']
    }
  },
  {
    name: 'resize_element',
    description: 'Resize a shape element',
    input_schema: {
      type: 'object',
      properties: {
        elementId: {
          type: 'string',
          description: 'ID of the element to resize'
        },
        width: {
          type: 'number',
          description: 'New width (for rectangles)'
        },
        height: {
          type: 'number',
          description: 'New height (for rectangles)'
        },
        radius: {
          type: 'number',
          description: 'New radius (for circles)'
        },
        scale: {
          type: 'number',
          description: 'Scale factor (e.g., 2.0 for double size)'
        }
      },
      required: ['elementId']
    }
  },
  {
    name: 'rotate_element',
    description: 'Rotate a shape or text element',
    input_schema: {
      type: 'object',
      properties: {
        elementId: {
          type: 'string',
          description: 'ID of the element to rotate'
        },
        rotation: {
          type: 'number',
          description: 'Rotation angle in degrees (0-360)'
        }
      },
      required: ['elementId', 'rotation']
    }
  },
  {
    name: 'arrange_elements',
    description: 'Arrange multiple elements in a pattern (grid, row, column)',
    input_schema: {
      type: 'object',
      properties: {
        elementIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of element IDs to arrange'
        },
        pattern: {
          type: 'string',
          enum: ['grid', 'row', 'column', 'circle'],
          description: 'Arrangement pattern'
        },
        spacing: {
          type: 'number',
          description: 'Spacing between elements in pixels (default: 20)'
        }
      },
      required: ['elementIds', 'pattern']
    }
  },
  {
    name: 'align_elements',
    description: 'Align multiple elements relative to each other',
    input_schema: {
      type: 'object',
      properties: {
        elementIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of element IDs to align'
        },
        alignment: {
          type: 'string',
          enum: ['left', 'right', 'top', 'bottom', 'center-horizontal', 'center-vertical'],
          description: 'Alignment direction'
        }
      },
      required: ['elementIds', 'alignment']
    }
  },
  {
    name: 'create_flowchart',
    description: 'Create a complete flowchart with connected nodes',
    input_schema: {
      type: 'object',
      properties: {
        nodes: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              label: { type: 'string' },
              type: { type: 'string', enum: ['start', 'process', 'decision', 'end'] }
            }
          },
          description: 'Array of flowchart nodes'
        },
        connections: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              from: { type: 'string' },
              to: { type: 'string' },
              label: { type: 'string' }
            }
          },
          description: 'Array of connections between nodes'
        },
        startX: {
          type: 'number',
          description: 'Starting X position for flowchart (default: 500)'
        },
        startY: {
          type: 'number',
          description: 'Starting Y position for flowchart (default: 200)'
        }
      },
      required: ['nodes']
    }
  },
  {
    name: 'create_ui_component',
    description: 'Create a common UI component (button, card, form, etc.)',
    input_schema: {
      type: 'object',
      properties: {
        componentType: {
          type: 'string',
          enum: ['button', 'card', 'form', 'navbar', 'sidebar'],
          description: 'Type of UI component to create'
        },
        x: {
          type: 'number',
          description: 'X coordinate'
        },
        y: {
          type: 'number',
          description: 'Y coordinate'
        },
        label: {
          type: 'string',
          description: 'Label or text for the component'
        },
        width: {
          type: 'number',
          description: 'Component width (default: 200)'
        },
        height: {
          type: 'number',
          description: 'Component height (default: 50)'
        }
      },
      required: ['componentType', 'x', 'y']
    }
  },
  {
    name: 'create_diagram',
    description: 'Create a structured diagram (org chart, tree, network)',
    input_schema: {
      type: 'object',
      properties: {
        diagramType: {
          type: 'string',
          enum: ['tree', 'orgchart', 'network', 'sequence'],
          description: 'Type of diagram to create'
        },
        data: {
          type: 'object',
          description: 'Diagram data structure (nodes and relationships)'
        },
        x: {
          type: 'number',
          description: 'Starting X coordinate (default: 500)'
        },
        y: {
          type: 'number',
          description: 'Starting Y coordinate (default: 200)'
        }
      },
      required: ['diagramType', 'data']
    }
  }
]
