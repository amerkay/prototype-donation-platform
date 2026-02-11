/**
 * A4 page geometry utilities for PDF/print rendering.
 */
import type { CertificateLayoutId } from '../types'

const MM_TO_CSS_PX = 96 / 25.4

const PAGE_MM = {
  portrait: { width: 210, height: 297 },
  landscape: { width: 297, height: 210 }
} as const

export type PageOrientation = 'portrait' | 'landscape'

/** Layout ID to orientation mapping */
const LAYOUT_ORIENTATIONS: Record<CertificateLayoutId, PageOrientation> = {
  'portrait-classic': 'portrait',
  'landscape-classic': 'landscape'
}

export interface PageRenderGeometry {
  orientation: PageOrientation
  canvasWidthPx: number
  canvasHeightPx: number
}

function mmToCssPx(mm: number): number {
  return Math.round(mm * MM_TO_CSS_PX)
}

/**
 * Get the orientation for a given certificate layout ID.
 */
export function getLayoutOrientation(layoutId: CertificateLayoutId): PageOrientation {
  return LAYOUT_ORIENTATIONS[layoutId] ?? 'portrait'
}

/**
 * Get the canvas geometry for A4 page rendering (in CSS pixels).
 */
export function getPageRenderGeometry(
  input: CertificateLayoutId | PageOrientation
): PageRenderGeometry {
  const orientation =
    input === 'portrait' || input === 'landscape' ? input : getLayoutOrientation(input)
  const page = PAGE_MM[orientation]

  return {
    orientation,
    canvasWidthPx: mmToCssPx(page.width),
    canvasHeightPx: mmToCssPx(page.height)
  }
}
