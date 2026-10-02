import { brandTokens } from '../branding/brand'
import { annotationCss, tokensCss } from '../styles/sharedCss'

/** Readable column. Independent of the coach's current window width. */
export const EXPORT_WIDTH_PX = 760

/**
 * Document-only CSS. Annotation rules and tokens are the same files the editor loads.
 * The shell below is export-specific so the file does not need the application stylesheet.
 */
export function documentExportCss(): string {
  return `${tokensCss}
${annotationCss}
html, body {
  margin: 0;
  background: var(--surface);
  color: var(--text);
}
.document {
  box-sizing: border-box;
  width: ${EXPORT_WIDTH_PX}px;
  margin: 0;
  padding: 1.5rem 1.75rem 2rem;
  background: var(--surface);
  color: var(--text);
  font-family: "Segoe UI", sans-serif;
  font-size: var(--editor-font-size);
  line-height: var(--editor-line-height);
  overflow-wrap: break-word;
}
.document p,
.document h1,
.document h2,
.document h3,
.document ul,
.document ol,
.document blockquote {
  margin: 0 0 1rem;
}
.document p {
  min-height: 1.7em;
}
.document h1 {
  font-size: 2rem;
  line-height: 1.25;
}
.document h2 {
  font-size: 1.6rem;
  line-height: 1.3;
}
.document h3 {
  font-size: 1.3rem;
  line-height: 1.35;
}
.document ul,
.document ol {
  padding-left: 1.5rem;
}
.document blockquote {
  padding: 0.15rem 0 0.15rem 0.85rem;
  border-left: 3px solid ${brandTokens.focus};
}
.document li > p:last-child,
.document blockquote > p:last-child {
  margin-bottom: 0;
}
`
}
