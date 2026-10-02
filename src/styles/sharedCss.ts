/** Design tokens. The editor injects this, and document export inlines the same text. */
export const tokensCss = `:root {
  --text: #111111;
  --surface: #ffffff;
  --line: #111111;
  --wash: #f4f4ef;
  --control-accent: #f4c400;
  --editor-font-size: 1.25rem;
  --editor-line-height: 1.7;
  --annotation-error-bg: rgb(255 228 228 / 0.72);
  --annotation-error-fg: #9b1c1c;
  --annotation-voicing: #b45309;
  --annotation-nasal: #6d28d9;
  --annotation-alternate: #1d4ed8;
  --annotation-connect: rgb(254 233 171 / 0.9);
  --annotation-glide: rgb(115 202 215 / 0.55);
  --annotation-link: rgb(173 196 190 / 0.7);
  --annotation-blend: rgb(254 167 162 / 0.62);
  --annotation-stretch-spacing: 0.28em;
  --annotation-reduce-spacing: -0.06em;
  --annotation-strike-ink: rgb(0 0 0 / 0.45);
  --annotation-strike-line: #c24141;
}
`

/** Annotation rules. Same string for the editor and for PNG/HTML export. */
export const annotationCss = `[data-annotation] {
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
}

.annotation-error {
  background: var(--annotation-error-bg);
  color: var(--annotation-error-fg);
}

.annotation-voicing {
  text-decoration: underline;
  text-decoration-color: var(--annotation-voicing);
  text-decoration-thickness: 2px;
  text-underline-offset: 0.18em;
}

.annotation-nasal {
  text-decoration: overline;
  text-decoration-color: var(--annotation-nasal);
  text-decoration-thickness: 2px;
}

.annotation-alternate {
  border-bottom: 2px dotted var(--annotation-alternate);
}

.annotation-connect {
  background: var(--annotation-connect);
}

.annotation-glide {
  background: var(--annotation-glide);
  text-decoration: underline wavy;
  text-decoration-color: #0f766e;
  text-underline-offset: 0.22em;
}

.annotation-link {
  background: var(--annotation-link);
  text-decoration: underline double;
  text-decoration-color: #3f6212;
  text-underline-offset: 0.2em;
}

.annotation-blend {
  background: var(--annotation-blend);
  text-decoration: underline dashed;
  text-decoration-color: #9f1239;
  text-underline-offset: 0.16em;
}

.annotation-stretch {
  font-weight: 700;
  letter-spacing: var(--annotation-stretch-spacing);
}

.annotation-reduce {
  letter-spacing: var(--annotation-reduce-spacing);
}

.annotation-stress {
  font-weight: 700;
  text-decoration: underline;
  text-decoration-color: #111111;
  text-decoration-thickness: 2px;
  text-underline-offset: 0.12em;
}

.annotation-strike {
  color: var(--annotation-strike-ink);
  text-decoration: line-through;
  text-decoration-color: var(--annotation-strike-line);
  text-decoration-thickness: 2px;
  background-image: linear-gradient(
    to left top,
    transparent 46%,
    var(--annotation-strike-line) 49%,
    var(--annotation-strike-line) 52%,
    transparent 55%
  );
}
`
