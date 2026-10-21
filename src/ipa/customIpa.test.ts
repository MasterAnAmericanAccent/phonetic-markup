import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { addCustomIpa, CUSTOM_IPA_KEY, loadCustomIpa, removeCustomIpa, saveCustomIpa } from './customIpa'
import { ipaSymbols } from './ipaData'

beforeEach(() => localStorage.clear())
afterEach(() => vi.restoreAllMocks())

describe('browser-local custom IPA inventory', () => {
  it('adds Unicode with the same metadata as built-ins without mutating them', () => {
    const before = structuredClone(ipaSymbols)
    const symbols = addCustomIpa([], 'ɐ', 'vowel')
    expect(symbols[0]).toMatchObject({ character: 'ɐ', category: 'vowel', codePoints: ['U+0250'], label: 'Insert ɐ', id: 'custom-vowel-U+0250' })
    expect(ipaSymbols).toEqual(before)
  })
  it('prevents built-in ǣ duplicates while allowing the same character in another category', () => {
    expect(() => addCustomIpa([], 'ǣ', 'vowel')).toThrow('already exists')
    expect(addCustomIpa([], 'ǣ', 'consonant')).toHaveLength(1)
  })
  it('prevents custom and canonical-equivalent duplicates within a category', () => {
    const symbols = addCustomIpa([], 'a\u0304', 'vowel')
    expect(() => addCustomIpa(symbols, 'ā', 'vowel')).toThrow('already exists')
    expect(() => addCustomIpa(symbols, 'a\u0304', 'vowel')).toThrow('already exists')
    expect(addCustomIpa(symbols, 'ā', 'consonant')).toHaveLength(2)
    expect(symbols[0]?.character).toBe('a\u0304')
  })
  for (const input of ['', '   ', 'a b', 'a\nb', '\u200b', '\ud800', 'a'.repeat(17)]) it(`rejects invalid input ${JSON.stringify(input)}`, () => {
    expect(() => addCustomIpa([], input, 'vowel')).toThrow('visible Unicode')
  })
  it('persists and restores every category using only character/category records', () => {
    let symbols = addCustomIpa([], 'ɐ', 'vowel')
    symbols = addCustomIpa(symbols, 'ɲ', 'consonant')
    symbols = addCustomIpa(symbols, '↗', 'intonation')
    expect(saveCustomIpa(symbols)).toBe(true)
    expect(loadCustomIpa()).toEqual({ symbols, error: '' })
    expect(JSON.parse(localStorage.getItem(CUSTOM_IPA_KEY)!)[0]).toEqual({ character: 'ɐ', category: 'vowel' })
  })
  it('removes only custom entries and persists removal', () => {
    const symbols = addCustomIpa([], 'ɐ', 'vowel')
    expect(removeCustomIpa(symbols, ipaSymbols[0]!.id)).toEqual(symbols)
    const removed = removeCustomIpa(symbols, symbols[0]!.id)
    expect(removed).toEqual([])
    saveCustomIpa(removed)
    expect(loadCustomIpa().symbols).toEqual([])
    expect(ipaSymbols.some(symbol => symbol.character === 'ǣ' && symbol.category === 'vowel')).toBe(true)
  })
  it('skips corrupted, duplicated and built-in stored entries without changing built-ins', () => {
    localStorage.setItem(CUSTOM_IPA_KEY, JSON.stringify([
      { character: 'ɐ', category: 'vowel' }, { character: 'ɐ', category: 'vowel' },
      { character: 'ǣ', category: 'vowel' }, { character: 'ɲ', category: 'unknown' }, null,
    ]))
    expect(loadCustomIpa().symbols.map(symbol => symbol.character)).toEqual(['ɐ'])
    expect(loadCustomIpa().error).toContain('skipped')
  })
  it('handles malformed JSON and blocked reads', () => {
    localStorage.setItem(CUSTOM_IPA_KEY, '{broken')
    expect(loadCustomIpa().error).toContain('could not be loaded')
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked') })
    expect(loadCustomIpa().symbols).toEqual([])
  })
  it('reports quota/blocked storage failures without overwriting saved data', () => {
    const symbols = addCustomIpa([], 'ɐ', 'vowel')
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota') })
    expect(saveCustomIpa(symbols)).toBe(false)
    expect(loadCustomIpa().symbols).toEqual([])
  })
})
