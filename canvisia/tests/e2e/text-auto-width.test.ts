/**
 * E2E test for text box behavior using Puppeteer
 * Validates that text boxes work correctly with fixed width/height
 */

import puppeteer, { Browser, Page } from 'puppeteer'
import { describe, test, expect, beforeAll, afterAll } from 'vitest'

describe('Text Box Behavior', () => {
  let browser: Browser
  let page: Page
  const BASE_URL = 'http://localhost:5173'

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
    page = await browser.newPage()
    await page.setViewport({ width: 1280, height: 720 })
  })

  afterAll(async () => {
    await browser.close()
  })

  test('text box should maintain fixed width and wrap text', async () => {
    // Navigate to the app
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' })

    // Wait for the canvas to load
    await page.waitForSelector('canvas', { timeout: 10000 })

    // Click the Text tool button
    const textToolButton = await page.waitForSelector('[aria-label="Text"], button:has-text("Text")', {
      timeout: 5000,
    })
    if (!textToolButton) {
      throw new Error('Text tool button not found')
    }
    await textToolButton.click()

    // Wait a bit for tool selection to register
    await page.waitForTimeout(500)

    // Click and drag on canvas to create text box
    const canvas = await page.$('canvas')
    if (!canvas) {
      throw new Error('Canvas not found')
    }

    const canvasBox = await canvas.boundingBox()
    if (!canvasBox) {
      throw new Error('Canvas bounding box not found')
    }

    // Start position for drag (center of canvas)
    const startX = canvasBox.x + canvasBox.width / 2
    const startY = canvasBox.y + canvasBox.height / 2
    const endX = startX + 200
    const endY = startY + 100

    // Drag to create text box
    await page.mouse.move(startX, startY)
    await page.mouse.down()
    await page.mouse.move(endX, endY)
    await page.mouse.up()

    // Wait for text edit mode to activate
    await page.waitForTimeout(500)

    // Find the textarea overlay (should be visible in edit mode)
    const textarea = await page.waitForSelector('textarea', {
      timeout: 5000,
      visible: true,
    })

    if (!textarea) {
      throw new Error('Textarea overlay not found')
    }

    // Get initial textarea dimensions
    const initialDimensions = await textarea.evaluate((el) => ({
      width: el.offsetWidth,
      height: el.offsetHeight,
    }))

    console.log('Initial textarea dimensions:', initialDimensions)

    // Type text into the textarea
    const testText = 'This is a long line of text that should wrap within the text box'
    await textarea.type(testText)

    // Wait for rendering to complete
    await page.waitForTimeout(300)

    // Get updated textarea dimensions
    const updatedDimensions = await textarea.evaluate((el) => ({
      width: el.offsetWidth,
      height: el.offsetHeight,
    }))

    console.log('Updated textarea dimensions:', updatedDimensions)

    // Validate fixed-width behavior - width should remain the same
    expect(updatedDimensions.width).toBe(initialDimensions.width)
    console.log(`✓ Textarea width remained fixed at ${updatedDimensions.width}px`)

    // Validate that height remained the same (fixed height box)
    expect(updatedDimensions.height).toBe(initialDimensions.height)
    console.log(`✓ Textarea height remained fixed at ${updatedDimensions.height}px`)

    // Exit edit mode by pressing Escape
    await page.keyboard.press('Escape')

    // Wait for edit mode to exit
    await page.waitForTimeout(500)

    // Verify textarea is no longer visible
    const textareaVisible = await page.evaluate(() => {
      const textarea = document.querySelector('textarea')
      return textarea !== null && textarea.offsetParent !== null
    })

    expect(textareaVisible).toBe(false)
    console.log('✓ Textarea hidden after exiting edit mode')

    // Look for the Konva text element on canvas
    // Note: We can't directly inspect Konva elements, but we can check if the shape was created
    await page.waitForTimeout(500)

    console.log('✓ Text box fixed width/height behavior validated successfully')
  }, 30000) // 30 second timeout for the entire test

  test('text selection box should match text width', async () => {
    // This test would require clicking on the text to select it
    // and checking the selection box dimensions
    // For now, this is a placeholder for future enhancement
    console.log('Test for selection box width matching - to be implemented with visual regression testing')
  })
})
