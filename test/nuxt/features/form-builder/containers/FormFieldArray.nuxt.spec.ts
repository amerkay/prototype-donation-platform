import { describe, it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { nextTick } from 'vue'
import FormRenderer from '~/features/form-builder/FormRenderer.vue'
import type { FormDef } from '~/features/form-builder/types'

describe('FormFieldArray', () => {
  it('normalizes scalar value to array before addItem', async () => {
    const sectionId = 'testSection'

    const schema: FormDef = {
      id: sectionId,
      fields: {
        value: {
          type: 'array',
          label: 'Values',
          addButtonText: 'Add Value',
          itemField: {
            type: 'text',
            label: 'Value'
          }
        }
      }
    }

    const onUpdate = vi.fn()

    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const wrapper = await mountSuspended(FormRenderer, {
      props: {
        section: schema,
        // Intentionally wrong type: simulates scalar -> array schema switch
        modelValue: {
          value: 100
        },
        'onUpdate:modelValue': onUpdate
      }
    })

    const addBtn = wrapper.findAll('button').find((b) => b.text() === 'Add Value')
    expect(addBtn).toBeDefined()

    await expect(addBtn!.trigger('click')).resolves.toBeUndefined()
    await nextTick()
    await nextTick()

    // Should not surface runtime errors when pushing into the array
    expect(consoleError).not.toHaveBeenCalled()

    // Verify the emitted model has an array value
    const lastCall = onUpdate.mock.lastCall
    expect(lastCall).toBeTruthy()
    const lastEmit = lastCall![0] as Record<string, unknown>
    expect(Array.isArray(lastEmit.value)).toBe(true)
    expect((lastEmit.value as unknown[]).length).toBe(1)

    consoleError.mockRestore()
    consoleWarn.mockRestore()
  })

  it('adds items without clearing existing array', async () => {
    const sectionId = 'testSection'

    const schema: FormDef = {
      id: sectionId,
      fields: {
        value: {
          type: 'array',
          label: 'Values',
          addButtonText: 'Add Value',
          itemField: {
            type: 'text',
            label: 'Value'
          }
        }
      }
    }

    const onUpdate = vi.fn()

    const wrapper = await mountSuspended(FormRenderer, {
      props: {
        section: schema,
        modelValue: {
          value: ['a']
        },
        'onUpdate:modelValue': onUpdate
      }
    })

    const addBtn = wrapper.findAll('button').find((b) => b.text() === 'Add Value')
    expect(addBtn).toBeDefined()

    await addBtn!.trigger('click')
    await nextTick()
    await nextTick()

    await addBtn!.trigger('click')
    await nextTick()
    await nextTick()

    const lastCall = onUpdate.mock.lastCall
    expect(lastCall).toBeTruthy()
    const lastEmit = lastCall![0] as Record<string, unknown>
    expect(Array.isArray(lastEmit.value)).toBe(true)
    expect((lastEmit.value as unknown[]).length).toBe(3)
  })
})
