import { isAnnotationKey, type AnnotationKey } from '../annotations/definitions'
import type { AnnotationDefinition } from '../annotations/types'

type MarkupButtonProps = {
  definition: AnnotationDefinition
  pressed: boolean
  disabled: boolean
  onToggle: () => void
}

/** Miniature sample of the document treatment. Not an active-state icon. */
const previewSample: Record<AnnotationKey, string> = {
  error: 'E',
  voicing: 'V',
  nasal: 'N',
  alternate: 'A',
  connect: 'C',
  glide: 'G',
  link: 'L',
  blend: 'B',
  stretch: 'AA',
  reduce: 'AA',
  stress: 'U',
  strike: 'S',
}

export function MarkupButton({ definition, pressed, disabled, onToggle }: MarkupButtonProps) {
  return (
    <button
      type="button"
      className={pressed ? 'mark-button is-active' : 'mark-button'}
      aria-pressed={pressed}
      aria-label={pressed ? `Remove ${definition.name}` : `Apply ${definition.name}`}
      title={definition.description}
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onToggle}
    >
      <span className="annotation-preview" aria-hidden="true">
        <span className={`annotation-preview-sample ${definition.className}`}>
          {isAnnotationKey(definition.key) ? previewSample[definition.key] : ''}
        </span>
      </span>
      <span className="mark-label">{definition.name}</span>
    </button>
  )
}
