export const HEX_NAME_MAP: Record<string, string> = {
  '#000000': 'Black',
  '#FFFFFF': 'White',
  '#1C1C1E': 'Midnight',
  '#F5F5F7': 'Silver',
  '#7D7E80': 'Space Gray',
  '#BFD0DD': 'Blue',
  '#E3CCB4': 'Starlight',
};

export function normalizeHex(input: string): string {
  if (!input) return '#000000';
  const s = input.trim();
  const withHash = s.startsWith('#') ? s : `#${s}`;
  if (withHash.length === 4) {
    // Expand #RGB to #RRGGBB
    const r = withHash[1];
    const g = withHash[2];
    const b = withHash[3];
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }
  if (withHash.length === 7 || withHash.length === 9) {
    return withHash.toUpperCase();
  }
  return withHash.toUpperCase();
}

export function guessColorName(hexInput: string): string | null {
  const hex = normalizeHex(hexInput);
  if (HEX_NAME_MAP[hex]) return HEX_NAME_MAP[hex];
  // Simple heuristic fallbacks by brightness and hue ranges can be added later.
  // For now, return null to allow callers to fallback to the hex if unknown.
  return null;
} 