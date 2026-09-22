import { BrandMark } from './BrandMark'
import { HeroConstellation } from './HeroConstellation'
import { SearchBar } from './SearchBar'

interface HeroProps {
  query: string
  onQueryChange: (value: string) => void
}

/**
 * Hero area: the primary identity, one supporting sentence, and the search
 * field — with the ambient "Thought Constellation" on the right.
 *
 * Per design.md > Layout > Hero band, this renders as a distinct warm band:
 * its own gradient background, a subtle paper grain, a hairline rule beneath,
 * and a soft accent glow anchored behind the search field. The card grid below
 * stays on the flat page color.
 *
 * The constellation is secondary by design: it appears only from `lg` up, sits
 * behind the text in stacking order, and never intercepts clicks.
 */
export function Hero({ query, onQueryChange }: HeroProps) {
  return (
    <section className="hero-band paper-grain relative isolate overflow-hidden">
      <div className="mx-auto w-full max-w-[1140px] px-4 pt-20 pb-14 sm:px-6 sm:pt-28 sm:pb-20 lg:px-8 lg:pt-32 lg:pb-24">
        {/*
          Two-column hero: typography + search on the left, constellation on
          the right. The right column takes ~42% of the width on desktop, and
          both columns are vertically centred against each other.

          Below `lg` the constellation is dropped rather than shrunk, so it
          never crowds the tagline or causes horizontal overflow on phones.
        */}
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.72fr)] lg:gap-10 xl:gap-14">
          <div className="max-w-2xl">
            <h1 className="text-balance">
              <BrandMark size="hero" />
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-relaxed text-secondary sm:mt-7 sm:text-lg">
              A collection of interactive learning pages. Read, explore, and
              work through each topic at your own pace.
            </p>

            {/* Soft accent glow sits behind the search field only. */}
            <div className="accent-glow mt-10 sm:mt-12">
              <SearchBar
                value={query}
                onChange={onQueryChange}
                label="Search learning pages"
                placeholder="Search by title or author"
              />
            </div>
          </div>

          {/*
            Interactive Thought Constellation.
            Desktop sizing: ~450-550px wide, ~350-450px tall, vertically
            centred against the hero content by the grid's `items-center`.
          */}
          <HeroConstellation className="hidden h-[400px] w-full max-w-[550px] select-none lg:block lg:justify-self-end xl:h-[450px]" />
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