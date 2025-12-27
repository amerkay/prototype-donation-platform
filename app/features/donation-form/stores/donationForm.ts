import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Product } from '~/features/donation-form/product/types'
import type { TributeData } from '~/features/donation-form/tribute/types'

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
    const formSections = ref<Record<string, Record<string, unknown>>>({
      donorInfo: {},
      shipping: {},
      giftAid: {},
      customFields: {},
      preferences: {}
    })

    // ==================== GETTERS ====================
    const currentFrequency = computed(() => activeTab.value)
    const currentDonationAmount = computed(() => {
      if (activeTab.value === 'multiple') return 0 // Use cart total instead
      return donationAmounts.value[activeTab.value as DonationFrequency]
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

    function clearSession() {
      currentStep.value = 1
      activeTab.value = 'once'
      donationAmounts.value = { once: 0, monthly: 0, yearly: 0 }
      selectedProducts.value = { monthly: null, yearly: null }
      tributeData.value = { once: undefined, monthly: undefined, yearly: undefined }
      coverCosts.value = null
      formSections.value = {
        donorInfo: {},
        shipping: {},
        giftAid: {},
        customFields: {},
        preferences: {}
      }
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
      formSections,

      // Getters
      currentFrequency,
      currentDonationAmount,

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
      clearSession,
      $persist,
      $hydrate
    }
  }
  // No persist config - manual handling in plugin to avoid SSR hydration issues
)
