import { describe, expect, it } from 'vitest'
import { harmonize, hexToHsl, hueDistance } from '../app/utils/color'
import { colorName, hexToOklab } from '../app/utils/colorNames'
import { createHistory, HISTORY_LIMIT, pushHistory, redo, undo } from '../app/utils/history'

const HEX = /^#[0-9a-f]{6}$/
const START = ['#111111', '#222222', '#333333', '#444444', '#555555']
const NONE = [false, false, false, false, false]
const hue = (hex: string) => hexToHsl(hex)[0]

// A seeded random so failures are reproducible.
function seeded(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 2 ** 32
    return seed / 2 ** 32
  }
}

describe('harmonize', () => {
  it('always returns five valid colours and keeps locked ones', () => {
    for (const mode of ['random', 'analogous', 'complementary', 'triadic', 'mono'] as const) {
      for (let s = 1; s < 40; s++) {
        const out = harmonize(START, [false, true, false, false, true], mode, seeded(s))
        expect(out).toHaveLength(5)
        out.forEach(c => expect(c).toMatch(HEX))
        expect(out[1]).toBe('#222222')
        expect(out[4]).toBe('#555555')
      }
    }
  })

  it('analogous stays within ±45° of the locked colour', () => {
    const anchor = '#e63946' // red, hue ≈ 355
    for (let s = 1; s < 40; s++) {
      const out = harmonize([anchor, ...START.slice(1)], [true, false, false, false, false], 'analogous', seeded(s))
      out.forEach(c => expect(hueDistance(hue(c), hue(anchor))).toBeLessThanOrEqual(45 + 3))
    }
  })

  it('complementary includes colours opposite the base', () => {
    const anchor = '#2a9d8f'
    for (let s = 1; s < 20; s++) {
      const out = harmonize([anchor, ...START.slice(1)], [true, false, false, false, false], 'complementary', seeded(s))
      expect(hueDistance(hue(out[2]!), hue(anchor))).toBeGreaterThan(170)
      expect(hueDistance(hue(out[3]!), hue(anchor))).toBeGreaterThan(170)
    }
  })

  it('triadic spreads hues 120° apart', () => {
    const anchor = '#3355ff'
    const out = harmonize([anchor, ...START.slice(1)], [true, false, false, false, false], 'triadic', seeded(7))
    expect(hueDistance(hue(out[1]!), hue(anchor))).toBeGreaterThan(110)
    expect(hueDistance(hue(out[2]!), hue(anchor))).toBeGreaterThan(110)
    expect(hueDistance(hue(out[1]!), hue(out[2]!))).toBeGreaterThan(110)
  })

  it('mono keeps one hue and runs dark to light', () => {
    for (let s = 1; s < 20; s++) {
      const out = harmonize(START, NONE, 'mono', seeded(s))
      const base = hue(out[2]!)
      out.forEach(c => expect(hueDistance(hue(c), base)).toBeLessThan(12))
      const lightness = out.map(c => hexToHsl(c)[2])
      expect([...lightness].sort((a, b) => a - b)).toEqual(lightness)
    }
  })
})

describe('colorName', () => {
  it('returns the exact name for a colour in the list', () => {
    expect(colorName('#e56e24')).toBe('24 Carrot')
  })

  it('finds a close name for any colour', () => {
    expect(colorName('#000000')).toBeTruthy()
    expect(colorName('#ffffff')).toBeTruthy()
    expect(colorName('#e56e25')).toBe('24 Carrot') // one step off
  })

  it('ignores hex case', () => {
    expect(colorName('#E56E24')).toBe(colorName('#e56e24'))
  })

  it('OKLab puts white at L=1 and black at L=0', () => {
    expect(hexToOklab('#ffffff')[0]).toBeCloseTo(1, 3)
    expect(hexToOklab('#000000')[0]).toBeCloseTo(0, 3)
  })
})

describe('history', () => {
  it('undoes and redoes', () => {
    let h = createHistory('a')
    h = pushHistory(h, 'b')
    h = pushHistory(h, 'c')
    h = undo(h)
    expect(h.present).toBe('b')
    h = undo(h)
    expect(h.present).toBe('a')
    h = redo(h)
    expect(h.present).toBe('b')
  })

  it('a new change clears redo', () => {
    let h = pushHistory(createHistory('a'), 'b')
    h = undo(h)
    h = pushHistory(h, 'x')
    expect(redo(h).present).toBe('x')
  })

  it('does nothing at either end', () => {
    const h = createHistory('a')
    expect(undo(h)).toBe(h)
    expect(redo(h)).toBe(h)
  })

  it(`keeps only the last ${HISTORY_LIMIT} steps`, () => {
    let h = createHistory(0)
    for (let i = 1; i <= HISTORY_LIMIT + 20; i++) h = pushHistory(h, i)
    expect(h.past).toHaveLength(HISTORY_LIMIT)
  })
})
