import type { Editor } from '@tiptap/core'
import { useEditorState } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import { selectionMenuDefinitions, type AnnotationKey } from '../annotations/definitions'
import { selectionMenuShouldShow, toggleAnnotationOnSelection } from '../commands/markupActions'
import { MarkupButton } from './MarkupButton'

type SelectionMenuProps = {
  editor: Editor
}

export function SelectionMenu({ editor }: SelectionMenuProps) {
  const definitions = selectionMenuDefinitions()
  const active = useEditorState({
    editor,
    selector: ({ editor: current }) =>
      Object.fromEntries(
        definitions.map((definition) => [
          definition.key,
          current ? current.isActive(definition.key) : false,
        ]),
      ) as Record<AnnotationKey, boolean>,
  })

  return (
    <BubbleMenu
      editor={editor}
      className="selection-menu"
      shouldShow={({ editor: current }) => selectionMenuShouldShow(current)}
      options={{ placement: 'bottom', offset: 8, flip: true, shift: true }}
    >
      <div className="selection-menu-grid" role="toolbar" aria-label="Markup for the selection">
        {definitions.map((definition) => (
          <MarkupButton
            key={definition.key}
            definition={definition}
            pressed={active?.[definition.key] ?? false}
            disabled={false}
            onToggle={() => toggleAnnotationOnSelection(editor, definition.key)}
          />
        ))}
      </div>
    </BubbleMenu>
  )
}
