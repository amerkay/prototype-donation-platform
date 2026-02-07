export interface BrandingTemplate {
  id: string
  name: string
  primaryColor: string
  secondaryColor: string
}

/**
 * 15 curated color palettes spanning the full hue spectrum.
 *
 * Design constraints:
 * - Primary: luminance < 0.4 so `contrastForeground()` picks white text.
 * - Secondary: complementary or split-complementary pop color for highlights.
 * - Ordered by hue: blues → teals → greens → purples → reds → oranges → pinks → dark.
 * - Font is chosen independently via the Font Family selector.
 */
export const BRANDING_TEMPLATES: BrandingTemplate[] = [
  // ── Blues ──────────────────────────────────────────────────────────────
  { id: 'ocean', name: 'Ocean', primaryColor: '#fcd34d', secondaryColor: '#0369a1' },
  { id: 'cobalt', name: 'Cobalt', primaryColor: '#34d399', secondaryColor: '#1d4ed8' },
  { id: 'iris', name: 'Iris', primaryColor: '#10b981', secondaryColor: '#4f46e5' },
  // ── Teals & Greens ────────────────────────────────────────────────────
  { id: 'teal', name: 'Teal', primaryColor: '#f43f5e', secondaryColor: '#0f766e' },
  { id: 'evergreen', name: 'Evergreen', primaryColor: '#f97316', secondaryColor: '#166534' },
  { id: 'emerald', name: 'Emerald', primaryColor: '#ec4899', secondaryColor: '#059669' },
  // ── Purples ───────────────────────────────────────────────────────────
  { id: 'amethyst', name: 'Amethyst', primaryColor: '#22d3ee', secondaryColor: '#7c3aed' },
  { id: 'indigo', name: 'Indigo', primaryColor: '#fb923c', secondaryColor: '#4338ca' },
  // ── Reds ──────────────────────────────────────────────────────────────
  { id: 'scarlet', name: 'Scarlet', primaryColor: '#06b6d4', secondaryColor: '#dc2626' },
  { id: 'ruby', name: 'Ruby', primaryColor: '#38bdf8', secondaryColor: '#9f1239' },
  // ── Oranges & Ambers ──────────────────────────────────────────────────
  { id: 'ember', name: 'Ember', primaryColor: '#2dd4bf', secondaryColor: '#c2410c' },
  { id: 'amber', name: 'Amber', primaryColor: '#6366f1', secondaryColor: '#b45309' },
  // ── Pinks & Fuchsia ───────────────────────────────────────────────────
  { id: 'rose', name: 'Rose', primaryColor: '#14b8a6', secondaryColor: '#be185d' },
  { id: 'fuchsia', name: 'Fuchsia', primaryColor: '#f59e0b', secondaryColor: '#c026d3' },
  // ── Dark ──────────────────────────────────────────────────────────────
  { id: 'midnight', name: 'Midnight', primaryColor: '#f97316', secondaryColor: '#1e293b' }
]

/** Find template whose colors match (case-insensitive), or undefined */
export function findMatchingTemplate(
  primary: string,
  secondary: string
): BrandingTemplate | undefined {
  return BRANDING_TEMPLATES.find(
    (t) =>
      t.primaryColor.toLowerCase() === primary.toLowerCase() &&
      t.secondaryColor.toLowerCase() === secondary.toLowerCase()
  )
}
