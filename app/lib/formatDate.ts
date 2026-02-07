/** "14 Jan 2026" — columns, detail pages, settings */
export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(new Date(dateString))
}

/** "14 Jan 2026, 10:30" — donation/subscription detail headers */
export function formatDateTime(dateString: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(dateString))
}

/** "14 Jan, 10:30" — dashboard recent activity */
export function formatDateCompact(dateString: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(dateString))
}
