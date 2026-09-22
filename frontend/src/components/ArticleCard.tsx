import { ArrowUpRight } from 'lucide-react'

import type { Article } from '../types'

interface ArticleCardProps {
  article: Article
}

/**
 * A single article card.
 *
 * Shows exactly the fields in the current metadata model per design.md >
 * Article Cards: title, all authors, all topics, and a small open affordance.
 *
 * The lesson `url` is used only for navigation. The source filename and folder
 * name are never rendered — they are implementation detail, not content.
 *
 * The whole card is a link, so it is keyboard accessible and clickable, and it
 * handles empty author/topic arrays without leaving stray elements.
 */
export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <a
      href={article.url}
      className="group flex h-full flex-col rounded-xl border border-border bg-surface p-5 transition-all duration-150 hover:-translate-y-0.5 hover:border-border-strong hover:bg-surface-muted focus-visible:-translate-y-0.5 sm:p-6"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg leading-snug font-semibold text-balance text-primary">
          {article.title}
        </h3>
        <ArrowUpRight
          aria-hidden="true"
          className="mt-0.5 h-4 w-4 shrink-0 text-tertiary transition-colors duration-150 group-hover:text-accent"
        />
      </div>

      {/*
        Authors then topics. `mt-auto` pushes this block to the bottom so cards
        of differing title lengths still align their metadata rows.
      */}
      <div className="mt-4 flex flex-col gap-3 sm:mt-auto sm:pt-5">
        {article.authors.length > 0 && (
          <p className="text-sm break-words text-secondary">
            {article.authors.join(' · ')}
          </p>
        )}

        {article.topic.length > 0 && (
          <ul className="flex flex-wrap gap-1.5">
            {article.topic.map((topic) => (
              <li
                key={topic}
                className="rounded-md border border-border bg-accent-soft px-2 py-0.5 text-xs text-secondary"
              >
                {topic}
              </li>
            ))}
          </ul>
        )}
      </div>
    </a>
  )
}