import type { Article } from '../types'

/**
 * Case-insensitive match used by search.
 *
 * Matches against the article title, all author names, and all topics. The
 * lesson filename/URL is deliberately excluded — it is an implementation
 * detail, not part of the user-facing model.
 *
 * Kept intentionally simple: no fuzzy-search dependency.
 */
export function articleMatchesQuery(
  article: Article,
  rawQuery: string,
): boolean {
  const query = rawQuery.trim().toLowerCase()
  if (query === '') return true

  const haystack = [article.title, ...article.authors, ...article.topic]
    .join(' ')
    .toLowerCase()

  return haystack.includes(query)
}

/**
 * Validate one entry from the generated manifest.
 *
 * The manifest is produced by our own build step, so this is a light
 * defence-in-depth check rather than strict validation (the discovery script
 * already rejects malformed metadata). A malformed entry is skipped by the
 * caller rather than breaking the whole library.
 */
export function isArticle(value: unknown): value is Article {
  if (value === null || typeof value !== 'object') return false
  const candidate = value as Record<string, unknown>

  return (
    typeof candidate.title === 'string' &&
    Array.isArray(candidate.authors) &&
    candidate.authors.every((author) => typeof author === 'string') &&
    Array.isArray(candidate.topic) &&
    candidate.topic.every((topic) => typeof topic === 'string') &&
    typeof candidate.url === 'string' &&
    typeof candidate.id === 'string'
  )
}