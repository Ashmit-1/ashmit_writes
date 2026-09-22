import { useMemo } from 'react'

import { ArticleGrid } from './ArticleGrid'
import { ArticleGridSkeleton } from './ArticleGridSkeleton'
import { StateMessage } from './StateMessage'
import { articleMatchesQuery } from '../lib/articles'
import type { Article, LibraryStatus } from '../types'

interface ArticleLibraryProps {
  articles: Article[]
  status: LibraryStatus
  error: string | null
  query: string
  onClearQuery: () => void
}

/**
 * The "Explore" library section.
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
  onClearQuery,
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