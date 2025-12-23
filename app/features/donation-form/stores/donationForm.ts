import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Product, TributeData } from '~/features/donation-form/product/types'

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
    // Store rewards as arrays for easy serialization (convert to/from Set on access)
    const selectedRewardsArrays = ref<Record<Frequency, string[]>>({
      once: [],
      monthly: [],
      yearly: [],
      multiple: []
    })
    const coverCosts = ref<CoverCostsData | null>(null)
    const formSections = ref<Record<string, Record<string, unknown>>>({
      donorInfo: {},
      shipping: {},
      giftAid: {},
      preferences: {}
    })

    // ==================== GETTERS ====================
    const currentFrequency = computed(() => activeTab.value)
    const currentDonationAmount = computed(() => {
      if (activeTab.value === 'multiple') return 0 // Use cart total instead
      return donationAmounts.value[activeTab.value as DonationFrequency]
    })

    // Convert arrays to Sets for component consumption
    const selectedRewards = computed<Record<Frequency, Set<string>>>(() => ({
      once: new Set(selectedRewardsArrays.value.once),
      monthly: new Set(selectedRewardsArrays.value.monthly),
      yearly: new Set(selectedRewardsArrays.value.yearly),
      multiple: new Set(selectedRewardsArrays.value.multiple)
    }))

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

    function toggleReward(itemId: string, frequency: Frequency) {
      const rewardArray = selectedRewardsArrays.value[frequency]
      const index = rewardArray.indexOf(itemId)
      if (index > -1) {
        rewardArray.splice(index, 1)
      } else {
        rewardArray.push(itemId)
      }
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
      selectedRewardsArrays.value = {
        once: [],
        monthly: [],
        yearly: [],
        multiple: []
      }
      coverCosts.value = null
      formSections.value = { donorInfo: {}, shipping: {}, giftAid: {}, preferences: {} }
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
            selectedRewardsArrays: selectedRewardsArrays.value,
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
        if (data.selectedRewardsArrays !== undefined)
          selectedRewardsArrays.value = data.selectedRewardsArrays
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
      selectedRewards,
      selectedRewardsArrays, // Expose internal arrays for persistence
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
      toggleReward,
      updateFormSection,
      setCoverCosts,
      clearSession,
      $persist,
      $hydrate
    }
  }
  // No persist config - manual handling in plugin to avoid SSR hydration issues
)
