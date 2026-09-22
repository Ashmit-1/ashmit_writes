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
    <header className="relative">
      <div className="mx-auto flex max-w-[1140px] items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
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