import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Product } from '~/features/donation-form/features/product/shared/types'
import type { TributeData } from '~/features/donation-form/features/tribute/donor/types'
import type { CartItem } from '~/features/donation-form/features/impact-cart/donor/types'

// Type definitions
type Frequency = 'once' | 'monthly' | 'yearly' | 'multiple'
type DonationFrequency = Exclude<Frequency, 'multiple'>

export interface CoverCostsData {
  type: 'percentage' | 'amount'
  value: number
}

export const useDonationFormStore = defineStore(
  'donationForm',
  () => {
    // ==================== STATE ====================
    const currentStep = ref(1)
    const activeTab = ref<Frequency>('once')
    const selectedCurrency = ref('USD')
    const donationAmounts = ref<Record<DonationFrequency, number>>({
      once: 0,
      monthly: 0,
      yearly: 0
    })
    const selectedProducts = ref<Record<Exclude<DonationFrequency, 'once'>, Product | null>>({
      monthly: null,
      yearly: null
    })
    const tributeData = ref<Record<DonationFrequency, TributeData | undefined>>({
      once: undefined,
      monthly: undefined,
      yearly: undefined
    })
    const coverCosts = ref<CoverCostsData | null>(null)
    const multipleCart = ref<CartItem[]>([])
    const formSections = ref<Record<string, Record<string, unknown>>>({
      donorInfo: {},
      shipping: {},
      giftAid: {},
      customFields: {},
      emailOptIn: { joinEmailList: true },
      terms: {}
    })

    // ==================== GETTERS ====================
    const currentFrequency = computed(() => activeTab.value)
    const currentDonationAmount = computed(() => {
      if (activeTab.value === 'multiple') return 0 // Use cart total instead
      return donationAmounts.value[activeTab.value as DonationFrequency]
    })

    // Cart total computation
    const multipleCartTotal = computed(() =>
      multipleCart.value.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0)
    )

    // Total donation amount (includes cart when multiple tab active)
    const totalDonationAmount = computed(() => {
      if (activeTab.value === 'multiple') return multipleCartTotal.value
      return donationAmounts.value[activeTab.value as DonationFrequency]
    })

    // Check if shipping is required
    const needsShipping = computed(() => {
      // Check single tab product selections
      if (activeTab.value !== 'multiple') {
        const product = selectedProducts.value[activeTab.value as 'monthly' | 'yearly']
        if (product?.isShippingRequired) return true
      }
      // Check multiple cart items
      return multipleCart.value.some((item) => item.isShippingRequired)
    })

    // Check if donation is a tribute
    const isTribute = computed(() => {
      return (
        (tributeData.value.once?.type && tributeData.value.once.type !== 'none') ||
        (tributeData.value.monthly?.type && tributeData.value.monthly.type !== 'none') ||
        (tributeData.value.yearly?.type && tributeData.value.yearly.type !== 'none')
      )
    })

    // Cost coverage percentage
    const costCoveragePercentage = computed(() => {
      return coverCosts.value?.type === 'percentage' ? coverCosts.value.value : 0
    })

    // Cover costs amount in currency
    const coverCostsAmount = computed(() => {
      const data = coverCosts.value
      if (!data || data.value === 0) return 0

      if (data.type === 'amount') {
        return data.value
      }

      if (data.type === 'percentage') {
        return totalDonationAmount.value * (data.value / 100)
      }

      return 0
    })

    // Total before covered fees (same as totalDonationAmount for clarity)
    const totalBeforeCoveredFees = computed(() => totalDonationAmount.value)

    // Total including covered fees
    const totalAmount = computed(() => totalDonationAmount.value + coverCostsAmount.value)

    // Complete state for submission (only submittable data, organized by domain)
    const completeState = computed(() => {
      // Get active data based on current tab
      const currentProduct =
        activeTab.value !== 'multiple' && activeTab.value !== 'once'
          ? selectedProducts.value[activeTab.value as 'monthly' | 'yearly']
          : null
      const currentTribute =
        activeTab.value !== 'multiple'
          ? tributeData.value[activeTab.value as DonationFrequency]
          : undefined
      const currentCart = activeTab.value === 'multiple' ? multipleCart.value : []

      return {
        frequency: activeTab.value,
        currency: selectedCurrency.value,

        // Donation details (contextual to frequency)
        donation: {
          amount: totalDonationAmount.value,
          ...(activeTab.value === 'multiple' && { cart: currentCart }),
          ...(currentProduct && { product: currentProduct }),
          ...(currentTribute && currentTribute.type !== 'none' && { tribute: currentTribute })
        },

        // Donor information
        donor: formSections.value.donorInfo || {},

        // Shipping (only if needed)
        ...(needsShipping.value && { shipping: formSections.value.shipping || {} }),

        // Gift Aid
        giftAid: formSections.value.giftAid || {},

        // Cover costs
        ...(coverCosts.value && { coverCosts: coverCosts.value }),

        // Custom fields
        customFields: formSections.value.customFields || {},

        // Email opt-in
        emailOptIn: formSections.value.emailOptIn || {},

        // Terms acceptance
        terms: formSections.value.terms || {},

        // Computed flags
        computed: {
          totalBeforeCoveredFees: totalBeforeCoveredFees.value,
          coverCostsAmount: coverCostsAmount.value,
          totalAmount: totalAmount.value,
          needsShipping: needsShipping.value,
          isTribute: isTribute.value,
          costCoveragePercentage: costCoveragePercentage.value
        }
      }
    })

    // ==================== ACTIONS ====================
    function initialize(defaultCurrency: string) {
      if (selectedCurrency.value === 'USD') {
        selectedCurrency.value = defaultCurrency
      }
    }

    function goToStep(step: number) {
      currentStep.value = step
    }

    function nextStep() {
      currentStep.value++
    }

    function previousStep() {
      if (currentStep.value > 1) {
        currentStep.value--
      }
    }

    function setActiveTab(tab: Frequency) {
      activeTab.value = tab
    }

    function setCurrency(currency: string) {
      selectedCurrency.value = currency
    }

    function setDonationAmount(frequency: DonationFrequency, amount: number) {
      donationAmounts.value[frequency] = amount
    }

    function setSelectedProduct(frequency: 'monthly' | 'yearly', product: Product | null) {
      selectedProducts.value[frequency] = product
    }

    function setTributeData(frequency: DonationFrequency, data: TributeData | undefined) {
      tributeData.value[frequency] = data
    }

    function updateFormSection(section: string, data: Record<string, unknown>) {
      formSections.value[section] = data
    }

    function setCoverCosts(data: CoverCostsData | null) {
      coverCosts.value = data
    }

    function syncMultipleCart(cartItems: CartItem[]) {
      multipleCart.value = cartItems
    }

    function clearSession() {
      currentStep.value = 1
      activeTab.value = 'once'
      donationAmounts.value = { once: 0, monthly: 0, yearly: 0 }
      selectedProducts.value = { monthly: null, yearly: null }
      tributeData.value = { once: undefined, monthly: undefined, yearly: undefined }
      coverCosts.value = null
      multipleCart.value = []
      formSections.value = {
        donorInfo: {},
        shipping: {},
        giftAid: {},
        customFields: {},
        emailOptIn: { joinEmailList: true },
        terms: {}
      }
    }

    function reset() {
      clearSession()
    }

    // Persistence methods (called by plugin after hydration)
    function $persist() {
      if (import.meta.server) return
      try {
        sessionStorage.setItem(
          'donation-form',
          JSON.stringify({
            currentStep: currentStep.value,
            activeTab: activeTab.value,
            selectedCurrency: selectedCurrency.value,
            donationAmounts: donationAmounts.value,
            selectedProducts: selectedProducts.value,
            tributeData: tributeData.value,
            coverCosts: coverCosts.value,
            multipleCart: multipleCart.value,
            formSections: formSections.value
          })
        )
      } catch (error) {
        console.warn('Failed to persist donation form:', error)
      }
    }

    function $hydrate() {
      if (import.meta.server) return
      try {
        const saved = sessionStorage.getItem('donation-form')
        if (!saved) return

        const data = JSON.parse(saved)
        if (data.currentStep !== undefined) currentStep.value = data.currentStep
        if (data.activeTab !== undefined) activeTab.value = data.activeTab
        if (data.selectedCurrency !== undefined) selectedCurrency.value = data.selectedCurrency
        if (data.donationAmounts !== undefined) donationAmounts.value = data.donationAmounts
        if (data.selectedProducts !== undefined) selectedProducts.value = data.selectedProducts
        if (data.tributeData !== undefined) tributeData.value = data.tributeData
        if (data.coverCosts !== undefined) coverCosts.value = data.coverCosts
        if (data.multipleCart !== undefined) multipleCart.value = data.multipleCart
        if (data.formSections !== undefined) formSections.value = data.formSections
      } catch (error) {
        console.warn('Failed to hydrate donation form:', error)
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
      coverCosts,
      multipleCart,
      formSections,

      // Getters
      currentFrequency,
      currentDonationAmount,
      multipleCartTotal,
      totalDonationAmount,
      needsShipping,
      isTribute,
      costCoveragePercentage,
      coverCostsAmount,
      totalBeforeCoveredFees,
      totalAmount,
      completeState,

      // Actions
      initialize,
      goToStep,
      nextStep,
      previousStep,
      setActiveTab,
      setCurrency,
      setDonationAmount,
      setSelectedProduct,
      setTributeData,
      updateFormSection,
      setCoverCosts,
      syncMultipleCart,
      clearSession,
      reset,
      $persist,
      $hydrate
    }
  }
  // No persist config - manual handling in plugin to avoid SSR hydration issues
)
