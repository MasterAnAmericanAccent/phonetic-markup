export const ipaCategories = [
  { id: 'vowel', label: 'Vowels' },
  { id: 'consonant', label: 'Consonants' },
  { id: 'intonation', label: 'Intonation' },
] as const

export type IpaCategoryId = (typeof ipaCategories)[number]['id']

export type IpaSymbol = {
  id: string
  character: string
  category: IpaCategoryId
  /** Accessible name. The button face shows `character` only. */
  label: string
  codePoints: readonly string[]
}

const vowelCharacters = [
  '\u0259',
  '\u026A',
  '\u028A',
  '\u00E6',
  '\u0251',
  '\u025B',
  '\u0254',
  '\u028C',
  'u',
  'e',
  'i',
  'o',
  'a',
  'y',
  'w',
  'a\u026Ay',
  'e\u026Ay',
  '\u0254\u026Ay',
  'o\u028Aw',
  'a\u028Aw',
  // Legacy button. U+0190, not U+025B. Do not "correct" this here.
  '\u0190\u0259',
  '\u025A',
] as const

const consonantCharacters = [
  'r',
  '\u025A',
  '\u026B',
  '\u00F0',
  '\u03B8',
  'z',
  's',
  'd',
  't\u032C',
  '\u231D',
  '\u0294',
  'v',
  'b',
  'm',
  'n',
  '\u014B',
  '\u0283',
  't\u0283',
  '\u0292',
  'd\u0292',
  'h',
  'k',
  't',
  'l',
] as const

const intonationCharacters = [
  { character: '\u21D1', label: 'Insert up arrow' },
  { character: '\u21D3', label: 'Insert down arrow' },
  { character: '\u21D2', label: 'Insert level arrow' },
  { character: '\u21D7', label: 'Insert rise arrow' },
  { character: '\u21D8', label: 'Insert fall arrow' },
] as const

function codePointsOf(character: string): string[] {
  const points: string[] = []
  for (const symbol of character) {
    const point = symbol.codePointAt(0)
    if (point === undefined) continue
    points.push(`U+${point.toString(16).toUpperCase().padStart(4, '0')}`)
  }
  return points
}

function entry(category: IpaCategoryId, character: string, label?: string): IpaSymbol {
  const codePoints = codePointsOf(character)
  return {
    id: `${category}-${codePoints.join('-')}`,
    character,
    category,
    label: label ?? `Insert ${character}`,
    codePoints,
  }
}

export const ipaSymbols: readonly IpaSymbol[] = [
  ...vowelCharacters.map((character) => entry('vowel', character)),
  ...consonantCharacters.map((character) => entry('consonant', character)),
  ...intonationCharacters.map((item) => entry('intonation', item.character, item.label)),
]

export function symbolsInCategory(category: IpaCategoryId): readonly IpaSymbol[] {
  return ipaSymbols.filter((symbol) => symbol.category === category)
}
