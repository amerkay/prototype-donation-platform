import { describe, it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { nextTick } from 'vue'
import FormRenderer from '~/features/form-builder/FormRenderer.vue'
import type { FormDef } from '~/features/form-builder/types'

describe('FormRenderer', () => {
  it('respects updateOnlyWhenValid when manual errors exist', async () => {
    const sectionId = 'testSection'
    const schema: FormDef = {
      id: sectionId,
      fields: {
        textField: {
          type: 'text',
          label: 'Text Field'
        },
        errorTriggerArray: {
          type: 'array',
          label: 'Trigger',
          addButtonText: 'Add Trigger',
          itemField: { type: 'text', label: 'Item' },
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
        }
      }
    }

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
})
