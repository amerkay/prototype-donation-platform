import type { FrequencyType, CartFrequencyType } from './types'

// Base currency for all products and amounts
export const BASE_CURRENCY = 'GBP'

// Currency configuration
export const CURRENCIES = [
    { value: 'USD', label: 'USD ($)' },
    { value: 'EUR', label: 'EUR (€)' },
    { value: 'GBP', label: 'GBP (£)' },
] as const

// Frequency configuration
export const BASE_FREQUENCIES = [
    { value: 'once' as const, label: 'One-time' },
    { value: 'monthly' as const, label: 'Monthly' },
] as const

// Amounts in base currency (GBP) - will be converted to selected currency
export const AMOUNTS_IN_BASE_CURRENCY = {
    once: {
        amounts: [5, 10, 25, 50, 100, 500],
        minPrice: 5,
        maxPrice: 1000
    },
    monthly: {
        amounts: [5, 10, 25, 50, 75, 100],
        minPrice: 3,
        maxPrice: 500
    },
    yearly: {
        amounts: [50, 100, 250, 500, 1000],
        minPrice: 25,
        maxPrice: 2000
    },
} as const

// Feature flags
export const ALLOW_MULTIPLE_ITEMS = true
export const INITIAL_PRODUCTS_DISPLAYED = 3
