import { ArrowUpRight } from 'lucide-react'

import { formatArticleDate } from '../lib/articles'
import type { Article } from '../types'

interface ArticleCardProps {
  article: Article
}

/**
 * A single article card.
 *
 * Exactly the useful basics per design.md > Article Cards: title, all authors,
 * a readable date, and a small open affordance. No invented metadata.
 *
 * The whole card is a link so it is keyboard accessible and clickable, while
 * robustly handling empty authors and malformed/missing dates.
 */
export function ArticleCard({ article }: ArticleCardProps) {
  const formattedDate = formatArticleDate(article.date)
  const hasAuthors = article.authors.length > 0

  return (
    <a
      href={article.href}
      className="group flex h-full flex-col rounded-xl border border-border bg-surface p-5 transition-all duration-150 hover:-translate-y-0.5 hover:border-border-strong hover:bg-surface-muted focus-visible:-translate-y-0.5 sm:p-6"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg leading-snug font-semibold text-balance text-primary">
          {article.name}
        </h3>
        <ArrowUpRight
          aria-hidden="true"
          className="mt-0.5 h-4 w-4 shrink-0 text-tertiary transition-colors duration-150 group-hover:text-accent"
        />
      </div>

      <div className="mt-4 flex flex-col gap-1 text-sm text-secondary sm:mt-auto sm:pt-4">
        {hasAuthors && (
          <p className="break-words">{article.authors.join(', ')}</p>
        )}
        {formattedDate && (
          <p className="text-xs text-tertiary">{formattedDate}</p>
        )}
      </div>
    </a>
  )
}