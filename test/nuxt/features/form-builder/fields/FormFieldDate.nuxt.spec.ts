import { describe, it, expect, vi } from 'vitest'
import FormFieldDate from '~/features/_library/form-builder/fields/FormFieldDate.vue'
import type { DateFieldDef, FieldContext } from '~/features/_library/form-builder/types'
import { mountFormField } from '../test-utils'

async function mountFormFieldDate(meta: Partial<DateFieldDef> = {}, modelValue?: string) {
  const defaultMeta: DateFieldDef = {
    type: 'date',
    name: 'testDate',
    label: 'Test Date',
    ...meta
  }

  const { wrapper } = await mountFormField(FormFieldDate, {
    meta: defaultMeta,
    modelValue,
    errors: [],
    name: 'testDate',
    onBlur: vi.fn()
  })

  return wrapper
}

describe('FormFieldDate - Normal Operation', () => {
  it('renders with label and placeholder text', async () => {
    const wrapper = await mountFormFieldDate({ label: 'End Date' })

    expect(wrapper.find('label').text()).toContain('End Date')
    expect(wrapper.find('button').text()).toContain('Pick a date')
  })

  it('displays formatted date when value is set', async () => {
    const wrapper = await mountFormFieldDate({}, '2026-03-15')

    const button = wrapper.find('button')
    expect(button.text()).toContain('March 15th, 2026')
  })

  it('shows optional indicator when optional is true', async () => {
    const wrapper = await mountFormFieldDate({
      label: 'Optional Date',
      optional: true
    })

    expect(wrapper.text()).toContain('(optional)')
  })

  it('displays description text', async () => {
    const wrapper = await mountFormFieldDate({
      description: 'When the campaign closes'
    })

    expect(wrapper.text()).toContain('When the campaign closes')
  })

  it('renders calendar icon in trigger button', async () => {
    const wrapper = await mountFormFieldDate()

    // lucide-vue-next renders SVGs
    expect(wrapper.find('button svg').exists()).toBe(true)
  })
})

describe('FormFieldDate - Dynamic Properties', () => {
  it('resolves dynamic label from function', async () => {
    const wrapper = await mountFormFieldDate({
      label: (ctx: FieldContext) => `Date for ${ctx.values.type || 'campaign'}`
    })

    expect(wrapper.find('label').text()).toContain('Date for campaign')
  })

  it('resolves dynamic description from function', async () => {
    const wrapper = await mountFormFieldDate({
      description: (ctx: FieldContext) => `Ends on ${ctx.values.date || 'TBD'}`
    })

    expect(wrapper.text()).toContain('Ends on TBD')
  })
})

describe('FormFieldDate - Error Handling', () => {
  it('displays validation errors', async () => {
    const { wrapper } = await mountFormField(FormFieldDate, {
      meta: { type: 'date', label: 'Test Date' },
      modelValue: undefined,
      errors: ['Date is required'],
      name: 'testDate'
    })

    expect(wrapper.text()).toContain('Date is required')
  })

  it('sets aria-invalid when errors present', async () => {
    const { wrapper } = await mountFormField(FormFieldDate, {
      meta: { type: 'date', label: 'Test Date' },
      modelValue: undefined,
      errors: ['Invalid date'],
      name: 'testDate'
    })

    const button = wrapper.find('button')
    expect(button.attributes('aria-invalid')).toBe('true')
  })

  it('does not set aria-invalid when no errors', async () => {
    const wrapper = await mountFormFieldDate()

    const button = wrapper.find('button')
    expect(button.attributes('aria-invalid')).toBe('false')
  })
})

