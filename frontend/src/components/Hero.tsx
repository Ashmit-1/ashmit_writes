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
      <div className="mx-auto w-full max-w-[1140px] px-4 pt-20 pb-14 sm:px-6 sm:pt-28 sm:pb-20 lg:px-8 lg:pt-36 lg:pb-24">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-16">
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
            Ambient constellation. Hidden below `lg` so it never crowds the
            hero or causes overflow on small screens.
          */}
          <HeroConstellation className="pointer-events-auto hidden h-[320px] w-full select-none lg:block lg:h-[380px]" />
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