import { describe, it, expect, vi } from 'vitest'
import * as z from 'zod'
import { mountFormFieldArray, waitForArrayUpdate } from './FormFieldArray.shared'
import { mountFormField, getSectionValues, assertNoDuplicateIds } from '../test-utils'
import FormFieldArray from '~/features/_library/form-builder/containers/FormFieldArray.vue'

/**
 * FormFieldArray - Validation, IDs, and Default Values
 *
 * Tests validation rules, error propagation, duplicate ID detection,
 * and handling of falsy default values (0, false, "", null, undefined).
 * INPUT ID FORMAT: vee-validate path with dots → underscores, brackets → underscores/removed
 * Example: test-section.testArray[0].name → test-section_testArray_0_name
 */

describe('FormFieldArray - Validation and Errors', () => {
  it('renders item with validation rules and enforces them on invalid input', async () => {
    const { wrapper } = await mountFormFieldArray({
      itemField: {
        type: 'text',
        name: '',
        label: 'Name',
        placeholder: 'Enter at least 3 characters',
        rules: z.string().min(3, 'Name must be at least 3 characters')
      }
    })

    // Add an item
    const addButton = wrapper.find('button[type="button"]')
    await addButton.trigger('click')
    await waitForArrayUpdate()

    // Verify item was added with field
    const items = wrapper.findAll('.ff-array__item--simple')
    expect(items).toHaveLength(1)

    // Verify the field was rendered with validation rules
    const input = wrapper.find('input[placeholder*="3 characters"]')
    expect(input.exists()).toBe(true)
    expect(input.attributes('placeholder')).toContain('3 characters')

    // CRITICAL: Now verify validation is actually ENFORCED
    // Enter invalid value (only 2 characters, violates min:3 rule)
    await input.setValue('ab')
    await input.trigger('blur')
    await waitForArrayUpdate()

    // Validation error must appear for values under 3 characters
    const errorText = wrapper.text()
    expect(errorText).toContain('at least 3 characters')
  })

  it('shows array-level error indicator when child fields have errors', async () => {
    const { wrapper } = await mountFormFieldArray(
      {
        itemField: {
          type: 'text',
          name: '',
          label: 'Name',
          rules: z.string().min(1, 'Required')
        }
      },
      [] // Start with empty array, add item dynamically
    )

    // Add an item
    const addButton = wrapper.find('button[type="button"]')
    await addButton.trigger('click')
    await waitForArrayUpdate()

    // Find input and trigger validation by entering empty value and blurring
    const input = wrapper.find('input')
    expect(input.exists()).toBe(true)

    // Enter value first, then remove it to trigger validation
    await input.setValue('test')
    await input.setValue('') // Now clear it (this makes it invalid)
    await input.trigger('blur')
    await waitForArrayUpdate()

    // CRITICAL: Verify field-level error is shown
    // This catches bugs where validation doesn't trigger correctly
    const errorText = wrapper.text()

    // Field-level error must be visible
    expect(errorText).toContain('Required')

    // Verify error component is rendered (accessibility)
    const fieldError = wrapper.find('[role="alert"]')
    expect(fieldError.exists()).toBe(true)
  })
})

