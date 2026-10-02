import type { Editor } from '@tiptap/core'
import { useEditorState } from '@tiptap/react'
import { annotationCategories } from '../annotations/types'
import { annotationDefinitions, type AnnotationKey } from '../annotations/definitions'
import { selectionHasRange, toggleAnnotationOnSelection } from '../commands/markupActions'
import { IpaPalette } from '../../ipa/IpaPalette'
import { MarkupButton } from './MarkupButton'

type MarkupPanelProps = {
  editor: Editor
}

export function MarkupPanel({ editor }: MarkupPanelProps) {
  const state = useEditorState({
    editor,
    selector: ({ editor: current }) => ({
      hasRange: current ? selectionHasRange(current) : false,
      active: Object.fromEntries(
        annotationDefinitions.map((definition) => [
          definition.key,
          current ? current.isActive(definition.key) : false,
        ]),
      ) as Record<AnnotationKey, boolean>,
    }),
  })

  return (
    <aside className="markup-panel" aria-label="Markup tools">
      <IpaPalette editor={editor} />
      {annotationCategories.map((category) => (
        <section key={category.id} className="markup-group" aria-labelledby={`markup-${category.id}`}>
          <h2 id={`markup-${category.id}`}>{category.label}</h2>
          <div className="markup-buttons">
            {annotationDefinitions
              .filter((definition) => definition.category === category.id)
              .map((definition) => (
                <MarkupButton
                  key={definition.key}
                  definition={definition}
                  pressed={state?.active[definition.key] ?? false}
                  disabled={!state?.hasRange}
                  onToggle={() => toggleAnnotationOnSelection(editor, definition.key)}
                />
              ))}
          </div>
        </section>
      ))}
    </aside>
  )
}
