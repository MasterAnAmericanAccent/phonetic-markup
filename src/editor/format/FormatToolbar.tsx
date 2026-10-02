import type { Editor } from '@tiptap/core'
import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { clearStandardFormatting } from '../commands/clearFormatting'

type FormatToolbarProps = {
  editor: Editor
}

type BlockChoice = {
  id: string
  label: string
  active: (editor: Editor) => boolean
  apply: (editor: Editor) => void
}

const blockChoices: BlockChoice[] = [
  {
    id: 'paragraph',
    label: 'Normal',
    active: (editor) =>
      editor.isActive('paragraph') &&
      !editor.isActive('heading') &&
      !editor.isActive('blockquote'),
    apply: (editor) => {
      editor.chain().focus().setParagraph().run()
    },
  },
  {
    id: 'h1',
    label: 'Heading 1',
    active: (editor) => editor.isActive('heading', { level: 1 }),
    apply: (editor) => {
      editor.chain().focus().setHeading({ level: 1 }).run()
    },
  },
  {
    id: 'h2',
    label: 'Heading 2',
    active: (editor) => editor.isActive('heading', { level: 2 }),
    apply: (editor) => {
      editor.chain().focus().setHeading({ level: 2 }).run()
    },
  },
  {
    id: 'h3',
    label: 'Heading 3',
    active: (editor) => editor.isActive('heading', { level: 3 }),
    apply: (editor) => {
      editor.chain().focus().setHeading({ level: 3 }).run()
    },
  },
]

function currentBlockLabel(editor: Editor): string {
  return blockChoices.find((choice) => choice.active(editor))?.label ?? 'Normal'
}

function keepSelection(event: { preventDefault: () => void }) {
  event.preventDefault()
}

