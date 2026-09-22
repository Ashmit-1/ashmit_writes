import { BrandMark } from './BrandMark'
import { SearchBar } from './SearchBar'

interface HeroProps {
  query: string
  onQueryChange: (value: string) => void
}

/**
 * Hero area: the primary identity, one supporting sentence, and the search
 * field. Per design.md this is the first strong typographic element on the
 * page, so it gets the largest vertical rhythm.
 */
export function Hero({ query, onQueryChange }: HeroProps) {
  return (
    <section className="pt-16 pb-12 sm:pt-24 sm:pb-16 lg:pt-32 lg:pb-20">
      <h1>
        <BrandMark size="hero" />
      </h1>

      <p className="mt-4 max-w-2xl text-base leading-relaxed text-secondary sm:mt-6 sm:text-lg">
        A collection of interactive learning pages. Read, explore, and work
        through each topic at your own pace.
      </p>

      <div className="mt-8 max-w-2xl sm:mt-10">
        <SearchBar
          value={query}
          onChange={onQueryChange}
          label="Search learning pages"
          placeholder="Search by title or author"
        />
      </div>
    </section>
  )
}