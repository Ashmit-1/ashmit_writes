interface StateMessageProps {
  title: string
  description?: string
  /** Optional recovery action, e.g. "Clear search". */
  action?: {
    label: string
    onClick: () => void
  }
}

/**
 * Quiet, centered message used for the no-articles, no-results, and
 * manifest-error states.
 *
 * Kept visually understated per design.md > Empty, Loading, and Error States.
 * States are communicated with text (not color alone), and the action is a
 * real button styled as a secondary affordance.
 */
export function StateMessage({ title, description, action }: StateMessageProps) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-surface px-6 py-14 text-center sm:py-16">
      <p className="text-base font-medium text-primary">{title}</p>
      {description && (
        <p className="mx-auto mt-2 max-w-md text-sm text-secondary">
          {description}
        </p>
      )}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-6 inline-flex items-center rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-accent transition-colors duration-150 hover:border-accent hover:bg-accent-soft"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}