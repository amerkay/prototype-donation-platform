import { describe, it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { nextTick } from 'vue'
import * as z from 'zod'

import FormRenderer from '~/features/form-builder/FormRenderer.vue'
import { defineForm, arrayField, fieldGroup } from '~/features/form-builder/api'
import { buildConditionItemField } from '~/features/custom-fields/forms/condition-field-builder'
import type { ContextSchema } from '~/features/form-builder/conditions'

describe('Condition builder loop regression', () => {
  it('does not thrash when adding value for `Donation Frequency in ...`', async () => {
    vi.useFakeTimers()
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    const contextSchema: ContextSchema = {
      donationFrequency: {
        label: 'Donation Frequency',
        // NOTE: this mirrors current app schema; the value itself is scalar,
        // but `in`/`notIn` use an array of values.
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
      }
    }

    const schema = defineForm('test', () => ({
      items: arrayField('items', {
        label: 'Items',
        addButtonText: 'Add Item',
        defaultValue: [
          {
            conditions: [
              {
                field: 'isTribute',
                operator: ''
              }
            ]
          }
        ],
        rules: z.array(z.any()).min(1),
        itemField: fieldGroup('', {
          label: 'Item',
          collapsible: true,
          collapsibleDefaultOpen: true,
          fields: {
            conditions: arrayField('conditions', {
              label: 'Conditions',
              addButtonText: 'Add Condition',
              defaultValue: [
                {
                  field: 'isTribute',
                  operator: ''
                }
              ],
              rules: z.array(z.any()).min(1),
              itemField: buildConditionItemField([], contextSchema)
            })
          }
        })
      })
    }))

    const wrapper = await mountSuspended(FormRenderer, {
      props: {
        section: schema,
        modelValue: {
          items: [
            {
              conditions: [
                {
                  field: 'isTribute',
                  operator: ''
                }
              ]
            }
          ]
        },
        contextSchema,
        validateOnMount: true,
        updateOnlyWhenValid: true
      }
    })

    // Find the first condition row's Field + Operator selects
    const selects = wrapper.findAll('select')
    // The form has many selects, but the first ones should be the condition builder's
    expect(selects.length).toBeGreaterThanOrEqual(2)

    // 1) Field = Donation Frequency
    await selects[0]!.setValue('donationFrequency')
    await nextTick()

    // 2) Operator = Is One Of (in)
    await selects[1]!.setValue('in')
    await nextTick()
    await nextTick()

    // Reset warning counter so we only measure Add Value effects.
    consoleWarn.mockClear()

    // 3) Click Add Value (array)
    const addValueBtn = wrapper.findAll('button').find((b) => b.text() === 'Add Value')
    expect(addValueBtn).toBeTruthy()
    await addValueBtn!.trigger('click')
    await nextTick()
    await nextTick()

    // Let any validate()/watch cycles settle; if there's a feedback loop,
    // warnings will keep appearing as the time window resets.
    for (let i = 0; i < 8; i++) {
      vi.advanceTimersByTime(50)
      await nextTick()
    }

    // If we enter a re-render/recompute loop, the detectLoop() warning fires.
    const loopWarnCalls = consoleWarn.mock.calls.filter((call) =>
      String(call[0]).includes('Possible infinite loop detected')
    )
    // In the real bug this repeats continuously; in test we allow a single warning
    // but fail if it keeps re-triggering.
    expect(loopWarnCalls.length).toBeLessThanOrEqual(1)

    // Also ensure we didn't hit runtime errors while mutating nested arrays.
    expect(consoleError).not.toHaveBeenCalled()

    consoleWarn.mockRestore()
    consoleError.mockRestore()
    vi.useRealTimers()
  })

  it('adds multiple values for `Donation Frequency in ...` (does not clear)', async () => {
    const onUpdate = vi.fn()

    const contextSchema: ContextSchema = {
      donationFrequency: {
        label: 'Donation Frequency',
        type: 'array',
        options: [
          { value: 'once', label: 'One-time' },
          { value: 'monthly', label: 'Monthly' },
          { value: 'yearly', label: 'Yearly' }
        ]
      }
    }

    const schema = defineForm('test', () => ({
      items: arrayField('items', {
        label: 'Items',
        addButtonText: 'Add Item',
        defaultValue: [
          {
            conditions: [
              {
                field: 'isTribute',
                operator: ''
              }
            ]
          }
        ],
        rules: z.array(z.any()).min(1),
        itemField: fieldGroup('', {
          label: 'Item',
          collapsible: true,
          collapsibleDefaultOpen: true,
          fields: {
            conditions: arrayField('conditions', {
              label: 'Conditions',
              addButtonText: 'Add Condition',
              defaultValue: [
                {
                  field: 'isTribute',
                  operator: ''
                }
              ],
              rules: z.array(z.any()).min(1),
              itemField: buildConditionItemField([], contextSchema)
            })
          }
        })
      })
    }))

    const wrapper = await mountSuspended(FormRenderer, {
      props: {
        section: schema,
        modelValue: {
          items: [
            {
              conditions: [
                {
                  field: 'isTribute',
                  operator: ''
                }
              ]
            }
          ]
        },
        contextSchema,
        updateOnlyWhenValid: false,
        'onUpdate:modelValue': onUpdate
      }
    })

    const selects = wrapper.findAll('select')
    expect(selects.length).toBeGreaterThanOrEqual(2)

    await selects[0]!.setValue('donationFrequency')
    await nextTick()
    await selects[1]!.setValue('in')
    await nextTick()
    await nextTick()

    const addValueBtn = wrapper.findAll('button').find((b) => b.text() === 'Add Value')
    expect(addValueBtn).toBeTruthy()

    await addValueBtn!.trigger('click')
    await nextTick()
    await addValueBtn!.trigger('click')
    await nextTick()

    const lastCall = onUpdate.mock.lastCall
    expect(lastCall).toBeTruthy()
    const lastModel = lastCall![0] as Record<string, unknown>

    const value = (
      (
        ((lastModel?.items as unknown[])?.[0] as Record<string, unknown>)?.conditions as unknown[]
      )?.[0] as Record<string, unknown>
    )?.value
    expect(Array.isArray(value)).toBe(true)
    expect((value as unknown[]).length).toBe(2)
  })

  it('switches from number condition to `in` without crashing on Add Value', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const onUpdate = vi.fn()

    const contextSchema: ContextSchema = {
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
      }
    }

    const schema = defineForm('test', () => ({
      conditions: arrayField('conditions', {
        label: 'Conditions',
        addButtonText: 'Add Condition',
        defaultValue: [
          {
            field: 'donationAmount',
            operator: '',
            // Intentionally still a number, simulating a stale value during operator swap.
            value: 100
          }
        ],
        rules: z.array(z.any()).min(1),
        itemField: buildConditionItemField([], contextSchema)
      })
    }))

    const wrapper = await mountSuspended(FormRenderer, {
      props: {
        section: schema,
        modelValue: {
          conditions: [
            {
              field: 'donationAmount',
              operator: '',
              value: 100
            }
          ]
        },
        contextSchema,
        updateOnlyWhenValid: false,
        'onUpdate:modelValue': onUpdate
      }
    })

    // Field + Operator selects should be present.
    const selects = wrapper.findAll('select')
    expect(selects.length).toBeGreaterThanOrEqual(2)

    // Switch to Donation Frequency + in
    await selects[0]!.setValue('donationFrequency')
    await nextTick()
    await selects[1]!.setValue('in')
    await nextTick()
    await nextTick()

    const addValueBtn = wrapper.findAll('button').find((b) => b.text() === 'Add Value')
    expect(addValueBtn).toBeTruthy()

    // This is where the bug used to throw: "can't assign to property 0 on 100"
    await expect(addValueBtn!.trigger('click')).resolves.toBeUndefined()
    await nextTick()
    await nextTick()

    expect(consoleError).not.toHaveBeenCalled()

    const lastCall = onUpdate.mock.lastCall
    expect(lastCall).toBeTruthy()
    const lastModel = lastCall![0] as Record<string, unknown>
    const value = ((lastModel?.conditions as unknown[])?.[0] as Record<string, unknown>)?.value
    expect(Array.isArray(value)).toBe(true)
    expect((value as unknown[]).length).toBeGreaterThanOrEqual(1)

    consoleError.mockRestore()
  })
})
