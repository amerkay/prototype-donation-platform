import { describe, it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { nextTick } from 'vue'
import * as z from 'zod'
import FormRenderer from '~/features/_library/form-builder/FormRenderer.vue'
import {
  defineForm,
  textField,
  arrayField,
  fieldGroup,
  toggleField
} from '~/features/_library/form-builder/api'

describe('FormRenderer', () => {
  it('respects updateOnlyWhenValid when manual errors exist', async () => {
    const sectionId = 'testSection'

    const schema = defineForm(sectionId, () => {
      const textFieldDef = textField('textField', {
        label: 'Text Field'
      })

      const errorTriggerArray = arrayField('errorTriggerArray', {
        label: 'Trigger',
        addButtonText: 'Add Trigger',
        itemField: {
          type: 'text',
          name: '',
          label: 'Item'
        },
        onChange: ({ value, setFieldError }) => {
          const arr = Array.isArray(value) ? value : []
          // If array has items, set a manual global error
          if (arr.length > 0) {
            // Set error on a path that doesn't correspond to a visible input
            // so it won't be cleared by standard input validation
            setFieldError?.(`${sectionId}.manualError`, 'Blocking Error')
          } else {
            setFieldError?.(`${sectionId}.manualError`, undefined)
          }
        }
      })

      return { textField: textFieldDef, errorTriggerArray }
    })

    const onUpdate = vi.fn()

    const wrapper = await mountSuspended(FormRenderer, {
      props: {
        section: schema,
        modelValue: {
          textField: 'initial',
          errorTriggerArray: []
        },
        updateOnlyWhenValid: true,
        'onUpdate:modelValue': onUpdate
      }
    })

    // Helper to wait for debounce (FormRenderer uses 0ms timeout)
    const waitForDebounce = async () => {
      await nextTick()
      await new Promise((resolve) => setTimeout(resolve, 10))
      await nextTick()
    }

    // 1. Initial valid update
    const input = wrapper.find(`input[id="${sectionId}_textField"]`)
    expect(input.exists()).toBe(true)

    await input.setValue('valid update')
    await waitForDebounce()

    expect(onUpdate).toHaveBeenLastCalledWith(
      expect.objectContaining({
        textField: 'valid update'
      })
    )
    onUpdate.mockClear()

    // 2. Trigger non-field error via Array
    const addBtn = wrapper.findAll('button').find((b) => b.text() === 'Add Trigger')
    expect(addBtn).toBeDefined()
    await addBtn!.trigger('click')
    await waitForDebounce()

    // Should NOT emit because onChange set a manual error
    expect(onUpdate).not.toHaveBeenCalled()

    // 3. Try to update text field while error persists
    await input.setValue('blocked update')
    await waitForDebounce()

    // Should still NOT emit
    expect(onUpdate).not.toHaveBeenCalled()

    // 4. Remove array item to clear error
    // Find remove button - typically renders as a generic button inside the item
    // Since we only have Add button and Remove button(s), find the one that is NOT 'Add Trigger'
    const buttons = wrapper.findAll('button')
    const removeBtn = buttons.find((b) => b.text() !== 'Add Trigger')
    expect(removeBtn).toBeDefined()

    await removeBtn!.trigger('click')
    await waitForDebounce()

    // Error cleared -> validation passes -> should emit
    expect(onUpdate).toHaveBeenCalled()
    const lastCall = onUpdate.mock.lastCall
    if (!lastCall) throw new Error('No calls to onUpdate')
    const lastEmit = lastCall[0]
    expect(lastEmit.textField).toBe('blocked update')
    expect(lastEmit.errorTriggerArray).toHaveLength(0)
  })

  it('exposes isValid=false when collapsed container has validation errors', async () => {
    const sectionId = 'testSection'

    const schema = defineForm(sectionId, () => {
      const upsells = fieldGroup('upsells', {
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
      })

      return { upsells }
    })

    const wrapper = await mountSuspended(FormRenderer, {
      props: {
        section: schema,
        modelValue: {
          upsells: {
            enableRecurring: false,
            enableIncrease: false // Invalid: both disabled
          }
        },
        validateOnMount: true
      }
    })

    await nextTick()
    await nextTick()

    // Get exposed isValid
    const formRenderer = wrapper.vm as { isValid: boolean }

    // Step 1: Container is open - isValid should be false
    expect(formRenderer.isValid).toBe(false)

    // Step 2: Collapse the field-group
    const trigger = wrapper.find('[data-slot="accordion-trigger"]')
    await trigger.trigger('click')
    await nextTick()
    await nextTick()

    // Step 3: CRITICAL - isValid should remain false even when collapsed
    // This is the bug we're fixing: previously isValid would become true
    // because vee-validate doesn't track unmounted fields
    expect(formRenderer.isValid).toBe(false)

    // Step 4: Reopen and fix the error
    await trigger.trigger('click')
    await nextTick()
    await nextTick()
    await nextTick()

    const toggle = wrapper.find('[role="switch"]')
    await toggle.trigger('click')
    await nextTick()
    await nextTick()
    await nextTick()
    // Wait for validation to complete
    await new Promise((resolve) => setTimeout(resolve, 50))
    await nextTick()

    // Step 5: Now isValid should be true
    expect(formRenderer.isValid).toBe(true)

    // Step 6: Collapse again - should remain valid
    await trigger.trigger('click')
    await nextTick()
    await nextTick()

    expect(formRenderer.isValid).toBe(true)
  })
})
