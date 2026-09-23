// Small, stable details derived from a palette's id, so a chip always looks
// the same wherever it hangs.

/** Four-digit stock number, like the code printed on a real paint chip. */
export function chipNumber(id: string): string {
  return String(parseInt(id.replace(/-/g, '').slice(0, 6), 16) % 10000).padStart(4, '0')
}

/** How far the chip hangs off straight, between -3° and 3°. */
export function tiltFor(id: string): number {
  const n = parseInt(id.slice(-2), 16) / 255
  return Math.round((n * 6 - 3) * 10) / 10
}
