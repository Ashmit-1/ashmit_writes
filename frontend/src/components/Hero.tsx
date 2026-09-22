import { BrandMark } from './BrandMark'
import { HeroConstellation } from './HeroConstellation'

/**
 * Hero area: the primary identity, one supporting sentence, and the ambient
 * "Thought Constellation".
 *
 * Per design.md > Layout > Hero band, this renders as a distinct warm band:
 * its own gradient background, a subtle paper grain, and a hairline rule
 * beneath. The card grid below stays on the flat page color.
 *
 * The search field lives in the article section (see ArticleLibrary), not
 * here — the hero is purely identity and orientation.
 */
export function Hero() {
  return (
    <section className="hero-band paper-grain relative isolate overflow-hidden">
      <div className="mx-auto w-full max-w-[1140px] px-4 pt-14 pb-8 sm:px-6 sm:pt-20 sm:pb-10 lg:px-8 lg:pt-20 lg:pb-10">
        {/*
          Two-column hero on desktop: typography on the left, the Thought
          Constellation on the right (~40% of the width), both vertically
          centred.

          On mobile this collapses to one column with the constellation below
          the tagline. `min-w-0` on the text column prevents long words from
          forcing horizontal overflow.
        */}
        <div className="grid grid-cols-1 items-center gap-8 sm:gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.72fr)] lg:gap-10 xl:gap-14">
          <div className="min-w-0 max-w-2xl">
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
            `max-w` is chosen per breakpoint to track the viewBox aspect ratio,
            so the composition fills its box instead of being letterboxed with
            empty side margins.
          */}
          <HeroConstellation className="h-[240px] w-full max-w-[290px] min-w-0 select-none justify-self-center sm:h-[320px] sm:max-w-[390px] lg:h-[400px] lg:max-w-[550px] lg:justify-self-end xl:h-[450px]" />
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