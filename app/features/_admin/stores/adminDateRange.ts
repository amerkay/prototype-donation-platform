import { defineStore } from 'pinia'
import type { DateRange } from 'reka-ui'

export const useAdminDateRangeStore = defineStore('adminDateRange', () => {
  const dateRange = ref<DateRange>({ start: undefined, end: undefined })

  const hasRange = computed(() => Boolean(dateRange.value.start && dateRange.value.end))

  function clearDateRange() {
    dateRange.value = { start: undefined, end: undefined }
  }

  /** Check if an ISO date string falls within the active range. Returns true if no range is set. */
  function isWithinRange(dateStr: string): boolean {
    const { start, end } = dateRange.value
    if (!start || !end) return true

    const startMs = start.toDate('UTC').getTime()
    const endMs = end.toDate('UTC').getTime() + 86400000 - 1
    const ts = new Date(dateStr).getTime()
    return ts >= startMs && ts <= endMs
  }

  return { dateRange, hasRange, clearDateRange, isWithinRange }
})
