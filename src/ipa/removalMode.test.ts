import { act, createElement } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import type { Editor } from '@tiptap/core'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createTestEditor } from '../editor/testSupport'
import { IpaPalette } from './IpaPalette'
import { addCustomIpa, loadCustomIpa, saveCustomIpa } from './customIpa'

const mounted: { root: Root; editor: Editor }[] = []
beforeEach(() => localStorage.clear())
afterEach(async () => {
  for (const { root, editor } of mounted.splice(0)) { await act(async () => root.unmount()); editor.destroy() }
  document.body.innerHTML = ''
})

async function mount(custom = true) {
  if (custom) saveCustomIpa(addCustomIpa([], 'ɐ', 'vowel'))
  const host = document.createElement('div'); document.body.append(host)
  const editor = createTestEditor('<p>already ɐ inserted</p>')
  const root = createRoot(host); mounted.push({ root, editor })
  await act(async () => root.render(createElement(IpaPalette, { editor })))
  const button = (label: string) => [...host.querySelectorAll('button')].find(element => element.textContent?.trim() === label)!
  const click = async (label: string) => { await act(async () => button(label).click()) }
  return { host, editor, button, click }
}

describe('IPA removal mode', () => {
  it('disables removal without custom characters and preserves built-ins', async () => {
    const { host, button } = await mount(false)
    expect(button('− Remove IPA').disabled).toBe(true)
    expect(host.querySelector('[aria-label="Insert ǣ, U+01E3"]')).not.toBeNull()
    expect(host.textContent).not.toContain('Custom characters are saved only')
  })
  it('requires confirmation, supports cancel and done, and never edits the document', async () => {
    const { host, editor, button, click } = await mount()
    const before = editor.getJSON()
    await click('− Remove IPA')
    expect((host.querySelector('[aria-label="Insert ǣ, U+01E3"]') as HTMLButtonElement).disabled).toBe(true)
    await click('ɐ')
    expect(host.querySelector('[aria-label="Confirm IPA removal"]')).not.toBeNull()
    expect(loadCustomIpa().symbols).toHaveLength(1)
    await click('Cancel')
    expect(host.querySelector('[aria-label="Confirm IPA removal"]')).toBeNull()
    expect(loadCustomIpa().symbols).toHaveLength(1)
    await click('ɐ')
    await click('Done')
    expect(host.querySelector('[aria-label="Confirm IPA removal"]')).toBeNull()
    expect(loadCustomIpa().symbols).toHaveLength(1)
    await click('− Remove IPA')
    await click('ɐ')
    await click('Remove')
    expect(loadCustomIpa().symbols).toEqual([])
    expect(button('− Remove IPA').disabled).toBe(true)
    expect(editor.getJSON()).toEqual(before)
    expect((host.querySelector('[aria-label="Insert ǣ, U+01E3"]') as HTMLButtonElement).disabled).toBe(false)
  })
})
