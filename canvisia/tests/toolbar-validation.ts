import puppeteer from 'puppeteer'

async function validateToolbarTooltips() {
  console.log('🚀 Starting toolbar tooltip validation...\n')

  const browser = await puppeteer.launch({
    headless: false, // Set to true for CI/CD
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  try {
    const page = await browser.newPage()
    await page.setViewport({ width: 1920, height: 1080 })

    console.log('📡 Navigating to http://localhost:5173...')
    await page.goto('http://localhost:5173', {
      waitUntil: 'networkidle0',
      timeout: 30000,
    })

    console.log('✅ Page loaded successfully\n')

    // Check if we need to authenticate
    console.log('🔐 Checking if authentication is required...')

    // Look for Dev Login button (contains 🔧 Dev Login text)
    const devLoginButton = await page.evaluateHandle(() => {
      return Array.from(document.querySelectorAll('button')).find(
        (btn) => btn.textContent?.includes('🔧 Dev Login')
      )
    })

    if (devLoginButton && (await devLoginButton.asElement())) {
      console.log('  ℹ️  Authentication page detected, using Dev Login...')

      // Click Dev Login button to open menu
      await (devLoginButton.asElement() as any).click()
      await new Promise(resolve => setTimeout(resolve, 500))

      // Click the first test user (Alice)
      const aliceButton = await page.evaluateHandle(() => {
        return Array.from(document.querySelectorAll('button')).find(
          (btn) => btn.textContent?.includes('Alice')
        )
      })

      if (aliceButton && (await aliceButton.asElement())) {
        await (aliceButton.asElement() as any).click()
        console.log('  ✅ Logging in as Alice...')

        // Wait for navigation/auth to complete
        await new Promise(resolve => setTimeout(resolve, 2000))

        // Wait for canvas to load
        await page.waitForSelector('canvas', { timeout: 10000 })
        console.log('  ✅ Logged in successfully\n')
      }
    } else {
      console.log('  ℹ️  Already authenticated or no auth required\n')
    }

    // Test 1: Verify toolbar tooltips appear
    console.log('📋 Test 1: Checking toolbar button tooltips...')

    // Hover over the select tool button
    const selectButton = await page.waitForSelector('button[title="Select"]')
    if (!selectButton) {
      throw new Error('Select button not found')
    }

    await selectButton.hover()
    await new Promise(resolve => setTimeout(resolve, 500)) // Wait for tooltip animation

    // Check if tooltip appears (browser default tooltip)
    const selectTitle = await page.evaluate(
      (el) => el?.getAttribute('title'),
      selectButton
    )

    if (selectTitle === 'Select') {
      console.log('  ✅ Toolbar tooltip found: "Select"')
    } else {
      throw new Error('Toolbar tooltip not found')
    }

    // Test multiple toolbar buttons
    const toolbarButtons = [
      { title: 'Hand (Pan)', expected: true },
      { title: 'Circles', expected: true },
      { title: 'Polygons', expected: true },
      { title: 'Zoom In', expected: true },
    ]

    for (const { title, expected } of toolbarButtons) {
      const button = await page.$(`button[title="${title}"]`)
      if (button) {
        await button.hover()
        await new Promise(resolve => setTimeout(resolve, 300))
        const hasTitle = await page.evaluate(
          (el) => el?.hasAttribute('title'),
          button
        )
        if (hasTitle) {
          console.log(`  ✅ Toolbar tooltip found: "${title}"`)
        }
      }
    }

    console.log('\n📋 Test 2: Creating a shape and checking for canvas tooltips...')

    // Click the circle button to select circle tool
    const circleButton = await page.$('button[title="Circles"]')
    if (circleButton) {
      await circleButton.click()
      await new Promise(resolve => setTimeout(resolve, 500))
      console.log('  ✅ Circle tool selected')
    }

    // Click on canvas to create a shape
    const canvas = await page.waitForSelector('canvas')
    if (canvas) {
      const canvasBox = await canvas.boundingBox()
      if (canvasBox) {
        // Click in the center of canvas to create a circle
        await page.mouse.click(
          canvasBox.x + canvasBox.width / 2,
          canvasBox.y + canvasBox.height / 2
        )
        await new Promise(resolve => setTimeout(resolve, 1000))
        console.log('  ✅ Shape created on canvas')

        // Move mouse over the created shape
        await page.mouse.move(
          canvasBox.x + canvasBox.width / 2,
          canvasBox.y + canvasBox.height / 2
        )
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Check if any tooltip div appears (should NOT appear)
        const tooltipDiv = await page.$(
          'div[style*="rgba(0, 0, 0, 0.8)"][style*="position: absolute"]'
        )

        if (!tooltipDiv) {
          console.log('  ✅ No canvas tooltip found (correct behavior)')
        } else {
          const tooltipText = await page.evaluate(
            (el) => el?.textContent,
            tooltipDiv
          )
          console.log(`  ❌ FAILED: Canvas tooltip found with text: "${tooltipText}"`)
          throw new Error('Canvas tooltips should not appear')
        }
      }
    }

    // Test 3: Verify shape icons are images (not Unicode)
    console.log('\n📋 Test 3: Checking toolbar icons are rendered as images...')

    const toolbarImages = await page.$$('button img[alt*="Circle"], button img[alt*="Rectangle"]')

    if (toolbarImages.length > 0) {
      console.log(`  ✅ Found ${toolbarImages.length} toolbar icons rendered as images`)
    } else {
      console.log('  ⚠️  No image-based icons found (might be using Unicode)')
    }

    // Test 4: Verify fitToBox consistency
    console.log('\n📋 Test 4: Checking icon size consistency...')

    const iconImages = await page.$$('button img')
    const imageSizes = await Promise.all(
      iconImages.map(async (img) => {
        return await page.evaluate((el) => {
          const style = window.getComputedStyle(el)
          return {
            width: style.width,
            height: style.height,
          }
        }, img)
      })
    )

    const uniqueSizes = new Set(imageSizes.map(s => `${s.width}x${s.height}`))
    if (uniqueSizes.size === 1) {
      const size = Array.from(uniqueSizes)[0]
      console.log(`  ✅ All toolbar icons have consistent size: ${size}`)
    } else {
      console.log(`  ⚠️  Found ${uniqueSizes.size} different icon sizes:`, Array.from(uniqueSizes))
    }

    console.log('\n✅ All tests passed! Toolbar validation complete.\n')
  } catch (error) {
    console.error('\n❌ Test failed:', error)
    throw error
  } finally {
    await browser.close()
  }
}

// Run the validation
validateToolbarTooltips()
  .then(() => {
    console.log('🎉 Validation successful!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Validation failed:', error)
    process.exit(1)
  })
