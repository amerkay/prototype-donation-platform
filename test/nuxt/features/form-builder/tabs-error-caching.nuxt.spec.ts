import { describe, it, expect } from 'vitest'
import { nextTick } from 'vue'
import * as z from 'zod'
import FormField from '~/features/_library/form-builder/FormField.vue'
import {
  fieldGroup,
  tabsField,
  numberField,
  arrayField,
  textField,
  toggleField
} from '~/features/_library/form-builder/api'
import { mountFormField } from './test-utils'
import type { VueWrapper } from '@vue/test-utils'

async function waitForUpdate() {
  await nextTick()
  await nextTick()
  await nextTick()
}

function findTabsTrigger(wrapper: VueWrapper, label: string) {
  const triggers = wrapper.findAll('[data-slot="tabs-trigger"]')
  const trigger = triggers.find((t) => t.text().includes(label))
  expect(trigger, `Could not find tabs trigger with label "${label}"`).toBeTruthy()
  return trigger!
}

describe('FormFieldTabs - Error Caching with unmount-on-hide', () => {
  it('shows errors at every level (group, tab, array, field) and persists across tab switch + collapse', async () => {
    const { wrapper } = await mountFormField(
      FormField,
      {
        meta: fieldGroup('pricing', {
          label: 'Pricing',
          collapsible: true,
          collapsibleDefaultOpen: false,
          fields: {
            frequencies: tabsField('frequencies', {
              label: 'Frequencies',
              defaultValue: 'once',
              tabs: [
                {
                  value: 'once',
                  label: 'Once',
                  fields: {
                    customAmount: fieldGroup('customAmount', {
                      label: 'Custom Amount',
                      collapsible: false,
                      fields: {
                        min: numberField('min', {
                          label: 'Min',
                          defaultValue: 5,
                          rules: z.coerce.number().min(1)
                        })
                      }
                    }),
                    presetAmounts: arrayField('presetAmounts', {
                      label: 'Preset Amounts',
                      itemField: numberField('', {
                        rules: (ctx) => {
                          const minAmount = (
                            ctx.values.customAmount as Record<string, unknown> | undefined
                          )?.min as number | undefined
                          const effectiveMin = minAmount ?? 1
                          return z.coerce
                            .number()
                            .min(effectiveMin, `Must be at least ${effectiveMin}`)
                        }
                      })
                    })
                  }
                },
                {
                  value: 'monthly',
                  label: 'Monthly',
                  fields: {
                    customAmount: fieldGroup('customAmount', {
                      label: 'Custom Amount',
                      collapsible: false,
                      fields: {
                        min: numberField('min', {
                          label: 'Min',
                          defaultValue: 5,
                          rules: z.coerce.number().min(1)
                        })
                      }
                    }),
                    presetAmounts: arrayField('presetAmounts', {
                      label: 'Preset Amounts',
                      itemField: numberField('', {
                        rules: (ctx) => {
                          const minAmount = (
                            ctx.values.customAmount as Record<string, unknown> | undefined
                          )?.min as number | undefined
                          const effectiveMin = minAmount ?? 1
                          return z.coerce
                            .number()
                            .min(effectiveMin, `Must be at least ${effectiveMin}`)
                        }
                      })
                    })
                  }
                }
              ]
            })
          }
        }),
        errors: [],
        name: 'pricing'
      },
      {
        initialValues: {
          pricing: {
            frequencies: {
              once: {
                customAmount: { min: 5 },
                presetAmounts: [1]
              },
              monthly: {
                customAmount: { min: 5 },
                presetAmounts: [10]
              }
            }
          }
        }
      }
    )

    await waitForUpdate()

    // Group-level badge should be seeded even when collapsed
    expect(wrapper.text()).toContain('Error')

    // Open accordion
    const groupTrigger = wrapper.find('[data-slot="accordion-trigger"]')
    await groupTrigger.trigger('click')
    await waitForUpdate()
    await nextTick() // Extra wait for validateOnMount to complete
    await waitForUpdate()

    // Field-level + array-level errors should be visible
    expect(wrapper.text()).toContain('Must be at least 5')
    expect(wrapper.text()).toContain('One or more errors above, please fix')

    // Tab-level badge should show on Once trigger
    const onceTrigger = findTabsTrigger(wrapper, 'Once')
    expect(onceTrigger.find('[data-slot="badge"].bg-destructive').exists()).toBe(true)

    // Switch tabs: Once should stay badged, monthly should not
    const monthlyTrigger = findTabsTrigger(wrapper, 'Monthly')
    await monthlyTrigger.trigger('click')
    await waitForUpdate()

    expect(
      findTabsTrigger(wrapper, 'Once').find('[data-slot="badge"].bg-destructive').exists()
    ).toBe(true)
    expect(
      findTabsTrigger(wrapper, 'Monthly').find('[data-slot="badge"].bg-destructive').exists()
    ).toBe(false)

    // Collapse accordion: group-level badge must persist even though invalid tab is unmounted
    await groupTrigger.trigger('click')
    await waitForUpdate()
    expect(wrapper.text()).toContain('Error')
  })

  it('clears badges at every level when invalid tab becomes valid', async () => {
    const { wrapper, validate } = await mountFormField(
      FormField,
      {
        meta: fieldGroup('pricing', {
          label: 'Pricing',
          collapsible: true,
          collapsibleDefaultOpen: true,
          fields: {
            frequencies: tabsField('frequencies', {
              label: 'Frequencies',
              defaultValue: 'once',
              tabs: [
                {
                  value: 'once',
                  label: 'Once',
                  fields: {
                    customAmount: fieldGroup('customAmount', {
                      label: 'Custom Amount',
                      collapsible: false,
                      fields: {
                        min: numberField('min', {
                          label: 'Min',
                          defaultValue: 5,
                          rules: z.number().min(1)
                        })
                      }
                    }),
                    presetAmounts: arrayField('presetAmounts', {
                      label: 'Preset Amounts',
                      itemField: numberField('', {
                        rules: (ctx) => {
                          const minAmount = (
                            ctx.values.customAmount as Record<string, unknown> | undefined
                          )?.min as number | undefined
                          const effectiveMin = minAmount ?? 1
                          return z.coerce
                            .number()
                            .min(effectiveMin, `Must be at least ${effectiveMin}`)
                        }
                      })
                    })
                  }
                },
                {
                  value: 'monthly',
                  label: 'Monthly',
                  fields: {
                    presetAmounts: arrayField('presetAmounts', {
                      label: 'Preset Amounts',
                      itemField: numberField('', {
                        rules: z.coerce.number().min(1)
                      })
                    })
                  }
                }
              ]
            })
          }
        }),
        errors: [],
        name: 'pricing'
      },
      {
        initialValues: {
          pricing: {
            frequencies: {
              once: {
                customAmount: { min: 5 },
                presetAmounts: [1]
              },
              monthly: { presetAmounts: [10] }
            }
          }
        }
      }
    )

    await waitForUpdate()

    // Sanity: errors are visible in Once tab
    expect(wrapper.text()).toContain('Must be at least 5')
    expect(
      findTabsTrigger(wrapper, 'Once').find('[data-slot="badge"].bg-destructive').exists()
    ).toBe(true)
    expect(wrapper.text()).toContain('Error')

    // Fix the invalid value
    // Fix the value: active tab has [min, presetAmounts[0]] as NumberFieldInput elements.
    const numberInputs = wrapper.findAll('[data-slot="input"]')
    expect(numberInputs.length).toBeGreaterThanOrEqual(2)
    const amountInput = numberInputs[1]!
    await amountInput.setValue('5')
    await amountInput.trigger('blur')
    await validate()
    await waitForUpdate()

    // Field + array errors should clear
    expect(wrapper.text()).not.toContain('Must be at least 5')
    expect(wrapper.text()).not.toContain('One or more errors above, please fix')

    // Tab badge should clear
    expect(
      findTabsTrigger(wrapper, 'Once').find('[data-slot="badge"].bg-destructive').exists()
    ).toBe(false)

    // Collapse: group badge should be gone when valid
    const groupTrigger = wrapper.find('[data-slot="accordion-trigger"]')
    await groupTrigger.trigger('click')
    await waitForUpdate()
    expect(wrapper.text()).not.toContain('Error')
  })

  it('does not surface cached errors for hidden tab fields', async () => {
    const { wrapper, validate } = await mountFormField(
      FormField,
      {
        meta: fieldGroup('settings', {
          label: 'Settings',
          collapsible: true,
          collapsibleDefaultOpen: true,
          fields: {
            advanced: toggleField('advanced', {
              label: 'Advanced',
              defaultValue: false,
              rules: z.boolean()
            }),
            tabs: tabsField('tabs', {
              label: 'Advanced Tabs',
              defaultValue: 'a',
              tabs: [
                {
                  value: 'a',
                  label: 'Tab A',
                  fields: {
                    hiddenSetting: textField('hiddenSetting', {
                      label: 'Hidden Setting',
                      placeholder: 'Hidden',
                      defaultValue: '',
                      rules: z.string().min(1, 'Required'),
                      visibleWhen: (ctx) => ctx.values.advanced === true
                    })
                  }
                }
              ]
            })
          }
        }),
        errors: [],
        name: 'settings'
      },
      {
        initialValues: {
          settings: {
            advanced: false,
            tabs: { a: { hiddenSetting: '' } }
          }
        }
      }
    )

    await waitForUpdate()

    const result = await validate()
    await waitForUpdate()
    expect(result.valid).toBe(true)
    expect(wrapper.text()).not.toContain('Error')
  })
})
