/**
 * The brand wordmark: "Ashmit and AI Writes".
 *
 * Treatment is fixed by frontend/design.md > Branding:
 *   - "Ashmit and" — system sans, semibold
 *   - "AI"         — serif, accent color (the single deliberate break in the
 *                    typography system)
 *   - "Writes"     — system sans, semibold
 *
 * `size` switches between the compact top-bar treatment and the large hero
 * heading, so both places stay typographically identical.
 */
interface BrandMarkProps {
  size?: 'compact' | 'hero'
}

export function BrandMark({ size = 'compact' }: BrandMarkProps) {
  const isHero = size === 'hero'

  const base = isHero
    ? 'text-4xl sm:text-5xl lg:text-6xl'
    : 'text-base sm:text-lg'

  // The serif accent should read as intentional, not as a font mismatch:
  // a slight italic contrasts the semibold sans around it.
  const accent = 'font-serif italic font-normal text-accent'

  return (
    <span className={`${base} font-semibold tracking-tight text-primary`}>
      Ashmit and <span className={accent}>AI</span> Writes
    </span>
  )
}