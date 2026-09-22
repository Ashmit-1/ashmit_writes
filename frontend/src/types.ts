/**
 * Core content types for the gateway.
 *
 * The metadata model is intentionally minimal and mirrors the `metadata.json`
 * files under `blogs/`:
 *
 *   title:    string
 *   authors:  string[]
 *   filename: string   -> which HTML file to open (never displayed)
 *   topic:    string[]
 *
 * Do not add required fields until the content model actually gains them.
 */

/**
 * A single interactive learning article, as produced by the build-time
 * discovery step and written to `blogs/index.json`.
 *
 * The frontend never reads the repository layout: the folder name and filename
 * have already been resolved into `url` by the discovery script.
 */
export interface Article {
  /** Display title, e.g. "Attention and KV Caching". */
  title: string
  /** All authors. May be empty. */
  authors: string[]
  /** All topics. May be empty. */
  topic: string[]
  /** Ready-to-use lesson URL, e.g. "/blogs/attention_llm/attention.html". */
  url: string
  /** Stable identity from the folder name, used as a React key. */
  id: string
}

/** Shape of the generated `blogs/index.json` manifest. */
export interface BlogManifest {
  version: number
  generatedAt: string
  articles: Article[]
}

/**
 * How the article library was resolved.
 *
 * The UI renders the same layout for every state; only the message differs.
 * `ready` is the normal case once the manifest has been loaded.
 */
export type LibraryStatus = 'loading' | 'ready' | 'error'