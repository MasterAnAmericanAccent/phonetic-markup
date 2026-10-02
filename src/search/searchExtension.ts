import { Extension } from '@tiptap/core'
import type { Editor } from '@tiptap/core'
import type { Node as ProseNode } from '@tiptap/pm/model'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import { findMatches, type SearchMatch } from './findMatches'

export type SearchPluginState = {
  query: string
  matches: SearchMatch[]
  activeIndex: number
}

type SearchMeta =
  | { type: 'query'; query: string }
  | { type: 'next' }
  | { type: 'previous' }
  | { type: 'clear' }

const emptySearch: SearchPluginState = { query: '', matches: [], activeIndex: -1 }

export const searchPluginKey = new PluginKey<SearchPluginState>('phoneticSearch')

function withQuery(doc: ProseNode, query: string, previous: SearchPluginState | null): SearchPluginState {
  const matches = findMatches(doc, query)
  if (matches.length === 0) return { query, matches, activeIndex: -1 }
  if (!previous || previous.query !== query || previous.activeIndex < 0) {
    return { query, matches, activeIndex: 0 }
  }
  const current = previous.matches[previous.activeIndex]
  if (!current) return { query, matches, activeIndex: 0 }
  const exact = matches.findIndex((match) => match.from === current.from && match.to === current.to)
  if (exact >= 0) return { query, matches, activeIndex: exact }
  const sameStart = matches.findIndex((match) => match.from === current.from)
  if (sameStart >= 0) return { query, matches, activeIndex: sameStart }
  const following = matches.findIndex((match) => match.from >= current.from)
  return { query, matches, activeIndex: following >= 0 ? following : matches.length - 1 }
}

function moveActive(state: SearchPluginState, direction: 1 | -1): SearchPluginState {
  if (state.matches.length === 0 || state.activeIndex < 0) return state
  const count = state.matches.length
  const activeIndex = (state.activeIndex + direction + count) % count
  return { ...state, activeIndex }
}

function decorationsFor(doc: ProseNode, search: SearchPluginState): DecorationSet {
  if (search.matches.length === 0) return DecorationSet.empty
  const decorations: Decoration[] = []
  search.matches.forEach((match, index) => {
    const active = index === search.activeIndex
    const className = active ? 'search-match search-match-active' : 'search-match'
    doc.nodesBetween(match.from, match.to, (node, pos) => {
      if (!node.isText) return
      const from = Math.max(pos, match.from)
      const to = Math.min(pos + node.nodeSize, match.to)
      if (from < to) decorations.push(Decoration.inline(from, to, { class: className }))
    })
  })
  decorations.sort((left, right) => left.from - right.from || left.to - right.to)
  return DecorationSet.create(doc, decorations)
}

/**
 * View-only search highlights. They are not marks, not document JSON,
 * and not an undo step. PNG and HTML export must render the document,
 * not these decoration classes.
 */
const searchPlugin = new Plugin<SearchPluginState>({
  key: searchPluginKey,
  state: {
    init: () => emptySearch,
    apply(tr, previous) {
      const meta = tr.getMeta(searchPluginKey) as SearchMeta | undefined
      if (meta?.type === 'clear' || (meta?.type === 'query' && meta.query.length === 0)) return emptySearch
      if (meta?.type === 'query') return withQuery(tr.doc, meta.query, null)
      if (meta?.type === 'next') return moveActive(previous, 1)
      if (meta?.type === 'previous') return moveActive(previous, -1)
      if (tr.docChanged && previous.query.length > 0) {
        const mapped: SearchPluginState = {
          ...previous,
          matches: previous.matches.map((match) => ({
            from: tr.mapping.map(match.from),
            to: tr.mapping.map(match.to),
          })),
        }
        return withQuery(tr.doc, previous.query, mapped)
      }
      return previous
    },
  },
  props: {
    decorations(state) {
      const search = searchPluginKey.getState(state) ?? emptySearch
      return decorationsFor(state.doc, search)
    },
  },
})

export const SearchHighlight = Extension.create({
  name: 'searchHighlight',
  addProseMirrorPlugins() {
    return [searchPlugin]
  },
})

export function getSearchState(editor: Editor): SearchPluginState {
  return searchPluginKey.getState(editor.state) ?? emptySearch
}

function dispatchSearch(editor: Editor, meta: SearchMeta): void {
  if (editor.isDestroyed) return
  const transaction = editor.state.tr.setMeta(searchPluginKey, meta).setMeta('addToHistory', false)
  editor.view.dispatch(transaction)
  revealActiveMatch(editor)
}

export function setSearchQuery(editor: Editor, query: string): void {
  dispatchSearch(editor, { type: 'query', query })
}

export function clearSearch(editor: Editor): void {
  dispatchSearch(editor, { type: 'clear' })
}

export function goToNextMatch(editor: Editor): void {
  dispatchSearch(editor, { type: 'next' })
}

export function goToPreviousMatch(editor: Editor): void {
  dispatchSearch(editor, { type: 'previous' })
}

function revealActiveMatch(editor: Editor): void {
  const active = editor.view.dom.querySelector('.search-match-active')
  if (!(active instanceof HTMLElement) || typeof active.scrollIntoView !== 'function') return
  try {
    active.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  } catch {
    // The test DOM has no layout.
  }
}

export function searchMatchCountLabel(state: SearchPluginState): string {
  if (state.query.length === 0) return ''
  if (state.matches.length === 0 || state.activeIndex < 0) return 'No matches'
  return `${state.activeIndex + 1} / ${state.matches.length}`
}
