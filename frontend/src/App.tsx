import { useState } from 'react'

import { ArticleLibrary } from './components/ArticleLibrary'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { isUsingDemoData, useArticleLibrary } from './hooks/useArticleLibrary'

/**
 * Application shell for the gateway.
 *
 * Composition only: header, hero + search, then the article library. All state
 * (search query, library status) lives here or in hooks, so the child
 * components stay presentational and easy to test.
 */
export default function App() {
  const { articles, status, error } = useArticleLibrary()
  const [query, setQuery] = useState('')

  return (
    <div className="flex min-h-dvh flex-col bg-page">
      <Header />

      <main className="flex-1">
        <div className="mx-auto w-full max-w-[1140px] px-4 sm:px-6 lg:px-8">
          <Hero query={query} onQueryChange={setQuery} />

          {/*
            Foundation-step notice. This banner is tied to the placeholder
            fixtures and disappears automatically once demo data is removed
            (see src/hooks/useArticleLibrary.ts).
          */}
          {isUsingDemoData && (
            <p className="mb-8 rounded-lg border border-border bg-accent-soft px-4 py-3 text-xs text-secondary">
              <span className="font-medium text-primary">
                Placeholder content.
              </span>{' '}
              The cards below are temporary demo data used to preview the
              layout. Real articles will appear here once discovery is added.
            </p>
          )}

          <ArticleLibrary
            articles={articles}
            status={status}
            error={error}
            query={query}
            onClearQuery={() => setQuery('')}
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