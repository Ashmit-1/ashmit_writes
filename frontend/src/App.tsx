import { useState } from 'react'

import { ArticleLibrary } from './components/ArticleLibrary'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { isUsingDemoData, useArticleLibrary } from './hooks/useArticleLibrary'

/**
 * Application shell for the gateway.
 *
 * Composition only: header, hero, then the article library (which owns the
 * search field). All state (search query, library status) lives here or in
 * hooks, so the child components stay presentational and easy to test.
 */
export default function App() {
  const { articles, status, error } = useArticleLibrary()
  const [query, setQuery] = useState('')

  return (
    <div className="page-wash flex min-h-dvh flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero renders its own full-width band; inner content is constrained there. */}
        <Hero />

        <div className="mx-auto w-full max-w-[1140px] px-4 pt-8 sm:px-6 sm:pt-10 lg:px-8">
          <ArticleLibrary
            articles={articles}
            status={status}
            error={error}
            query={query}
            onQueryChange={setQuery}
            onClearQuery={() => setQuery('')}
            showDemoNotice={isUsingDemoData}
          />
        </div>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-[1140px] px-4 py-6 text-xs text-tertiary sm:px-6 lg:px-8">
          Ashmit and AI Writes
        </div>
      </footer>
    </div>
  )
}