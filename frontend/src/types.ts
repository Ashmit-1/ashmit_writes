/**
 * Core content types for the gateway.
 *
 * The metadata model is intentionally minimal and mirrors frontend/design.md:
 * the gateway is built around title, authors, and date only. Do not add
 * required fields until the content model actually gains them.
 */

/**
 * A single interactive learning article, as described by its metadata.
 *
 * `date` stays a raw source string here (metadata may be ISO, loose, or
 * malformed). Formatting for humans happens at render time via
 * `formatArticleDate`, so the original value is never lost.
 */
export interface Article {
  /** Display title, e.g. "How Transformers Learn". */
  name: string
  /** All authors. May be empty. */
  authors: string[]
  /** Raw source date string. May be missing or malformed. */
  date: string
  /** URL to the article's static HTML page (e.g. /blogs/<folder>/index.html). */
  href: string
  /** Stable identity, used as a React key. */
  id: string
}

/**
 * How the article library was resolved.
 *
 * The UI renders the same layout for every state; only the message differs.
 * `ready` is the normal case once a manifest has been loaded.
 */
export type LibraryStatus = 'loading' | 'ready' | 'error'