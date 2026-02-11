/**
 * Composable for resolving certificate colors from preset names or hex values.
 */

import { isHexColor } from '~/lib/colors'
import type { CertificateBranding, CertificateDesign, ResolvedColors } from '../types'

/** Resolve color value from preset name or hex color */
export function resolveColor(
  colorValue: string | undefined,
  brandingPrimary: string,
  brandingSecondary: string,
  fallback?: string
): string {
  const fb = fallback ?? brandingPrimary
  if (!colorValue || colorValue === '') return fb
  if (colorValue === 'primary') return brandingPrimary
  if (colorValue === 'secondary') return brandingSecondary
  if (!isHexColor(colorValue)) return fb
  return colorValue
}

/** Resolve all certificate colors from branding and design settings */
export function useCertificateColors(
  branding: CertificateBranding,
  design: CertificateDesign,
  titleTextColor: string
): ResolvedColors {
  return {
    titleText: resolveColor(titleTextColor, branding.primaryColor, branding.secondaryColor),
    separatorsAndBorders: resolveColor(
      design.separatorsAndBordersColor,
      branding.primaryColor,
      branding.secondaryColor
    )
  }
}
