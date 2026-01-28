import { describe, it, expect } from 'vitest'
import { nextTick } from 'vue'
import * as z from 'zod'
import FormField from '~/features/_library/form-builder/FormField.vue'
import { fieldGroup, tabsField, toggleField } from '~/features/_library/form-builder/api'
import { mountFormField } from './test-utils'

/**
 * Wait for Vue reactivity and vee-validate updates
 */
async function waitForUpdate() {
  await nextTick()
  await nextTick()
  await nextTick()
}

/**
 * Container-Level Validation Test Suite
 *
 * Tests validation rules applied to containers (field-groups, tabs) themselves,
 * not just their child fields. Examples:
 * - "At least one option must be enabled" (field-group with multiple toggles)
 * - "Total must be under limit" (tabs with cross-tab validation)
 *
 * CRITICAL BEHAVIOR:
 * - Container validation errors must show in UI when container is open
 * - Error badges must persist when container is collapsed (unmount-on-hide)
 * - Errors must reappear when container is reopened
 */
describe('Container Field Validation (field-group and tabs rules)', () => {
  /**
   * Field-group with container-level rule: "at least one toggle must be enabled"
   * This is the exact pattern used in impact-boost upsells configuration
   */
  it('validates field-group level rules and shows error badge when collapsed', async () => {
    const { wrapper, validate } = await mountFormField(
      FormField,
      {
        meta: fieldGroup('upsells', {
          label: 'Upsell Options',
          collapsible: true,
          collapsibleDefaultOpen: true,
          fields: {
            enableRecurring: toggleField('enableRecurring', {
              label: 'Enable Recurring Boost',
              defaultValue: false
            }),
            enableIncrease: toggleField('enableIncrease', {
              label: 'Enable Increase Boost',
              defaultValue: false
            })
          },
          // Container-level rule: at least one must be enabled
          rules: z
            .object({
              enableRecurring: z.boolean().optional(),
              enableIncrease: z.boolean().optional()
            })
            .refine((val) => val.enableRecurring || val.enableIncrease, {
              message: 'At least one upsell option must be enabled'
            })
        }),
        errors: [],
        name: 'upsells'
      },
      {
        initialValues: {
          upsells: {
            enableRecurring: false,
            enableIncrease: false // Invalid: both disabled
          }
        }
      }
    )

    await waitForUpdate()

    // Step 1: Container is open - validate to surface container-level error
    await validate()
    await waitForUpdate()

    // Container-level error should be visible in UI
    expect(wrapper.text()).toContain('At least one upsell option must be enabled')

    // Error badge should show on accordion trigger
    expect(wrapper.find('[data-slot="badge"].bg-destructive').exists()).toBe(true)

    // Step 2: Collapse accordion
    const trigger = wrapper.find('[data-slot="accordion-trigger"]')
    await trigger.trigger('click')
    await waitForUpdate()

    // Content should be unmounted
    expect(wrapper.find('[data-radix-collection-item]').exists()).toBe(false)

    // CRITICAL: Error badge must persist when collapsed
    expect(wrapper.find('[data-slot="badge"].bg-destructive').exists()).toBe(true)
    expect(wrapper.text()).toContain('Error')
  })

  it('shows field-group error badge on initial load when container starts collapsed', async () => {
    const { wrapper } = await mountFormField(
      FormField,
      {
        meta: fieldGroup('upsells', {
          label: 'Upsell Options',
          collapsible: true,
          collapsibleDefaultOpen: false, // Starts collapsed
          fields: {
            enableRecurring: toggleField('enableRecurring', {
              label: 'Enable Recurring Boost',
              defaultValue: false
            }),
            enableIncrease: toggleField('enableIncrease', {
              label: 'Enable Increase Boost',
              defaultValue: false
            })
          },
          rules: z
            .object({
              enableRecurring: z.boolean().optional(),
              enableIncrease: z.boolean().optional()
            })
            .refine((val) => val.enableRecurring || val.enableIncrease, {
              message: 'At least one upsell option must be enabled'
            })
        }),
        errors: [],
        name: 'upsells'
      },
      {
        initialValues: {
          upsells: {
            enableRecurring: false,
            enableIncrease: false
          }
        }
      }
    )

    await waitForUpdate()

    // Accordion should be collapsed
    expect(wrapper.find('[data-state="closed"]').exists()).toBe(true)

    // Error badge should show even though content is unmounted
    // (schema validation detects the container-level rule violation)
    expect(wrapper.find('[data-slot="badge"].bg-destructive').exists()).toBe(true)
    expect(wrapper.text()).toContain('Error')
  })

  it('clears field-group error badge when container-level validation passes', async () => {
    const { wrapper, validate } = await mountFormField(
      FormField,
      {
        meta: fieldGroup('upsells', {
          label: 'Upsell Options',
          collapsible: true,
          collapsibleDefaultOpen: true,
          fields: {
            enableRecurring: toggleField('enableRecurring', {
              label: 'Enable Recurring Boost',
              defaultValue: false
            }),
            enableIncrease: toggleField('enableIncrease', {
              label: 'Enable Increase Boost',
              defaultValue: false
            })
          },
          rules: z
            .object({
              enableRecurring: z.boolean().optional(),
              enableIncrease: z.boolean().optional()
            })
            .refine((val) => val.enableRecurring || val.enableIncrease, {
              message: 'At least one upsell option must be enabled'
            })
        }),
        errors: [],
        name: 'upsells'
      },
      {
        initialValues: {
          upsells: {
            enableRecurring: false,
            enableIncrease: false
          }
        }
      }
    )

    await waitForUpdate()

    // Validate to show error
    await validate()
    await waitForUpdate()
    expect(wrapper.text()).toContain('At least one upsell option must be enabled')

    // Fix the error by enabling one option
    const toggle = wrapper.find('[role="switch"]')
    await toggle.trigger('click')
    await validate()
    await waitForUpdate()

    // Error should be gone
    expect(wrapper.text()).not.toContain('At least one upsell option must be enabled')

    // Collapse accordion
    const trigger = wrapper.find('[data-slot="accordion-trigger"]')
    await trigger.trigger('click')
    await waitForUpdate()

    // Error badge should NOT appear (container is now valid)
    expect(wrapper.find('[data-slot="badge"].bg-destructive').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('Error')
  })

  it('restores field-group container error when reopening collapsed accordion', async () => {
    const { wrapper, validate } = await mountFormField(
      FormField,
      {
        meta: fieldGroup('upsells', {
          label: 'Upsell Options',
          collapsible: true,
          collapsibleDefaultOpen: true,
          fields: {
            enableRecurring: toggleField('enableRecurring', {
              label: 'Enable Recurring Boost',
              defaultValue: false
            }),
            enableIncrease: toggleField('enableIncrease', {
              label: 'Enable Increase Boost',
              defaultValue: false
            })
          },
          rules: z
            .object({
              enableRecurring: z.boolean().optional(),
              enableIncrease: z.boolean().optional()
            })
            .refine((val) => val.enableRecurring || val.enableIncrease, {
              message: 'At least one upsell option must be enabled'
            })
        }),
        errors: [],
        name: 'upsells'
      },
      {
        initialValues: {
          upsells: {
            enableRecurring: false,
            enableIncrease: false
          }
        }
      }
    )

    await waitForUpdate()

    // Trigger validation
    await validate()
    await waitForUpdate()
    expect(wrapper.text()).toContain('At least one upsell option must be enabled')

    // Collapse
    const trigger = wrapper.find('[data-slot="accordion-trigger"]')
    await trigger.trigger('click')
    await waitForUpdate()

    // Badge persists
    expect(wrapper.find('[data-slot="badge"].bg-destructive').exists()).toBe(true)

    // Reopen
    await trigger.trigger('click')
    await waitForUpdate()

    // Error message should reappear in content
    expect(wrapper.text()).toContain('At least one upsell option must be enabled')
  })

  /**
   * Tabs with container-level rule: cross-tab validation
   * Example: "At least one donation frequency must be enabled"
   */
  it('validates tabs-level rules and shows error in collapsed parent group', async () => {
    const { wrapper, validate } = await mountFormField(
      FormField,
      {
        meta: fieldGroup('donation', {
          label: 'Donation Settings',
          collapsible: true,
          collapsibleDefaultOpen: true,
          fields: {
            frequencies: tabsField('frequencies', {
              label: 'Donation Frequencies',
              defaultValue: 'once',
              tabs: [
                {
                  value: 'once',
                  label: 'One-Time',
                  fields: {
                    enabled: toggleField('enabled', {
                      label: 'Enable One-Time Donations',
                      defaultValue: false
                    })
                  }
                },
                {
                  value: 'monthly',
                  label: 'Monthly',
                  fields: {
                    enabled: toggleField('enabled', {
                      label: 'Enable Monthly Donations',
                      defaultValue: false
                    })
                  }
                }
              ],
              // Container-level rule: at least one frequency must be enabled
              rules: z
                .object({
                  once: z.object({ enabled: z.boolean().optional() }).optional(),
                  monthly: z.object({ enabled: z.boolean().optional() }).optional()
                })
                .refine((val) => val.once?.enabled === true || val.monthly?.enabled === true, {
                  message: 'At least one donation frequency must be enabled'
                })
            })
          }
        }),
        errors: [],
        name: 'donation'
      },
      {
        initialValues: {
          donation: {
            frequencies: {
              once: { enabled: false },
              monthly: { enabled: false }
            }
          }
        }
      }
    )

    await waitForUpdate()

    // Validate to surface tabs-level error
    await validate()
    await waitForUpdate()

    // Tabs-level error should be visible
    expect(wrapper.text()).toContain('At least one donation frequency must be enabled')

    // Collapse parent group
    const trigger = wrapper.find('[data-slot="accordion-trigger"]')
    await trigger.trigger('click')
    await waitForUpdate()

    // Parent group error badge should persist (includes tabs-level error)
    expect(wrapper.find('[data-slot="badge"].bg-destructive').exists()).toBe(true)
    expect(wrapper.text()).toContain('Error')
  })

  it('shows tabs-level error badge when parent group starts collapsed', async () => {
    const { wrapper } = await mountFormField(
      FormField,
      {
        meta: fieldGroup('donation', {
          label: 'Donation Settings',
          collapsible: true,
          collapsibleDefaultOpen: false, // Starts collapsed
          fields: {
            frequencies: tabsField('frequencies', {
              label: 'Donation Frequencies',
              defaultValue: 'once',
              tabs: [
                {
                  value: 'once',
                  label: 'One-Time',
                  fields: {
                    enabled: toggleField('enabled', {
                      label: 'Enable One-Time Donations',
                      defaultValue: false
                    })
                  }
                },
                {
                  value: 'monthly',
                  label: 'Monthly',
                  fields: {
                    enabled: toggleField('enabled', {
                      label: 'Enable Monthly Donations',
                      defaultValue: false
                    })
                  }
                }
              ],
              rules: z
                .object({
                  once: z.object({ enabled: z.boolean().optional() }).optional(),
                  monthly: z.object({ enabled: z.boolean().optional() }).optional()
                })
                .refine((val) => val.once?.enabled === true || val.monthly?.enabled === true, {
                  message: 'At least one donation frequency must be enabled'
                })
            })
          }
        }),
        errors: [],
        name: 'donation'
      },
      {
        initialValues: {
          donation: {
            frequencies: {
              once: { enabled: false },
              monthly: { enabled: false }
            }
          }
        }
      }
    )

    await waitForUpdate()

    // Accordion should be collapsed
    expect(wrapper.find('[data-state="closed"]').exists()).toBe(true)

    // Error badge should show from schema validation
    expect(wrapper.find('[data-slot="badge"].bg-destructive').exists()).toBe(true)
    expect(wrapper.text()).toContain('Error')
  })
})
