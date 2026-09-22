import type { Article } from '../types'

/**
 * Date formatting for article metadata.
 *
 * The source value is kept raw on the `Article`; this helper only produces the
 * human-readable form. It must never throw: metadata can be missing, malformed,
 * or an unexpected format, and the UI should degrade quietly.
 *
 * Example: "2026-01-12" -> "12 January 2026"
 */
export function formatArticleDate(value: string | null | undefined): string | null {
  if (!value || typeof value !== 'string') return null

  const trimmed = value.trim()
  if (trimmed === '') return null

  const parsed = new Date(trimmed)

  // An Invalid Date means we could not understand the source value. Rather
  // than hide it or crash, fall back to showing the original text.
  if (Number.isNaN(parsed.getTime())) return trimmed

  return parsed.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/**
 * Case-insensitive match used by search.
 *
 * Matches against the article title and all author names, per design.md.
 * Kept deliberately simple — no fuzzy-search dependency.
 */
export function articleMatchesQuery(article: Article, rawQuery: string): boolean {
  const query = rawQuery.trim().toLowerCase()
  if (query === '') return true

  const haystack = [article.name, ...article.authors].join(' ').toLowerCase()
  return haystack.includes(query)
}