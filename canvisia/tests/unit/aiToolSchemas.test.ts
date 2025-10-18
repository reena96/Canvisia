import { describe, it, expect } from 'vitest'
import { AI_TOOLS } from '@/services/ai/tools'

describe('AI Tool Schemas', () => {
  it('should have all 11 required tools defined', () => {
    expect(AI_TOOLS.length).toBe(11)

    const toolNames = AI_TOOLS.map(tool => tool.name)
    expect(toolNames).toContain('create_shape')
    expect(toolNames).toContain('create_text')
    expect(toolNames).toContain('create_arrow')
    expect(toolNames).toContain('move_element')
    expect(toolNames).toContain('resize_element')
    expect(toolNames).toContain('rotate_element')
    expect(toolNames).toContain('arrange_elements')
    expect(toolNames).toContain('align_elements')
    expect(toolNames).toContain('create_flowchart')
    expect(toolNames).toContain('create_ui_component')
    expect(toolNames).toContain('create_diagram')
  })

  it('should validate create_shape schema', () => {
    const createShape = AI_TOOLS.find(tool => tool.name === 'create_shape')
    expect(createShape).toBeDefined()
    expect(createShape?.input_schema.properties).toHaveProperty('shapeType')
    expect(createShape?.input_schema.properties).toHaveProperty('x')
    expect(createShape?.input_schema.properties).toHaveProperty('y')
    expect(createShape?.input_schema.required).toContain('shapeType')
    expect(createShape?.input_schema.required).toContain('x')
    expect(createShape?.input_schema.required).toContain('y')
  })

  it('should validate create_text schema', () => {
    const createText = AI_TOOLS.find(tool => tool.name === 'create_text')
    expect(createText).toBeDefined()
    expect(createText?.input_schema.properties).toHaveProperty('text')
    expect(createText?.input_schema.properties).toHaveProperty('x')
    expect(createText?.input_schema.properties).toHaveProperty('y')
    expect(createText?.input_schema.required).toContain('text')
  })

  it('should validate create_arrow schema', () => {
    const createArrow = AI_TOOLS.find(tool => tool.name === 'create_arrow')
    expect(createArrow).toBeDefined()
    expect(createArrow?.input_schema.properties).toHaveProperty('x1')
    expect(createArrow?.input_schema.properties).toHaveProperty('y1')
    expect(createArrow?.input_schema.properties).toHaveProperty('x2')
    expect(createArrow?.input_schema.properties).toHaveProperty('y2')
  })

  it('should validate move_element schema', () => {
    const moveElement = AI_TOOLS.find(tool => tool.name === 'move_element')
    expect(moveElement).toBeDefined()
    expect(moveElement?.input_schema.properties).toHaveProperty('elementId')
    expect(moveElement?.input_schema.properties).toHaveProperty('x')
    expect(moveElement?.input_schema.properties).toHaveProperty('y')
  })

  it('should validate resize_element schema', () => {
    const resizeElement = AI_TOOLS.find(tool => tool.name === 'resize_element')
    expect(resizeElement).toBeDefined()
    expect(resizeElement?.input_schema.properties).toHaveProperty('elementId')
  })

  it('should validate rotate_element schema', () => {
    const rotateElement = AI_TOOLS.find(tool => tool.name === 'rotate_element')
    expect(rotateElement).toBeDefined()
    expect(rotateElement?.input_schema.properties).toHaveProperty('elementId')
    expect(rotateElement?.input_schema.properties).toHaveProperty('rotation')
  })

  it('should validate arrange_elements schema', () => {
    const arrangeElements = AI_TOOLS.find(tool => tool.name === 'arrange_elements')
    expect(arrangeElements).toBeDefined()
    expect(arrangeElements?.input_schema.properties).toHaveProperty('elementIds')
    expect(arrangeElements?.input_schema.properties).toHaveProperty('pattern')
  })

  it('should validate align_elements schema', () => {
    const alignElements = AI_TOOLS.find(tool => tool.name === 'align_elements')
    expect(alignElements).toBeDefined()
    expect(alignElements?.input_schema.properties).toHaveProperty('elementIds')
    expect(alignElements?.input_schema.properties).toHaveProperty('alignment')
  })

  it('should validate create_flowchart schema', () => {
    const createFlowchart = AI_TOOLS.find(tool => tool.name === 'create_flowchart')
    expect(createFlowchart).toBeDefined()
    expect(createFlowchart?.input_schema.properties).toHaveProperty('nodes')
  })

  it('should validate create_ui_component schema', () => {
    const createUIComponent = AI_TOOLS.find(tool => tool.name === 'create_ui_component')
    expect(createUIComponent).toBeDefined()
    expect(createUIComponent?.input_schema.properties).toHaveProperty('componentType')
    expect(createUIComponent?.input_schema.properties).toHaveProperty('x')
    expect(createUIComponent?.input_schema.properties).toHaveProperty('y')
  })

  it('should validate create_diagram schema', () => {
    const createDiagram = AI_TOOLS.find(tool => tool.name === 'create_diagram')
    expect(createDiagram).toBeDefined()
    expect(createDiagram?.input_schema.properties).toHaveProperty('diagramType')
    expect(createDiagram?.input_schema.properties).toHaveProperty('data')
  })
})
