interface PipeSeparatorProps {
  className?: string
}

export function PipeSeparator({ className }: PipeSeparatorProps) {
  return (
    <span aria-hidden="true" className={`text-neutral-400 ${className ?? ""}`}>
      |
    </span>
  )
}
