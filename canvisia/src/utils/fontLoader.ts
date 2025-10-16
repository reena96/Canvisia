export const AVAILABLE_FONTS = [
  'Inter',
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Poppins',
  'Shadows Into Light',
  'Kaushan Script',
  'Dancing Script',
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Georgia',
  'Courier New',
  'Verdana',
] as const

export type FontFamily = typeof AVAILABLE_FONTS[number]

export const DEFAULT_FONT: FontFamily = 'Inter'

export function isFontLoaded(fontFamily: string): boolean {
  return document.fonts.check(`16px "${fontFamily}"`)
}

export async function loadFont(fontFamily: string): Promise<void> {
  if (isFontLoaded(fontFamily)) {
    return
  }

  try {
    await document.fonts.load(`16px "${fontFamily}"`)
  } catch (error) {
    console.warn(`Failed to load font: ${fontFamily}`, error)
  }
}
