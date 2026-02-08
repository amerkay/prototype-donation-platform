/**
 * PDF scaling utilities.
 *
 * Used by wrap-pdf-page.ts to scale preview-width content to fill A4 pages.
 */

/** Preview panel width in AdminEditLayout (lg:w-95 = 380px) */
export const PREVIEW_WIDTH_PX = 380

/** CSS pixels per mm (at 96 DPI) */
const MM_TO_PX = 3.7795275591

/** Compute the scale factor to fill A4 from the preview width */
export function getScaleFactor(orientation: 'portrait' | 'landscape'): number {
  const pageWidthMm = orientation === 'landscape' ? 297 : 210
  return (pageWidthMm * MM_TO_PX) / PREVIEW_WIDTH_PX
}

/** Compute the content height at preview width for a given A4 orientation */
export function getContentHeight(orientation: 'portrait' | 'landscape'): number {
  const ratio = orientation === 'landscape' ? 210 / 297 : 297 / 210
  return Math.round(PREVIEW_WIDTH_PX * ratio)
}
