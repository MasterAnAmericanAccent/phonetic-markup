import type { JSONContent } from '@tiptap/core'
import { EditorContent, useEditor } from '@tiptap/react'
import { brand } from '../branding/brand'
import { layoutFixture } from '../document/layoutFixture'
import { ExportActions } from '../export/ExportActions'
import { SearchBar } from '../search/SearchBar'
import { createPhoneticExtensions } from './createPhoneticExtensions'
import { phoneticEditorProps } from './paste'
import { FormatToolbar } from './format/FormatToolbar'
import { MarkupPanel } from './selection/MarkupPanel'
import { SelectionMenu } from './selection/SelectionMenu'

function SparkleIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path
        d="M8 1.2 9.1 6 13.8 8 9.1 10 8 14.8 6.9 10 2.2 8 6.9 6 8 1.2Z"
        fill="currentColor"
      />
    </svg>
  )
}

const emptyDocument: JSONContent = {
  type: 'doc',
  content: [{ type: 'paragraph' }],
}

export function PhoneticEditor() {
  const editor = useEditor({
    extensions: createPhoneticExtensions(),
    content: layoutFixture,
    editorProps: phoneticEditorProps,
    autofocus: 'end',
  })

  return (
    <div className="workspace">
      <header className="workspace-bar">
        <div className="brand-lockup">
          <span className="brand-logo-frame">
            <img className="brand-logo" src={brand.logoSrc} alt={brand.logoAlt} />
          </span>
          <h1>{brand.headerLabel}</h1>
        </div>
        <div className="workspace-search">{editor ? <SearchBar editor={editor} /> : null}</div>
        <div className="workspace-actions">
          {editor ? <ExportActions editor={editor} /> : null}
          <button
            type="button"
            className="text-button control-button text-button-warm"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              editor?.chain().focus().setContent(emptyDocument).run()
            }}
          >
            <SparkleIcon />
            Clear passage
          </button>
        </div>
      </header>
      <div className="workspace-body">
        {editor ? <MarkupPanel editor={editor} /> : <aside className="markup-panel" aria-hidden="true" />}
        <section className="passage" aria-label="Phonetic passage">
          {editor ? <FormatToolbar editor={editor} /> : null}
          {editor ? <SelectionMenu editor={editor} /> : null}
          <EditorContent editor={editor} className="phonetic-editor" />
        </section>
      </div>
    </div>
  )
}