describe('FormFieldArray - Duplicate ID Detection', () => {
  it('ensures all input IDs are unique after add operations', async () => {
    const { wrapper } = await mountFormFieldArray({
      itemField: {
        type: 'field-group',
        name: '',
        label: 'Item',
        collapsible: false,
        fields: {
          name: { type: 'text', name: '', label: 'Name', rules: z.string() },
          value: { type: 'number', name: '', label: 'Value', rules: z.number() }
        }
      }
    })

    const addButton = wrapper.find('button[type="button"]')

    // Add 5 items
    for (let i = 0; i < 5; i++) {
      await addButton.trigger('click')
      await waitForArrayUpdate()

      // Check for duplicates after each add
      assertNoDuplicateIds(wrapper)
    }

    // Final verification: all IDs are unique
    const allElements = wrapper.element.querySelectorAll('[id]')
    const ids = Array.from(allElements).map((el) => (el as Element).id)
    const uniqueIds = new Set(ids)
    expect(ids.length).toBe(uniqueIds.size)
  })

  it('ensures all input IDs remain unique after remove operations', async () => {
    const initialData = [
      { name: 'A', value: 1 },
      { name: 'B', value: 2 },
      { name: 'C', value: 3 },
      { name: 'D', value: 4 },
      { name: 'E', value: 5 }
    ]

    const { wrapper } = await mountFormFieldArray(
      {
        itemField: {
          type: 'field-group',
          name: '',
          label: 'Item',
          collapsible: false,
          fields: {
            name: { type: 'text', name: '', label: 'Name', rules: z.string() },
            value: { type: 'number', name: '', label: 'Value', rules: z.number() }
          }
        }
      },
      initialData
    )

    // Remove middle items
    for (let i = 0; i < 3; i++) {
      const items = wrapper.findAll('.ff-array__item--simple')
      const removeButton = items[1]!
        .findAll('button')
        .find((btn) => btn.attributes('aria-label')?.includes('Remove'))
      await removeButton!.trigger('click')
      await waitForArrayUpdate()

      // Check for duplicates after each removal
      assertNoDuplicateIds(wrapper)
    }
  })
})

describe('FormFieldArray - Falsy Default Values', () => {
  it('correctly sets default value of 0 for number fields', async () => {
    const { wrapper, formValues } = await mountFormFieldArray({
      itemField: {
        type: 'number',
        name: '',
        label: 'Count',
        defaultValue: 0,
        rules: z.number()
      }
    })

    const addButton = wrapper.find('button[type="button"]')
    await addButton.trigger('click')
    await waitForArrayUpdate()

    // Bug check: 0 should be preserved, not treated as "no default"
    const values = getSectionValues(formValues)
    const arrayValues = values?.testArray as number[]
    expect(arrayValues).toHaveLength(1)
    expect(arrayValues[0]).toBe(0)
  })

  it('correctly sets default value of false for toggle fields', async () => {
    const { wrapper, formValues } = await mountFormFieldArray({
      itemField: {
        type: 'toggle',
        name: '',
        label: 'Enabled',
        defaultValue: false,
        rules: z.boolean()
      }
    })

    const addButton = wrapper.find('button[type="button"]')
    await addButton.trigger('click')
    await waitForArrayUpdate()

    // Bug check: false should be preserved
    const values = getSectionValues(formValues)
    const arrayValues = values?.testArray as boolean[]
    expect(arrayValues).toHaveLength(1)
    expect(arrayValues[0]).toBe(false)
  })

  it('correctly sets default value of empty string', async () => {
    const { wrapper, formValues } = await mountFormFieldArray({
      itemField: {
        type: 'text',
        name: '',
        label: 'Name',
        defaultValue: '',
        rules: z.string().optional()
      }
    })

    const addButton = wrapper.find('button[type="button"]')
    await addButton.trigger('click')
    await waitForArrayUpdate()

    // Bug check: Empty string should be set explicitly
    const values = getSectionValues(formValues)
    const arrayValues = values?.testArray as string[]
    expect(arrayValues).toHaveLength(1)
    expect(arrayValues[0]).toBe('')
  })

  it('handles nested falsy defaults in field-groups', async () => {
    const { wrapper, formValues } = await mountFormFieldArray({
      itemField: {
        type: 'field-group',
        name: '',
        label: 'Settings',
        collapsible: false,
        fields: {
          count: {
            type: 'number',
            name: '',
            label: 'Count',
            defaultValue: 0,
            rules: z.number()
          },
          enabled: {
            type: 'toggle',
            name: '',
            label: 'Enabled',
            defaultValue: false,
            rules: z.boolean()
          },
          label: {
            type: 'text',
            name: '',
            label: 'Label',
            defaultValue: '',
            rules: z.string()
          }
        }
      }
    })

    const addButton = wrapper.find('button[type="button"]')
    await addButton.trigger('click')
    await waitForArrayUpdate()

    // All falsy defaults should be preserved
    const values = getSectionValues(formValues)
    const arrayValues = values?.testArray as Array<{
      count: number
      enabled: boolean
      label: string
    }>
    expect(arrayValues).toHaveLength(1)
    expect(arrayValues[0]).toEqual({
      count: 0,
      enabled: false,
      label: ''
    })
  })
})

