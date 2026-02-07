type StatusColor = 'green' | 'amber' | 'red' | 'blue' | 'gray'

const PALETTES: Record<StatusColor, { dot: string; text: string; border: string }> = {
  green: {
    dot: 'bg-emerald-500',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-500/40'
  },
  amber: {
    dot: 'bg-amber-500',
    text: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-500/40'
  },
  red: {
    dot: 'bg-red-500',
    text: 'text-red-700 dark:text-red-400',
    border: 'border-red-500/40'
  },
  blue: {
    dot: 'bg-blue-500',
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-500/40'
  },
  gray: {
    dot: 'bg-muted-foreground',
    text: 'text-muted-foreground',
    border: 'border-muted-foreground/30'
  }
}

const STATUS_MAP: Record<string, StatusColor> = {
  active: 'green',
  succeeded: 'green',
  paused: 'amber',
  pending: 'amber',
  past_due: 'amber',
  failed: 'red',
  cancelled: 'red',
  completed: 'blue',
  draft: 'gray',
  archived: 'gray',
  refunded: 'gray'
}

/** Returns Tailwind classes for dot, text, and border based on status string */
export function getStatusColor(status: string) {
  return PALETTES[STATUS_MAP[status] ?? 'gray']
}
