import { useEffect, useState, type MouseEvent, type ReactNode } from 'react'
import type { Editor } from '@tiptap/core'
import {
  clearSearch,
  getSearchState,
  goToNextMatch,
  goToPreviousMatch,
  searchMatchCountLabel,
  setSearchQuery,
  type SearchPluginState,
} from './searchExtension'

type SearchBarProps = {
  editor: Editor
}

function keepEditorSelection(event: MouseEvent) {
  event.preventDefault()
}

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      {children}
    </svg>
  )
}

function SearchIcon() {
  return (
    <Icon>
      <circle cx="7" cy="7" r="4.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10.2 10.2 13.2 13.2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </Icon>
  )
}

function ChevronLeftIcon() {
  return (
    <Icon>
      <path d="M9.6 3.2 5.2 8l4.4 4.8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </Icon>
  )
}

function ChevronRightIcon() {
  return (
    <Icon>
      <path d="M6.4 3.2 10.8 8 6.4 12.8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </Icon>
  )
}

function TrashIcon() {
  return (
    <Icon>
      <path d="M3.2 4.4h9.6M6.2 4.4V3.2h3.6v1.2M4.4 4.4l.6 8.2h6l.6-8.2" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </Icon>
  )
}

export function SearchBar({ editor }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState<SearchPluginState>(() => getSearchState(editor))

  useEffect(() => {
    const refresh = () => setSearch(getSearchState(editor))
    editor.on('transaction', refresh)
    return () => {
      editor.off('transaction', refresh)
    }
  }, [editor])

  const count = searchMatchCountLabel(search)
  const hasMatches = search.matches.length > 0

  return (
    <form className="search-bar" role="search" onSubmit={(event) => event.preventDefault()}>
      <label className="search-label" htmlFor="passage-search">
        <span className="visually-hidden">Search passage</span>
        <SearchIcon />
        <input
          id="passage-search"
          className="search-field"
          type="search"
          placeholder="Search"
          autoComplete="off"
          spellCheck={false}
          value={query}
          onChange={(event) => {
            const next = event.target.value
            setQuery(next)
            setSearchQuery(editor, next)
          }}
        />
      </label>
      {query.length > 0 ? (
        <span className="search-count" aria-live="polite">
          {count}
        </span>
      ) : (
        <span className="visually-hidden" aria-live="polite">
          {count}
        </span>
      )}
      <button
        type="button"
        className="text-button control-button search-step"
        onMouseDown={keepEditorSelection}
        onClick={() => goToPreviousMatch(editor)}
        disabled={!hasMatches}
      >
        <ChevronLeftIcon />
        Previous
      </button>
      <button
        type="button"
        className="text-button control-button search-step"
        onMouseDown={keepEditorSelection}
        onClick={() => goToNextMatch(editor)}
        disabled={!hasMatches}
      >
        Next
        <ChevronRightIcon />
      </button>
      <button
        type="button"
        className="text-button control-button search-step"
        onMouseDown={keepEditorSelection}
        onClick={() => {
          setQuery('')
          clearSearch(editor)
        }}
        disabled={query.length === 0}
      >
        <TrashIcon />
        Clear
      </button>
    </form>
  )
}
