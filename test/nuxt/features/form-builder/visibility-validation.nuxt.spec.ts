import { describe, it, expect } from 'vitest'
import * as z from 'zod'
import FormField from '~/features/form-builder/FormField.vue'
import type { FieldMeta } from '~/features/form-builder/types'
import { mountFormField, getSectionValues } from './test-utils'

/**
 * Wait for Vue reactivity and vee-validate updates
 */
async function waitForUpdate() {
  await nextTick()
  await nextTick()
  await nextTick()
}

/**
 * Visibility + Validation Test Suite
 *
 * CRITICAL BEHAVIOR: When a field is hidden via visibleWhen condition,
 * its validation errors must be cleared from the form. The form should
 * become valid even if the hidden field contains invalid data.
 *
 * This is essential for:
 * - Conditional forms where different fields apply based on user selection
 * - Multi-step wizards where previous steps may have different rules
 * - Dynamic configs where enabling/disabling sections shouldn't block form submission
 *
 * The field's VALUE should be preserved (for when user toggles back),
 * but its VALIDATION STATE should not affect form validity.
 */
describe('FormField - Visibility and Validation Integration', () => {
  /**
   * Integration test using FormFieldGroup with toggle + conditional text field
   * This represents the real-world scenario where toggling a feature off
   * should make the form valid even if hidden fields have invalid values.
   */
  it('form becomes valid when field with errors is hidden', async () => {
    const { wrapper, formValues, validate } = await mountFormField(
      FormField,
      {
        meta: {
          type: 'field-group',
          label: 'Test Group',
          collapsible: false,
          fields: {
            enabled: {
              type: 'toggle',
              label: 'Enable Feature',
              defaultValue: true,
              rules: z.boolean()
            },
            requiredWhenEnabled: {
              type: 'text',
              label: 'Required Field',
              placeholder: 'At least 3 characters',
              defaultValue: '', // Invalid when visible (empty, but min 3 required)
              rules: z.string().min(3, 'Must be at least 3 characters'),
              visibleWhen: (ctx) => ctx.values.enabled === true
            }
          }
        } as FieldMeta,
        errors: [],
        name: 'testGroup'
      },
      {
        initialValues: {
          testGroup: {
            enabled: true,
            requiredWhenEnabled: 'ab' // Invalid: only 2 chars
          }
        }
      }
    )

    await waitForUpdate()

    // Step 1: Field is visible, trigger validation
    const input = wrapper.find('input[placeholder="At least 3 characters"]')
    expect(input.exists()).toBe(true)

    // Trigger validation by blurring
    await input.trigger('blur')
    await waitForUpdate()

    // Validate the form
    const result1 = await validate()
    await waitForUpdate()

    // Form should be INVALID (field visible with invalid value)
    expect(result1.valid).toBe(false)
    expect(wrapper.text()).toContain('at least 3 characters')

    // Step 2: Toggle OFF - field should hide
    const toggle = wrapper.find('[role="switch"]')
    expect(toggle.exists()).toBe(true)

    await toggle.trigger('click')
    await waitForUpdate()

    // Field should be hidden now
    const hiddenInput = wrapper.find('input[placeholder="At least 3 characters"]')
    expect(hiddenInput.exists()).toBe(false)

    // Step 3: Validate again - form should be VALID now
    const result2 = await validate()
    await waitForUpdate()

    // CRITICAL ASSERTION: Form must be valid when field is hidden
    // This is the behavior that was broken by the change
    expect(result2.valid).toBe(true)

    // Error message should not appear
    expect(wrapper.text()).not.toContain('at least 3 characters')

    // Step 4: Verify value is preserved (for when toggle turns back ON)
    const values = getSectionValues(formValues)
    const groupValues = values?.testGroup as Record<string, unknown>
    expect(groupValues?.requiredWhenEnabled).toBe('ab') // Value preserved
    expect(groupValues?.enabled).toBe(false) // Toggle is OFF
  })

  /**
   * Test that error badges don't appear on container headers when child is hidden
   */
  it('does not show error badge on field-group when hidden child has errors', async () => {
    const { wrapper, validate } = await mountFormField(
      FormField,
      {
        meta: {
          type: 'field-group',
          label: 'Settings Group',
          collapsible: true,
          collapsibleDefaultOpen: true,
          fields: {
            advancedMode: {
              type: 'toggle',
              label: 'Advanced Mode',
              defaultValue: false,
              rules: z.boolean()
            },
            advancedSetting: {
              type: 'text',
              label: 'Advanced Setting',
              placeholder: 'Required in advanced mode',
              defaultValue: '', // Invalid when visible
              rules: z.string().min(1, 'Required'),
              visibleWhen: (ctx) => ctx.values.advancedMode === true
            }
          }
        } as FieldMeta,
        errors: [],
        name: 'settings'
      },
      {
        initialValues: {
          settings: {
            advancedMode: false,
            advancedSetting: '' // Would be invalid if visible
          }
        }
      }
    )

    await waitForUpdate()

    // Field should be hidden (advancedMode is false)
    const input = wrapper.find('input[placeholder="Required in advanced mode"]')
    expect(input.exists()).toBe(false)

    // Validate
    const result = await validate()
    await waitForUpdate()

    // Form should be valid (hidden field doesn't count)
    expect(result.valid).toBe(true)

    // No error badge should appear
    expect(wrapper.text()).not.toContain('Error')
  })
})
