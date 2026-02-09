export interface FontOption {
  value: string
  label: string
}

/** Bunny Fonts CDN font specs (family name → slug:weights) */
export const BUNNY_FONTS: Record<string, string> = {
  Inter: 'inter:400,500,600,700',
  Roboto: 'roboto:400,500,700',
  'Open Sans': 'open-sans:400,500,600,700',
  Lato: 'lato:400,700',
  Poppins: 'poppins:400,500,600,700',
  Montserrat: 'montserrat:400,500,600,700',
  Nunito: 'nunito:400,500,600,700',
  'Source Sans Pro': 'source-sans-pro:400,600,700',
  'Playfair Display': 'playfair-display:400,500,700',
  Merriweather: 'merriweather:400,700',
  'Dancing Script': 'dancing-script:400,700',
  Sacramento: 'sacramento:400',
  Pacifico: 'pacifico:400',
  Satisfy: 'satisfy:400',
  Caveat: 'caveat:400,600,700',
  'Kaushan Script': 'kaushan-script:400',
  'Alex Brush': 'alex-brush:400',
  Parisienne: 'parisienne:400',
  Allura: 'allura:400',
  'Great Vibes': 'great-vibes:400'
}

export const BRANDING_FONT_OPTIONS: FontOption[] = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Open Sans', label: 'Open Sans' },
  { value: 'Lato', label: 'Lato' },
  { value: 'Poppins', label: 'Poppins' },
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'Nunito', label: 'Nunito' },
  { value: 'Source Sans Pro', label: 'Source Sans Pro' },
  { value: 'Playfair Display', label: 'Playfair Display' },
  { value: 'Merriweather', label: 'Merriweather' }
]

export const SIGNATURE_FONT_OPTIONS: FontOption[] = [
  { value: 'Dancing Script', label: 'Dancing Script' },
  { value: 'Great Vibes', label: 'Great Vibes' },
  { value: 'Parisienne', label: 'Parisienne' },
  { value: 'Allura', label: 'Allura' },
  { value: 'Sacramento', label: 'Sacramento' },
  { value: 'Pacifico', label: 'Pacifico' },
  { value: 'Satisfy', label: 'Satisfy' },
  { value: 'Caveat', label: 'Caveat' },
  { value: 'Kaushan Script', label: 'Kaushan Script' },
  { value: 'Alex Brush', label: 'Alex Brush' }
]

/** Build a Bunny Fonts CSS URL for the given font family */
export function getBunnyFontUrl(fontFamily: string): string {
  const spec = BUNNY_FONTS[fontFamily] ?? BUNNY_FONTS.Inter
  return `https://fonts.bunny.net/css?family=${spec}&display=swap`
}

/** Build unique Bunny Fonts CSS URLs from a list of font families */
export function getBunnyFontUrls(fontFamilies: string[]): string[] {
  return Array.from(new Set(fontFamilies.filter(Boolean))).map((family) => getBunnyFontUrl(family))
}
