/**
 * Build timezone options from Intl API — zero dependencies.
 * Returns options sorted by UTC offset, then alphabetically.
 */
export function getTimezoneOptions(): { value: string; label: string }[] {
  const timezones = Intl.supportedValuesOf('timeZone')

  const withOffset = timezones.map((tz) => {
    const offsetMinutes = getOffsetMinutes(tz)
    const sign = offsetMinutes <= 0 ? '+' : '-'
    const abs = Math.abs(offsetMinutes)
    const hours = String(Math.floor(abs / 60)).padStart(2, '0')
    const mins = String(abs % 60).padStart(2, '0')
    return {
      value: tz,
      label: `${tz} (UTC${sign}${hours}:${mins})`,
      offsetMinutes
    }
  })

  withOffset.sort((a, b) => a.offsetMinutes - b.offsetMinutes || a.value.localeCompare(b.value))

  return withOffset.map(({ value, label }) => ({ value, label }))
}

function getOffsetMinutes(tz: string): number {
  const now = new Date()
  const utc = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }))
  const local = new Date(now.toLocaleString('en-US', { timeZone: tz }))
  return (utc.getTime() - local.getTime()) / 60_000
}