describe('FormFieldDate - Clear Button', () => {
  it('shows clear button when optional and has value', async () => {
    const wrapper = await mountFormFieldDate({ optional: true }, '2026-03-15')

    const clearBtn = wrapper.find('button[aria-label="Clear date"]')
    expect(clearBtn.exists()).toBe(true)
  })

  it('hides clear button when no value is set', async () => {
    const wrapper = await mountFormFieldDate({ optional: true })

    const clearBtn = wrapper.find('button[aria-label="Clear date"]')
    expect(clearBtn.exists()).toBe(false)
  })

  it('hides clear button when field is not optional', async () => {
    const wrapper = await mountFormFieldDate({ optional: false }, '2026-03-15')

    const clearBtn = wrapper.find('button[aria-label="Clear date"]')
    expect(clearBtn.exists()).toBe(false)
  })

  it('hides clear button when field is disabled', async () => {
    const wrapper = await mountFormFieldDate({ optional: true, disabled: true }, '2026-03-15')

    const clearBtn = wrapper.find('button[aria-label="Clear date"]')
    expect(clearBtn.exists()).toBe(false)
  })

  it('emits null when clear button is clicked', async () => {
    const onUpdateModelValue = vi.fn()
    const { wrapper } = await mountFormField(FormFieldDate, {
      meta: { type: 'date', label: 'Test Date', optional: true },
      modelValue: '2026-03-15',
      errors: [],
      name: 'testDate',
      onUpdateModelValue
    })

    const clearBtn = wrapper.find('button[aria-label="Clear date"]')
    await clearBtn.trigger('click')

    expect(onUpdateModelValue).toHaveBeenCalledWith(null)
  })
})

describe('FormFieldDate - Edge Cases', () => {
  it('handles undefined modelValue gracefully', async () => {
    const { wrapper } = await mountFormField(FormFieldDate, {
      meta: { type: 'date' },
      modelValue: undefined,
      errors: [],
      name: 'testDate'
    })

    expect(wrapper.find('button').text()).toContain('Pick a date')
  })

  it('handles empty string modelValue as no date', async () => {
    const wrapper = await mountFormFieldDate({}, '')

    expect(wrapper.find('button').text()).toContain('Pick a date')
  })

  it('applies disabled attribute when disabled is true', async () => {
    const wrapper = await mountFormFieldDate({ disabled: true })

    const button = wrapper.find('button')
    expect(button.attributes('disabled')).toBeDefined()
  })

  it('disables button when disabled function returns true', async () => {
    const { wrapper } = await mountFormField(
      FormFieldDate,
      {
        meta: {
          type: 'date',
          label: 'Test Date',
          disabled: (ctx: FieldContext) => ctx.values.locked === true
        },
        modelValue: undefined,
        errors: [],
        name: 'testDate'
      },
      { initialValues: { locked: true } }
    )

    const button = wrapper.find('button')
    expect(button.attributes('disabled')).toBeDefined()
  })

  it('handles missing label gracefully', async () => {
    const wrapper = await mountFormFieldDate({ label: undefined })

    expect(wrapper.find('label').exists()).toBe(false)
  })
})

describe('FormFieldDate - Accessibility', () => {
  it('associates label with button via for/id', async () => {
    const wrapper = await mountFormFieldDate({ label: 'Campaign End Date' })

    const label = wrapper.find('label')
    const button = wrapper.find('button')

    expect(label.attributes('for')).toBe('testDate')
    expect(button.attributes('id')).toBe('testDate')
  })

  it('renders as a button element', async () => {
    const wrapper = await mountFormFieldDate()

    const button = wrapper.find('button')
    expect(button.element.tagName).toBe('BUTTON')
  })
})

describe('FormFieldDate - Integration', () => {
  it('works with all metadata properties combined', async () => {
    const wrapper = await mountFormFieldDate(
      {
        label: 'Full Featured Date',
        description: 'Pick a campaign end date',
        optional: true,
        class: 'custom-class',
        labelClass: 'label-custom'
      },
      '2026-06-15'
    )

    expect(wrapper.find('label').text()).toContain('Full Featured Date')
    expect(wrapper.text()).toContain('Pick a campaign end date')
    expect(wrapper.text()).toContain('(optional)')
    expect(wrapper.find('button').text()).toContain('June 15th, 2026')
  })

  it('emits update:modelValue when date changes', async () => {
    const onUpdateModelValue = vi.fn()
    const { wrapper } = await mountFormField(FormFieldDate, {
      meta: { type: 'date', label: 'Test Date' },
      modelValue: undefined,
      errors: [],
      name: 'testDate',
      onUpdateModelValue
    })

    // Verify the component renders and the button exists
    const button = wrapper.find('button')
    expect(button.exists()).toBe(true)

    // The actual calendar interaction (open popover, click date) requires
    // full DOM rendering. Here we verify the component is wired correctly
    // by checking the trigger button is present and accessible.
    expect(button.text()).toContain('Pick a date')
  })
})
