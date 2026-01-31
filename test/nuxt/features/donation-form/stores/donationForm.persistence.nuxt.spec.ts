import { describe, it, expect, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { defineComponent } from 'vue'
import { setActivePinia, createPinia } from 'pinia'
import { useDonationFormStore } from '~/features/donation-form/donor/stores/donationForm'

/**
 * Tests for donationForm store persistence
 *
 * The donationForm store uses $hydrate and $persist methods to save/restore
 * state from sessionStorage. This allows users to refresh the page without
 * losing their donation form progress.
 */
describe('donationForm store persistence', () => {
  beforeEach(() => {
    // Clear sessionStorage before each test
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.clear()
    }

    // MUST restore/clear/reset mocks between tests (WRITING-TESTS.instructions.md)
    // Create a fresh Pinia instance to prevent store pollution across tests
    setActivePinia(createPinia())
  })

  describe('$hydrate', () => {
    it('restores form state from sessionStorage', async () => {
      // Pre-populate sessionStorage with saved form data
      const savedData = {
        currentStep: 2,
        activeTab: 'monthly',
        selectedCurrency: 'USD',
        donationAmounts: { once: 0, monthly: 25, yearly: 100 },
        selectedProducts: { monthly: null, yearly: null },
        tributeData: undefined,
        coverCosts: { type: 'percentage', value: 10 },
        multipleCart: [],
        formSections: {
          donorInfo: { firstName: 'John', lastName: 'Doe' },
          shipping: {},
          giftAid: {},
          customFields: {},
          emailOptIn: { joinEmailList: true },
          terms: {}
        }
      }

      sessionStorage.setItem('donation-form', JSON.stringify(savedData))

      const TestComponent = defineComponent({
        setup() {
          const store = useDonationFormStore()
          // Manually call hydrate (plugin would do this automatically)
          store.$hydrate()
          return { store }
        },
        template: `
          <div>
            <div data-test="step">{{ store.currentStep }}</div>
            <div data-test="tab">{{ store.activeTab }}</div>
            <div data-test="currency">{{ store.selectedCurrency }}</div>
            <div data-test="monthly-amount">{{ store.donationAmounts.monthly }}</div>
          </div>
        `
      })

      const wrapper = await mountSuspended(TestComponent)

      // Verify all fields were restored from sessionStorage
      expect(wrapper.find('[data-test="step"]').text()).toBe('2')
      expect(wrapper.find('[data-test="tab"]').text()).toBe('monthly')
      expect(wrapper.find('[data-test="currency"]').text()).toBe('USD')
      expect(wrapper.find('[data-test="monthly-amount"]').text()).toBe('25')
    })

    it('handles missing sessionStorage data gracefully', () => {
      // No data in sessionStorage
      const store = useDonationFormStore()

      // Should not throw even when no data exists
      expect(() => store.$hydrate()).not.toThrow()

      // Should keep default values
      expect(store.currentStep).toBe(1)
      expect(store.activeTab).toBe('once')
    })

    it('handles corrupted sessionStorage data gracefully', () => {
      // Invalid JSON in sessionStorage
      sessionStorage.setItem('donation-form', 'invalid-json{')

      const store = useDonationFormStore()

      // Should not throw even with corrupted data
      expect(() => store.$hydrate()).not.toThrow()

      // Should keep default values (hydration failed safely)
      expect(store.currentStep).toBe(1)
      expect(store.activeTab).toBe('once')
    })

    it('only restores fields that exist in saved data', () => {
      // Partial data in sessionStorage
      const partialData = {
        currentStep: 3,
        activeTab: 'yearly'
        // Missing selectedCurrency and other fields
      }

      sessionStorage.setItem('donation-form', JSON.stringify(partialData))

      const store = useDonationFormStore()
      store.initialize('EUR') // Set a default currency
      store.$hydrate() // Restore from partial data

      // Should restore the fields that were in sessionStorage
      expect(store.currentStep).toBe(3)
      expect(store.activeTab).toBe('yearly')

      // Should keep the initialized currency (not overwritten since missing from saved data)
      expect(store.selectedCurrency).toBe('EUR')
    })
  })

  describe('$persist', () => {
    it('saves form state to sessionStorage', () => {
      const store = useDonationFormStore()
      store.initialize('GBP')

      // Make changes to the store
      store.setActiveTab('monthly')
      store.setDonationAmount('monthly', 50)
      store.goToStep(2)
      store.setCoverCosts({ type: 'percentage', value: 15 })

      // Manually call persist (plugin would do this via subscription)
      store.$persist()

      // Verify sessionStorage was updated
      const saved = sessionStorage.getItem('donation-form')
      expect(saved).toBeTruthy()

      const parsed = JSON.parse(saved!)
      expect(parsed.currentStep).toBe(2)
      expect(parsed.activeTab).toBe('monthly')
      expect(parsed.selectedCurrency).toBe('GBP')
      expect(parsed.donationAmounts.monthly).toBe(50)
      expect(parsed.coverCosts).toEqual({ type: 'percentage', value: 15 })
    })

    it('persists complex nested form sections', async () => {
      const TestComponent = defineComponent({
        setup() {
          const store = useDonationFormStore()
          return { store }
        },
        template: '<div>test</div>'
      })

      await mountSuspended(TestComponent)
      const store = useDonationFormStore()

      // Update nested form section
      store.updateFormSection('donorInfo', {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com'
      })

      store.updateFormSection('shipping', {
        address: '123 Main St',
        city: 'London'
      })

      store.$persist()

      // Verify nested data was persisted
      const saved = sessionStorage.getItem('donation-form')
      const parsed = JSON.parse(saved!)

      expect(parsed.formSections.donorInfo).toEqual({
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com'
      })

      expect(parsed.formSections.shipping).toEqual({
        address: '123 Main St',
        city: 'London'
      })
    })

    it('persists cart items for multiple donations', async () => {
      const TestComponent = defineComponent({
        setup() {
          const store = useDonationFormStore()
          return { store }
        },
        template: '<div>test</div>'
      })

      await mountSuspended(TestComponent)
      const store = useDonationFormStore()

      // Add items to cart
      const cartItems = [
        {
          id: '1',
          name: 'Monthly donation',
          description: 'Description 1',
          price: 25,
          frequency: 'monthly' as const,
          image: '',
          thumbnail: '',
          icon: '',
          addedAt: Date.now(),
          quantity: 1,
          isShippingRequired: false
        },
        {
          id: '2',
          name: 'One-time donation',
          description: 'Description 2',
          price: 100,
          frequency: 'once' as const,
          image: '',
          thumbnail: '',
          icon: '',
          addedAt: Date.now(),
          quantity: 1,
          isShippingRequired: false
        }
      ]

      store.syncMultipleCart(cartItems)
      store.$persist()

      // Verify cart was persisted
      const saved = sessionStorage.getItem('donation-form')
      const parsed = JSON.parse(saved!)

      expect(parsed.multipleCart).toHaveLength(2)
      expect(parsed.multipleCart[0]).toMatchObject({
        id: '1',
        name: 'Monthly donation',
        price: 25
      })
    })

    it('handles server-side context gracefully', async () => {
      // The $persist method should check for import.meta.server and skip
      // This test verifies no errors occur even if called server-side

      const TestComponent = defineComponent({
        setup() {
          const store = useDonationFormStore()
          // Calling $persist should be safe
          store.$persist()
          return { store }
        },
        template: '<div>test</div>'
      })

      // Should not throw
      await mountSuspended(TestComponent)
    })
  })

  describe('round-trip persistence', () => {
    it('correctly restores state after save and reload', async () => {
      const TestComponent = defineComponent({
        setup() {
          const store = useDonationFormStore()
          store.initialize('USD')
          return { store }
        },
        template: '<div>test</div>'
      })

      await mountSuspended(TestComponent)
      const store = useDonationFormStore()

      // Set up a complex state
      store.setActiveTab('monthly')
      store.setDonationAmount('monthly', 75)
      store.goToStep(3)
      const tributeInput = {
        type: 'memorial' as const,
        honoreeName: {
          honoreeFirstName: 'John',
          honoreeLastName: 'Doe'
        },
        message: 'In honor of John'
      }
      store.setTributeData(tributeInput)
      store.updateFormSection('donorInfo', {
        firstName: 'Alice',
        email: 'alice@example.com'
      })
      store.setCoverCosts({ type: 'amount', value: 5 })

      // Persist the state
      store.$persist()

      // Verify sessionStorage contains the data
      const saved = sessionStorage.getItem('donation-form')
      expect(saved).toBeTruthy()

      // Create fresh pinia and store instance to simulate page reload
      setActivePinia(createPinia())
      const freshStore = useDonationFormStore()
      freshStore.$hydrate()

      // Verify all state was restored correctly (testing actual persisted shape)
      expect(freshStore.currentStep).toBe(3)
      expect(freshStore.activeTab).toBe('monthly')
      expect(freshStore.donationAmounts.monthly).toBe(75)
      expect(freshStore.tributeData).toEqual(tributeInput)
      expect(freshStore.formSections.donorInfo).toEqual({
        firstName: 'Alice',
        email: 'alice@example.com'
      })
      expect(freshStore.coverCosts).toEqual({ type: 'amount', value: 5 })
    })
  })

  describe('clearSession', () => {
    it('resets store to initial state and clears persistence', async () => {
      const TestComponent = defineComponent({
        setup() {
          const store = useDonationFormStore()
          return { store }
        },
        template: '<div>test</div>'
      })

      await mountSuspended(TestComponent)
      const store = useDonationFormStore()

      // Set up some state
      store.setActiveTab('monthly')
      store.setDonationAmount('monthly', 50)
      store.goToStep(2)
      store.$persist()

      // Verify state was persisted
      expect(sessionStorage.getItem('donation-form')).toBeTruthy()

      // Clear the session
      store.clearSession()

      // Verify store was reset
      expect(store.currentStep).toBe(1)
      expect(store.activeTab).toBe('once')
      expect(store.donationAmounts.monthly).toBe(0)

      // After clearing, we should persist the empty state
      store.$persist()

      // Verify sessionStorage reflects the cleared state
      const saved = sessionStorage.getItem('donation-form')
      const parsed = JSON.parse(saved!)
      expect(parsed.currentStep).toBe(1)
      expect(parsed.activeTab).toBe('once')
    })
  })
})
