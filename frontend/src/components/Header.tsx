import { BrandMark } from './BrandMark'

/**
 * Top bar for the gateway.
 *
 * Per design.md this stays minimal: a small brand mark and wordmark, no
 * complex navigation. An optional source link can be added here later once a
 * real repository URL exists.
 *
 * The logo also serves as the favicon. It is linked from `public/`, so it
 * resolves at `/logo.svg` in both dev and the built site.
 */
export function Header() {
  return (
    <header className="relative">
      <div className="mx-auto flex max-w-[1140px] items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
        <a
          href="./"
          className="flex items-center gap-2.5 rounded-sm transition-colors duration-150"
        >
          {/*
            Decorative here: the adjacent wordmark already names the brand, so
            an empty alt avoids repeating it for screen readers.
          */}
          <img
            src="/logo.svg"
            alt=""
            width={28}
            height={28}
            className="h-7 w-7 shrink-0"
          />
          <BrandMark size="compact" />
        </a>
      </div>
    </header>
  )
}