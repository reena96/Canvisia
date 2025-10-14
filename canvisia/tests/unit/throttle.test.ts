import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { throttle } from '@/utils/throttle'

describe('throttle', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should call function immediately on first call', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 100)

    throttled('arg1', 'arg2')

    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith('arg1', 'arg2')
  })

  it('should throttle subsequent calls within time window', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 100)

    throttled() // Called immediately
    throttled() // Throttled
    throttled() // Throttled

    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should call function again after throttle period', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 100)

    throttled() // Called immediately
    expect(fn).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(50) // 50ms passed
    throttled() // Still throttled
    expect(fn).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(60) // 110ms total passed
    throttled() // Should be called
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('should preserve latest arguments during throttle period', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 100)

    throttled(1)
    throttled(2) // Throttled, but args saved
    throttled(3) // Throttled, but args saved

    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenLastCalledWith(1)

    vi.advanceTimersByTime(110)

    // Should call with latest args (3)
    expect(fn).toHaveBeenCalledTimes(2)
    expect(fn).toHaveBeenLastCalledWith(3)
  })

  it('should handle multiple throttle instances independently', () => {
    const fn1 = vi.fn()
    const fn2 = vi.fn()
    const throttled1 = throttle(fn1, 100)
    const throttled2 = throttle(fn2, 200)

    throttled1()
    throttled2()

    expect(fn1).toHaveBeenCalledTimes(1)
    expect(fn2).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(110)
    throttled1()
    throttled2() // Still throttled

    expect(fn1).toHaveBeenCalledTimes(2)
    expect(fn2).toHaveBeenCalledTimes(1)
  })

  it('should work with 50ms throttle for cursor updates', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 50) // 20 updates/second

    // Simulate rapid cursor moves
    for (let i = 0; i < 10; i++) {
      throttled(i, i)
      vi.advanceTimersByTime(10) // 10ms between calls
    }

    // Should only call ~2-3 times (every 50ms)
    expect(fn.mock.calls.length).toBeLessThanOrEqual(3)
    expect(fn.mock.calls.length).toBeGreaterThanOrEqual(2)
  })
})
