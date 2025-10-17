import Konva from 'konva'

/**
 * Fits a Konva node into a bounding box by scaling and centering
 * @param node - The Konva node to fit
 * @param boxW - Target box width
 * @param boxH - Target box height
 * @param padding - Padding around the shape
 */
function fitToBox(node: Konva.Node, boxW = 26, boxH = 26, padding = 2) {
  // Include stroke when measuring; skipShadow avoids blurry padding
  const r = node.getClientRect({ skipShadow: true })
  const scale = Math.min(
    (boxW - 2 * padding) / r.width,
    (boxH - 2 * padding) / r.height
  )

  node.scale({ x: scale, y: scale })

  // Re-center inside the target box
  const after = node.getClientRect({ skipShadow: true })
  node.x(node.x() - after.x + (boxW - after.width) / 2)
  node.y(node.y() - after.y + (boxH - after.height) / 2)
}

/**
 * Creates a shape icon as a data URL
 * @param makeShapeFn - Function that creates the Konva shape
 * @param size - Size of the icon (width and height)
 * @returns Data URL of the rendered icon
 */
function createShapeIcon(makeShapeFn: () => Konva.Shape | Konva.Group, size = 26): string {
  // Create a temporary stage (off-screen)
  const stage = new Konva.Stage({
    container: document.createElement('div'),
    width: size,
    height: size,
  })

  const layer = new Konva.Layer()
  stage.add(layer)

  const group = new Konva.Group({ width: size, height: size })
  const shape = makeShapeFn()

  // Keep stroke width constant when scaling
  const disableStrokeScale = (node: Konva.Node) => {
    if ('strokeScaleEnabled' in node) {
      (node as any).strokeScaleEnabled(false)
    }
    if ('getChildren' in node) {
      (node as Konva.Group).getChildren().forEach(disableStrokeScale)
    }
  }
  disableStrokeScale(shape)

  group.add(shape)
  layer.add(group)

  // Fit the shape into the target box
  fitToBox(group, size, size)

  layer.draw()

  // Export as data URL
  const dataURL = stage.toDataURL({ pixelRatio: 2 }) // 2x for retina displays

  // Cleanup
  stage.destroy()

  return dataURL
}

// Generate all shape icons
export const shapeIcons = {
  rectangle: createShapeIcon(() =>
    new Konva.Rect({
      width: 100,
      height: 100,
      stroke: '#1F2937',
      strokeWidth: 2,
    })
  ),

  circle: createShapeIcon(() =>
    new Konva.Circle({
      x: 50,
      y: 50,
      radius: 50,
      stroke: '#1F2937',
      strokeWidth: 2,
    })
  ),

  ellipse: createShapeIcon(() =>
    new Konva.Ellipse({
      x: 50,
      y: 50,
      radiusX: 40,
      radiusY: 60,
      stroke: '#1F2937',
      strokeWidth: 2,
    })
  ),

  roundedRectangle: createShapeIcon(() =>
    new Konva.Rect({
      width: 100,
      height: 100,
      cornerRadius: 10,
      stroke: '#1F2937',
      strokeWidth: 2,
    })
  ),

  cylinder: createShapeIcon(() => {
    const group = new Konva.Group()
    const width = 100
    const height = 100
    const ellipseRadiusY = width / 6 // Flatter ellipses for better proportion

    // Cylinder body (left and right lines only)
    group.add(
      new Konva.Line({
        points: [0, ellipseRadiusY, 0, height - ellipseRadiusY],
        stroke: '#1F2937',
        strokeWidth: 2,
      })
    )
    group.add(
      new Konva.Line({
        points: [width, ellipseRadiusY, width, height - ellipseRadiusY],
        stroke: '#1F2937',
        strokeWidth: 2,
      })
    )

    // Top ellipse (full)
    group.add(
      new Konva.Ellipse({
        x: width / 2,
        y: ellipseRadiusY,
        radiusX: width / 2,
        radiusY: ellipseRadiusY,
        stroke: '#1F2937',
        strokeWidth: 2,
      })
    )

    // Bottom ellipse (full)
    group.add(
      new Konva.Ellipse({
        x: width / 2,
        y: height - ellipseRadiusY,
        radiusX: width / 2,
        radiusY: ellipseRadiusY,
        stroke: '#1F2937',
        strokeWidth: 2,
      })
    )

    return group
  }),

  triangle: createShapeIcon(() =>
    new Konva.RegularPolygon({
      x: 50,
      y: 50,
      sides: 3,
      radius: 60,
      stroke: '#1F2937',
      strokeWidth: 2,
    })
  ),

  pentagon: createShapeIcon(() =>
    new Konva.RegularPolygon({
      x: 50,
      y: 50,
      sides: 5,
      radius: 60,
      stroke: '#1F2937',
      strokeWidth: 2,
    })
  ),

  hexagon: createShapeIcon(() =>
    new Konva.RegularPolygon({
      x: 50,
      y: 50,
      sides: 6,
      radius: 60,
      stroke: '#1F2937',
      strokeWidth: 2,
    })
  ),

  star: createShapeIcon(() =>
    new Konva.Star({
      x: 50,
      y: 50,
      numPoints: 5,
      innerRadius: 25,
      outerRadius: 60,
      stroke: '#1F2937',
      strokeWidth: 2,
    })
  ),

  arrow: createShapeIcon(() =>
    new Konva.Arrow({
      points: [10, 50, 90, 50],
      stroke: '#1F2937',
      strokeWidth: 2,
      fill: '#1F2937',
      pointerLength: 10,
      pointerWidth: 10,
    })
  ),

  bidirectionalArrow: createShapeIcon(() =>
    new Konva.Arrow({
      points: [10, 50, 90, 50],
      stroke: '#1F2937',
      strokeWidth: 2,
      fill: '#1F2937',
      pointerLength: 10,
      pointerWidth: 10,
      pointerAtBeginning: true,
      pointerAtEnding: true,
    })
  ),

  bentConnector: createShapeIcon(() =>
    new Konva.Line({
      points: [10, 70, 50, 70, 50, 30, 90, 30],
      stroke: '#1F2937',
      strokeWidth: 2,
    })
  ),

  // Combined line and arrow icon for Lines & Connectors group
  lineAndArrow: createShapeIcon(() => {
    const group = new Konva.Group()

    // Line on top
    group.add(
      new Konva.Line({
        points: [10, 30, 90, 30],
        stroke: '#1F2937',
        strokeWidth: 2,
      })
    )

    // Arrow on bottom
    group.add(
      new Konva.Arrow({
        points: [10, 70, 90, 70],
        stroke: '#1F2937',
        strokeWidth: 2,
        fill: '#1F2937',
        pointerLength: 10,
        pointerWidth: 10,
      })
    )

    return group
  }),
}

// Tool icons (non-shape tools)
export const toolIcons = {
  select: '➚',
  hand: '✋',
  line: '—',
  text: 'T',
}
