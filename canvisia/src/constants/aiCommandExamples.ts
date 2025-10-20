// AI Command Examples for Autocomplete
// Based on PR #17 Rubric Requirements

export interface CommandExample {
  command: string
  category: 'creation' | 'manipulation' | 'layout' | 'complex'
  description: string
}

export const AI_COMMAND_EXAMPLES: CommandExample[] = [
  // ========== CREATION COMMANDS ==========
  {
    command: 'Create a red circle at position 100, 200',
    category: 'creation',
    description: 'Create a circle with specific color and position'
  },
  {
    command: 'Add a text layer that says "Hello World"',
    category: 'creation',
    description: 'Add text to the canvas'
  },
  {
    command: 'Make a 200x300 rectangle',
    category: 'creation',
    description: 'Create a rectangle with specific dimensions'
  },
  {
    command: 'Create a blue circle',
    category: 'creation',
    description: 'Create a circle with smart positioning'
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
    command: 'Make 5 red circles',
    category: 'creation',
    description: 'Create multiple shapes at once'
  },

  // ========== MANIPULATION COMMANDS ==========
  {
    command: 'Move the blue rectangle to the center',
    category: 'manipulation',
    description: 'Move a specific shape to center'
  },
  {
    command: 'Resize the circle to be twice as big',
    category: 'manipulation',
    description: 'Resize a shape by scale factor'
  },
  {
    command: 'Rotate the text 45 degrees',
    category: 'manipulation',
    description: 'Rotate an element by degrees'
  },
  {
    command: 'Change the color of the hexagon to purple',
    category: 'manipulation',
    description: 'Change shape color'
  },
  {
    command: 'Move all circles to the right',
    category: 'manipulation',
    description: 'Move multiple shapes'
  },
  {
    command: 'Delete the red shapes',
    category: 'manipulation',
    description: 'Delete specific shapes'
  },

  // ========== LAYOUT COMMANDS ==========
  {
    command: 'Arrange these shapes in a horizontal row',
    category: 'layout',
    description: 'Arrange shapes horizontally'
  },
  {
    command: 'Create a grid of 3x3 squares',
    category: 'layout',
    description: 'Create a grid layout'
  },
  {
    command: 'Space these elements evenly',
    category: 'layout',
    description: 'Distribute elements with even spacing'
  },
  {
    command: 'Align all shapes to the left',
    category: 'layout',
    description: 'Align shapes to left edge'
  },
  {
    command: 'Stack the rectangles vertically',
    category: 'layout',
    description: 'Arrange shapes in vertical stack'
  },

  // ========== COMPLEX COMMANDS ==========
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
    command: 'Create a flowchart',
    category: 'complex',
    description: 'Create flowchart with nodes and connections'
  },
  {
    command: 'Make an org chart',
    category: 'complex',
    description: 'Create organizational chart'
  },
  {
    command: 'Create a button',
    category: 'complex',
    description: 'Create a styled button component'
  },
]

// Group examples by category for organized display
export const COMMAND_EXAMPLES_BY_CATEGORY = {
  creation: AI_COMMAND_EXAMPLES.filter(ex => ex.category === 'creation'),
  manipulation: AI_COMMAND_EXAMPLES.filter(ex => ex.category === 'manipulation'),
  layout: AI_COMMAND_EXAMPLES.filter(ex => ex.category === 'layout'),
  complex: AI_COMMAND_EXAMPLES.filter(ex => ex.category === 'complex'),
}
