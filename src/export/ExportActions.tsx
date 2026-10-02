import { useState, type MouseEvent } from 'react'
import type { Editor } from '@tiptap/core'
import { downloadBlob, HTML_EXPORT_FILENAME, PNG_EXPORT_FILENAME } from './download'
import { renderDocumentHtml } from './documentHtml'
import { exportErrorMessage, renderDocumentPng } from './renderPng'

type ExportActionsProps = {
  editor: Editor
}

function keepEditorSelection(event: MouseEvent) {
  event.preventDefault()
}

function ImageIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <rect x="2" y="3" width="12" height="10" rx="1.4" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="5.6" cy="6.4" r="1" fill="currentColor" />
      <path d="M3.2 11.4 6.2 8.4l2 2 1.6-1.6 3 3.2" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  )
}

function CodeIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path d="M6 4.2 2.8 8 6 11.8M10 4.2 13.2 8 10 11.8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function ExportActions({ editor }: ExportActionsProps) {
  const [pngBusy, setPngBusy] = useState(false)
  const [message, setMessage] = useState('')

  async function exportPng() {
    if (pngBusy) return
    setPngBusy(true)
    setMessage('')
    const content = editor.getJSON()
    try {
      const blob = await renderDocumentPng(renderDocumentHtml(content))
      downloadBlob(blob, PNG_EXPORT_FILENAME)
    } catch (error) {
      setMessage(exportErrorMessage(error, 'PNG'))
    } finally {
      setPngBusy(false)
    }
  }

  function exportHtml() {
    setMessage('')
    const content = editor.getJSON()
    try {
      const html = renderDocumentHtml(content)
      downloadBlob(new Blob([html], { type: 'text/html;charset=utf-8' }), HTML_EXPORT_FILENAME)
    } catch (error) {
      setMessage(exportErrorMessage(error, 'HTML'))
    }
  }

  return (
    <div className="export-actions">
      <button
        type="button"
        className="text-button control-button text-button-primary"
        onMouseDown={keepEditorSelection}
        onClick={() => void exportPng()}
        disabled={pngBusy}
      >
        <ImageIcon />
        {pngBusy ? 'Exporting…' : 'Export PNG'}
      </button>
      <button type="button" className="text-button control-button" onMouseDown={keepEditorSelection} onClick={exportHtml}>
        <CodeIcon />
        Export HTML
      </button>
      <p className="export-status" role="status">
        {message}
      </p>
    </div>
  )
}
