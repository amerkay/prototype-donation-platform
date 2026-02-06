import { formatCurrency } from '~/lib/formatCurrency'
import { differenceInCalendarDays } from 'date-fns'

/**
 * Shared formatting utilities for campaign components
 * Extracts common formatting logic used across donor and admin campaign views
 */
export function useCampaignFormatters() {
  /**
   * Format currency amount (defaults to GBP)
   */
  const formatAmount = (amount: number, currency?: string, decimals?: number): string => {
    return formatCurrency(amount, currency, decimals)
  }

  /**
   * Format date as relative time (e.g., "5m ago", "2h ago", "3d ago")
   * Falls back to "day month" format for dates older than 7 days
   */
  const formatRelativeTime = (dateString: string): string => {
    const now = new Date()
    const date = new Date(dateString)
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(date)
  }

  /**
   * Get donor initials from full name
   * Returns "?" for anonymous donors
   */
  const getDonorInitials = (name: string): string => {
    if (name === 'Anonymous') return '?'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  /**
   * Format absolute date (e.g., "14 Jan 2026")
   */
  const formatDate = (dateString: string): string => {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(new Date(dateString))
  }

  /**
   * Calculate progress percentage for fundraising goals
   */
  const getProgressPercentage = (raised: number, goal: number): number => {
    if (!goal || goal === 0) return 0
    return Math.min((raised / goal) * 100, 100)
  }

  /**
   * Get remaining calendar days from an end date.
   * Uses differenceInCalendarDays (ignores time-of-day) so both
   * formatTimeRemaining and formatTimeRemainingShort always agree.
   */
  const getRemainingDays = (endDate: string | null | undefined): number | null => {
    if (!endDate) return null
    const days = differenceInCalendarDays(new Date(endDate), new Date())
    return days > 0 ? days : null
  }

  /** Human-readable time remaining (e.g. "28 days") */
  const formatTimeRemaining = (endDate: string | null | undefined): string | null => {
    const days = getRemainingDays(endDate)
    if (days === null) return null
    return days === 1 ? '1 day' : `${days} days`
  }

  /** Compact time remaining (e.g. "28d") */
  const formatTimeRemainingShort = (endDate: string | null | undefined): string | null => {
    const days = getRemainingDays(endDate)
    if (days === null) return null
    return `${days}d`
  }

  return {
    formatAmount,
    formatRelativeTime,
    getDonorInitials,
    getInitials: getDonorInitials, // Alias for broader use
    formatDate,
    getProgressPercentage,
    formatTimeRemaining,
    formatTimeRemainingShort
  }
}
