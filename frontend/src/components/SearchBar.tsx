import { Search, X } from 'lucide-react'
import { useId } from 'react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  /** Accessible label. The visual UI relies on the placeholder, so this must
   *  still be provided for screen readers (design.md > Accessibility). */
  label: string
  placeholder?: string
}

/**
 * Search field.
 *
 * Fully controlled and currently unwired to any filtering logic — it exposes
 * `value`/`onChange` so search can be connected later without UI changes.
 * Styling follows design.md > Search: white surface, subtle border, rounded
 * corners, restrained accent focus ring, leading icon, trailing clear button.
 */
export function SearchBar({
  value,
  onChange,
  label,
  placeholder = 'Search',
}: SearchBarProps) {
  const inputId = useId()
  const hasValue = value.length > 0

  return (
    <div className="relative">
      <label htmlFor={inputId} className="sr-only">
        {label}
      </label>

      {/* Leading search icon — decorative, the label carries the meaning. */}
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-tertiary"
      />

      <input
        id={inputId}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        className="w-full rounded-xl border border-border bg-surface py-3 pr-11 pl-10 text-sm text-primary transition-colors duration-150 placeholder:text-tertiary hover:border-border-strong focus:border-accent focus:outline-none focus-visible:outline-none [&::-webkit-search-cancel-button]:hidden"
      />

      {hasValue && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute top-1/2 right-2.5 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-tertiary transition-colors duration-150 hover:bg-surface-muted hover:text-primary"
        >
          <X aria-hidden="true" className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}