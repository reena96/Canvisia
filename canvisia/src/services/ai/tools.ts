// System prompt for Claude
export const SYSTEM_PROMPT = `You are Vega, a helpful AI assistant for Canvisia, a collaborative canvas application.
You are friendly, creative, and eager to help users create visual content.

When users ask who you are or what your name is, respond as "Vega" - that's your name and identity.
Do not mention Claude, Anthropic, or any other AI system names.

CRITICAL: VIEWPORT-FIRST BEHAVIOR

Default Operations (what user currently sees):
- "align left" → left edge of VIEWPORT (visible area on screen)
- "create circle" → smart placement in VIEWPORT (omit x,y coordinates)
- "arrange in a row" → within VIEWPORT bounds

Only use CANVAS if user explicitly says:
- "align to canvas center" or "place at canvas edge"
- Otherwise, ALWAYS default to viewport

FILTERING RULES (MUST FOLLOW EXACTLY):
- "shapes" = ONLY geometric shapes (circle, hexagon, rectangle, etc.) - EXCLUDES text and arrows
- "text" = ONLY text elements - EXCLUDES geometric shapes
- "hexagons" = ONLY hexagon type - EXCLUDES all other shapes
- "red text" = ONLY text with red color - EXCLUDES shapes
- "red shapes" = ONLY geometric shapes with red color - EXCLUDES text

COORDINATE RULES:
- NEVER provide x,y coordinates unless user specifies exact position
- "create a circle" → omit x,y (system auto-places in viewport)
- "create a circle at 500,300" → x: 500, y: 300

EXAMPLES:
✅ "align all shapes to the left"
   → elementIds: ["all"], alignment: "left", category: "shapes", alignTo: "viewport"

✅ "create 10 circles"
   → type: "circle", NO x/y coordinates (repeat 10 times)

✅ "move red hexagons to the right"
   → elementIds: ["all"], alignment: "right", type: "hexagon", color: "red", alignTo: "viewport"

✅ "align text to canvas center"
   → elementIds: ["all"], alignment: "center-horizontal", category: "text", alignTo: "canvas"

✅ "arrange all shapes in a row"
   → elementIds: ["all"], pattern: "row", category: "shapes"

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
          description: 'X coordinate (pixels) - ONLY provide if user specifies exact position. Omit for smart placement in viewport.'
        },
        y: {
          type: 'number',
          description: 'Y coordinate (pixels) - ONLY provide if user specifies exact position. Omit for smart placement in viewport.'
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
      required: ['shapeType']
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
          description: 'X coordinate (pixels) - ONLY provide if user specifies exact position. Omit for smart placement in viewport.'
        },
        y: {
          type: 'number',
          description: 'Y coordinate (pixels) - ONLY provide if user specifies exact position. Omit for smart placement in viewport.'
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
      required: ['text']
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
          description: 'Start X coordinate - ONLY provide if user specifies exact position. Omit for smart placement in viewport.'
        },
        y1: {
          type: 'number',
          description: 'Start Y coordinate - ONLY provide if user specifies exact position. Omit for smart placement in viewport.'
        },
        x2: {
          type: 'number',
          description: 'End X coordinate - ONLY provide if user specifies exact position. Omit for smart placement in viewport.'
        },
        y2: {
          type: 'number',
          description: 'End Y coordinate - ONLY provide if user specifies exact position. Omit for smart placement in viewport.'
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
      required: []
    }
  },
  {
    name: 'move_element',
    description: 'Move a shape or text element to a new position. You can identify elements by type and color (e.g., "blue rectangle", "red circle") without needing the element ID.',
    input_schema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          description: 'Type of element (e.g., rectangle, circle, text, ellipse). Use this to identify the element by description.'
        },
        color: {
          type: 'string',
          description: 'Color of the element (e.g., "blue", "red", "mauve", "#FF0000"). Use this to identify the element by description.'
        },
        position: {
          type: 'string',
          description: 'Named position like "center", "top left", "top right", "bottom left", "bottom right", "left", "right", "top", "bottom"'
        },
        x: {
          type: 'number',
          description: 'Explicit X coordinate (use this instead of position for exact placement)'
        },
        y: {
          type: 'number',
          description: 'Explicit Y coordinate (use this instead of position for exact placement)'
        }
      },
      required: []
    }
  },
  {
    name: 'resize_element',
    description: 'Resize a shape element. You can identify elements by type and color (e.g., "the circle", "the blue rectangle") without needing the element ID.',
    input_schema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          description: 'Type of element (e.g., rectangle, circle, ellipse). Use this to identify the element by description.'
        },
        color: {
          type: 'string',
          description: 'Color of the element (e.g., "blue", "red"). Use this to identify the element by description.'
        },
        scale: {
          type: 'number',
          description: 'Scale factor (e.g., 2.0 for "twice as big", 0.5 for "half the size", 3.0 for "three times larger")'
        },
        width: {
          type: 'number',
          description: 'Explicit new width in pixels (use this instead of scale for exact sizing)'
        },
        height: {
          type: 'number',
          description: 'Explicit new height in pixels (use this instead of scale for exact sizing)'
        },
        radius: {
          type: 'number',
          description: 'Explicit new radius in pixels for circles (use this instead of scale for exact sizing)'
        }
      },
      required: []
    }
  },
  {
    name: 'rotate_element',
    description: 'Rotate a shape or text element. You can identify elements by type and color (e.g., "the text", "the blue rectangle") without needing the element ID.',
    input_schema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          description: 'Type of element (e.g., rectangle, circle, text). Use this to identify the element by description.'
        },
        color: {
          type: 'string',
          description: 'Color of the element (e.g., "blue", "red"). Use this to identify the element by description.'
        },
        angle: {
          type: 'number',
          description: 'Rotation angle in degrees (e.g., 45, 90, 180, -30)'
        }
      },
      required: ['angle']
    }
  },
  {
    name: 'arrange_elements',
    description: 'Arrange multiple elements in a pattern (grid, row, column). To arrange ALL shapes on the canvas, use "all" as the special keyword instead of specific IDs.',
    input_schema: {
      type: 'object',
      properties: {
        elementIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of element IDs to arrange, or ["all"] to arrange all shapes on the canvas'
        },
        pattern: {
          type: 'string',
          enum: ['grid', 'row', 'column', 'circle'],
          description: 'Arrangement pattern'
        },
        spacing: {
          type: 'number',
          description: 'Spacing between elements in pixels (default: 20)'
        },
        category: {
          type: 'string',
          enum: ['shapes', 'text', 'arrows'],
          description: 'Optional: Filter by category when using ["all"]. "shapes" = geometric shapes ONLY, excludes text/arrows.'
        },
        type: {
          type: 'string',
          description: 'Optional: Filter by specific type when using ["all"] (e.g., "hexagon", "circle", "text")'
        },
        color: {
          type: 'string',
          description: 'Optional: Filter by color when using ["all"] (e.g., "red", "blue", "#FF0000")'
        },
        textContent: {
          type: 'string',
          description: 'Optional: Filter text elements by content (partial match, case-insensitive) when using ["all"]'
        }
      },
      required: ['elementIds', 'pattern']
    }
  },
  {
    name: 'align_elements',
    description: 'Align multiple elements to viewport edges (default) or canvas. To align ALL shapes, use "all" keyword.',
    input_schema: {
      type: 'object',
      properties: {
        elementIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of element IDs to align, or ["all"] to align all shapes on the canvas'
        },
        alignment: {
          type: 'string',
          enum: ['left', 'right', 'top', 'bottom', 'center-horizontal', 'center-vertical'],
          description: 'Alignment direction'
        },
        alignTo: {
          type: 'string',
          enum: ['viewport', 'canvas'],
          description: 'Align to viewport (default, visible area) or canvas. Use "viewport" unless user explicitly says "canvas".'
        },
        category: {
          type: 'string',
          enum: ['shapes', 'text', 'arrows'],
          description: 'Optional: Filter by category when using ["all"]. "shapes" = geometric shapes ONLY, excludes text/arrows.'
        },
        type: {
          type: 'string',
          description: 'Optional: Filter by specific type when using ["all"] (e.g., "hexagon", "circle", "text")'
        },
        color: {
          type: 'string',
          description: 'Optional: Filter by color when using ["all"] (e.g., "red", "blue", "#FF0000")'
        },
        textContent: {
          type: 'string',
          description: 'Optional: Filter text elements by content (partial match, case-insensitive) when using ["all"]'
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
