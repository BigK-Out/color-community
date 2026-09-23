import { describe, expect, it } from 'vitest'
import {
  decodeColors, encodeColors, generate, hexToHsl, hslToHex,
  normalizeHex, randomColor, textColorFor,
} from '../app/utils/color'

const HEX = /^#[0-9a-f]{6}$/

describe('hslToHex', () => {
  it('converts the primaries', () => {
    expect(hslToHex(0, 100, 50)).toBe('#ff0000')
    expect(hslToHex(120, 100, 50)).toBe('#00ff00')
    expect(hslToHex(240, 100, 50)).toBe('#0000ff')
    expect(hslToHex(0, 0, 100)).toBe('#ffffff')
    expect(hslToHex(0, 0, 0)).toBe('#000000')
  })
})

describe('randomColor', () => {
  it('always returns lowercase #rrggbb inside the saturation/lightness band', () => {
    for (let i = 0; i < 500; i++) {
      const c = randomColor()
      expect(c).toMatch(HEX)
      const [, s, l] = hexToHsl(c)
      // ±1.5 for rounding to whole 0–255 channels
      expect(s).toBeGreaterThanOrEqual(45 - 1.5)
      expect(s).toBeLessThanOrEqual(90 + 1.5)
      expect(l).toBeGreaterThanOrEqual(35 - 1.5)
      expect(l).toBeLessThanOrEqual(75 + 1.5)
    }
  })

  it('stays in range at the extremes of rand()', () => {
    expect(randomColor(() => 0)).toMatch(HEX)
    expect(randomColor(() => 0.999999)).toMatch(HEX)
  })
})

describe('generate', () => {
  it('keeps locked colours and rerolls the rest', () => {
    const current = ['#111111', '#222222', '#333333', '#444444', '#555555']
    const next = generate(current, [true, false, true, false, false], () => 0.5)
    expect(next[0]).toBe('#111111')
    expect(next[2]).toBe('#333333')
    expect(next[1]).not.toBe('#222222')
    expect(next[4]).not.toBe('#555555')
    expect(next).toHaveLength(5)
  })

  it('rerolls nothing when everything is locked', () => {
    const current = ['#111111', '#222222', '#333333', '#444444', '#555555']
    expect(generate(current, [true, true, true, true, true])).toEqual(current)
  })
})

describe('normalizeHex', () => {
  it.each([
    ['abc', '#aabbcc'],
    ['#ABC', '#aabbcc'],
    ['aabbcc', '#aabbcc'],
    ['  #FF0844 ', '#ff0844'],
  ])('%s → %s', (input, out) => {
    expect(normalizeHex(input)).toBe(out)
  })

  it.each(['', '#', 'ab', 'abcd', '#gggggg', 'aabbccdd', 'red'])('rejects %j', (input) => {
    expect(normalizeHex(input)).toBeNull()
  })
})

describe('textColorFor', () => {
  it('picks the readable one', () => {
    expect(textColorFor('#000000')).toBe('#ffffff')
    expect(textColorFor('#ffffff')).toBe('#000000')
    expect(textColorFor('#ffff00')).toBe('#000000') // yellow is light
    expect(textColorFor('#0000ff')).toBe('#ffffff') // blue is dark
    expect(textColorFor('#131313')).toBe('#ffffff')
  })
})

describe('encodeColors / decodeColors', () => {
  const colors = ['#ff0844', '#ffb199', '#12c2e9', '#c471ed', '#f64f59']

  it('round-trips', () => {
    expect(encodeColors(colors)).toBe('ff0844-ffb199-12c2e9-c471ed-f64f59')
    expect(decodeColors(encodeColors(colors))).toEqual(colors)
  })

  it('rejects the wrong count, bad hex and non-strings', () => {
    expect(decodeColors('ff0844-ffb199')).toBeNull()
    expect(decodeColors('ff0844-ffb199-12c2e9-c471ed-zzzzzz')).toBeNull()
    expect(decodeColors(undefined)).toBeNull()
    expect(decodeColors(['ff0844'])).toBeNull()
  })
})
