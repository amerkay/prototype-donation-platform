/** Bunny Fonts CDN font specs (family name → slug:weights) */
export const BUNNY_FONTS: Record<string, string> = {
  Inter: 'inter:400,500,600,700',
  Roboto: 'roboto:400,500,700',
  'Open Sans': 'open-sans:400,500,600,700',
  Lato: 'lato:400,700',
  Poppins: 'poppins:400,500,600,700',
  Montserrat: 'montserrat:400,500,600,700'
}

/** Build a Bunny Fonts CSS URL for the given font family */
export function getBunnyFontUrl(fontFamily: string): string {
  const spec = BUNNY_FONTS[fontFamily] ?? BUNNY_FONTS.Inter
  return `https://fonts.bunny.net/css?family=${spec}&display=swap`
}
