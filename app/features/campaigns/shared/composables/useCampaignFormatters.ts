import type { CampaignStatus } from '~/features/campaigns/shared/types'

/**
 * Campaign status badge variant mapping
 * Used for consistent badge styling across all campaign components
 */
export const CAMPAIGN_STATUS_VARIANTS: Record<
  CampaignStatus,
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  active: 'default',
  draft: 'secondary',
  paused: 'outline',
  completed: 'outline',
  archived: 'outline'
}

/**
 * Status-specific color classes for the header status selector
 * Provides distinct visual differentiation per campaign status
 */
export const CAMPAIGN_STATUS_COLORS: Record<CampaignStatus, { trigger: string; dot: string }> = {
  draft: {
    trigger: 'border-muted-foreground/30 text-muted-foreground',
    dot: 'bg-muted-foreground'
  },
  active: {
    trigger: 'border-emerald-500/40 text-emerald-700 dark:text-emerald-400',
    dot: 'bg-emerald-500'
  },
  paused: {
    trigger: 'border-amber-500/40 text-amber-700 dark:text-amber-400',
    dot: 'bg-amber-500'
  },
  completed: {
    trigger: 'border-blue-500/40 text-blue-700 dark:text-blue-400',
    dot: 'bg-blue-500'
  },
  archived: {
    trigger: 'border-neutral-400/40 text-neutral-500 dark:text-neutral-400',
    dot: 'bg-neutral-400'
  }
}

/**
 * Shared formatting utilities for campaign components
 * Extracts common formatting logic used across donor and admin campaign views
 */
export function useCampaignFormatters() {
  /**
   * Format currency amount in GBP
   */
  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
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

  return {
    formatAmount,
    formatRelativeTime,
    getDonorInitials,
    getInitials: getDonorInitials, // Alias for broader use
    formatDate,
    getProgressPercentage
  }
}
