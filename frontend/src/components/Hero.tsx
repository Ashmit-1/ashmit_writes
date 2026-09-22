import { BrandMark } from './BrandMark'
import { SearchBar } from './SearchBar'

interface HeroProps {
  query: string
  onQueryChange: (value: string) => void
}

/**
 * Hero area: the primary identity, one supporting sentence, and the search
 * field.
 *
 * Per design.md > Layout > Hero band, this renders as a distinct warm band:
 * its own gradient background, a subtle paper grain, a hairline rule beneath,
 * and a faint accent glow anchored behind the search field. The card grid
 * below stays on the flat page color.
 */
export function Hero({ query, onQueryChange }: HeroProps) {
  return (
    <section className="hero-band paper-grain relative isolate overflow-hidden">
      <div className="mx-auto w-full max-w-[1140px] px-4 pt-20 pb-14 sm:px-6 sm:pt-28 sm:pb-20 lg:px-8 lg:pt-36 lg:pb-24">
        <h1 className="text-balance">
          <BrandMark size="hero" />
        </h1>

        <p className="mt-5 max-w-2xl text-base leading-relaxed text-secondary sm:mt-7 sm:text-lg">
          A collection of interactive learning pages. Read, explore, and work
          through each topic at your own pace.
        </p>

        {/* Faint accent glow sits behind the search field only. */}
        <div className="accent-glow mt-10 max-w-2xl sm:mt-12">
          <SearchBar
            value={query}
            onChange={onQueryChange}
            label="Search learning pages"
            placeholder="Search by title or author"
          />
        </div>

        {/* Subtle editorial hairline closing the band. */}
        <div
          aria-hidden="true"
          className="mt-14 h-px w-full bg-gradient-to-r from-border-strong via-border to-transparent sm:mt-16"
        />
      </div>
    </section>
  )
}