import { describe, it, expect } from 'vitest'
import * as z from 'zod'
import type { DOMWrapper } from '@vue/test-utils'
import { mountFormFieldArray, waitForArrayUpdate } from './FormFieldArray.shared'
import { getSectionValues, assertNoDuplicateIds } from '../test-utils'

/**
 * FormFieldArray - Core Operations
 *
 * Tests add/remove operations, maintains data integrity across operations,
 * button text customization, and edge cases like rapid sequences and many items.
 * Every test verifies BOTH DOM state AND vee-validate form state.
 */

describe('FormFieldArray - Adding Items', () => {
  it('adds new item when add button is clicked', async () => {
    const { wrapper, formValues } = await mountFormFieldArray({
      itemField: {
        type: 'text',
        name: '',
        label: 'Name',
        placeholder: 'Enter name',
        rules: z.string().optional()
      }
    })

    // Initially no items
    let items = wrapper.findAll('.ff-array__item--simple')
    expect(items).toHaveLength(0)

    // Verify initial form state is empty array
    let values = getSectionValues(formValues)
    expect(values?.testArray).toEqual([])

    // Click add button
    const addButton = wrapper.find('button[type="button"]')
    await addButton.trigger('click')
    await waitForArrayUpdate()

    // Verify one item is now rendered
    items = wrapper.findAll('.ff-array__item--simple')
    expect(items).toHaveLength(1)

    // Verify the item contains the expected label and input
    const firstItem = items[0]
    expect(firstItem!.text()).toContain('Name')

    // Verify actual input field was rendered (use id or placeholder, not type)
    const input = wrapper.find('input[placeholder="Enter name"]')
    expect(input.exists()).toBe(true)
    // ID is now sanitized vee path: test-section.testArray[0] → test-section_testArray_0
    expect(input.attributes('id')).toBe('test-section_testArray_0')

    // CRITICAL: Verify form state matches DOM
    values = getSectionValues(formValues)
    expect(values?.testArray).toHaveLength(1)
    expect(Array.isArray(values?.testArray)).toBe(true)

    // Verify no duplicate IDs
    assertNoDuplicateIds(wrapper)
  })

  it('adds item with default values from nested fields', async () => {
    const { wrapper, formValues } = await mountFormFieldArray({
      itemField: {
        type: 'field-group',
        name: '',
        label: 'Item',
        // Non-collapsible so fields are always visible
        collapsible: false,
        fields: {
          name: {
            type: 'text',
            name: '',
            label: 'Name',
            defaultValue: 'Default Name',
            placeholder: 'Enter name',
            rules: z.string()
          },
          count: {
            type: 'number',
            name: '',
            label: 'Count',
            defaultValue: 5,
            rules: z.number()
          }
        }
      }
    })

    // Click add button
    const addButton = wrapper.find('button[type="button"]')
    await addButton.trigger('click')
    await waitForArrayUpdate()

    // Verify item was added
    const items = wrapper.findAll('.ff-array__item--simple')
    expect(items).toHaveLength(1)

    // Verify both fields are rendered (non-collapsible)
    const text = wrapper.text()
    expect(text).toContain('Name')
    expect(text).toContain('Count')

    // Verify actual inputs exist with default values
    // Get the first (and only) array item
    const addedItems = wrapper.findAll('.ff-array__item--simple')
    const firstItem = addedItems[0]!

    // Within that item, find the text input for 'name' field
    // New ID format: test-section.testArray[0].name → test-section_testArray_0_name
    const textInput = firstItem.find('input[id="test-section_testArray_0_name"]')
    expect(textInput.exists()).toBe(true)
    expect((textInput.element as HTMLInputElement).value).toBe('Default Name')

    // Within that item, find the number input for 'count' field (NumberField uses type="text")
    // New ID format: test-section.testArray[0].count → test-section_testArray_0_count
    const numberInput = firstItem.find('input[id="test-section_testArray_0_count"]')
    expect(numberInput.exists()).toBe(true)
    expect((numberInput.element as HTMLInputElement).value).toBe('5')

    // CRITICAL: Verify form state has default values
    const values = getSectionValues(formValues)
    const arrayValues = values?.testArray as Array<{ name: string; count: number }>
    expect(arrayValues).toHaveLength(1)
    expect(arrayValues[0]).toEqual({ name: 'Default Name', count: 5 })

    // Verify no duplicate IDs
    assertNoDuplicateIds(wrapper)
  })

  it('adds multiple items sequentially', async () => {
    const { wrapper, formValues } = await mountFormFieldArray({
      itemField: {
        type: 'text',
        name: '',
        label: 'Item',
        rules: z.string().optional()
      }
    })

    const addButton = wrapper.find('button[type="button"]')

    // Add 3 items
    for (let i = 0; i < 3; i++) {
      await addButton.trigger('click')
      await waitForArrayUpdate()
    }

    // Verify 3 items rendered
    const items = wrapper.findAll('.ff-array__item--simple')
    expect(items).toHaveLength(3)

    // CRITICAL: Verify form state has 3 items
    const values = getSectionValues(formValues)
    expect(values?.testArray).toHaveLength(3)

    // Verify all IDs are unique
    assertNoDuplicateIds(wrapper)
  })
})

