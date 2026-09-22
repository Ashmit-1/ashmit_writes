import { useEffect, useState } from 'react'

import { isArticle } from '../lib/articles'
import type { Article, BlogManifest, LibraryStatus } from '../types'

export interface ArticleLibrary {
  articles: Article[]
  status: LibraryStatus
  /** Human-readable message when `status` is 'error'. */
  error: string | null
}

/**
 * URL of the generated manifest.
 *
 * `blogs/index.json` is produced at build time by scripts/build-manifest.mjs.
 * `BASE_URL` keeps this working under a subpath deployment (Vite sets it from
 * the configured `base`).
 */
const MANIFEST_URL = `${import.meta.env.BASE_URL}blogs/index.json`

/**
 * Reads and normalises the generated manifest.
 *
 * The browser only ever fetches this static file — it never inspects the
 * filesystem or the repository structure.
 */
async function loadArticles(signal: AbortSignal): Promise<Article[]> {
  const response = await fetch(MANIFEST_URL, { signal })

  if (!response.ok) {
    throw new Error(`Manifest request failed with status ${response.status}`)
  }

  const manifest = (await response.json()) as Partial<BlogManifest>

  if (!manifest || !Array.isArray(manifest.articles)) {
    throw new Error('Manifest is missing an articles array')
  }

  // Skip anything malformed rather than failing the whole library. The build
  // step already validates metadata, so this is a safety net.
  return manifest.articles.filter(isArticle)
}

/**
 * Provides the article list and its loading/error state.
 *
 * Kept as a hook so components never need to know where the data came from.
 */
export function useArticleLibrary(): ArticleLibrary {
  const [articles, setArticles] = useState<Article[]>([])
  const [status, setStatus] = useState<LibraryStatus>('loading')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    loadArticles(controller.signal)
      .then((loaded) => {
        setArticles(loaded)
        setStatus('ready')
      })
      .catch((cause: unknown) => {
        // An abort is a normal cleanup, not an error to surface.
        if (controller.signal.aborted) return
        console.error('Failed to load the article manifest:', cause)
        // Calm message only — never surface stack traces (design.md).
        setError('The article library could not be loaded.')
        setStatus('error')
      })

    return () => controller.abort()
  }, [])

  return { articles, status, error }
}