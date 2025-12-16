import { watch } from 'vue'
import { watchDebounced } from '@vueuse/core'
import type { Product, TributeData, CartItem } from '@/lib/common/types'

// Session storage key
const SESSION_KEY = 'donation-form:session'
const SYNC_DEBOUNCE_MS = 500

// Donor info types
export interface DonorInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
  anonymous: boolean
}

export interface ShippingAddress {
  address1: string
  address2: string
  city: string
  county: string
  postcode: string
  country: string
}

// Session storage structure
interface DonationFormSession {
  currentStep: number
  activeTab: 'once' | 'monthly' | 'yearly' | 'multiple'
  currency: string
  donationAmounts: {
    once: number
    monthly: number
    yearly: number
  }
  selectedProducts: {
    monthly: Product | null
    yearly: Product | null
  }
  tributeData: {
    once: TributeData | undefined
    monthly: TributeData | undefined
    yearly: TributeData | undefined
  }
  donorInfo: DonorInfo
  shippingAddress: ShippingAddress
  multipleCartSnapshot: CartItem[]
  selectedRewardsSnapshot: string[]
  lastSyncedAt: number
}

export function useDonationFormState(defaultCurrency: string) {
  // Nuxt useState for reactive in-memory state
  const currentStep = useState<number>('donation-form:current-step', () => 1)
  const activeTab = useState<'once' | 'monthly' | 'yearly' | 'multiple'>(
    'donation-form:active-tab',
    () => 'once'
  )
  const selectedCurrency = useState<string>('donation-form:currency', () => defaultCurrency)
  const donationAmounts = useState('donation-form:amounts', () => ({
    once: 0,
    monthly: 0,
    yearly: 0
  }))
  const selectedProducts = useState<{
    monthly: Product | null
    yearly: Product | null
  }>('donation-form:products', () => ({
    monthly: null,
    yearly: null
  }))
  const tributeData = useState<{
    once: TributeData | undefined
    monthly: TributeData | undefined
    yearly: TributeData | undefined
  }>('donation-form:tribute', () => ({
    once: undefined,
    monthly: undefined,
    yearly: undefined
  }))
  const donorInfo = useState<DonorInfo>('donation-form:donor-info', () => ({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    anonymous: false
  }))
  const shippingAddress = useState<ShippingAddress>('donation-form:shipping-address', () => ({
    address1: '',
    address2: '',
    city: '',
    county: '',
    postcode: '',
    country: ''
  }))

  // Session storage sync - only runs on client
  const syncToSession = (multipleCart: CartItem[], selectedRewards: Set<string>) => {
    if (import.meta.server) return

    const session: DonationFormSession = {
      currentStep: currentStep.value,
      activeTab: activeTab.value,
      currency: selectedCurrency.value,
      donationAmounts: { ...donationAmounts.value },
      selectedProducts: { ...selectedProducts.value },
      tributeData: { ...tributeData.value },
      donorInfo: { ...donorInfo.value },
      shippingAddress: { ...shippingAddress.value },
      multipleCartSnapshot: [...multipleCart],
      selectedRewardsSnapshot: Array.from(selectedRewards),
      lastSyncedAt: Date.now()
    }

    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
    } catch (error) {
      console.warn('Failed to sync donation form to session storage:', error)
    }
  }

  const restoreFromSession = (): {
    multipleCart: CartItem[]
    selectedRewards: string[]
  } | null => {
    if (import.meta.server) return null

    try {
      const stored = sessionStorage.getItem(SESSION_KEY)
      if (!stored) return null

      const session: DonationFormSession = JSON.parse(stored)

      // Restore state
      currentStep.value = session.currentStep ?? 1
      activeTab.value = session.activeTab
      selectedCurrency.value = session.currency
      donationAmounts.value = { ...session.donationAmounts }
      selectedProducts.value = { ...session.selectedProducts }
      tributeData.value = { ...session.tributeData }
      donorInfo.value = session.donorInfo ?? {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        anonymous: false
      }
      shippingAddress.value = session.shippingAddress ?? {
        address1: '',
        address2: '',
        city: '',
        county: '',
        postcode: '',
        country: ''
      }

      // Return cart/rewards data for caller to restore into useImpactCart
      return {
        multipleCart: session.multipleCartSnapshot || [],
        selectedRewards: session.selectedRewardsSnapshot || []
      }
    } catch (error) {
      console.warn('Failed to restore donation form from session storage:', error)
      return null
    }
  }

  const clearSession = () => {
    if (import.meta.server) return
    try {
      sessionStorage.removeItem(SESSION_KEY)
    } catch (error) {
      console.warn('Failed to clear donation form session:', error)
    }
  }

  // Setup debounced sync watcher
  const setupSync = (getMultipleCart: () => CartItem[], getSelectedRewards: () => Set<string>) => {
    if (import.meta.server) return

    // Watch all state and sync to session storage (debounced)
    watchDebounced(
      [
        currentStep,
        activeTab,
        selectedCurrency,
        donationAmounts,
        selectedProducts,
        tributeData,
        donorInfo,
        shippingAddress
      ],
      () => {
        syncToSession(getMultipleCart(), getSelectedRewards())
      },
      { debounce: SYNC_DEBOUNCE_MS, deep: true }
    )

    // Also watch for step/tab changes and sync immediately (no debounce)
    watch([currentStep, activeTab], () => {
      syncToSession(getMultipleCart(), getSelectedRewards())
    })
  }

  // Manually trigger sync (for cart changes in multiple tab)
  const triggerSync = (multipleCart: CartItem[], selectedRewards: Set<string>) => {
    if (import.meta.server) return
    syncToSession(multipleCart, selectedRewards)
  }

  // Step navigation
  const goToStep = (step: number) => {
    currentStep.value = step
  }

  const nextStep = () => {
    currentStep.value++
  }

  const previousStep = () => {
    if (currentStep.value > 1) {
      currentStep.value--
    }
  }

  return {
    // State
    currentStep,
    activeTab,
    selectedCurrency,
    donationAmounts,
    selectedProducts,
    tributeData,
    donorInfo,
    shippingAddress,

    // Methods
    goToStep,
    nextStep,
    previousStep,
    setupSync,
    triggerSync,
    restoreFromSession,
    clearSession
  }
}
