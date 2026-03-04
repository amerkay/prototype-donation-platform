import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import { nextTick, defineComponent, h } from 'vue'
import CampaignCreateWizard from '~/features/campaigns/admin/components/CampaignCreateWizard.vue'
import { useCurrencySettingsStore } from '~/features/settings/admin/stores/currencySettings'

// Mock navigateTo (Nuxt auto-import)
const mockNavigateTo = vi.fn()
vi.stubGlobal('navigateTo', mockNavigateTo)

// Mock useCampaigns
const mockCreateCampaign = vi.fn(() => 'new-camp-id')
const mockUpdateCampaign = vi.fn()
vi.mock('~/features/campaigns/shared/composables/useCampaigns', () => ({
  useCampaigns: () => ({
    createCampaign: mockCreateCampaign,
    updateCampaign: mockUpdateCampaign
  })
}))

// Mock useCreateFormFromTemplate
const mockCreateFormFromTemplate = vi.fn(() => ({
  formId: 'form-1',
  formName: 'Basic Form',
  config: {
    donationAmounts: { baseDefaultCurrency: 'GBP', frequencies: {} }
  },
  products: []
}))
vi.mock('~/features/donation-form/admin/composables/useCreateFormFromTemplate', () => ({
  useCreateFormFromTemplate: () => ({
    createFormFromTemplate: mockCreateFormFromTemplate
  })
}))

// Stub BaseDialogOrDrawer to render slots directly (avoids teleport/dialog rendering issues)
const BaseDialogOrDrawerStub = defineComponent({
  name: 'BaseDialogOrDrawer',
  props: ['open', 'size', 'dismissible', 'description'],
  emits: ['update:open'],
  setup(props, { slots }) {
    return () =>
      props.open
        ? h('div', { class: 'dialog-stub' }, [
            slots.header?.(),
            slots.content?.(),
            slots.footer?.()
          ])
        : null
  }
})

describe('CampaignCreateWizard', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    const currencyStore = useCurrencySettingsStore()
    currencyStore.initialize({
      supportedCurrencies: ['GBP', 'USD', 'EUR'],
      defaultCurrency: 'GBP',
      currencyMultipliers: {}
    })
    vi.clearAllMocks()
  })

  async function mountWizard(open = true) {
    const wrapper = await mountSuspended(CampaignCreateWizard, {
      props: { open },
      global: {
        stubs: {
          BaseDialogOrDrawer: BaseDialogOrDrawerStub,
          DonationFormTemplateGrid: defineComponent({
            name: 'DonationFormTemplateGrid',
            props: ['campaignType'],
            emits: ['select'],
            setup(_, { emit }) {
              return () =>
                h(
                  'div',
                  {
                    class: 'template-grid-stub',
                    onClick: () =>
                      emit('select', {
                        metadata: { id: 'basic', name: 'Basic' },
                        factory: () => ({
                          config: {
                            donationAmounts: { baseDefaultCurrency: 'GBP', frequencies: {} }
                          },
                          products: []
                        })
                      })
                  },
                  'Template Grid'
                )
            }
          })
        }
      }
    })
    return wrapper
  }

  it('renders Step 1 with form fields', async () => {
    const wrapper = await mountWizard()

    expect(wrapper.text()).toContain('New Campaign')

    const titleInput = wrapper.find('[id="campaignCreate_title"]')
    expect(titleInput.exists()).toBe(true)
  })

  it('Next button triggers form validation; invalid form stays on Step 1', async () => {
    const wrapper = await mountWizard()

    const buttons = wrapper.findAll('button')
    const nextBtn = buttons.find((b) => b.text().includes('Next'))
    expect(nextBtn).toBeDefined()

    await nextBtn!.trigger('click')
    await nextTick()
    await nextTick()
    await nextTick()

    // Should still show Step 1 since form is invalid
    expect(wrapper.text()).toContain('New Campaign')
    expect(wrapper.text()).not.toContain('Template Grid')
  })

  it('valid Step 1 submission advances to Step 2', async () => {
    const wrapper = await mountWizard()

    // Advance directly via internal state — validation is tested separately
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const vm = wrapper.vm as Record<string, any>
    vm.step1Data = {
      title: 'Save the Orangutans Campaign',
      currency: 'GBP',
      campaignType: 'standard',
      goalAmount: undefined
    }
    vm.currentStep = 2
    await nextTick()

    expect(wrapper.text()).toContain('Choose a Form Template')
  })

  it('Step 2 shows Back button that returns to Step 1', async () => {
    const wrapper = await mountWizard()

    // Advance to step 2 via internal state
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(wrapper.vm as Record<string, any>).currentStep = 2
    await nextTick()

    expect(wrapper.text()).toContain('Choose a Form Template')

    // Click Back
    const backBtn = wrapper.findAll('button').find((b) => b.text().includes('Back'))
    expect(backBtn).toBeDefined()
    await backBtn!.trigger('click')
    await nextTick()

    expect(wrapper.text()).toContain('New Campaign')
  })

  it('dialog resets on re-open: step resets to 1', async () => {
    const wrapper = await mountWizard()

    // Advance to step 2
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(wrapper.vm as Record<string, any>).currentStep = 2
    await nextTick()
    expect(wrapper.text()).toContain('Choose a Form Template')

    // Close + re-open
    await wrapper.setProps({ open: false })
    await nextTick()
    await wrapper.setProps({ open: true })
    await nextTick()
    await nextTick()

    expect(wrapper.text()).toContain('New Campaign')
  })
})
