import type { CertificateLayoutId } from '../types'
import { getFragmentOrientation } from './certificate-fragment'

const MM_TO_CSS_PX = 96 / 25.4
export const CERTIFICATE_BASE_WIDTH_PX = 380

const PAGE_MM = {
  portrait: { width: 210, height: 297 },
  landscape: { width: 297, height: 210 }
} as const

export interface CertificateRenderGeometry {
  orientation: 'portrait' | 'landscape'
  canvasWidthPx: number
  canvasHeightPx: number
}

export interface CertificateContentGeometry {
  widthPx: number
  heightPx: number
}

function mmToCssPx(mm: number): number {
  return Math.round(mm * MM_TO_CSS_PX)
}

export function getCertificateRenderGeometry(
  input: CertificateLayoutId | 'portrait' | 'landscape'
): CertificateRenderGeometry {
  const orientation =
    input === 'portrait' || input === 'landscape' ? input : getFragmentOrientation(input)

  const page = PAGE_MM[orientation]

  return {
    orientation,
    canvasWidthPx: mmToCssPx(page.width),
    canvasHeightPx: mmToCssPx(page.height)
  }
}

export function getCertificateContentGeometry(
  input: CertificateLayoutId | 'portrait' | 'landscape'
): CertificateContentGeometry {
  const orientation =
    input === 'portrait' || input === 'landscape' ? input : getFragmentOrientation(input)
  const ratio = orientation === 'landscape' ? 210 / 297 : 297 / 210
  return {
    widthPx: CERTIFICATE_BASE_WIDTH_PX,
    heightPx: Math.round(CERTIFICATE_BASE_WIDTH_PX * ratio)
  }
}