export function FormatToolbar({ editor }: FormatToolbarProps) {
  const [, setRevision] = useState(0)
  useEffect(() => {
    const refresh = () => setRevision((value) => value + 1)
    editor.on('transaction', refresh)
    return () => {
      editor.off('transaction', refresh)
    }
  }, [editor])

  const blockLabel = currentBlockLabel(editor)
  const align = editor.isActive({ textAlign: 'center' })
    ? 'center'
    : editor.isActive({ textAlign: 'right' })
      ? 'right'
      : editor.isActive({ textAlign: 'justify' })
        ? 'justify'
        : 'left'

  return (
    <div className="format-toolbar" role="toolbar" aria-label="Text formatting">
      <BlockMenu editor={editor} label={blockLabel} />
      <div className="format-group">
        <FormatButton
          label="Bold"
          pressed={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <BoldIcon />
        </FormatButton>
        <FormatButton
          label="Italic"
          pressed={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <ItalicIcon />
        </FormatButton>
        <FormatButton
          label="Underline"
          pressed={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon />
        </FormatButton>
        <FormatButton
          label="Strikethrough"
          pressed={editor.isActive('textStrike')}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <StrikeIcon />
        </FormatButton>
      </div>
      <div className="format-group" role="group" aria-label="Alignment">
        <FormatButton
          label="Align left"
          pressed={align === 'left'}
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
        >
          <AlignLeftIcon />
        </FormatButton>
        <FormatButton
          label="Align center"
          pressed={align === 'center'}
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
        >
          <AlignCenterIcon />
        </FormatButton>
        <FormatButton
          label="Align right"
          pressed={align === 'right'}
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
        >
          <AlignRightIcon />
        </FormatButton>
        <FormatButton
          label="Align justify"
          pressed={align === 'justify'}
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
        >
          <AlignJustifyIcon />
        </FormatButton>
      </div>
      <div className="format-group">
        <FormatButton
          label="Bulleted list"
          pressed={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <BulletListIcon />
        </FormatButton>
        <FormatButton
          label="Numbered list"
          pressed={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <NumberedListIcon />
        </FormatButton>
      </div>
      <FormatButton
        solo
        label="Blockquote"
        pressed={editor.isActive('blockquote')}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <QuoteIcon />
      </FormatButton>
      <div className="format-group">
        <FormatButton label="Undo" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}>
          <UndoIcon />
        </FormatButton>
        <FormatButton label="Redo" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}>
          <RedoIcon />
        </FormatButton>
      </div>
      <button
        type="button"
        className="format-text"
        title="Clear formatting"
        aria-label="Clear formatting"
        onMouseDown={keepSelection}
        onClick={() => clearStandardFormatting(editor)}
      >
        Clear formatting
      </button>
    </div>
  )
}

function BlockMenu({ editor, label }: { editor: Editor; label: string }) {
  const [open, setOpen] = useState(false)
  const menuId = useId()
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const close = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="format-block" ref={rootRef}>
      <button
        type="button"
        className="format-text"
        title="Text style"
        aria-label={`Text style, ${label}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={menuId}
        onMouseDown={keepSelection}
        onClick={() => setOpen((value) => !value)}
      >
        {label}
        <CaretIcon />
      </button>
      {open ? (
        <ul className="format-block-menu" id={menuId} role="listbox" aria-label="Text style">
          {blockChoices.map((choice) => {
            const selected = choice.active(editor)
            return (
              <li key={choice.id} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={selected ? 'is-active' : undefined}
                  onMouseDown={keepSelection}
                  onClick={() => {
                    choice.apply(editor)
                    setOpen(false)
                  }}
                >
                  {choice.label}
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}

function FormatButton({
  label,
  pressed,
  disabled,
  solo,
  onClick,
  children,
}: {
  label: string
  pressed?: boolean
  disabled?: boolean
  solo?: boolean
  onClick: () => void
  children: ReactNode
}) {
  const className = ['format-button', pressed ? 'is-active' : '', solo ? 'is-solo' : ''].filter(Boolean).join(' ')
  return (
    <button
      type="button"
      className={className}
      title={label}
      aria-label={label}
      aria-pressed={pressed}
      disabled={disabled}
      onMouseDown={keepSelection}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">
      {children}
    </svg>
  )
}

function BoldIcon() {
  return (
    <Icon>
      <path d="M4 2.5h5.1a2.7 2.7 0 0 1 1.6 4.9A2.9 2.9 0 0 1 9.4 13.5H4V2.5Zm2 4h2.6a1.2 1.2 0 0 0 0-2.4H6v2.4Zm0 5h3.1a1.3 1.3 0 0 0 0-2.6H6v2.6Z" fill="currentColor" />
    </Icon>
  )
}

function ItalicIcon() {
  return (
    <Icon>
      <path d="M7 2.5h5v1.8H9.8l-2.2 7.4H9.5V13.5H4.5v-1.8h2.1l2.2-7.4H7V2.5Z" fill="currentColor" />
    </Icon>
  )
}

function UnderlineIcon() {
  return (
    <Icon>
      <path d="M4 2.5h2v5.2a2 2 0 0 0 4 0V2.5h2v5.2a4 4 0 0 1-8 0V2.5ZM3.5 13.5h9v-1.6h-9v1.6Z" fill="currentColor" />
    </Icon>
  )
}

function StrikeIcon() {
  return (
    <Icon>
      <path d="M3 8h10v1.4H3V8Zm2.2-2.6c.3-1 1.2-1.6 2.6-1.6 1.5 0 2.4.7 2.4 1.7h1.8c0-2-1.6-3.3-4.2-3.3-2.3 0-4.1 1.1-4.4 3.2h1.8Zm.6 4.2h1.7c.2 1.1 1.1 1.7 2.6 1.7 1.4 0 2.3-.6 2.3-1.6H14c0 2-1.7 3.3-4.2 3.3-2.6 0-4.3-1.3-4.6-3.4Z" fill="currentColor" />
    </Icon>
  )
}

function AlignLeftIcon() {
  return (
    <Icon>
      <path d="M2 3.2h12v1.4H2V3.2Zm0 3.1h8v1.4H2V6.3Zm0 3.1h12v1.4H2V9.4Zm0 3.1h8v1.4H2v-1.4Z" fill="currentColor" />
    </Icon>
  )
}

function AlignCenterIcon() {
  return (
    <Icon>
      <path d="M2 3.2h12v1.4H2V3.2Zm2 3.1h8v1.4H4V6.3Zm-2 3.1h12v1.4H2V9.4Zm2 3.1h8v1.4H4v-1.4Z" fill="currentColor" />
    </Icon>
  )
}

function AlignRightIcon() {
  return (
    <Icon>
      <path d="M2 3.2h12v1.4H2V3.2Zm4 3.1h8v1.4H6V6.3Zm-4 3.1h12v1.4H2V9.4Zm4 3.1h8v1.4H6v-1.4Z" fill="currentColor" />
    </Icon>
  )
}

function AlignJustifyIcon() {
  return (
    <Icon>
      <path d="M2 3.2h12v1.4H2V3.2Zm0 3.1h12v1.4H2V6.3Zm0 3.1h12v1.4H2V9.4Zm0 3.1h12v1.4H2v-1.4Z" fill="currentColor" />
    </Icon>
  )
}

function BulletListIcon() {
  return (
    <Icon>
      <circle cx="3" cy="4" r="1.2" fill="currentColor" />
      <circle cx="3" cy="8" r="1.2" fill="currentColor" />
      <circle cx="3" cy="12" r="1.2" fill="currentColor" />
      <path d="M6 3.3h8v1.4H6V3.3Zm0 4h8v1.4H6V7.3Zm0 4h8v1.4H6v-1.4Z" fill="currentColor" />
    </Icon>
  )
}

function NumberedListIcon() {
  return (
    <Icon>
      <path d="M2.2 3.2h1.2v3H2.2v-.9h-.7V4.4h.7V3.2Zm-.2 5.2h2v.8l-1.2.9h1.2v.9H2v-.8l1.2-.9H2V8.4Zm.2 4.2h1.6v.8H2.8v.7h1.2v.8H2v-2.3h.2Zm3.6-9.3h8v1.4H6V3.3Zm0 4h8v1.4H6V7.3Zm0 4h8v1.4H6v-1.4Z" fill="currentColor" />
    </Icon>
  )
}

function QuoteIcon() {
  return (
    <Icon>
      <path d="M3 6.2c1.4 0 2.2.8 2.2 2.1 0 1.5-1 2.6-2.6 3.1l-.5-1.1c.9-.4 1.4-.9 1.4-1.6-.2.1-.5.1-.8.1-1.2 0-2-.8-2-1.9 0-1.1.8-1.7 2.3-1.7Zm6.2 0c1.4 0 2.2.8 2.2 2.1 0 1.5-1 2.6-2.6 3.1l-.5-1.1c.9-.4 1.4-.9 1.4-1.6-.2.1-.5.1-.8.1-1.2 0-2-.8-2-1.9 0-1.1.8-1.7 2.3-1.7Z" fill="currentColor" />
    </Icon>
  )
}

function UndoIcon() {
  return (
    <Icon>
      <path d="M6.2 4.2 3.2 7l3 2.8V7.8h3.2a2.6 2.6 0 1 1 0 5.2H6.2V14.5h3.2a4.1 4.1 0 0 0 0-8.2H6.2V4.2Z" fill="currentColor" />
    </Icon>
  )
}

function RedoIcon() {
  return (
    <Icon>
      <path d="M9.8 4.2 12.8 7l-3 2.8V7.8H6.6a2.6 2.6 0 1 0 0 5.2h3.2V14.5H6.6a4.1 4.1 0 0 1 0-8.2h3.2V4.2Z" fill="currentColor" />
    </Icon>
  )
}

function CaretIcon() {
  return (
    <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true" focusable="false">
      <path d="M4 6h8L8 11 4 6Z" fill="currentColor" />
    </svg>
  )
}
