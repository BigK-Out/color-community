// Human names for colours, e.g. "#e56e24" → "24 Carrot".
// The list is the "best of" set from the color-name-list package (~5,000 names).
// We pick the name whose colour looks closest, measured in OKLab — a colour
// space where equal distances look like equal differences to the eye.
import { colornames } from 'color-name-list/bestof'

type Lab = [number, number, number]

function toLinear(c: number) {
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

export function hexToOklab(hex: string): Lab {
  const [r, g, b] = [1, 3, 5].map(i => toLinear(parseInt(hex.slice(i, i + 2), 16) / 255)) as Lab
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ]
}

// Converted once, on first use.
type Entry = { name: string, hex: string, lab: Lab }
let table: Entry[] | null = null
const cache = new Map<string, string>()

function getTable(): Entry[] {
  table ??= colornames.map(c => ({ name: c.name, hex: c.hex.toLowerCase(), lab: hexToOklab(c.hex) }))
  return table
}

function distance(a: Lab, b: Lab): number {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2)
}

export function colorName(hex: string): string {
  const key = hex.toLowerCase()
  const hit = cache.get(key)
  if (hit) return hit

  const lab = hexToOklab(key)
  let best = getTable()[0]!
  let bestDist = Infinity
  for (const entry of getTable()) {
    const d = distance(entry.lab, lab)
    if (d < bestDist) {
      bestDist = d
      best = entry
    }
  }
  cache.set(key, best.name)
  return best.name
}

export interface ColorMatch {
  name: string
  hex: string
  /** OKLab distance: 0 is identical, ~0.02 is hard to tell apart. */
  distance: number
}

/** The `count` named colours closest to `hex`, closest first. */
export function nearestColors(hex: string, count = 4): ColorMatch[] {
  const lab = hexToOklab(hex.toLowerCase())
  return getTable()
    .map(e => ({ name: e.name, hex: e.hex, distance: distance(e.lab, lab) }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, count)
}

/** One named colour per calendar day (key like "2026-09-23"), the same for everyone. */
export function colorOfTheDay(dateKey: string): { name: string, hex: string } {
  let hash = 2166136261 // FNV-1a
  for (const ch of dateKey) hash = Math.imul(hash ^ ch.charCodeAt(0), 16777619)
  const entry = colornames[(hash >>> 0) % colornames.length]!
  return { name: entry.name, hex: entry.hex.toLowerCase() }
}
