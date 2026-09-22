import { useMemo } from 'react'

import { ArticleGrid } from './ArticleGrid'
import { ArticleGridSkeleton } from './ArticleGridSkeleton'
import { SearchBar } from './SearchBar'
import { StateMessage } from './StateMessage'
import { articleMatchesQuery } from '../lib/articles'
import type { Article, LibraryStatus } from '../types'

interface ArticleLibraryProps {
  articles: Article[]
  status: LibraryStatus
  error: string | null
  query: string
  onQueryChange: (value: string) => void
  onClearQuery: () => void
  /** Shows the temporary placeholder-data notice. Remove with the demo fixtures. */
  showDemoNotice?: boolean
}

/**
 * The article section: a centered search field followed by the "Explore" grid.
 *
 * The search field lives here rather than in the hero, so the hero is purely
 * identity and the search clearly belongs to the article library it filters.
 *
 * Owns the rendering decision between loading, error, empty, no-results, and
 * the populated grid, so App stays a thin composition layer. Filtering is
 * derived from the query here; when real discovery lands the only change is
 * where `articles` comes from.
 */
export function ArticleLibrary({
  articles,
  status,
  error,
  query,
  onQueryChange,
  onClearQuery,
  showDemoNotice = false,
}: ArticleLibraryProps) {
  const visibleArticles = useMemo(
    () => articles.filter((article) => articleMatchesQuery(article, query)),
    [articles, query],
  )

  const isSearching = query.trim() !== ''

  return (
    <section aria-labelledby="library-heading" className="pb-16 sm:pb-20">
      <h2
        id="library-heading"
        className="text-xl font-semibold text-primary sm:text-2xl"
      >
        Explore
      </h2>

      {/*
        Search sits centered and constrained rather than full-bleed, so it
        reads as a focused control above the grid. The accent glow moves here
        with it from the hero.

        It stays full-width on phones (the content area is narrower than any
        sensible cap there) and centers from tablet up.
      */}
      <div className="accent-glow mx-auto mt-5 w-full max-w-2xl sm:mt-6">
        <SearchBar
          value={query}
          onChange={onQueryChange}
          label="Search learning pages"
          placeholder="Search by title or author"
        />
      </div>

      {/*
        Foundation-step notice. Sits below the search so the section header and
        search read as one unit. Tied to the placeholder fixtures and
        disappears automatically once demo data is removed
        (see src/hooks/useArticleLibrary.ts).
      */}
      {showDemoNotice && (
        <p className="mt-5 rounded-lg border border-border bg-accent-soft px-4 py-3 text-xs text-secondary">
          <span className="font-medium text-primary">Placeholder content.</span>{' '}
          The cards below are temporary demo data used to preview the layout.
          Real articles will appear here once discovery is added.
        </p>
      )}

      <div className="mt-6 sm:mt-8">
        {status === 'loading' && (
          <>
            {/* Announce the loading state without relying on the skeleton. */}
            <p role="status" className="sr-only">
              Loading articles…
            </p>
            <ArticleGridSkeleton />
          </>
        )}

        {status === 'error' && (
          <StateMessage
            title={error ?? 'The article library could not be loaded.'}
            description="Please try again later."
          />
        )}

        {status === 'ready' && articles.length === 0 && (
          <StateMessage title="No articles yet." />
        )}

        {status === 'ready' &&
          articles.length > 0 &&
          visibleArticles.length === 0 && (
            <StateMessage
              title={`No articles match “${query.trim()}”.`}
              description="Try a different title or author."
              action={{ label: 'Clear search', onClick: onClearQuery }}
            />
          )}

        {status === 'ready' && visibleArticles.length > 0 && (
          <>
            <p role="status" className="sr-only">
              {isSearching
                ? `${visibleArticles.length} of ${articles.length} articles match your search.`
                : `${visibleArticles.length} articles.`}
            </p>
            <ArticleGrid articles={visibleArticles} />
          </>
        )}
      </div>
    </section>
  )
}