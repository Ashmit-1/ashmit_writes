import { BrandMark } from './BrandMark'

/**
 * Top bar for the gateway.
 *
 * Per design.md this stays minimal: a small wordmark and no complex
 * navigation. An optional source link can be added here later once a real
 * repository URL exists.
 */
export function Header() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-[1140px] items-center justify-between gap-4 px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
        <a
          href="./"
          className="rounded-sm transition-colors duration-150 hover:text-accent"
        >
          <BrandMark size="compact" />
        </a>
      </div>
    </header>
  )
}