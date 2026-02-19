import { describe, it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { nextTick } from 'vue'
import * as z from 'zod'

import FormRenderer from '~/features/_library/form-builder/FormRenderer.vue'
import { defineForm, arrayField, fieldGroup } from '~/features/_library/form-builder/api'
import { buildConditionItemField } from '~/features/_library/form-builder/conditions'
import type { ContextSchema } from '~/features/_library/form-builder/conditions'
import type { VueWrapper } from '@vue/test-utils'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createConditionSchema(
  overrides?: Partial<Record<string, ContextSchema[string]>>
): ContextSchema {
  return {
    donationFrequency: {
      label: 'Donation Frequency',
      type: 'array',
      options: [
        { value: 'once', label: 'One-time' },
        { value: 'monthly', label: 'Monthly' },
        { value: 'yearly', label: 'Yearly' }
      ]
    },
    donationAmount: {
      label: 'Donation Amount',
      type: 'number'
    },
    isTribute: {
      label: 'Is Tribute',
      type: 'boolean'
    },
    ...overrides
  }
}

/**
 * Build a nested items > conditions form (used by most tests), or a flat
 * conditions form when `opts.nested` is false.
 */
function createConditionForm(contextSchema: ContextSchema, opts?: { nested?: boolean }) {
  const conditionItem = buildConditionItemField([], contextSchema)

  if (opts?.nested === false) {
    return defineForm('test', () => ({
      conditions: arrayField('conditions', {
        label: 'Conditions',
        addButtonText: 'Add Condition',
        defaultValue: [{ field: '', operator: '' }],
        rules: z.array(z.any()).min(1),
        itemField: conditionItem
      })
    }))
  }

  return defineForm('test', () => ({
    items: arrayField('items', {
      label: 'Items',
      addButtonText: 'Add Item',
      defaultValue: [{ conditions: [{ field: 'isTribute', operator: '' }] }],
      rules: z.array(z.any()).min(1),
      itemField: fieldGroup('', {
        label: 'Item',
        collapsible: true,
        collapsibleDefaultOpen: true,
        fields: {
          conditions: arrayField('conditions', {
            label: 'Conditions',
            addButtonText: 'Add Condition',
            defaultValue: [{ field: 'isTribute', operator: '' }],
            rules: z.array(z.any()).min(1),
            itemField: conditionItem
          })
        }
      })
    })
  }))
}

/** Extract the value of the first condition from an emitted model. */
function getFirstConditionValue(model: Record<string, unknown>, nested = true): unknown {
  if (nested) {
    return (
      (
        ((model?.items as unknown[])?.[0] as Record<string, unknown>)?.conditions as unknown[]
      )?.[0] as Record<string, unknown>
    )?.value
  }
  return ((model?.conditions as unknown[])?.[0] as Record<string, unknown>)?.value
}

/**
 * Return the condition builder's Field / Operator / Value selects.
 * Vue Test Utils doesn't support role-based queries natively, so we rely on
 * DOM order: [0] = Field, [1] = Operator, [2+] = Value selects (if any).
 */
function findConditionSelects(wrapper: VueWrapper) {
  return wrapper.findAll('select')
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Condition builder loop regression', () => {
  it('does not thrash when adding value for `Donation Frequency in ...`', async () => {
    vi.useFakeTimers()
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    const contextSchema = createConditionSchema()
    const schema = createConditionForm(contextSchema)

    const wrapper = await mountSuspended(FormRenderer, {
      props: {
        section: schema,
        modelValue: {
          items: [{ conditions: [{ field: 'isTribute', operator: '' }] }]
        },
        contextSchema,
        validateOnMount: true,
        updateOnlyWhenValid: true
      }
    })

    const selects = findConditionSelects(wrapper)
    expect(selects.length).toBeGreaterThanOrEqual(2)

    await selects[0]!.setValue('donationFrequency')
    await nextTick()

    await selects[1]!.setValue('in')
    await nextTick()
    await nextTick()

    consoleWarn.mockClear()

    const addValueBtn = wrapper.findAll('button').find((b) => b.text() === 'Add Value')
    expect(addValueBtn).toBeTruthy()
    await addValueBtn!.trigger('click')
    await nextTick()
    await nextTick()

    for (let i = 0; i < 8; i++) {
      vi.advanceTimersByTime(50)
      await nextTick()
    }

    const loopWarnCalls = consoleWarn.mock.calls.filter((call) =>
      String(call[0]).includes('Possible infinite loop detected')
    )
    expect(loopWarnCalls.length).toBeLessThanOrEqual(1)
    expect(consoleError).not.toHaveBeenCalled()

    consoleWarn.mockRestore()
    consoleError.mockRestore()
    vi.useRealTimers()
  })

  it('adds multiple values for `Donation Frequency in ...` (does not clear)', async () => {
    const onUpdate = vi.fn()

    const contextSchema = createConditionSchema()
    const schema = createConditionForm(contextSchema)

    const wrapper = await mountSuspended(FormRenderer, {
      props: {
        section: schema,
        modelValue: {
          items: [{ conditions: [{ field: 'isTribute', operator: '' }] }]
        },
        contextSchema,
        updateOnlyWhenValid: false,
        'onUpdate:modelValue': onUpdate
      }
    })

    const selects = findConditionSelects(wrapper)
    expect(selects.length).toBeGreaterThanOrEqual(2)

    await selects[0]!.setValue('donationFrequency')
    await nextTick()
    await nextTick()

    const addValueBtn = wrapper.findAll('button').find((b) => b.text() === 'Add Value')
    expect(addValueBtn).toBeTruthy()

    await addValueBtn!.trigger('click')
    await nextTick()
    await addValueBtn!.trigger('click')
    await nextTick()

    const lastModel = onUpdate.mock.lastCall![0] as Record<string, unknown>
    const value = getFirstConditionValue(lastModel)
    expect(Array.isArray(value)).toBe(true)
    // 1 pre-filled + 2 added = 3
    expect((value as unknown[]).length).toBe(3)
  })

  it('switches field to enum type and auto-selects in operator without crashing', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const onUpdate = vi.fn()

    const contextSchema = createConditionSchema()
    const schema = createConditionForm(contextSchema, { nested: false })

    const wrapper = await mountSuspended(FormRenderer, {
      props: {
        section: schema,
        modelValue: { conditions: [{ field: '', operator: '' }] },
        contextSchema,
        updateOnlyWhenValid: false,
        'onUpdate:modelValue': onUpdate
      }
    })

    const selects = findConditionSelects(wrapper)
    expect(selects.length).toBeGreaterThanOrEqual(1)

    await selects[0]!.setValue('donationFrequency')
    await nextTick()
    await nextTick()
    await nextTick()

    const addValueBtn = wrapper.findAll('button').find((b) => b.text() === 'Add Value')
    expect(addValueBtn).toBeTruthy()

    await expect(addValueBtn!.trigger('click')).resolves.toBeUndefined()
    await nextTick()
    await nextTick()

    expect(consoleError).not.toHaveBeenCalled()

    const lastModel = onUpdate.mock.lastCall![0] as Record<string, unknown>
    const value = getFirstConditionValue(lastModel, false)
    expect(Array.isArray(value)).toBe(true)
    expect((value as unknown[]).length).toBeGreaterThanOrEqual(1)

    consoleError.mockRestore()
  })
})
