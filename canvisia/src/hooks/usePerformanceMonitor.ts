import { useEffect, useRef } from 'react'

interface PerformanceMetrics {
  fps: number
  renderTime: number
  shapeCount: number
  visibleShapeCount: number
}

export function usePerformanceMonitor(
  shapeCount: number,
  visibleShapeCount: number,
  enabled: boolean = process.env.NODE_ENV === 'development'
) {
  const frameCount = useRef(0)
  const lastTime = useRef(performance.now())
  const fps = useRef(60)
  const renderStartTime = useRef(0)
  const metricsLogInterval = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!enabled) return

    renderStartTime.current = performance.now()

    const measureFrame = () => {
      const currentTime = performance.now()
      frameCount.current++

      // Calculate FPS every second
      if (currentTime >= lastTime.current + 1000) {
        fps.current = Math.round((frameCount.current * 1000) / (currentTime - lastTime.current))
        frameCount.current = 0
        lastTime.current = currentTime
      }

      // Warn if FPS drops below 30
      if (fps.current < 30) {
        console.warn(`⚠️ Low FPS detected: ${fps.current} FPS (Target: 60 FPS)`)
      }

      requestAnimationFrame(measureFrame)
    }

    const animationFrame = requestAnimationFrame(measureFrame)

    // Log metrics every 5 seconds
    metricsLogInterval.current = setInterval(() => {
      const metrics: PerformanceMetrics = {
        fps: fps.current,
        renderTime: performance.now() - renderStartTime.current,
        shapeCount,
        visibleShapeCount,
      }

      console.log('📊 Performance Metrics:', {
        FPS: metrics.fps,
        'Total Shapes': metrics.shapeCount,
        'Visible Shapes': metrics.visibleShapeCount,
        'Culling Ratio': `${Math.round(((metrics.shapeCount - metrics.visibleShapeCount) / Math.max(metrics.shapeCount, 1)) * 100)}%`,
        'Render Time': `${metrics.renderTime.toFixed(2)}ms`,
      })

      // Warn if shape count is high
      if (metrics.shapeCount > 500) {
        console.warn(`⚠️ High shape count: ${metrics.shapeCount} shapes (recommended: <500)`)
      }
    }, 5000)

    return () => {
      cancelAnimationFrame(animationFrame)
      if (metricsLogInterval.current) {
        clearInterval(metricsLogInterval.current)
      }
    }
  }, [shapeCount, visibleShapeCount, enabled])

  return { fps: fps.current }
}
