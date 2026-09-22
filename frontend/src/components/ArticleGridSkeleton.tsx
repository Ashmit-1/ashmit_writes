/**
 * Neutral skeleton cards shown while the library loads.
 *
 * Understated on purpose — design.md asks for a quiet skeleton, not a spinner.
 * Purely decorative, so the whole block is hidden from assistive tech while
 * the live region in App announces the loading state.
 */
export function ArticleGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <ul
      aria-hidden="true"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6"
    >
      {Array.from({ length: count }).map((_, index) => (
        <li
          key={index}
          className="flex h-full min-h-[148px] flex-col rounded-xl border border-border bg-surface p-5 sm:p-6"
        >
          <div className="h-4 w-4/5 rounded bg-surface-muted" />
          <div className="mt-2.5 h-4 w-1/2 rounded bg-surface-muted" />
          <div className="mt-auto pt-6">
            <div className="h-3 w-1/3 rounded bg-surface-muted" />
            <div className="mt-2 h-3 w-1/4 rounded bg-surface-muted" />
          </div>
        </li>
      ))}
    </ul>
  )
}