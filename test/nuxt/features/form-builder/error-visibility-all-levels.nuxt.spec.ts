import { describe, it, expect } from 'vitest'
import { nextTick } from 'vue'
import * as z from 'zod'
import FormField from '~/features/_library/form-builder/FormField.vue'
import {
  fieldGroup,
  tabsField,
  numberField,
  arrayField
} from '~/features/_library/form-builder/api'
import { mountFormField } from './test-utils'
import type { VueWrapper } from '@vue/test-utils'

/**
 * Regression tests for error visibility at all nested levels
 *
 * CRITICAL BUG PREVENTED:
 * When accordion opens with invalid data, errors MUST appear immediately at ALL levels:
 * - Field-group accordion trigger (Error badge)
 * - Tab trigger (Error badge)
 * - Array container ("One or more errors above")
 * - Individual field (validation message)
 *
 * This requires:
 * 1. FormFieldTabs always checks schema + live errors for all tabs
 * 2. FormFieldArray provides scopedFormValues + checks schema errors
 * 3. FormField validates on visibility change
 */

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

describe('Error Visibility - All Nested Levels (Regression Prevention)', () => {
  it('shows errors at ALL levels immediately when opening accordion with invalid nested tab+array+field data', async () => {
    const { wrapper } = await mountFormField(
      FormField,
      {
        meta: fieldGroup('pricing', {
          label: 'Pricing Configuration',
          collapsible: true,
          collapsibleDefaultOpen: false, // Start CLOSED
          fields: {
            frequencies: tabsField('frequencies', {
              label: 'Donation Frequencies',
              defaultValue: 'once',
              tabs: [
                {
                  value: 'once',
                  label: 'One-time',
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
                        placeholder: 'Amount',
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
                presetAmounts: [1] // INVALID: 1 < min (5)
              },
              monthly: {
                customAmount: { min: 5 },
                presetAmounts: [10] // VALID
              }
            }
          }
        }
      }
    )

    await waitForUpdate()

    // ============================================================
    // LEVEL 1: Field-group accordion trigger shows error badge
    // ============================================================
    const groupTrigger = wrapper.find('[data-slot="accordion-trigger"]')
    expect(groupTrigger.exists()).toBe(true)

    // CRITICAL: Error badge must be visible even when accordion is CLOSED
    // Uses schema validation since content is unmounted
    expect(groupTrigger.text()).toContain('Error')

    // ============================================================
    // Open the accordion - ALL nested errors must appear
    // ============================================================
    await groupTrigger.trigger('click')
    await waitForUpdate()
    await nextTick() // Extra tick for validation to complete
    await waitForUpdate()

    // ============================================================
    // LEVEL 2: Tab trigger shows error badge
    // ============================================================
    const onceTrigger = findTabsTrigger(wrapper, 'One-time')
    const errorBadge = onceTrigger.find('[data-slot="badge"].bg-destructive')

    // CRITICAL: Error badge must appear on tab trigger immediately
    // Uses schema validation for unvisited/newly visible tabs
    expect(errorBadge.exists()).toBe(true)

    // Monthly tab should NOT have error badge (data is valid)
    const monthlyTrigger = findTabsTrigger(wrapper, 'Monthly')
    const monthlyErrorBadge = monthlyTrigger.find('[data-slot="badge"].bg-destructive')
    expect(monthlyErrorBadge.exists()).toBe(false)

    // ============================================================
    // LEVEL 3: Array shows error message
    // ============================================================
    // Find the specific label containing "Preset Amounts" (not the first label)
    const labels = wrapper.findAll('label')
    const presetAmountsLabel = labels.find((label) => label.text().includes('Preset Amounts'))
    expect(presetAmountsLabel?.exists()).toBe(true)

    // CRITICAL: Array must show error indicator immediately
    // Uses hasSchemaErrors computed in FormFieldArray
    expect(wrapper.text()).toContain('One or more errors above, please fix')

    // ============================================================
    // LEVEL 4: Individual field shows validation error
    // ============================================================
    // CRITICAL: Field error message must appear WITHOUT user interaction
    // Field validates on visibility via watch(isVisible) in FormField
    expect(wrapper.text()).toContain('Must be at least 5')

    // Verify the error is shown near the actual field input
    const numberInputs = wrapper.findAll('[data-slot="input"]')
    expect(numberInputs.length).toBeGreaterThan(0)

    // Error should be in a role="alert" element for accessibility
    const errorAlert = wrapper.find('[role="alert"]')
    expect(errorAlert.exists()).toBe(true)
    expect(errorAlert.text()).toContain('Must be at least 5')
  })

  it('shows field errors for multiple invalid array items immediately on open', async () => {
    const { wrapper } = await mountFormField(
      FormField,
      {
        meta: fieldGroup('settings', {
          label: 'Settings',
          collapsible: true,
          collapsibleDefaultOpen: false,
          fields: {
            items: arrayField('items', {
              label: 'Required Items',
              itemField: {
                type: 'text',
                name: '',
                label: 'Item Name',
                placeholder: 'Enter name',
                rules: z.string().min(3, 'Name must be at least 3 characters')
              }
            })
          }
        }),
        errors: [],
        name: 'settings'
      },
      {
        initialValues: {
          settings: {
            items: ['a', 'b', 'ok'] // First two are invalid (< 3 chars)
          }
        }
      }
    )

    await waitForUpdate()

    // Field-group should show error badge when closed
    expect(wrapper.text()).toContain('Error')

    // Open accordion
    const trigger = wrapper.find('[data-slot="accordion-trigger"]')
    await trigger.trigger('click')
    await waitForUpdate()
    await nextTick()
    await waitForUpdate()

    // All validation errors must appear immediately
    const errorMessages = wrapper.findAll('[role="alert"]')

    // Should have at least 2 error messages (for 'a' and 'b')
    expect(errorMessages.length).toBeGreaterThanOrEqual(2)

    // Both errors should mention the 3 character minimum
    const allErrorText = errorMessages.map((el) => el.text()).join(' ')
    expect(allErrorText).toContain('at least 3 characters')

    // Array-level error indicator should show
    expect(wrapper.text()).toContain('One or more errors above')
  })

  it('clears errors at all levels when data becomes valid', async () => {
    const { wrapper, validate } = await mountFormField(
      FormField,
      {
        meta: fieldGroup('pricing', {
          label: 'Pricing',
          collapsible: true,
          collapsibleDefaultOpen: true, // Start OPEN for this test
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
                presetAmounts: [1] // Invalid
              }
            }
          }
        }
      }
    )

    await waitForUpdate()

    // Verify all error levels are present initially
    expect(wrapper.text()).toContain('Must be at least 5')
    expect(wrapper.text()).toContain('One or more errors above')
    const onceTrigger = findTabsTrigger(wrapper, 'Once')
    expect(onceTrigger.find('[data-slot="badge"].bg-destructive').exists()).toBe(true)

    // Fix the invalid value
    const numberInputs = wrapper.findAll('[data-slot="input"]')
    const invalidInput = numberInputs[1]! // Second input is the array item
    await invalidInput.setValue('5')
    await invalidInput.trigger('blur')
    await validate()
    await waitForUpdate()

    // ALL error indicators must clear
    expect(wrapper.text()).not.toContain('Must be at least 5')
    expect(wrapper.text()).not.toContain('One or more errors above')
    expect(onceTrigger.find('[data-slot="badge"].bg-destructive').exists()).toBe(false)

    // Close accordion - no error badge should appear
    const groupTrigger = wrapper.find('[data-slot="accordion-trigger"]')
    await groupTrigger.trigger('click')
    await waitForUpdate()
    expect(groupTrigger.text()).not.toContain('Error')
  })

  it('shows errors in nested field-groups within arrays immediately on open', async () => {
    const { wrapper } = await mountFormField(
      FormField,
      {
        meta: fieldGroup('complex', {
          label: 'Complex Structure',
          collapsible: true,
          collapsibleDefaultOpen: false,
          fields: {
            items: arrayField('items', {
              label: 'Items',
              itemField: fieldGroup('', {
                label: 'Item Details',
                collapsible: false,
                fields: {
                  name: {
                    type: 'text',
                    name: 'name',
                    label: 'Name',
                    placeholder: 'Enter name',
                    rules: z.string().min(1, 'Name required')
                  },
                  value: numberField('value', {
                    label: 'Value',
                    rules: z.number().min(1, 'Value must be positive')
                  })
                }
              })
            })
          }
        }),
        errors: [],
        name: 'complex'
      },
      {
        initialValues: {
          complex: {
            items: [
              { name: '', value: 0 } // Both fields invalid
            ]
          }
        }
      }
    )

    await waitForUpdate()

    // Field-group badge when closed
    expect(wrapper.text()).toContain('Error')

    // Open
    const trigger = wrapper.find('[data-slot="accordion-trigger"]')
    await trigger.trigger('click')
    await waitForUpdate()
    await nextTick()
    await waitForUpdate()

    // Both nested field errors must appear immediately
    expect(wrapper.text()).toContain('Name required')
    expect(wrapper.text()).toContain('Value must be positive')

    // Array error indicator
    expect(wrapper.text()).toContain('One or more errors above')
  })
})
