import { describe, it, expect } from 'vitest'
import { nextTick } from 'vue'
import * as z from 'zod'
import FormField from '~/features/form-builder/FormField.vue'
import type { FieldMeta, FieldGroupMeta } from '~/features/form-builder/types'
import { mountFormField } from './test-utils'

/**
 * Wait for Vue reactivity and vee-validate updates
 * Multiple ticks needed for: Vue reactivity → async watch → error restoration
 */
async function waitForUpdate() {
  await nextTick()
  await nextTick()
  await nextTick()
}

/**
 * Error Caching Test Suite
 *
 * Tests error badge persistence and restoration for collapsible containers
 * with unmount-on-hide="true" behavior.
 *
 * ISSUES ADDRESSED:
 * 1. Error badges should persist when accordion content is collapsed (unmounted)
 * 2. Error badges should appear when form loads with invalid initial values in collapsed state
 * 3. Errors should be preserved when accordion is collapsed then re-expanded
 * 4. Initial errors in collapsed accordion should show correctly when first opened
 *
 * IMPLEMENTATION:
 * - useCachedChildErrors composable caches errors when content unmounts
 * - Zod validation runs independently for initial collapsed state
 * - setFieldError + setFieldTouched restore errors when content mounts
 */
describe('FormFieldGroup - Error Caching for Collapsible Containers', () => {
  /**
   * Issue 1: Error badges persist when accordion is collapsed
   * When user collapses accordion with invalid field, error badge should remain visible
   */
  it('persists error badge when accordion is collapsed', async () => {
    const { wrapper, validate } = await mountFormField(
      FormField,
      {
        meta: {
          type: 'field-group',
          label: 'Collapsible Group',
          collapsible: true,
          collapsibleDefaultOpen: true,
          fields: {
            requiredField: {
              type: 'text',
              label: 'Required Field',
              placeholder: 'Enter value',
              defaultValue: '',
              rules: z.string().min(1, 'Required')
            }
          }
        } as FieldMeta,
        errors: [],
        name: 'testGroup'
      },
      {
        initialValues: {
          testGroup: {
            requiredField: ''
          }
        }
      }
    )

    await waitForUpdate()

    // Step 1: Field is visible (accordion open), trigger validation
    const input = wrapper.find('input[placeholder="Enter value"]')
    expect(input.exists()).toBe(true)

    await input.trigger('blur')
    await validate()
    await waitForUpdate()

    // Error message should be visible
    expect(wrapper.text()).toContain('Required')

    // Step 2: Collapse accordion by clicking trigger
    const trigger = wrapper.find('[data-slot="accordion-trigger"]')
    expect(trigger.exists()).toBe(true)
    await trigger.trigger('click')
    await waitForUpdate()

    // Content should be unmounted (unmount-on-hide="true")
    expect(wrapper.find('input[placeholder="Enter value"]').exists()).toBe(false)

    // Step 3: Error badge should persist on trigger
    expect(wrapper.text()).toContain('Error')
  })

  /**
   * Issue 2: Error badge appears for initial invalid state in collapsed accordion
   * When form loads with invalid data and accordion starts collapsed, error badge should show
   */
  it('shows error badge when form loads with invalid initial values in collapsed state', async () => {
    const { wrapper } = await mountFormField(
      FormField,
      {
        meta: {
          type: 'field-group',
          label: 'Collapsed Group',
          collapsible: true,
          collapsibleDefaultOpen: false, // Starts collapsed
          fields: {
            requiredField: {
              type: 'text',
              label: 'Required Field',
              placeholder: 'Enter value',
              defaultValue: '',
              rules: z.string().min(1, 'Required')
            }
          }
        } as FieldMeta,
        errors: [],
        name: 'testGroup'
      },
      {
        initialValues: {
          testGroup: {
            requiredField: '' // Invalid: empty string fails min(1) rule
          }
        }
      }
    )

    await waitForUpdate()

    // Content should NOT be mounted (accordion collapsed with unmount-on-hide)
    expect(wrapper.find('input[placeholder="Enter value"]').exists()).toBe(false)

    // Error badge should show on trigger (initial validation via Zod)
    expect(wrapper.text()).toContain('Error')
  })

  /**
   * Issue 3: Error state preserved when accordion is collapsed then re-expanded
   * Errors visible before collapse should reappear when accordion reopens
   */
  it('preserves error state when accordion is collapsed then re-expanded', async () => {
    const { wrapper, validate } = await mountFormField(
      FormField,
      {
        meta: {
          type: 'field-group',
          label: 'Toggle Group',
          collapsible: true,
          collapsibleDefaultOpen: true,
          fields: {
            requiredField: {
              type: 'text',
              label: 'Required Field',
              placeholder: 'Enter value',
              defaultValue: '',
              rules: z.string().min(1, 'Required')
            }
          }
        } as FieldMeta,
        errors: [],
        name: 'testGroup'
      },
      {
        initialValues: {
          testGroup: {
            requiredField: ''
          }
        }
      }
    )

    await waitForUpdate()

    // Step 1: Trigger validation while open
    const input = wrapper.find('input[placeholder="Enter value"]')
    await input.trigger('blur')
    await validate()
    await waitForUpdate()

    // Error should be visible
    expect(wrapper.text()).toContain('Required')

    // Step 2: Collapse accordion
    const trigger = wrapper.find('[data-slot="accordion-trigger"]')
    await trigger.trigger('click')
    await waitForUpdate()

    // Content unmounted
    expect(wrapper.find('input[placeholder="Enter value"]').exists()).toBe(false)

    // Step 3: Re-expand accordion
    await trigger.trigger('click')
    await waitForUpdate()

    // Content should be visible again
    expect(wrapper.find('input[placeholder="Enter value"]').exists()).toBe(true)

    // Error message should reappear on the field
    expect(wrapper.text()).toContain('Required')
  })

  /**
   * Issue 4: Initial errors in collapsed accordion show when first opened
   * When accordion starts collapsed with invalid data, opening it should show errors
   */
  it('shows field errors when opening accordion with initial invalid values', async () => {
    const { wrapper } = await mountFormField(
      FormField,
      {
        meta: {
          type: 'field-group',
          label: 'Initially Collapsed',
          collapsible: true,
          collapsibleDefaultOpen: false, // Starts collapsed
          fields: {
            requiredField: {
              type: 'text',
              label: 'Required Field',
              placeholder: 'Enter value',
              defaultValue: '',
              rules: z.string().min(1, 'Required')
            }
          }
        } as FieldMeta,
        errors: [],
        name: 'testGroup'
      },
      {
        initialValues: {
          testGroup: {
            requiredField: '' // Invalid initial value
          }
        }
      }
    )

    await waitForUpdate()

    // Content not mounted initially
    expect(wrapper.find('input[placeholder="Enter value"]').exists()).toBe(false)

    // Error badge should show (from Zod validation of initial values)
    expect(wrapper.text()).toContain('Error')

    // Open accordion
    const trigger = wrapper.find('[data-slot="accordion-trigger"]')
    await trigger.trigger('click')
    await waitForUpdate()

    // Content now mounted
    expect(wrapper.find('input[placeholder="Enter value"]').exists()).toBe(true)

    // Error message should be displayed on the field itself
    expect(wrapper.text()).toContain('Required')
  })

  /**
   * Error badge disappears when field becomes valid
   * After fixing validation error, badge should clear when accordion closes
   */
  it('clears error badge when field becomes valid', async () => {
    const { wrapper, validate } = await mountFormField(
      FormField,
      {
        meta: {
          type: 'field-group',
          label: 'Fixable Group',
          collapsible: true,
          collapsibleDefaultOpen: true,
          fields: {
            textField: {
              type: 'text',
              label: 'Text Field',
              placeholder: 'Enter value',
              defaultValue: '',
              rules: z.string().min(1, 'Field is required')
            }
          }
        } as FieldMeta,
        errors: [],
        name: 'testGroup'
      },
      {
        initialValues: {
          testGroup: {
            textField: ''
          }
        }
      }
    )

    await waitForUpdate()

    // Trigger validation to show error
    const input = wrapper.find('input[placeholder="Enter value"]')
    await input.trigger('blur')
    await validate()
    await waitForUpdate()
    expect(wrapper.text()).toContain('Field is required')

    // Fix the error by entering valid value
    await input.setValue('valid text')
    await validate()
    await waitForUpdate()

    // Error should be gone
    expect(wrapper.text()).not.toContain('Field is required')

    // Collapse accordion
    const trigger = wrapper.find('[data-slot="accordion-trigger"]')
    await trigger.trigger('click')
    await waitForUpdate()

    // Error badge should NOT appear (field is now valid)
    expect(wrapper.text()).not.toContain('Error')
  })

  /**
   * Multiple fields: error badge shows if ANY child has errors
   */
  it('shows error badge when any child field has errors', async () => {
    const { wrapper, validate } = await mountFormField(
      FormField,
      {
        meta: {
          type: 'field-group',
          label: 'Multi Field Group',
          collapsible: true,
          collapsibleDefaultOpen: true,
          fields: {
            validField: {
              type: 'text',
              label: 'Valid Field',
              placeholder: 'Valid placeholder',
              defaultValue: 'valid',
              rules: z.string().min(1, 'Required')
            },
            invalidField: {
              type: 'text',
              label: 'Invalid Field',
              placeholder: 'Invalid placeholder',
              defaultValue: '',
              rules: z.string().min(1, 'Required')
            }
          }
        } as FieldMeta,
        errors: [],
        name: 'testGroup'
      },
      {
        initialValues: {
          testGroup: {
            validField: 'valid value',
            invalidField: ''
          }
        }
      }
    )

    await waitForUpdate()

    // Validate to surface errors
    const invalidInput = wrapper.find('input[placeholder="Invalid placeholder"]')
    await invalidInput.trigger('blur')
    await validate()
    await waitForUpdate()

    // Collapse
    const trigger = wrapper.find('[data-slot="accordion-trigger"]')
    await trigger.trigger('click')
    await waitForUpdate()

    // Error badge should show (at least one field has error)
    expect(wrapper.text()).toContain('Error')
  })

  /**
   * Nested field-groups: errors in nested group show badge on parent
   */
  it('shows error badge for errors in nested field-groups', async () => {
    const { wrapper } = await mountFormField(
      FormField,
      {
        meta: {
          type: 'field-group',
          label: 'Parent Group',
          collapsible: true,
          collapsibleDefaultOpen: false, // Starts collapsed
          fields: {
            nested: {
              type: 'field-group',
              label: 'Nested Group',
              collapsible: false,
              fields: {
                deepField: {
                  type: 'text',
                  label: 'Deep Field',
                  placeholder: 'Deep placeholder',
                  defaultValue: '',
                  rules: z.string().min(1, 'Required')
                }
              }
            } as FieldGroupMeta
          }
        } as FieldMeta,
        errors: [],
        name: 'testGroup'
      },
      {
        initialValues: {
          testGroup: {
            nested: {
              deepField: '' // Invalid
            }
          }
        }
      }
    )

    await waitForUpdate()

    // Error badge should show on parent (from nested validation)
    expect(wrapper.text()).toContain('Error')
  })

  it('shows and clears array + field errors correctly when collapsed', async () => {
    const { wrapper, validate } = await mountFormField(
      FormField,
      {
        meta: {
          type: 'field-group',
          label: 'Array Group',
          collapsible: true,
          collapsibleDefaultOpen: false,
          fields: {
            customAmount: {
              type: 'field-group',
              label: 'Custom Amount',
              collapsible: false,
              fields: {
                min: {
                  type: 'number',
                  label: 'Min',
                  defaultValue: 5,
                  rules: z.coerce.number().min(1)
                }
              }
            } as FieldGroupMeta,
            presetAmounts: {
              type: 'array',
              label: 'Preset Amounts',
              itemField: {
                type: 'number',
                placeholder: 'Amount',
                rules: ({ values }) => {
                  const minAmount = (values.customAmount as Record<string, unknown> | undefined)
                    ?.min as number | undefined
                  const effectiveMin = minAmount ?? 1
                  return z.coerce.number().min(effectiveMin, `Must be at least ${effectiveMin}`)
                }
              }
            }
          }
        } as FieldMeta,
        errors: [],
        name: 'testGroup'
      },
      {
        initialValues: {
          testGroup: {
            customAmount: { min: 5 },
            presetAmounts: [1]
          }
        }
      }
    )

    await waitForUpdate()

    // Starts collapsed - badge should be seeded via schema validation
    expect(wrapper.text()).toContain('Error')

    // Open accordion
    const trigger = wrapper.find('[data-slot="accordion-trigger"]')
    await trigger.trigger('click')
    await waitForUpdate()
    await nextTick() // Extra wait for validateOnMount to complete
    await waitForUpdate()

    // Field-level error should show (validated on mount)
    expect(wrapper.text()).toContain('Must be at least 5')

    // Array-level error should show (hasChildErrors in FormFieldArray)
    expect(wrapper.text()).toContain('One or more errors above, please fix')

    // Fix the value: NumberFieldInput doesn't use placeholder; use data-slot.
    const numberInputs = wrapper.findAll('[data-slot="input"]')
    // Inputs: [min, presetAmounts[0]]
    expect(numberInputs.length).toBeGreaterThanOrEqual(2)
    const amountInput = numberInputs[1]!
    await amountInput.setValue('5')
    await amountInput.trigger('blur')
    await validate()
    await waitForUpdate()

    // Errors should clear
    expect(wrapper.text()).not.toContain('Must be at least 5')
    expect(wrapper.text()).not.toContain('One or more errors above, please fix')

    // Collapse - badge should not show once valid
    await trigger.trigger('click')
    await waitForUpdate()
    expect(wrapper.text()).not.toContain('Error')
  })

  /**
   * Issue 5: Manual errors on unmounted fields
   * When manual errors are set on fields inside a collapsed accordion,
   * the error badge should still appear.
   */
  it('shows error badge when manual error is set on unmounted child field', async () => {
    const { wrapper, setFieldError } = await mountFormField(
      FormField,
      {
        meta: {
          type: 'field-group',
          label: 'Collapsible Group',
          collapsible: true, // Needs to be collapsible to unmount content
          collapsibleDefaultOpen: false, // Start unmounted (collapsed)
          fields: {
            childField: {
              type: 'text',
              label: 'Child Field'
            }
          }
        },
        name: 'testGroup'
      },
      {
        sectionId: 'test-section',
        initialValues: {
          testGroup: {
            childField: ''
          }
        }
      }
    )

    // Ensure it is collapsed
    expect(wrapper.find('[data-state="closed"]').exists()).toBe(true)

    // Inject manual error
    const errorPath = 'test-section.testGroup.childField'
    if (setFieldError) {
      setFieldError(errorPath, 'Manual Error')
    }

    await waitForUpdate()

    // Assert error badge is visible
    expect(wrapper.find('.bg-destructive').exists()).toBe(true)
  })

  /**
   * Issue 6: Errors in array item field-groups persist across unmount/remount
   * Critical for custom fields with conditions: when a condition references a deleted field,
   * the error is deeply nested (array[i].fieldGroup.nestedField). Schema-based error caching
   * must recurse into array item field-groups to preserve these errors.
   *
   * Regression test for: error badge disappearing on second accordion open
   */
  it('preserves errors in array item field-groups across multiple open/close cycles', async () => {
    const { wrapper } = await mountFormField(
      FormField,
      {
        meta: {
          type: 'field-group',
          label: 'Collapsible Container',
          collapsible: true,
          collapsibleDefaultOpen: false, // Start collapsed
          fields: {
            items: {
              type: 'array',
              label: 'Items',
              addButtonText: 'Add Item',
              itemField: {
                type: 'field-group',
                label: 'Item',
                fields: {
                  nestedField: {
                    type: 'text',
                    label: 'Nested Field',
                    rules: z.string().min(3, 'Must be at least 3 characters')
                  }
                }
              }
            }
          }
        },
        name: 'container'
      },
      {
        sectionId: 'test-section',
        initialValues: {
          container: {
            items: [
              {
                nestedField: 'ab' // Invalid: too short
              }
            ]
          }
        }
      }
    )

    // Initial state: collapsed with error (detected via schema validation)
    expect(wrapper.find('[data-state="closed"]').exists()).toBe(true)
    let errorBadge = wrapper.find('.bg-destructive')
    expect(errorBadge.exists()).toBe(true)
    expect(errorBadge.text()).toContain('Error')

    // Open accordion (mount content)
    let trigger = wrapper.find('button[data-state="closed"]')
    await trigger.trigger('click')
    await waitForUpdate()
    expect(wrapper.find('[data-state="open"]').exists()).toBe(true)

    // Error should still be visible (now from vee-validate)
    errorBadge = wrapper.find('.bg-destructive')
    expect(errorBadge.exists()).toBe(true)

    // Close accordion (unmount content, cache errors)
    trigger = wrapper.find('button[data-state="open"]')
    await trigger.trigger('click')
    await waitForUpdate()
    expect(wrapper.find('[data-state="closed"]').exists()).toBe(true)

    // Error badge should persist (from cache)
    errorBadge = wrapper.find('.bg-destructive')
    expect(errorBadge.exists()).toBe(true)
    expect(errorBadge.text()).toContain('Error')

    // CRITICAL: Open again (this was failing before fix)
    // Schema-based error caching must have recursed into array item field-group
    // to preserve the error when vee-validate cleared it on unmount
    trigger = wrapper.find('button[data-state="closed"]')
    await trigger.trigger('click')
    await waitForUpdate()
    expect(wrapper.find('[data-state="open"]').exists()).toBe(true)

    // Error badge MUST still be visible (restored from schema-seeded cache)
    errorBadge = wrapper.find('.bg-destructive')
    expect(errorBadge.exists()).toBe(true)
    expect(errorBadge.text()).toContain('Error')
  })
})
