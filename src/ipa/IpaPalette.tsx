import { useState, type FormEvent } from 'react'
import type { Editor } from '@tiptap/core'
import { addCustomIpa, loadCustomIpa, removeCustomIpa, saveCustomIpa } from './customIpa'
import { insertSymbolAtSelection } from './insertSymbol'
import { ipaCategories, symbolsInCategory, type IpaCategoryId, type IpaSymbol } from './ipaData'

type IpaPaletteProps = {
  editor: Editor
}

export function IpaPalette({ editor }: IpaPaletteProps) {
  const [category, setCategory] = useState<IpaCategoryId>('vowel')
  const [inventory, setInventory] = useState(loadCustomIpa)
  const [open, setOpen] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [pending, setPending] = useState<IpaSymbol | null>(null)
  const [character, setCharacter] = useState('')
  const [targetCategory, setTargetCategory] = useState<IpaCategoryId>('vowel')
  const [message, setMessage] = useState('')
  const symbols = [...symbolsInCategory(category), ...inventory.symbols.filter(symbol => symbol.category === category)]

  function persist(symbols: typeof inventory.symbols): boolean {
    if (!saveCustomIpa(symbols)) {
      setMessage('Could not save custom IPA characters. Browser storage may be unavailable or full. No changes were saved.')
      return false
    }
    setInventory({ symbols, error: '' })
    setMessage('')
    return true
  }

  function save(event: FormEvent) {
    event.preventDefault()
    try {
      if (persist(addCustomIpa(inventory.symbols, character, targetCategory))) {
        setCategory(targetCategory)
        setCharacter('')
        setOpen(false)
      }
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not add this character.') }
  }

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
              onClick={() => { setCategory(item.id); setPending(null) }}
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
            aria-label={removing && symbol.id.startsWith('custom-') ? `Remove custom ${symbol.character} from ${symbol.category}` : `${symbol.label}, ${symbol.codePoints.join(' ')}`}
            disabled={removing && !symbol.id.startsWith('custom-')}
            title={removing && !symbol.id.startsWith('custom-') ? 'Built-in IPA characters cannot be removed' : symbol.codePoints.join(' ')}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              if (removing) {
                if (symbol.id.startsWith('custom-')) setPending(symbol)
              } else insertSymbolAtSelection(editor, symbol.character)
            }}
          >
            {symbol.character}
          </button>
        ))}
      </div>
      <div className="ipa-manage-actions">
      <button type="button" className="ipa-add" aria-expanded={open} aria-controls="custom-ipa-form"
        onMouseDown={event => event.preventDefault()}
        onClick={() => { setOpen(!open); setRemoving(false); setPending(null); setTargetCategory(category); setMessage('') }}>
        + Add IPA
      </button>
      <button type="button" className="ipa-add" aria-pressed={removing} disabled={inventory.symbols.length === 0}
        onMouseDown={event => event.preventDefault()}
        onClick={() => { setRemoving(true); setPending(null); setOpen(false); setCharacter(''); setMessage('') }}>
        − Remove IPA
      </button>
      </div>
      {removing && <div className="ipa-removal-mode">
        <div className="ipa-custom-actions">
          <span>Select a custom character to remove.</span>
          <button type="button" className="ipa-add" onClick={() => { setRemoving(false); setPending(null); setMessage('') }}>Done</button>
        </div>
        {pending && <div className="ipa-removal-confirm" role="group" aria-label="Confirm IPA removal">
          <p>Remove {pending.character} from {ipaCategories.find(item => item.id === pending.category)?.label}?</p>
          <div className="ipa-custom-actions">
            <button type="button" className="ipa-add" onClick={() => {
              const next = removeCustomIpa(inventory.symbols, pending.id)
              if (persist(next)) {
                setPending(null)
                if (next.length === 0) setRemoving(false)
              }
            }}>Remove</button>
            <button type="button" className="ipa-add" onClick={() => { setPending(null); setMessage('') }}>Cancel</button>
          </div>
        </div>}
      </div>}
      {(message || inventory.error) && <p className="ipa-custom-message" role="alert">{message || inventory.error}</p>}
      {open && <form id="custom-ipa-form" className="ipa-custom-form" aria-label="Add or manage custom IPA" onSubmit={save}>
        <label>Unicode character<input autoFocus autoCapitalize="off" autoCorrect="off" spellCheck={false} value={character} onChange={event => setCharacter(event.target.value)} required /></label>
        <label>Category<select aria-label="Category" value={targetCategory} onChange={event => setTargetCategory(event.target.value as IpaCategoryId)}>
          {ipaCategories.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
        </select></label>
        <div className="ipa-custom-actions">
          <button type="submit" className="ipa-add">Save</button>
          <button type="button" className="ipa-add" onClick={() => { setOpen(false); setCharacter(''); setMessage('') }}>Cancel</button>
        </div>

      </form>}
    </section>
  )
}
