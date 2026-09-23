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
let table: { name: string, lab: Lab }[] | null = null
const cache = new Map<string, string>()

export function colorName(hex: string): string {
  const key = hex.toLowerCase()
  const hit = cache.get(key)
  if (hit) return hit

  table ??= colornames.map(c => ({ name: c.name, lab: hexToOklab(c.hex) }))
  const [L, A, B] = hexToOklab(key)
  let best = table[0]!
  let bestDist = Infinity
  for (const entry of table) {
    const d = (entry.lab[0] - L) ** 2 + (entry.lab[1] - A) ** 2 + (entry.lab[2] - B) ** 2
    if (d < bestDist) {
      bestDist = d
      best = entry
    }
  }
  cache.set(key, best.name)
  return best.name
}
