import { useEffect, useState } from 'react'

import { DEMO_ARTICLES, IS_DEMO_DATA } from '../data/demo-articles'
import type { Article, LibraryStatus } from '../types'

export interface ArticleLibrary {
  articles: Article[]
  status: LibraryStatus
  /** Human-readable message when `status` is 'error'. */
  error: string | null
}

/**
 * Loads the article library for the gateway.
 *
 * ---------------------------------------------------------------------------
 * PLACEHOLDER IMPLEMENTATION (foundation step).
 *
 * This currently just returns the clearly-labeled demo fixtures so the landing
 * page can be built and reviewed. It performs no directory browsing and does
 * not read `blogs/`.
 *
 * NEXT STEP — real discovery:
 *   Replace the body of `loadArticles` with a fetch of the static manifest
 *   (e.g. `${import.meta.env.BASE_URL}blogs/index.json`), map it to `Article[]`,
 *   and delete src/data/demo-articles.ts. `status`/`error` already model the
 *   loading and manifest-error states, so no UI changes should be needed.
 * ---------------------------------------------------------------------------
 */
async function loadArticles(): Promise<Article[]> {
  return DEMO_ARTICLES
}

/**
 * Provides the article list and its loading/error state.
 *
 * Kept as a hook so the component tree never needs to know whether data comes
 * from fixtures today or a static manifest tomorrow.
 */
export function useArticleLibrary(): ArticleLibrary {
  const [articles, setArticles] = useState<Article[]>([])
  const [status, setStatus] = useState<LibraryStatus>('loading')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    loadArticles()
      .then((loaded) => {
        if (cancelled) return
        setArticles(loaded)
        setStatus('ready')
      })
      .catch(() => {
        if (cancelled) return
        // Calm message only — never surface stack traces (design.md).
        setError('The article library could not be loaded.')
        setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { articles, status, error }
}

/** True while the library is still showing placeholder fixtures. */
export const isUsingDemoData = IS_DEMO_DATA