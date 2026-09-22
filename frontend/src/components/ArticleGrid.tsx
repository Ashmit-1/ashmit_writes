import { ArticleCard } from './ArticleCard'
import type { Article } from '../types'

interface ArticleGridProps {
  articles: Article[]
}

/**
 * Responsive card grid: 1 column on mobile, 2 on medium screens, 3 only once
 * there is genuinely enough width (design.md > Card grid).
 */
export function ArticleGrid({ articles }: ArticleGridProps) {
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
      {articles.map((article) => (
        <li key={article.id} className="h-full">
          <ArticleCard article={article} />
        </li>
      ))}
    </ul>
  )
}