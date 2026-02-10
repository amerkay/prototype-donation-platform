const HEX_COLOR_PATTERN = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/

export function normalizeHexColor(value: string): string | null {
  const trimmed = value.trim()
  if (!HEX_COLOR_PATTERN.test(trimmed)) return null

  const lower = trimmed.toLowerCase()
  if (lower.length === 4) {
    const [_, r, g, b] = lower
    return `#${r}${r}${g}${g}${b}${b}`
  }

  return lower
}

export function isHexColor(value: string): boolean {
  return HEX_COLOR_PATTERN.test(value)
}