describe('FormFieldArray - Removing Items', () => {
  it('removes first item and maintains data integrity for remaining items', async () => {
    // Start with 3 pre-populated items with distinct data
    const initialData = [
      { name: 'Item One', value: 100 },
      { name: 'Item Two', value: 200 },
      { name: 'Item Three', value: 300 }
    ]

    const { wrapper, formValues } = await mountFormFieldArray(
      {
        itemField: {
          type: 'field-group',
          name: '',
          label: 'Item',
          // Non-collapsible so we can access inputs reliably
          collapsible: false,
          fields: {
            name: {
              type: 'text',
              name: '',
              label: 'Name',
              rules: z.string()
            },
            value: {
              type: 'number',
              name: '',
              label: 'Value',
              rules: z.number()
            }
          }
        }
      },
      initialData
    )

    // Verify 3 items are rendered
    let items = wrapper.findAll('.ff-array__item--simple')
    expect(items).toHaveLength(3)

    // Verify initial form state
    let values = getSectionValues(formValues)
    expect(values?.testArray).toHaveLength(3)

    // Verify initial data is correct BEFORE removal
    // IDs are now unique: test-section.testArray[0].name → test-section_testArray_0_name
    const firstItemNameInput = items[0]!.find('input[id="test-section_testArray_0_name"]')
    const firstItemValueInput = items[0]!.find('input[id="test-section_testArray_0_value"]')
    expect((firstItemNameInput.element as HTMLInputElement).value).toBe('Item One')
    expect((firstItemValueInput.element as HTMLInputElement).value).toBe('100')

    // Find and click the remove button for the FIRST item (Item One)
    const firstItem = items[0]
    const removeButton = firstItem!
      .findAll('button')
      .find((btn: DOMWrapper<Element>) => btn.attributes('aria-label')?.includes('Remove'))
    expect(removeButton).toBeDefined()
    await removeButton!.trigger('click')
    await waitForArrayUpdate()

    // Verify only 2 items remain
    items = wrapper.findAll('.ff-array__item--simple')
    expect(items).toHaveLength(2)

    // CRITICAL: Verify form state integrity
    values = getSectionValues(formValues)
    const arrayValues = values?.testArray as Array<{ name: string; value: number }>
    expect(arrayValues).toHaveLength(2)
    expect(arrayValues[0]).toEqual({ name: 'Item Two', value: 200 })
    expect(arrayValues[1]).toEqual({ name: 'Item Three', value: 300 })

    // First remaining item should be "Item Two" with value 200
    // After removal, indices shift: Item Two is now at [0]
    const newFirstItemNameInput = items[0]!.find('input[id="test-section_testArray_0_name"]')
    const newFirstItemValueInput = items[0]!.find('input[id="test-section_testArray_0_value"]')
    expect((newFirstItemNameInput.element as HTMLInputElement).value).toBe('Item Two')
    expect((newFirstItemValueInput.element as HTMLInputElement).value).toBe('200')

    // Second remaining item should be "Item Three" with value 300
    // Item Three is now at [1]
    const newSecondItemNameInput = items[1]!.find('input[id="test-section_testArray_1_name"]')
    const newSecondItemValueInput = items[1]!.find('input[id="test-section_testArray_1_value"]')
    expect((newSecondItemNameInput.element as HTMLInputElement).value).toBe('Item Three')
    expect((newSecondItemValueInput.element as HTMLInputElement).value).toBe('300')

    // Verify no duplicate IDs after removal
    assertNoDuplicateIds(wrapper)
  })

  it('removes middle item and maintains data integrity', async () => {
    const initialData = [
      { name: 'First', value: 1 },
      { name: 'Middle', value: 2 },
      { name: 'Last', value: 3 }
    ]

    const { wrapper, formValues } = await mountFormFieldArray(
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

    // Remove middle item (index 1)
    const items = wrapper.findAll('.ff-array__item--simple')
    const middleItem = items[1]
    const removeButton = middleItem!
      .findAll('button')
      .find((btn: DOMWrapper<Element>) => btn.attributes('aria-label')?.includes('Remove'))
    await removeButton!.trigger('click')
    await waitForArrayUpdate()

    // Verify form state: should have First and Last
    const values = getSectionValues(formValues)
    const arrayValues = values?.testArray as Array<{ name: string; value: number }>
    expect(arrayValues).toHaveLength(2)
    expect(arrayValues[0]).toEqual({ name: 'First', value: 1 })
    expect(arrayValues[1]).toEqual({ name: 'Last', value: 3 })

    assertNoDuplicateIds(wrapper)
  })

  it('removes last item and maintains data integrity', async () => {
    const initialData = [
      { name: 'First', value: 1 },
      { name: 'Second', value: 2 },
      { name: 'Last', value: 3 }
    ]

    const { wrapper, formValues } = await mountFormFieldArray(
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

    // Remove last item
    const items = wrapper.findAll('.ff-array__item--simple')
    const lastItem = items[2]
    const removeButton = lastItem!
      .findAll('button')
      .find((btn: DOMWrapper<Element>) => btn.attributes('aria-label')?.includes('Remove'))
    await removeButton!.trigger('click')
    await waitForArrayUpdate()

    // Verify form state: should have First and Second
    const values = getSectionValues(formValues)
    const arrayValues = values?.testArray as Array<{ name: string; value: number }>
    expect(arrayValues).toHaveLength(2)
    expect(arrayValues[0]).toEqual({ name: 'First', value: 1 })
    expect(arrayValues[1]).toEqual({ name: 'Second', value: 2 })

    assertNoDuplicateIds(wrapper)
  })

  it('removes all items one by one until array is empty', async () => {
    const initialData = ['Item 1', 'Item 2', 'Item 3']

    const { wrapper, formValues } = await mountFormFieldArray(
      {
        itemField: {
          type: 'text',
          name: '',
          label: 'Item',
          rules: z.string()
        }
      },
      initialData
    )

    // Remove all items
    for (let i = 0; i < initialData.length; i++) {
      const items = wrapper.findAll('.ff-array__item--simple')
      const removeButton = items[0]!
        .findAll('button')
        .find((btn: DOMWrapper<Element>) => btn.attributes('aria-label')?.includes('Remove'))
      await removeButton!.trigger('click')
      await waitForArrayUpdate()
    }

    // Verify array is empty
    const items = wrapper.findAll('.ff-array__item--simple')
    expect(items).toHaveLength(0)

    // CRITICAL: Verify form state is empty array (not undefined or null)
    const values = getSectionValues(formValues)
    expect(values?.testArray).toEqual([])
  })
})

describe('FormFieldArray - Custom Button Text', () => {
  it('displays custom add button text', async () => {
    const { wrapper } = await mountFormFieldArray({
      addButtonText: 'Add New Entry',
      itemField: {
        type: 'text',
        name: '',
        label: 'Item',
        rules: z.string()
      }
    })

    const addButton = wrapper.find('button[type="button"]')
    expect(addButton.text()).toContain('Add New Entry')
    expect(addButton.text()).not.toContain('Add Item')
  })

  it('displays custom remove button text', async () => {
    const { wrapper } = await mountFormFieldArray(
      {
        removeButtonText: 'Delete Entry',
        itemField: {
          type: 'text',
          name: '',
          label: 'Item',
          rules: z.string()
        }
      },
      ['Item 1']
    )

    const items = wrapper.findAll('.ff-array__item--simple')
    const removeButton = items[0]!
      .findAll('button')
      .find((btn: DOMWrapper<Element>) => btn.attributes('aria-label')?.includes('Delete'))
    expect(removeButton).toBeDefined()
    expect(removeButton!.attributes('aria-label')).toBe('Delete Entry')
  })
})

describe('FormFieldArray - Edge Cases', () => {
  it('handles rapid add/remove/add sequence', async () => {
    const { wrapper, formValues } = await mountFormFieldArray({
      itemField: {
        type: 'text',
        name: '',
        label: 'Item',
        rules: z.string()
      }
    })

    const addButton = wrapper.find('button[type="button"]')

    // Rapid add
    await addButton.trigger('click')
    await addButton.trigger('click')
    await waitForArrayUpdate()

    let items = wrapper.findAll('.ff-array__item--simple')
    expect(items).toHaveLength(2)

    // Rapid remove
    let removeButton = items[0]!
      .findAll('button')
      .find((btn: DOMWrapper<Element>) => btn.attributes('aria-label')?.includes('Remove'))
    await removeButton!.trigger('click')
    await waitForArrayUpdate()

    items = wrapper.findAll('.ff-array__item--simple')
    removeButton = items[0]!
      .findAll('button')
      .find((btn: DOMWrapper<Element>) => btn.attributes('aria-label')?.includes('Remove'))
    await removeButton!.trigger('click')
    await waitForArrayUpdate()

    items = wrapper.findAll('.ff-array__item--simple')
    expect(items).toHaveLength(0)

    // Add again after empty
    await addButton.trigger('click')
    await waitForArrayUpdate()

    items = wrapper.findAll('.ff-array__item--simple')
    expect(items).toHaveLength(1)

    // Verify form state is consistent
    const values = getSectionValues(formValues)
    expect(values?.testArray).toHaveLength(1)

    // Verify no duplicate IDs
    assertNoDuplicateIds(wrapper)
  })

  it('handles adding many items (10+)', async () => {
    const { wrapper, formValues } = await mountFormFieldArray({
      itemField: {
        type: 'text',
        name: '',
        label: 'Item',
        rules: z.string()
      }
    })

    const addButton = wrapper.find('button[type="button"]')

    // Add 15 items
    for (let i = 0; i < 15; i++) {
      await addButton.trigger('click')
    }
    await waitForArrayUpdate()

    const items = wrapper.findAll('.ff-array__item--simple')
    expect(items).toHaveLength(15)

    // Verify form state
    const values = getSectionValues(formValues)
    expect(values?.testArray).toHaveLength(15)

    // Verify no duplicate IDs with many items
    assertNoDuplicateIds(wrapper)
  })

  it('handles undefined and null values gracefully', async () => {
    const initialData = [undefined, null, '', 'Valid Item']

    const { wrapper, formValues } = await mountFormFieldArray(
      {
        itemField: {
          type: 'text',
          name: '',
          label: 'Item',
          rules: z.string().nullable().optional()
        }
      },
      initialData
    )

    // Should render all items without crashing
    const items = wrapper.findAll('.ff-array__item--simple')
    expect(items).toHaveLength(4)

    // Form state should preserve the data structure
    const values = getSectionValues(formValues)
    expect(values?.testArray).toHaveLength(4)
  })
})
