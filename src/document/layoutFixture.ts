import type { JSONContent } from '@tiptap/core'

/**
 * Unsaved example passage. A few ordinary words contain IPA characters.
 */
export const layoutFixture: JSONContent = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'In sociolinguistics, an ',
        },
        {
          type: 'text',
          text: 'accent',
          marks: [{ type: 'error' }],
        },
        {
          type: 'text',
          text: ' is a way of ',
        },
        {
          type: 'text',
          text: 'pronouncing',
          marks: [{ type: 'error' }, { type: 'voicing' }],
        },
        {
          type: 'text',
          text: ' a language that is distinctive to a country, area, social class, or individual. A ',
        },
        {
          type: 'text',
          text: 'nasal',
          marks: [{ type: 'nasal' }],
        },
        {
          type: 'text',
          text: ' vowel can sit beside an ',
        },
        {
          type: 'text',
          text: 'Alternative',
          marks: [{ type: 'alternate' }],
        },
        {
          type: 'text',
          text: ' note. Pop',
        },
        {
          type: 'text',
          text: '\u028A',
          marks: [{ type: 'connect' }],
        },
        {
          type: 'text',
          text: 'lar videos can leave someone v',
        },
        {
          type: 'text',
          text: '\u028C',
        },
        {
          type: 'text',
          text: 'u',
          marks: [{ type: 'error' }],
        },
        {
          type: 'text',
          text: 'lnerable, or sound qu',
        },
        {
          type: 'text',
          text: '\u026A',
        },
        {
          type: 'text',
          text: 'te different in anoth',
        },
        {
          type: 'text',
          text: '\u0259',
        },
        {
          type: 'text',
          text: 'r context. Combining marks stay with their base, as in a\u0301 and \u0259.',
        },
      ],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Second paragraph for structure checks.' },
        { type: 'hardBreak' },
        { type: 'text', text: 'This line is a hard break inside that paragraph.' },
      ],
    },
  ],
}
