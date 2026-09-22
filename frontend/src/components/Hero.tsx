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
      <div className="mx-auto w-full max-w-[1140px] px-4 pt-14 pb-10 sm:px-6 sm:pt-20 sm:pb-12 lg:px-8 lg:pt-24 lg:pb-14">
        {/*
          Two-column hero on desktop: typography + search on the left, the
          Thought Constellation on the right (~40% of the width), both
          vertically centred.

          On mobile this collapses to one column and the constellation slots
          between the tagline and the search bar, staying visible rather than
          being hidden. Order is controlled with `order-*` so the same markup
          serves both layouts. `min-w-0` on the text column prevents long
          words from forcing horizontal overflow.
        */}
        <div className="grid grid-cols-1 items-center gap-8 sm:gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.72fr)] lg:gap-10 xl:gap-14">
          <div className="order-1 min-w-0 max-w-2xl lg:col-start-1 lg:row-start-1">
            <h1 className="text-balance">
              <BrandMark size="hero" />
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-relaxed text-secondary sm:mt-6 sm:text-lg">
              A collection of interactive learning pages. Read, explore, and
              work through each topic at your own pace.
            </p>
          </div>

          {/*
            Interactive Thought Constellation.
            Mobile/tablet: sits between the tagline and the search bar.
            Desktop: moves into the right column at its full size.

            `max-w` is chosen per breakpoint to track the viewBox aspect ratio,
            so the composition fills its box instead of being letterboxed with
            empty side margins. Heights stay modest on phones so the search bar
            is not pushed far down the page.
          */}
          <HeroConstellation className="order-2 h-[240px] w-full max-w-[290px] min-w-0 select-none justify-self-center sm:h-[320px] sm:max-w-[390px] lg:order-3 lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:h-[400px] lg:max-w-[550px] lg:justify-self-end xl:h-[450px]" />

          <div className="order-3 min-w-0 max-w-2xl lg:order-2 lg:col-start-1 lg:row-start-2">
            {/* Soft accent glow sits behind the search field only. */}
            <div className="accent-glow">
              <SearchBar
                value={query}
                onChange={onQueryChange}
                label="Search learning pages"
                placeholder="Search by title or author"
              />
            </div>
          </div>
        </div>

        {/* Subtle editorial hairline closing the band. */}
        <div
          aria-hidden="true"
          className="mt-10 h-px w-full bg-gradient-to-r from-border-strong via-border to-transparent sm:mt-12"
        />
      </div>
    </section>
  )
}