import logoUrl from '../assets/brand-logo.svg'

/**
 * Accent Coach Bianca identity and the client 2025 Honeybee palette.
 * Shell CSS is injected only for the application. Document export keeps src/styles/sharedCss.ts.
 * The header shows the complete supplied 1.svg lockup, with PHONETIC MARKUP underneath.
 * Exports do not include that asset.
 */
export const brand = {
  productName: 'Accent Coach Bianca',
  headerLabel: 'PHONETIC MARKUP',
  appTitle: 'ACB Phonetic Markup',
  toolName: 'Phonetic markup',
  logoSrc: logoUrl,
  logoAlt: 'Accent Coach Bianca',
}

/** Client-supplied families. Variants that are not used in the shell stay here as the source values. */
export const honeybee = {
  amber: {
    main: '#FFB800',
    blackest: '#120B02',
    mediumDark: '#915B12',
    mediumLight: '#FFE085',
    whitest: '#FFFAE8',
  },
  butterscotch: {
    main: '#E79A3F',
    blackest: '#120B02',
    mediumDark: '#915B12',
    mediumLight: '#F4D0A4',
    whitest: '#FFF6ED',
  },
  caribbeanCurrent: {
    main: '#28666B',
    almostWhite: '#F1F8F9',
    blackest: '#061D1E',
    mediumDark: '#17373A',
    mediumLight: '#8ACBD0',
  },
  eerieBlack: {
    main: '#232323',
    darkest: '#0A0A0A',
    lightest: '#F5F5F5',
    mediumDark: '#141414',
    mediumLight: '#8F8F8F',
  },
  eggshell: {
    main: '#FEEAD9',
    blackest: '#120B02',
    mediumDark: '#BA8D38',
    mediumLight: '#FDF6ED',
    whitest: '#FDF6ED',
  },
  mustard: {
    main: '#FFE058',
    blackest: '#120B02',
    mediumDark: '#B88D00',
    mediumLight: '#FFF0AD',
    whitest: '#FFFBE8',
  },
  russet: {
    main: '#7A451B',
    blackest: '#120B02',
    whitest: '#FFF4EE',
    mediumDark: '#45250F',
    mediumLight: '#DE9868',
  },
} as const

/**
 * Semantic shell roles. Text on yellow and cream stays Eerie Black.
 * line, lineStrong, muted, and control are Canva UI neutrals, not annotation colors.
 */
export const brandTokens = {
  text: honeybee.eerieBlack.main,
  background: '#f5f5f5',
  surface: '#f5f5f5',
  panel: '#ffffff',
  border: '#ddd9d4',
  line: '#e6e3de',
  lineStrong: '#ddd9d4',
  muted: '#71675f',
  control: '#ffffff',
  onPrimary: '#ffffff',
  onHover: honeybee.eerieBlack.main,
  accent: honeybee.butterscotch.main,
  primary: honeybee.mustard.main,
  primaryHover: honeybee.amber.main,
  secondary: honeybee.butterscotch.main,
  focus: honeybee.mustard.main,
} as const

/** Application shell variables. Not included in PNG or HTML document export. */
export function brandShellCss(): string {
  return `:root {
  --brand-text: ${brandTokens.text};
  --brand-background: ${brandTokens.background};
  --brand-surface: ${brandTokens.surface};
  --brand-panel: ${brandTokens.panel};
  --brand-border: ${brandTokens.border};
  --brand-line: ${brandTokens.line};
  --brand-line-strong: ${brandTokens.lineStrong};
  --brand-muted: ${brandTokens.muted};
  --brand-control: ${brandTokens.control};
  --brand-on-primary: ${brandTokens.onPrimary};
  --brand-on-hover: ${brandTokens.onHover};
  --brand-accent: ${brandTokens.accent};
  --brand-primary: ${brandTokens.primary};
  --brand-primary-hover: ${brandTokens.primaryHover};
  --brand-secondary: ${brandTokens.secondary};
  --brand-focus: ${brandTokens.focus};
}
`
}
