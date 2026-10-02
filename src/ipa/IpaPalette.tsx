import { useState } from 'react'
import type { Editor } from '@tiptap/core'
import { insertSymbolAtSelection } from './insertSymbol'
import { ipaCategories, symbolsInCategory, type IpaCategoryId } from './ipaData'

type IpaPaletteProps = {
  editor: Editor
}

export function IpaPalette({ editor }: IpaPaletteProps) {
  const [category, setCategory] = useState<IpaCategoryId>('vowel')
  const symbols = symbolsInCategory(category)

  return (
    <section className="ipa-palette" aria-label="Phonetic symbols">
      <div className="ipa-tabs" role="tablist" aria-label="Symbol groups">
        {ipaCategories.map((item) => {
          const selected = item.id === category
          return (
            <button
              key={item.id}
              type="button"
              className={selected ? 'ipa-tab is-active' : 'ipa-tab'}
              role="tab"
              id={`ipa-tab-${item.id}`}
              aria-selected={selected}
              aria-controls={`ipa-panel-${item.id}`}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => setCategory(item.id)}
            >
              {item.label}
            </button>
          )
        })}
      </div>
      <div
        className="ipa-grid"
        role="tabpanel"
        id={`ipa-panel-${category}`}
        aria-labelledby={`ipa-tab-${category}`}
      >
        {symbols.map((symbol) => (
          <button
            key={symbol.id}
            type="button"
            className="ipa-symbol"
            aria-label={`${symbol.label}, ${symbol.codePoints.join(' ')}`}
            title={symbol.codePoints.join(' ')}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => insertSymbolAtSelection(editor, symbol.character)}
          >
            {symbol.character}
          </button>
        ))}
      </div>
    </section>
  )
}
