import type { AnnotationDefinition } from './types'

/**
 * The user-facing name is Alternative. The stored mark stays `alternate` so existing documents do not need a migration.
 * Connect reproduces the verified highlight only. The legacy About text does not define a coaching meaning.
 */
export const annotationDefinitions = [
  {
    key: 'error',
    name: 'Error',
    description: 'Pronunciation error or correction. Successor of legacy My Errors. Colors are provisional.',
    category: 'feedback',
    status: 'provisional',
    className: 'annotation-error',
    inSelectionMenu: true,
    exportTag: 'span',
  },
  {
    key: 'voicing',
    name: 'Voicing',
    description: 'Voicing observation. Visual treatment is provisional.',
    category: 'feedback',
    status: 'provisional',
    className: 'annotation-voicing',
    inSelectionMenu: true,
    exportTag: 'span',
  },
  {
    key: 'nasal',
    name: 'Nasal',
    description: 'Nasal observation. Visual treatment is provisional.',
    category: 'feedback',
    status: 'provisional',
    className: 'annotation-nasal',
    inSelectionMenu: true,
    exportTag: 'span',
  },
  {
    key: 'alternate',
    name: 'Alternative',
    description:
      'A pronunciation or realization that differs from the primary target but is still acceptable, rather than an error.',
    category: 'feedback',
    status: 'confirmed',
    className: 'annotation-alternate',
    inSelectionMenu: true,
    exportTag: 'span',
  },
  {
    key: 'connect',
    name: 'Connect',
    description: 'Legacy highlight. The coaching meaning is not defined in the UAlberta About text.',
    category: 'connected-speech',
    status: 'confirmed',
    className: 'annotation-connect',
    inSelectionMenu: true,
    exportTag: 'span',
  },
  {
    key: 'glide',
    name: 'Glide',
    description: 'Vowel sound into a following vowel sound, including /w/ and /y/.',
    category: 'connected-speech',
    status: 'confirmed',
    className: 'annotation-glide',
    inSelectionMenu: true,
    exportTag: 'span',
  },
  {
    key: 'link',
    name: 'Link',
    description: 'Consonant into a following vowel sound, including /w/ and /y/.',
    category: 'connected-speech',
    status: 'confirmed',
    className: 'annotation-link',
    inSelectionMenu: true,
    exportTag: 'span',
  },
  {
    key: 'blend',
    name: 'Blend',
    description: 'Smooth transition between two consonants.',
    category: 'connected-speech',
    status: 'confirmed',
    className: 'annotation-blend',
    inSelectionMenu: true,
    exportTag: 'span',
  },
  {
    key: 'stretch',
    name: 'Stretch',
    description: 'Wider letter spacing and bold, matching the legacy Stretch control.',
    category: 'rhythm',
    status: 'confirmed',
    className: 'annotation-stretch',
    inSelectionMenu: true,
    exportTag: 'span',
  },
  {
    key: 'reduce',
    name: 'Reduce',
    description: 'Tighter letter spacing, matching the legacy Reduce control.',
    category: 'rhythm',
    status: 'confirmed',
    className: 'annotation-reduce',
    inSelectionMenu: true,
    exportTag: 'span',
  },
  {
    key: 'stress',
    name: 'Stress',
    description: 'Bold and underline for a stressed syllable.',
    category: 'rhythm',
    status: 'confirmed',
    className: 'annotation-stress',
    inSelectionMenu: true,
    exportTag: 'span',
  },
  {
    key: 'strike',
    name: 'Strike Out',
    description: 'Mark a syllable that should not be pronounced.',
    category: 'rhythm',
    status: 'confirmed',
    className: 'annotation-strike',
    inSelectionMenu: true,
    exportTag: 'span',
  },
] as const satisfies readonly AnnotationDefinition[]

export type AnnotationKey = (typeof annotationDefinitions)[number]['key']

const annotationKeys = new Set<string>(annotationDefinitions.map((definition) => definition.key))

export function isAnnotationKey(key: string): key is AnnotationKey {
  return annotationKeys.has(key)
}

export function selectionMenuDefinitions() {
  return annotationDefinitions.filter((definition) => definition.inSelectionMenu)
}
