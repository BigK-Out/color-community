// Pure colour helpers. Files in app/utils/ are auto-imported by Nuxt,
// so pages and components can call randomColor() etc. without importing.

export const PALETTE_SIZE = 5

/** h in 0–360, s and l in 0–100 → "#rrggbb" */
export function hslToHex(h: number, s: number, l: number): string {
  s /= 100
  l /= 100
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))
  }
  return '#' + [f(0), f(8), f(4)]
    .map(x => Math.round(x * 255).toString(16).padStart(2, '0'))
    .join('')
}

/** "#rrggbb" → [h 0–360, s 0–100, l 0–100] */
export function hexToHsl(hex: string): [number, number, number] {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255) as [number, number, number]
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  const d = max - min
  if (d === 0) return [0, 0, l * 100]
  const s = d / (1 - Math.abs(2 * l - 1))
  let h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4
  h *= 60
  if (h < 0) h += 360
  return [h, s * 100, l * 100]
}

/** A random colour that is never too grey, too dark or too washed out. */
export function randomColor(rand: () => number = Math.random): string {
  const h = rand() * 360
  const s = 45 + rand() * 45 // 45–90%
  const l = 35 + rand() * 40 // 35–75%
  return hslToHex(h, s, l)
}

/** Reroll every colour whose lock is off. */
export function generate(current: string[], locked: boolean[], rand: () => number = Math.random): string[] {
  return current.map((c, i) => (locked[i] ? c : randomColor(rand)))
}

// ─── Harmony ───────────────────────────────────────────────────────────────

export type HarmonyMode = 'random' | 'analogous' | 'complementary' | 'triadic' | 'mono'

export const HARMONY_MODES: { mode: HarmonyMode, label: string }[] = [
  { mode: 'random', label: 'Random' },
  { mode: 'analogous', label: 'Analogous' },
  { mode: 'complementary', label: 'Complementary' },
  { mode: 'triadic', label: 'Triad' },
  { mode: 'mono', label: 'Mono' },
]

// Hue offsets (degrees from the base hue) for each of the five slots.
const HUE_OFFSETS: Record<Exclude<HarmonyMode, 'random'>, number[]> = {
  analogous: [-40, -20, 0, 20, 40],
  complementary: [0, 0, 180, 180, 0],
  triadic: [0, 120, 240, 0, 120],
  mono: [0, 0, 0, 0, 0],
}

// Mono spreads lightness so the five shades don't blur together.
const MONO_LIGHTNESS = [24, 38, 52, 66, 80]

/**
 * Reroll unlocked colours so they work together. The first locked colour
 * sets the base hue; with nothing locked, the base hue is random.
 */
export function harmonize(
  current: string[],
  locked: boolean[],
  mode: HarmonyMode,
  rand: () => number = Math.random,
): string[] {
  if (mode === 'random') return generate(current, locked, rand)

  const anchor = current.find((_, i) => locked[i])
  const base = anchor ? hexToHsl(anchor)[0] : rand() * 360
  const offsets = HUE_OFFSETS[mode]

  return current.map((c, i) => {
    if (locked[i]) return c
    const jitter = (rand() - 0.5) * 8 // ±4° so repeats don't look mechanical
    const h = (((base + offsets[i]! + jitter) % 360) + 360) % 360
    const s = 45 + rand() * 40
    const l = mode === 'mono' ? MONO_LIGHTNESS[i]! + (rand() - 0.5) * 6 : 35 + rand() * 40
    return hslToHex(h, s, l)
  })
}

/** Shortest distance between two hues on the colour wheel, 0–180. */
export function hueDistance(a: number, b: number): number {
  const d = Math.abs(a - b) % 360
  return d > 180 ? 360 - d : d
}

/** "abc", "#ABC", "aabbcc" → "#aabbcc"; anything else → null. */
export function normalizeHex(input: string): string | null {
  const s = input.trim().replace(/^#/, '').toLowerCase()
  if (/^[0-9a-f]{3}$/.test(s)) return '#' + [...s].map(ch => ch + ch).join('')
  if (/^[0-9a-f]{6}$/.test(s)) return '#' + s
  return null
}

/** Black or white — whichever reads better on top of `hex`. */
export function textColorFor(hex: string): '#000000' | '#ffffff' {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }) as [number, number, number]
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
  const contrastWithWhite = 1.05 / (luminance + 0.05)
  const contrastWithBlack = (luminance + 0.05) / 0.05
  return contrastWithBlack >= contrastWithWhite ? '#000000' : '#ffffff'
}

/** ["#ff0844", …] → "ff0844-…" for the ?c= URL parameter. */
export function encodeColors(colors: string[]): string {
  return colors.map(c => c.slice(1)).join('-')
}

/** Inverse of encodeColors. Returns null unless it is exactly five valid colours. */
export function decodeColors(param: unknown): string[] | null {
  if (typeof param !== 'string') return null
  const colors = param.split('-').map(normalizeHex)
  if (colors.length !== PALETTE_SIZE || colors.some(c => c === null)) return null
  return colors as string[]
}
