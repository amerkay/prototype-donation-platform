/**
 * Certificate layout registry.
 *
 * Each layout is a named builder function that composes sections
 * into a complete certificate HTML fragment.
 */

import type { CertificateLayoutId, CertificateLayoutMetadata } from '../../types'
import type { CertificateFragmentData } from '../certificate-fragment'
import { buildPortraitClassic } from './portrait-classic'
import { buildLandscapeClassic } from './landscape-classic'

/** Layout builder function signature */
export type LayoutBuilder = (data: CertificateFragmentData) => string

/** Complete layout definition with metadata and builder */
export interface LayoutDefinition {
  metadata: CertificateLayoutMetadata
  builder: LayoutBuilder
}

/** Registry of all available certificate layouts */
export const LAYOUT_REGISTRY: Record<CertificateLayoutId, LayoutDefinition> = {
  'portrait-classic': {
    metadata: {
      id: 'portrait-classic',
      name: 'Portrait Classic',
      description: 'Traditional vertical layout',
      orientation: 'portrait'
    },
    builder: buildPortraitClassic
  },
  'landscape-classic': {
    metadata: {
      id: 'landscape-classic',
      name: 'Landscape Classic',
      description: 'Horizontal layout with 3-column footer',
      orientation: 'landscape'
    },
    builder: buildLandscapeClassic
  }
}

/** Get all available layouts for UI display */
export function getAvailableLayouts(): CertificateLayoutMetadata[] {
  return Object.values(LAYOUT_REGISTRY).map((def) => def.metadata)
}

/** Get layout metadata by ID */
export function getLayoutMetadata(layoutId: CertificateLayoutId): CertificateLayoutMetadata {
  return LAYOUT_REGISTRY[layoutId]?.metadata ?? LAYOUT_REGISTRY['portrait-classic'].metadata
}

/** Get orientation for a layout ID */
export function getLayoutOrientation(layoutId: CertificateLayoutId): 'portrait' | 'landscape' {
  return LAYOUT_REGISTRY[layoutId]?.metadata.orientation ?? 'portrait'
}
