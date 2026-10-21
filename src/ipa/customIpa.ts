import { createIpaSymbol, ipaCategories, ipaSymbols, type IpaCategoryId, type IpaSymbol } from './ipaData'

export const CUSTOM_IPA_KEY = 'acb.custom-ipa.v1'

function isCategory(value: unknown): value is IpaCategoryId {
  return ipaCategories.some(category => category.id === value)
}

/** Compare canonical equivalents without changing the inserted Unicode sequence. */
export function addCustomIpa(symbols: readonly IpaSymbol[], input: string, category: IpaCategoryId): IpaSymbol[] {
  const character = input.trim()
  if (!isCategory(category)) throw new Error('Choose an existing category.')
  if (!character || [...character].length > 16 || /[\s\p{Cc}\p{Cf}\p{Cs}]/u.test(character)) {
    throw new Error('Enter a visible Unicode character or short IPA sequence (up to 16 code points), without spaces.')
  }
  if ([...ipaSymbols, ...symbols].some(symbol => symbol.category === category && symbol.character.normalize('NFC') === character.normalize('NFC'))) {
    throw new Error('This character already exists in that category.')
  }
  const symbol = createIpaSymbol(category, character)
  return [...symbols, { ...symbol, id: `custom-${symbol.id}` }]
}

export function removeCustomIpa(symbols: readonly IpaSymbol[], id: string): IpaSymbol[] {
  return symbols.filter(symbol => !(symbol.id.startsWith('custom-') && symbol.id === id))
}

export function loadCustomIpa(): { symbols: IpaSymbol[]; error: string } {
  try {
    const raw = localStorage.getItem(CUSTOM_IPA_KEY)
    if (!raw) return { symbols: [], error: '' }
    const records: unknown = JSON.parse(raw)
    if (!Array.isArray(records)) throw new Error('Invalid inventory')
    let symbols: IpaSymbol[] = []
    let skipped = false
    for (const record of records) {
      try {
        if (!record || typeof record !== 'object' || typeof record.character !== 'string' || !isCategory(record.category)) throw new Error('Invalid entry')
        symbols = addCustomIpa(symbols, record.character, record.category)
      } catch { skipped = true }
    }
    return { symbols, error: skipped ? 'Some saved custom IPA entries were invalid or duplicated and were skipped.' : '' }
  } catch {
    return { symbols: [], error: 'Custom IPA characters could not be loaded from this browser.' }
  }
}

/** Persist first: the UI must not imply that an unsaved change will survive refresh. */
export function saveCustomIpa(symbols: readonly IpaSymbol[]): boolean {
  try {
    localStorage.setItem(CUSTOM_IPA_KEY, JSON.stringify(symbols.map(({ character, category }) => ({ character, category }))))
    return true
  } catch { return false }
}