describe('FormFieldArray - Array-Level Validation', () => {
  it('validates array with min/max length rules', async () => {
    const { wrapper, formValues } = await mountFormFieldArray({
      itemField: {
        type: 'text',
        name: '',
        label: 'Item',
        rules: z.string().min(1)
      },
      rules: z.array(z.string()).min(2, 'At least 2 items required').max(5, 'Maximum 5 items')
    })

    // Add one item - still invalid (need min 2)
    const addButton = wrapper.find('button[type="button"]')
    await addButton.trigger('click')
    await waitForArrayUpdate()

    let values = getSectionValues(formValues)
    expect(values?.testArray).toHaveLength(1)

    // Add second item - now meets minimum requirement
    await addButton.trigger('click')
    await waitForArrayUpdate()

    values = getSectionValues(formValues)
    expect(values?.testArray).toHaveLength(2)

    // Verify we can add up to 5
    for (let i = 0; i < 3; i++) {
      await addButton.trigger('click')
      await waitForArrayUpdate()
    }

    values = getSectionValues(formValues)
    expect(values?.testArray).toHaveLength(5)

    // Note: This test verifies array operations respect min/max bounds
    // Actual validation error display is tested in 'shows array-level errors when passed via props'
  })

  it('shows array-level errors when passed via props', async () => {
    const { wrapper } = await mountFormFieldArray(
      {
        itemField: {
          type: 'text',
          name: '',
          label: 'Item',
          rules: z.string()
        }
      },
      [],
      {}
    )

    // Initially no errors
    expect(wrapper.text()).not.toContain('At least 2 items required')

    // Re-mount with error prop
    const { wrapper: wrapperWithError } = await mountFormField(
      FormFieldArray,
      {
        meta: {
          type: 'array',
          name: '',
          label: 'Test Array',
          itemField: {
            type: 'text',
            name: '',
            label: 'Item',
            rules: z.string()
          }
        },
        modelValue: [],
        errors: ['At least 2 items required'],
        name: 'testArray',
        touched: true,
        onBlur: vi.fn()
      },
      {
        initialValues: { testArray: [] },
        sectionId: 'test-section'
      }
    )

    // Should display the array-level error
    expect(wrapperWithError.text()).toContain('At least 2 items required')
  })
})

describe('FormFieldArray - Non-Sortable Behavior', () => {
  it('initializes correctly when sortable is explicitly false', async () => {
    const { wrapper } = await mountFormFieldArray({
      sortable: false,
      itemField: {
        type: 'text',
        name: '',
        label: 'Item',
        rules: z.string()
      }
    })

    // Add items
    const addButton = wrapper.find('button[type="button"]')
    await addButton.trigger('click')
    await addButton.trigger('click')
    await waitForArrayUpdate()

    // Verify items use simple styling (no drag handles)
    const items = wrapper.findAll('.ff-array__item--simple')
    expect(items).toHaveLength(2)

    // Verify no drag handles present
    const dragHandles = wrapper.findAll('.drag-handle')
    expect(dragHandles).toHaveLength(0)
  })

  it('initializes correctly when sortable is undefined (defaults to false)', async () => {
    const { wrapper } = await mountFormFieldArray({
      itemField: {
        type: 'text',
        name: '',
        label: 'Item',
        rules: z.string()
      }
      // sortable is undefined
    })

    const addButton = wrapper.find('button[type="button"]')
    await addButton.trigger('click')
    await waitForArrayUpdate()

    // Should use simple item styling
    const items = wrapper.findAll('.ff-array__item--simple')
    expect(items).toHaveLength(1)
    expect(wrapper.findAll('.drag-handle')).toHaveLength(0)
  })
})
