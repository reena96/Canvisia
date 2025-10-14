/**
 * Throttle a function to limit how often it can be called
 *
 * @param func - Function to throttle
 * @param delay - Minimum time between calls in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCallTime = 0
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  let lastArgs: Parameters<T> | null = null

  return function throttled(...args: Parameters<T>) {
    const now = Date.now()
    const timeSinceLastCall = now - lastCallTime

    // Store the latest arguments
    lastArgs = args

    if (timeSinceLastCall >= delay) {
      // Enough time has passed, call immediately
      lastCallTime = now
      func(...args)
      lastArgs = null
    } else if (!timeoutId) {
      // Schedule a call for when the delay period is up
      const remainingTime = delay - timeSinceLastCall
      timeoutId = setTimeout(() => {
        lastCallTime = Date.now()
        timeoutId = null
        if (lastArgs) {
          func(...lastArgs)
          lastArgs = null
        }
      }, remainingTime)
    }
  }
}
