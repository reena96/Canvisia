// AI Command Examples for Autocomplete
// Based on PR #17 Rubric Requirements

export interface CommandExample {
  command: string
  category: 'creation' | 'manipulation' | 'layout' | 'complex'
  description: string
}

export const AI_COMMAND_EXAMPLES: CommandExample[] = [
  // ========== CREATION COMMANDS (create_shape, create_multiple_shapes, create_text, create_arrow) ==========

  // Single shapes with smart placement
  {
    command: 'Create a blue circle',
    category: 'creation',
    description: 'Create a circle with smart viewport placement'
  },
  {
    command: 'Add a green hexagon',
    category: 'creation',
    description: 'Create a hexagon shape'
  },
  {
    command: 'Create a yellow star',
    category: 'creation',
    description: 'Create a star shape'
  },
  {
    command: 'Make a purple triangle',
    category: 'creation',
    description: 'Create a triangle'
  },
  {
    command: 'Add a red pentagon',
    category: 'creation',
    description: 'Create a pentagon shape'
  },

  // Single shapes with explicit positioning
  {
    command: 'Create a red circle at position 100, 200',
    category: 'creation',
    description: 'Create a circle with specific color and position'
  },
  {
    command: 'Make a 200x300 rectangle',
    category: 'creation',
    description: 'Create a rectangle with specific dimensions'
  },

  // Multiple shapes
  {
    command: 'Make 5 red circles',
    category: 'creation',
    description: 'Create multiple shapes at once'
  },
  {
    command: 'Create 100 blue squares',
    category: 'creation',
    description: 'Create many shapes with grid layout'
  },
  {
    command: 'Create a grid of 3x3 squares',
    category: 'creation',
    description: 'Create a grid layout'
  },
  {
    command: 'Make 10 hexagons in a row',
    category: 'creation',
    description: 'Create shapes in horizontal row'
  },

  // Text
  {
    command: 'Add a text layer that says "Hello World"',
    category: 'creation',
    description: 'Add text to the canvas'
  },
  {
    command: 'Create text "Welcome" in red size 24',
    category: 'creation',
    description: 'Create text with custom color and size'
  },

  // Arrows
  {
    command: 'Draw an arrow from 100,100 to 500,500',
    category: 'creation',
    description: 'Create an arrow with specific coordinates'
  },
  {
    command: 'Create a bidirectional arrow',
    category: 'creation',
    description: 'Create a two-way arrow'
  },

  // ========== MANIPULATION COMMANDS (move_element, resize_element, rotate_element) ==========

  // Move with named positions
  {
    command: 'Move the blue rectangle to the center',
    category: 'manipulation',
    description: 'Move a specific shape to center'
  },
  {
    command: 'Move all circles to the right',
    category: 'manipulation',
    description: 'Move multiple shapes to right edge'
  },
  {
    command: 'Move the red hexagon to top left',
    category: 'manipulation',
    description: 'Move shape to corner position'
  },
  {
    command: 'Move selected shapes to the bottom',
    category: 'manipulation',
    description: 'Move selection to bottom edge'
  },

  // Move with explicit coordinates
  {
    command: 'Move the circle to position 500, 300',
    category: 'manipulation',
    description: 'Move shape to exact coordinates'
  },

  // Resize with scale factor
  {
    command: 'Resize the circle to be twice as big',
    category: 'manipulation',
    description: 'Resize a shape by scale factor'
  },
  {
    command: 'Make the rectangle half the size',
    category: 'manipulation',
    description: 'Resize shape smaller by scale'
  },
  {
    command: 'Scale the hexagon by 3',
    category: 'manipulation',
    description: 'Resize shape to 3x larger'
  },

  // Resize with explicit dimensions
  {
    command: 'Resize the rectangle to 300x200 pixels',
    category: 'manipulation',
    description: 'Resize with exact dimensions'
  },
  {
    command: 'Make the ellipse 150x100',
    category: 'manipulation',
    description: 'Resize ellipse to specific size'
  },

  // Rotate
  {
    command: 'Rotate the text 45 degrees',
    category: 'manipulation',
    description: 'Rotate an element by degrees'
  },
  {
    command: 'Rotate the blue circle 90 degrees',
    category: 'manipulation',
    description: 'Rotate shape clockwise'
  },
  {
    command: 'Rotate all rectangles by -30 degrees',
    category: 'manipulation',
    description: 'Rotate multiple shapes counter-clockwise'
  },

  // ========== LAYOUT COMMANDS (arrange_elements, align_elements) ==========

  // Arrange patterns
  {
    command: 'Arrange these shapes in a horizontal row',
    category: 'layout',
    description: 'Arrange shapes horizontally'
  },
  {
    command: 'Stack the rectangles vertically',
    category: 'layout',
    description: 'Arrange shapes in vertical stack'
  },
  {
    command: 'Arrange all shapes in a grid',
    category: 'layout',
    description: 'Arrange all shapes in grid pattern'
  },
  {
    command: 'Arrange all red hexagons in a circle',
    category: 'layout',
    description: 'Arrange filtered shapes in circular pattern'
  },
  {
    command: 'Space these elements evenly',
    category: 'layout',
    description: 'Distribute elements with even spacing'
  },

  // Align to viewport (default)
  {
    command: 'Align all shapes to the left',
    category: 'layout',
    description: 'Align shapes to left edge of viewport'
  },
  {
    command: 'Align these elements center-horizontal',
    category: 'layout',
    description: 'Center align elements horizontally'
  },
  {
    command: 'Align red hexagons to the right edge',
    category: 'layout',
    description: 'Align filtered shapes to right'
  },
  {
    command: 'Align selected shapes to the top',
    category: 'layout',
    description: 'Align selection to top edge'
  },

  // Align to canvas
  {
    command: 'Align text to canvas center',
    category: 'layout',
    description: 'Align text to canvas center point'
  },
  {
    command: 'Align all shapes to canvas center',
    category: 'layout',
    description: 'Center all shapes on canvas'
  },

  // ========== COMPLEX COMMANDS (create_flowchart, create_ui_component, create_diagram) ==========

  // Flowcharts
  {
    command: 'Create a flowchart',
    category: 'complex',
    description: 'Create flowchart with nodes and connections'
  },
  {
    command: 'Build a flowchart with start, process, decision, and end nodes',
    category: 'complex',
    description: 'Create complete flowchart structure'
  },

  // UI Components
  {
    command: 'Create a login form',
    category: 'complex',
    description: 'Create login form with username and password fields'
  },
  {
    command: 'Build a navigation bar',
    category: 'complex',
    description: 'Create navigation bar with menu items'
  },
  {
    command: 'Make a card layout',
    category: 'complex',
    description: 'Create card with title and content'
  },
  {
    command: 'Create a button',
    category: 'complex',
    description: 'Create a styled button component'
  },
  {
    command: 'Create a sidebar with menu items',
    category: 'complex',
    description: 'Create sidebar component'
  },

  // Diagrams
  {
    command: 'Make an org chart',
    category: 'complex',
    description: 'Create organizational chart'
  },
  {
    command: 'Create an organizational chart with CEO and 3 managers',
    category: 'complex',
    description: 'Create org chart with specific hierarchy'
  },
  {
    command: 'Build a tree diagram',
    category: 'complex',
    description: 'Create tree structure diagram'
  },
]

// Group examples by category for organized display
export const COMMAND_EXAMPLES_BY_CATEGORY = {
  creation: AI_COMMAND_EXAMPLES.filter(ex => ex.category === 'creation'),
  manipulation: AI_COMMAND_EXAMPLES.filter(ex => ex.category === 'manipulation'),
  layout: AI_COMMAND_EXAMPLES.filter(ex => ex.category === 'layout'),
  complex: AI_COMMAND_EXAMPLES.filter(ex => ex.category === 'complex'),
}
