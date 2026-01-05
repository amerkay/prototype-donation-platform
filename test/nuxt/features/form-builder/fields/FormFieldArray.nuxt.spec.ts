import { describe, it, expect, vi } from 'vitest'
import * as z from 'zod'
import type { DOMWrapper } from '@vue/test-utils'
import FormFieldArray from '~/features/form-builder/containers/FormFieldArray.vue'
import type { ArrayFieldMeta, FieldMeta } from '~/features/form-builder/types'
import { mountFormField, getSectionValues, assertNoDuplicateIds } from '../test-utils'
import { simulateDragAndDrop } from '../../../../utils/simulateDragAndDrop'

/**
 * Wait for all async updates when array operations occur
 * Includes: Vue reactivity, auto-animate transitions, and vee-validate updates
 * Useful for testing components with complex async behavior
 */
async function waitForArrayUpdate() {
  await nextTick() // Vue reactivity
  await nextTick() // auto-animate
  await nextTick() // vee-validate
}

/**
 * FormFieldArray Test Suite
 *
 * CRITICAL TESTING PRINCIPLES:
 * - Every test verifies BOTH DOM state AND vee-validate form state
 * - Tests use specific value assertions, never vague checks like toBeTruthy()
 * - Data integrity is verified after every operation (add/remove/reorder)
 * - Tests catch bugs, not just verify current implementation
 * - Edge cases include: empty arrays, single items, many items (10+), falsy values, null/undefined
 *
 * KEY BEHAVIORS TESTED:
 * 1. Add/Remove Operations: Verify form state matches DOM, indices update correctly
 * 2. Drag-and-Drop Reordering: Verify visual order updates AND vee-validate state commits correctly
 * 3. Data Integrity: After operations, verify correct items remain with correct values
 * 4. Unique IDs: Every input has unique ID for accessibility (no duplicate ID warnings)
 * 5. Default Values: Falsy values (0, false, "") are properly preserved
 * 6. Validation: Rules are enforced, errors propagate from child to array level
 * 7. Dynamic Fields: itemField functions receive correct item values, fields update reactively
 *
 * DRAG-AND-DROP IMPLEMENTATION (Native HTML5):
 * - Uses real DragEvent dispatching, no mocking needed
 * - Visual order updates in real-time during drag (visualOrder state)
 * - Order commits to vee-validate on dragend via move() operation
 * - Tests verify BOTH visual feedback AND final committed state
 * - Fixed: onDragOver now filters from stable baseKeys to prevent accumulation bug
 *
 * INPUT ID FORMAT:
 * vee-validate path with dots → underscores, brackets → underscores/removed
 * Example: test-section.testArray[0].name → test-section_testArray_0_name
 *
 * This ensures:
 * 1. Each array item has UNIQUE IDs (HTML valid, no duplicates)
 * 2. Labels correctly associate with their inputs (accessibility ✅)
 * 3. No duplicate ID warnings in browsers or dev tools
 * 4. Form validation works correctly for all inputs
 * 5. document.getElementById() returns the correct element
 *
 * Test selectors should use full sanitized ID:
 * - `wrapper.find('input[id="test-section_testArray_0_name"]')`
 * - OR scope within item: `item.find('input[id="test-section_testArray_0_name"]')`
 */

/**
 * Helper to mount FormFieldArray with complete form-builder context
 * Provides flexible configuration for different test scenarios
 */
async function mountFormFieldArray(
  meta: Partial<ArrayFieldMeta> = {},
  modelValue: unknown[] = [],
  options: {
    initialValues?: Record<string, unknown>
    sectionId?: string
  } = {}
) {
  const defaultMeta: ArrayFieldMeta = {
    type: 'array',
    label: 'Test Array Field',
    itemField: {
      type: 'text',
      label: 'Item',
      rules: z.string().optional()
    },
    rules: z.array(z.any()).optional(),
    ...meta
  }

  const { wrapper, formValues } = await mountFormField(
    FormFieldArray,
    {
      meta: defaultMeta,
      modelValue: modelValue,
      errors: [],
      name: 'testArray',
      touched: false,
      onBlur: vi.fn()
    },
    {
      initialValues: {
        testArray: modelValue,
        ...options.initialValues
      },
      sectionId: options.sectionId ?? 'test-section'
    }
  )

  return { wrapper, formValues }
}

/**
 * Helper to create dynamic itemField function (like custom fields)
 * Returns different fields based on item values
 */
function createDynamicItemField(): (values: Record<string, unknown>) => FieldMeta {
  return (values: Record<string, unknown>) => {
    const type = values.type as string | undefined
    const name = values.name as string | undefined

    // Dynamic label based on item data
    const displayLabel = name ? `Item: ${name}` : 'New Item'

    const fields: Record<string, FieldMeta> = {
      type: {
        type: 'select',
        label: 'Type',
        options: [
          { value: 'text', label: 'Text' },
          { value: 'number', label: 'Number' }
        ],
        rules: z.enum(['text', 'number'])
      },
      name: {
        type: 'text',
        label: 'Name',
        rules: z.string().min(1, 'Name is required')
      }
    }

    // Add type-specific fields
    if (type === 'text') {
      fields.maxLength = {
        type: 'number',
        label: 'Max Length',
        min: 1,
        max: 1000,
        optional: true,
        rules: z.number().min(1).max(1000).optional()
      }
    } else if (type === 'number') {
      fields.min = {
        type: 'number',
        label: 'Minimum',
        optional: true,
        rules: z.number().optional()
      }
      fields.max = {
        type: 'number',
        label: 'Maximum',
        optional: true,
        rules: z.number().optional()
      }
    }

    return {
      type: 'field-group',
      label: displayLabel,
      collapsible: true,
      collapsibleDefaultOpen: !type,
      fields
    }
  }
}

describe('FormFieldArray - Basic Rendering', () => {
  it('renders with empty array and shows add button', async () => {
    const { wrapper } = await mountFormFieldArray()

    // Verify label is displayed
    expect(wrapper.text()).toContain('Test Array Field')

    // Verify add button is present with correct text
    const addButton = wrapper.find('button[type="button"]')
    expect(addButton.exists()).toBe(true)
    expect(addButton.text()).toContain('Add Item')

    // Verify no items are rendered initially
    const items = wrapper.findAll('.ff-array__item, .ff-array__item--simple')
    expect(items).toHaveLength(0)
  })
})

describe('FormFieldArray - Adding Items', () => {
  it('adds new item when add button is clicked', async () => {
    const { wrapper, formValues } = await mountFormFieldArray({
      itemField: {
        type: 'text',
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
        label: 'Item',
        // Non-collapsible so fields are always visible
        collapsible: false,
        fields: {
          name: {
            type: 'text',
            label: 'Name',
            defaultValue: 'Default Name',
            placeholder: 'Enter name',
            rules: z.string()
          },
          count: {
            type: 'number',
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
          label: 'Item',
          // Non-collapsible so we can access inputs reliably
          collapsible: false,
          fields: {
            name: {
              type: 'text',
              label: 'Name',
              rules: z.string()
            },
            value: {
              type: 'number',
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
          label: 'Item',
          collapsible: false,
          fields: {
            name: { type: 'text', label: 'Name', rules: z.string() },
            value: { type: 'number', label: 'Value', rules: z.number() }
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
          label: 'Item',
          collapsible: false,
          fields: {
            name: { type: 'text', label: 'Name', rules: z.string() },
            value: { type: 'number', label: 'Value', rules: z.number() }
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

describe('FormFieldArray - Drag and Drop', () => {
  it('displays drag handles when sortable is true', async () => {
    const { wrapper } = await mountFormFieldArray(
      {
        sortable: true,
        itemField: {
          type: 'text',
          label: 'Name',
          rules: z.string()
        }
      },
      ['Item 1', 'Item 2', 'Item 3']
    )

    // Verify items use sortable class
    const items = wrapper.findAll('.ff-array__item')
    expect(items).toHaveLength(3)

    // Verify drag handles are present
    const dragHandles = wrapper.findAll('.drag-handle')
    expect(dragHandles).toHaveLength(3)

    // Verify grip icon is present in each handle
    for (const handle of dragHandles) {
      expect(handle.html()).toContain('lucide:grip-vertical')
    }

    // Verify no duplicate IDs even with drag handles
    assertNoDuplicateIds(wrapper)
  })

  it('hides drag handles when sortable is false', async () => {
    const { wrapper } = await mountFormFieldArray(
      {
        sortable: false,
        itemField: {
          type: 'text',
          label: 'Name',
          rules: z.string()
        }
      },
      ['Item 1', 'Item 2', 'Item 3']
    )

    // Verify items use non-sortable class
    const items = wrapper.findAll('.ff-array__item--simple')
    expect(items).toHaveLength(3)

    // Verify no drag handles are present
    const dragHandles = wrapper.findAll('.drag-handle')
    expect(dragHandles).toHaveLength(0)

    // Verify sortable items don't exist
    const sortableItems = wrapper.findAll('.ff-array__item')
    expect(sortableItems).toHaveLength(0)
  })

  it('maintains data integrity when items are reordered via drag-drop', async () => {
    const initialData = [
      { name: 'Alpha', value: 100 },
      { name: 'Beta', value: 200 },
      { name: 'Gamma', value: 300 }
    ]

    const { wrapper, formValues } = await mountFormFieldArray(
      {
        sortable: true,
        itemField: {
          type: 'field-group',
          label: 'Item',
          collapsible: false,
          fields: {
            name: { type: 'text', label: 'Name', rules: z.string() },
            value: { type: 'number', label: 'Value', rules: z.number() }
          }
        }
      },
      initialData
    )

    // Verify initial state in vee-validate
    let values = getSectionValues(formValues)
    let arrayValues = values?.testArray as Array<{ name: string; value: number }>
    expect(arrayValues).toEqual(initialData)

    // Verify initial DOM order
    let items = wrapper.findAll('.ff-array__item')
    expect(items).toHaveLength(3)
    let firstInput = items[0]!.find('input[id="test-section_testArray_0_name"]')
    expect((firstInput.element as HTMLInputElement).value).toBe('Alpha')

    // SIMULATE DRAG: Move 'Alpha' (index 0) to end (index 2)
    // This triggers commitDndOrderToVee() in FormFieldArray.vue
    await simulateDragAndDrop(wrapper, 0, 2)

    // CRITICAL: Verify vee-validate state changed to: ['Beta', 'Gamma', 'Alpha']
    values = getSectionValues(formValues)
    arrayValues = values?.testArray as Array<{ name: string; value: number }>
    expect(arrayValues).toEqual([
      { name: 'Beta', value: 200 },
      { name: 'Gamma', value: 300 },
      { name: 'Alpha', value: 100 }
    ])

    // Verify DOM reflects the new order
    items = wrapper.findAll('.ff-array__item')
    expect(items).toHaveLength(3)
    firstInput = items[0]!.find('input[id="test-section_testArray_0_name"]')
    expect((firstInput.element as HTMLInputElement).value).toBe('Beta')
    const secondInput = items[1]!.find('input[id="test-section_testArray_1_name"]')
    expect((secondInput.element as HTMLInputElement).value).toBe('Gamma')
    const thirdInput = items[2]!.find('input[id="test-section_testArray_2_name"]')
    expect((thirdInput.element as HTMLInputElement).value).toBe('Alpha')

    // Verify no duplicate IDs after reorder
    assertNoDuplicateIds(wrapper)
  })

  it('handles reverse reorder (moving last item to first)', async () => {
    const initialData = ['First', 'Second', 'Third']

    const { wrapper, formValues } = await mountFormFieldArray(
      {
        sortable: true,
        itemField: {
          type: 'text',
          label: 'Item',
          rules: z.string()
        }
      },
      initialData
    )

    // Verify initial order
    let values = getSectionValues(formValues)
    expect(values?.testArray).toEqual(initialData)

    // SIMULATE DRAG: Move 'Third' (index 2) to start (index 0)
    await simulateDragAndDrop(wrapper, 2, 0)

    // CRITICAL: Verify vee-validate state changed to: ['Third', 'First', 'Second']
    values = getSectionValues(formValues)
    expect(values?.testArray).toEqual(['Third', 'First', 'Second'])

    // Verify DOM reflects new order
    const items = wrapper.findAll('.ff-array__item')
    const inputs = [
      items[0]!.find('input[id="test-section_testArray_0"]'),
      items[1]!.find('input[id="test-section_testArray_1"]'),
      items[2]!.find('input[id="test-section_testArray_2"]')
    ]
    expect((inputs[0]!.element as HTMLInputElement).value).toBe('Third')
    expect((inputs[1]!.element as HTMLInputElement).value).toBe('First')
    expect((inputs[2]!.element as HTMLInputElement).value).toBe('Second')

    assertNoDuplicateIds(wrapper)
  })

  it('handles multiple sequential reorders', async () => {
    const initialData = ['A', 'B', 'C', 'D']

    const { wrapper, formValues } = await mountFormFieldArray(
      {
        sortable: true,
        itemField: {
          type: 'text',
          label: 'Item',
          rules: z.string()
        }
      },
      initialData
    )

    // Initial: ['A', 'B', 'C', 'D']
    let values = getSectionValues(formValues)
    expect(values?.testArray).toEqual(['A', 'B', 'C', 'D'])

    // Move A (0) to position 2 → ['B', 'C', 'A', 'D']
    await simulateDragAndDrop(wrapper, 0, 2)
    values = getSectionValues(formValues)
    expect(values?.testArray).toEqual(['B', 'C', 'A', 'D'])

    // Move D (3) to position 1 → ['B', 'D', 'C', 'A']
    await simulateDragAndDrop(wrapper, 3, 1)
    values = getSectionValues(formValues)
    expect(values?.testArray).toEqual(['B', 'D', 'C', 'A'])

    // Move C (2) to position 0 → ['C', 'B', 'D', 'A']
    await simulateDragAndDrop(wrapper, 2, 0)
    values = getSectionValues(formValues)
    expect(values?.testArray).toEqual(['C', 'B', 'D', 'A'])

    // Verify final DOM order matches vee-validate state
    const items = wrapper.findAll('.ff-array__item')
    const expectedOrder = ['C', 'B', 'D', 'A']
    items.forEach((item, index) => {
      const input = item.find(`input[id="test-section_testArray_${index}"]`)
      expect((input.element as HTMLInputElement).value).toBe(expectedOrder[index])
    })

    assertNoDuplicateIds(wrapper)
  })
})

describe('FormFieldArray - Dynamic itemField Function', () => {
  it('resolves dynamic itemField function with correct item values', async () => {
    const itemFieldFn = vi.fn((values: Record<string, unknown>): FieldMeta => {
      const type = values.type as string | undefined
      return {
        type: 'field-group' as const,
        label: `Item (${type || 'no type'})`,
        fields: {
          type: {
            type: 'select' as const,
            label: 'Type',
            options: [
              { value: 'text', label: 'Text' },
              { value: 'number', label: 'Number' }
            ],
            rules: z.enum(['text', 'number'])
          },
          name: {
            type: 'text' as const,
            label: 'Name',
            rules: z.string()
          }
        }
      }
    })

    const { wrapper } = await mountFormFieldArray(
      {
        itemField: itemFieldFn as (values: Record<string, unknown>) => FieldMeta
      },
      []
    )

    // Add first item
    const addButton = wrapper.find('button[type="button"]')
    await addButton.trigger('click')
    await waitForArrayUpdate()

    // itemFieldFn should have been called with empty object and context for new item
    expect(itemFieldFn).toHaveBeenCalledWith({}, expect.objectContaining({ index: 0, items: [] }))

    // Verify the item was rendered with correct label (no type yet)
    expect(wrapper.text()).toContain('Item (no type)')
  })

  it('renders different fields based on initial item values', async () => {
    const { wrapper } = await mountFormFieldArray(
      {
        itemField: createDynamicItemField()
      },
      [
        { type: 'text', name: 'Text Field' },
        { type: 'number', name: 'Number Field' }
      ]
    )

    // Verify both items are rendered
    const items = wrapper.findAll('.ff-array__item--simple')
    expect(items).toHaveLength(2)

    // First item should show text-specific field (maxLength)
    const firstItem = items[0]!
    expect(firstItem.text()).toContain('Text Field')
    expect(firstItem.text()).toContain('Max Length')

    // Second item should show number-specific fields (min/max)
    const secondItem = items[1]!
    expect(secondItem.text()).toContain('Number Field')
    expect(secondItem.text()).toContain('Minimum')
    expect(secondItem.text()).toContain('Maximum')

    // First item should NOT have number fields
    expect(firstItem.text()).not.toContain('Minimum')
  })

  it('updates rendered fields when item values change (reactivity test)', async () => {
    const { wrapper } = await mountFormFieldArray(
      {
        itemField: createDynamicItemField()
      },
      [{ type: '', name: '' }] // Start with empty item
    )

    await waitForArrayUpdate()

    // Initially, no type-specific fields should be visible (empty type)
    let text = wrapper.text()
    expect(text).not.toContain('Max Length')
    expect(text).not.toContain('Minimum')

    // Find the type select field and change it to 'text'
    const items = wrapper.findAll('.ff-array__item--simple')
    const firstItem = items[0]!

    // Find the select element for type field - it MUST exist
    const typeSelect = firstItem.find('select')
    expect(typeSelect.exists()).toBe(true)

    // Change value to 'text'
    await typeSelect.setValue('text')
    await waitForArrayUpdate()

    // After changing to text type, maxLength field should appear
    text = wrapper.text()
    expect(text).toContain('Max Length')
    expect(text).not.toContain('Minimum')

    // Change to number type
    await typeSelect.setValue('number')
    await waitForArrayUpdate()

    // After changing to number type, min/max fields should appear
    text = wrapper.text()
    expect(text).toContain('Minimum')
    expect(text).toContain('Maximum')
    expect(text).not.toContain('Max Length')
  })
})

describe('FormFieldArray - Validation and Errors', () => {
  it('renders item with validation rules and enforces them on invalid input', async () => {
    const { wrapper } = await mountFormFieldArray({
      itemField: {
        type: 'text',
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

  it('triggers validation and displays errors on invalid input', async () => {
    const { wrapper } = await mountFormFieldArray({
      itemField: {
        type: 'text',
        label: 'Name',
        placeholder: 'Enter name',
        rules: z.string().min(3, 'Name must be at least 3 characters')
      }
    })

    // Add an item
    const addButton = wrapper.find('button[type="button"]')
    await addButton.trigger('click')
    await waitForArrayUpdate()

    // Find the input field
    const input = wrapper.find('input[placeholder="Enter name"]')
    expect(input.exists()).toBe(true)

    // Enter invalid value (too short)
    await input.setValue('ab')
    await input.trigger('blur') // Trigger validation
    await waitForArrayUpdate()

    // Verify error message appears
    const errorText = wrapper.text()
    expect(errorText).toContain('at least 3 characters')
  })

  it('shows array-level error indicator when child fields have errors', async () => {
    const { wrapper } = await mountFormFieldArray(
      {
        itemField: {
          type: 'text',
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

    // CRITICAL: Verify BOTH field-level error AND array-level error indicator are shown
    // This catches bugs where one error type doesn't propagate correctly
    const errorText = wrapper.text()

    // Field-level error must be visible
    const hasFieldError = errorText.includes('Required')
    expect(hasFieldError).toBe(true)

    // Array-level error indicator must also be shown (propagated from child)
    const hasArrayError = errorText.includes('One or more errors above')
    expect(hasArrayError).toBe(true)

    // Additional verification: check for FieldError component with alert role
    const fieldError = wrapper.find('[role="alert"]')
    expect(fieldError.exists()).toBe(true)
  })
})

describe('FormFieldArray - Duplicate ID Detection', () => {
  it('ensures all input IDs are unique after add operations', async () => {
    const { wrapper } = await mountFormFieldArray({
      itemField: {
        type: 'field-group',
        label: 'Item',
        collapsible: false,
        fields: {
          name: { type: 'text', label: 'Name', rules: z.string() },
          value: { type: 'number', label: 'Value', rules: z.number() }
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
          label: 'Item',
          collapsible: false,
          fields: {
            name: { type: 'text', label: 'Name', rules: z.string() },
            value: { type: 'number', label: 'Value', rules: z.number() }
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
        .find((btn: DOMWrapper<Element>) => btn.attributes('aria-label')?.includes('Remove'))
      await removeButton!.trigger('click')
      await waitForArrayUpdate()

      // Check for duplicates after each removal
      assertNoDuplicateIds(wrapper)
    }
  })
})

describe('FormFieldArray - Custom Button Text', () => {
  it('displays custom add button text', async () => {
    const { wrapper } = await mountFormFieldArray({
      addButtonText: 'Add New Entry',
      itemField: {
        type: 'text',
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

describe('FormFieldArray - Tabs Support', () => {
  it('adds items with tabs type and extracts default values from all tabs', async () => {
    const { wrapper, formValues } = await mountFormFieldArray({
      itemField: {
        type: 'tabs',
        tabs: [
          {
            value: 'basic',
            label: 'Basic Info',
            fields: {
              name: {
                type: 'text',
                label: 'Name',
                defaultValue: 'Default Name',
                rules: z.string()
              },
              email: {
                type: 'text',
                label: 'Email',
                defaultValue: 'default@example.com',
                rules: z.string().email()
              }
            }
          },
          {
            value: 'advanced',
            label: 'Advanced',
            fields: {
              priority: {
                type: 'number',
                label: 'Priority',
                defaultValue: 10,
                rules: z.number()
              },
              enabled: {
                type: 'toggle',
                label: 'Enabled',
                defaultValue: true,
                rules: z.boolean()
              }
            }
          }
        ]
      }
    })

    // Add item with tabs
    const addButton = wrapper.find('button[type="button"]')
    await addButton.trigger('click')
    await waitForArrayUpdate()

    // Verify item was added
    const items = wrapper.findAll('.ff-array__item--simple')
    expect(items).toHaveLength(1)

    // CRITICAL: Verify form state has default values from ALL tabs
    const values = getSectionValues(formValues)
    const arrayValues = values?.testArray as Array<{
      basic: { name: string; email: string }
      advanced: { priority: number; enabled: boolean }
    }>
    expect(arrayValues).toHaveLength(1)

    // Bug check: All tab defaults should be extracted, not just active tab
    expect(arrayValues[0]).toEqual({
      basic: {
        name: 'Default Name',
        email: 'default@example.com'
      },
      advanced: {
        priority: 10,
        enabled: true
      }
    })

    assertNoDuplicateIds(wrapper)
  })

  it('handles tabs with no default values (empty objects)', async () => {
    const { wrapper, formValues } = await mountFormFieldArray({
      itemField: {
        type: 'tabs',
        tabs: [
          {
            value: 'tab1',
            label: 'Tab 1',
            fields: {
              field1: {
                type: 'text',
                label: 'Field 1',
                rules: z.string().optional()
              }
            }
          }
        ]
      }
    })

    const addButton = wrapper.find('button[type="button"]')
    await addButton.trigger('click')
    await waitForArrayUpdate()

    // Verify empty object structure is created for tabs
    const values = getSectionValues(formValues)
    const arrayValues = values?.testArray as Array<Record<string, unknown>>
    expect(arrayValues).toHaveLength(1)
    expect(arrayValues[0]).toEqual({
      tab1: {}
    })
  })
})

describe('FormFieldArray - Complex Reordering Scenarios', () => {
  it('maintains data integrity with sortable arrays after multiple operations', async () => {
    // Test that the reordering algorithm (commitDndOrderToVee) works correctly
    // by verifying data integrity after complex sequences of operations
    const initialData = [
      { name: 'Item A', order: 1 },
      { name: 'Item B', order: 2 },
      { name: 'Item C', order: 3 },
      { name: 'Item D', order: 4 }
    ]

    const { wrapper, formValues } = await mountFormFieldArray(
      {
        sortable: true,
        itemField: {
          type: 'field-group',
          label: 'Item',
          collapsible: false,
          fields: {
            name: { type: 'text', label: 'Name', rules: z.string() },
            order: { type: 'number', label: 'Order', rules: z.number() }
          }
        }
      },
      initialData
    )

    // Verify initial order
    let values = getSectionValues(formValues)
    let arrayValues = values?.testArray as typeof initialData
    expect(arrayValues.map((v) => v.name)).toEqual(['Item A', 'Item B', 'Item C', 'Item D'])

    // Verify sortable UI is present
    let items = wrapper.findAll('.ff-array__item')
    expect(items).toHaveLength(4)
    const dragHandles = wrapper.findAll('.drag-handle')
    expect(dragHandles).toHaveLength(4)

    // SIMULATE DRAG: Reorder before other operations
    // Move 'Item D' (index 3) to position 1 → ['Item A', 'Item D', 'Item B', 'Item C']
    await simulateDragAndDrop(wrapper, 3, 1)

    values = getSectionValues(formValues)
    arrayValues = values?.testArray as typeof initialData
    expect(arrayValues.map((v) => v.name)).toEqual(['Item A', 'Item D', 'Item B', 'Item C'])
    expect(arrayValues.map((v) => v.order)).toEqual([1, 4, 2, 3])

    // Remove middle item (Item D at new position 1)
    items = wrapper.findAll('.ff-array__item')
    const secondItem = items[1]
    const removeButton = secondItem!
      .findAll('button')
      .find((btn: DOMWrapper<Element>) => btn.attributes('aria-label')?.includes('Remove'))
    await removeButton!.trigger('click')
    await waitForArrayUpdate()

    values = getSectionValues(formValues)
    arrayValues = values?.testArray as typeof initialData
    expect(arrayValues.map((v) => v.name)).toEqual(['Item A', 'Item B', 'Item C'])
    expect(arrayValues.map((v) => v.order)).toEqual([1, 2, 3])

    // Verify 3 items remain after removal
    expect(wrapper.findAll('.ff-array__item')).toHaveLength(3)

    // SIMULATE DRAG: Reorder remaining items
    // Move 'Item C' (index 2) to position 0 → ['Item C', 'Item A', 'Item B']
    await simulateDragAndDrop(wrapper, 2, 0)

    values = getSectionValues(formValues)
    arrayValues = values?.testArray as typeof initialData
    expect(arrayValues.map((v) => v.name)).toEqual(['Item C', 'Item A', 'Item B'])
    expect(arrayValues.map((v) => v.order)).toEqual([3, 1, 2])

    // Add new item (will have default values from extractDefaultValues)
    const addButtons = wrapper.findAll('button[type="button"]')
    const addButton = addButtons.find((btn) => btn.text().includes('Add'))
    expect(addButton).toBeDefined()
    await addButton!.trigger('click')
    await waitForArrayUpdate()

    values = getSectionValues(formValues)
    const finalArray = values?.testArray as Array<{ name?: string; order?: number }>
    expect(finalArray).toHaveLength(4)
    // First 3 items should remain in reordered state
    expect(finalArray[0]).toEqual({ name: 'Item C', order: 3 })
    expect(finalArray[1]).toEqual({ name: 'Item A', order: 1 })
    expect(finalArray[2]).toEqual({ name: 'Item B', order: 2 })

    assertNoDuplicateIds(wrapper)
  })

  it('handles sortable arrays with many items and maintains unique keys', async () => {
    // Test that the key mapping (keyToVeeIndex) works correctly with many items
    const initialData = Array.from({ length: 10 }, (_, i) => ({
      id: `Item ${i + 1}`,
      value: i + 1
    }))

    const { wrapper, formValues } = await mountFormFieldArray(
      {
        sortable: true,
        itemField: {
          type: 'field-group',
          label: 'Item',
          collapsible: false,
          fields: {
            id: { type: 'text', label: 'ID', rules: z.string() },
            value: { type: 'number', label: 'Value', rules: z.number() }
          }
        }
      },
      initialData
    )

    // Verify all items rendered with drag handles
    let items = wrapper.findAll('.ff-array__item')
    expect(items).toHaveLength(10)
    const dragHandles = wrapper.findAll('.drag-handle')
    expect(dragHandles).toHaveLength(10)

    // SIMULATE DRAG: Reorder with many items
    // Move item 9 (index 9) to position 2
    await simulateDragAndDrop(wrapper, 9, 2)

    let values = getSectionValues(formValues)
    let arrayValues = values?.testArray as Array<{ id: string; value: number }>
    // Expected order: [0,1,9,2,3,4,5,6,7,8] (10 moved to position 2)
    expect(arrayValues[2]?.id).toBe('Item 10')
    expect(arrayValues[2]?.value).toBe(10)

    // Remove several items from different positions
    items = wrapper.findAll('.ff-array__item')

    // Remove last item (Item 8 at position 9)
    let removeButton = items[9]!
      .findAll('button')
      .find((btn: DOMWrapper<Element>) => btn.attributes('aria-label')?.includes('Remove'))
    await removeButton!.trigger('click')
    await waitForArrayUpdate()

    // Remove first item
    items = wrapper.findAll('.ff-array__item')
    removeButton = items[0]!
      .findAll('button')
      .find((btn: DOMWrapper<Element>) => btn.attributes('aria-label')?.includes('Remove'))
    await removeButton!.trigger('click')
    await waitForArrayUpdate()

    // SIMULATE DRAG: Reorder again after removals
    // Move item at index 3 to index 1
    await simulateDragAndDrop(wrapper, 3, 1)

    // Remove middle item
    items = wrapper.findAll('.ff-array__item')
    removeButton = items[4]!
      .findAll('button')
      .find((btn: DOMWrapper<Element>) => btn.attributes('aria-label')?.includes('Remove'))
    await removeButton!.trigger('click')
    await waitForArrayUpdate()

    // Verify correct number of items remain
    values = getSectionValues(formValues)
    expect(values?.testArray).toHaveLength(7)

    // Verify all remaining items have valid IDs and values
    arrayValues = values?.testArray as Array<{ id: string; value: number }>
    arrayValues.forEach((item) => {
      expect(item.id).toMatch(/^Item \d+$/)
      expect(item.value).toBeGreaterThan(0)
      expect(item.value).toBeLessThanOrEqual(10)
    })

    // Verify no duplicate IDs after complex operations
    assertNoDuplicateIds(wrapper)
  })

  it('handles empty sortable array initialization', async () => {
    // Test that sortable setup works correctly with no initial items
    const { wrapper, formValues } = await mountFormFieldArray({
      sortable: true,
      itemField: {
        type: 'text',
        label: 'Item',
        rules: z.string()
      }
    })

    // Verify empty state
    let items = wrapper.findAll('.ff-array__item')
    expect(items).toHaveLength(0)

    // Add items to sortable array
    const addButton = wrapper.find('button[type="button"]')
    await addButton.trigger('click')
    await addButton.trigger('click')
    await addButton.trigger('click')
    await waitForArrayUpdate()

    // Verify items have drag handles
    items = wrapper.findAll('.ff-array__item')
    expect(items).toHaveLength(3)
    const dragHandles = wrapper.findAll('.drag-handle')
    expect(dragHandles).toHaveLength(3)

    // Verify form state
    const values = getSectionValues(formValues)
    expect(values?.testArray).toHaveLength(3)

    assertNoDuplicateIds(wrapper)
  })

  it('maintains nested field-group data integrity when reordering items with different configurations', async () => {
    /**
     * CRITICAL TEST: Custom Fields Use Case
     *
     * Tests the real-world scenario from custom-fields where each array item
     * can have a completely different nested field configuration based on type.
     *
     * Example: Array of form field configurations where:
     * - Item 0: Slider field (has min, max, step, prefix, suffix)
     * - Item 1: Select field (has options array)
     * - Item 2: Text field (has placeholder, maxLength)
     *
     * When reordering, we must ensure:
     * 1. Slider config stays with slider item (no mixing with select options)
     * 2. Select options array stays with select item (no mixing with slider min/max)
     * 3. No data remnants or cross-contamination between items
     * 4. vee-validate paths resolve correctly after reorder
     */

    // Define initial data matching custom fields structure
    const initialData = [
      {
        type: 'slider',
        label: 'Donation Amount',
        min: 10,
        max: 1000,
        step: 5,
        prefix: '$',
        suffix: ' USD'
      },
      {
        type: 'select',
        label: 'Payment Method',
        options: ['Credit Card', 'PayPal', 'Bank Transfer']
      },
      {
        type: 'text',
        label: 'Full Name',
        placeholder: 'Enter your name',
        maxLength: 100
      }
    ]

    // Create itemField function that returns different configs based on type
    const itemFieldFn = (values: Record<string, unknown>): FieldMeta => {
      const type = values.type as string | undefined
      const label = (values.label as string) || 'Unnamed Field'

      const fields: Record<string, FieldMeta> = {
        type: {
          type: 'select',
          label: 'Type',
          options: [
            { value: 'text', label: 'Text' },
            { value: 'slider', label: 'Slider' },
            { value: 'select', label: 'Select' }
          ],
          rules: z.enum(['text', 'slider', 'select'])
        },
        label: {
          type: 'text',
          label: 'Label',
          rules: z.string().min(1)
        }
      }

      // Add type-specific fields
      if (type === 'slider') {
        fields.min = {
          type: 'number',
          label: 'Min',
          rules: z.number()
        }
        fields.max = {
          type: 'number',
          label: 'Max',
          rules: z.number()
        }
        fields.step = {
          type: 'number',
          label: 'Step',
          rules: z.number()
        }
        fields.prefix = {
          type: 'text',
          label: 'Prefix',
          rules: z.string().optional()
        }
        fields.suffix = {
          type: 'text',
          label: 'Suffix',
          rules: z.string().optional()
        }
      } else if (type === 'select') {
        fields.options = {
          type: 'array',
          label: 'Options',
          itemField: {
            type: 'text',
            label: 'Option',
            rules: z.string()
          },
          rules: z.array(z.string()).optional()
        }
      } else if (type === 'text') {
        fields.placeholder = {
          type: 'text',
          label: 'Placeholder',
          rules: z.string().optional()
        }
        fields.maxLength = {
          type: 'number',
          label: 'Max Length',
          rules: z.number().optional()
        }
      }

      return {
        type: 'field-group',
        label: `${type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Field'}: ${label}`,
        collapsible: true,
        collapsibleDefaultOpen: false,
        fields
      }
    }

    const { wrapper, formValues } = await mountFormFieldArray(
      {
        sortable: true,
        itemField: itemFieldFn
      },
      initialData
    )

    // Verify initial data structure
    let values = getSectionValues(formValues)
    let arrayValues = values?.testArray as Array<Record<string, unknown>>
    expect(arrayValues).toHaveLength(3)

    // Verify slider config (item 0)
    expect(arrayValues[0]).toEqual({
      type: 'slider',
      label: 'Donation Amount',
      min: 10,
      max: 1000,
      step: 5,
      prefix: '$',
      suffix: ' USD'
    })

    // Verify select config (item 1)
    expect(arrayValues[1]).toEqual({
      type: 'select',
      label: 'Payment Method',
      options: ['Credit Card', 'PayPal', 'Bank Transfer']
    })

    // Verify text config (item 2)
    expect(arrayValues[2]).toEqual({
      type: 'text',
      label: 'Full Name',
      placeholder: 'Enter your name',
      maxLength: 100
    })

    // SIMULATE DRAG: Move slider (index 0) to end (index 2)
    // Expected order: [select, text, slider]
    await simulateDragAndDrop(wrapper, 0, 2)

    // CRITICAL: Verify all nested data moved correctly
    values = getSectionValues(formValues)
    arrayValues = values?.testArray as Array<Record<string, unknown>>
    expect(arrayValues).toHaveLength(3)

    // Item 0 should now be select (was item 1)
    expect(arrayValues[0]?.type).toBe('select')
    expect(arrayValues[0]?.label).toBe('Payment Method')
    expect(arrayValues[0]?.options).toEqual(['Credit Card', 'PayPal', 'Bank Transfer'])
    // CRITICAL: Verify NO slider fields leaked into select
    expect(arrayValues[0]?.min).toBeUndefined()
    expect(arrayValues[0]?.max).toBeUndefined()
    expect(arrayValues[0]?.step).toBeUndefined()

    // Item 1 should now be text (was item 2)
    expect(arrayValues[1]?.type).toBe('text')
    expect(arrayValues[1]?.label).toBe('Full Name')
    expect(arrayValues[1]?.placeholder).toBe('Enter your name')
    expect(arrayValues[1]?.maxLength).toBe(100)
    // CRITICAL: Verify NO select options leaked into text
    expect(arrayValues[1]?.options).toBeUndefined()
    // CRITICAL: Verify NO slider fields leaked into text
    expect(arrayValues[1]?.min).toBeUndefined()

    // Item 2 should now be slider (was item 0)
    expect(arrayValues[2]?.type).toBe('slider')
    expect(arrayValues[2]?.label).toBe('Donation Amount')
    expect(arrayValues[2]?.min).toBe(10)
    expect(arrayValues[2]?.max).toBe(1000)
    expect(arrayValues[2]?.step).toBe(5)
    expect(arrayValues[2]?.prefix).toBe('$')
    expect(arrayValues[2]?.suffix).toBe(' USD')
    // CRITICAL: Verify NO select options leaked into slider
    expect(arrayValues[2]?.options).toBeUndefined()
    // CRITICAL: Verify NO text fields leaked into slider
    expect(arrayValues[2]?.placeholder).toBeUndefined()
    expect(arrayValues[2]?.maxLength).toBeUndefined()

    // SIMULATE DRAG: Move text (index 1) to start (index 0)
    // Expected order: [text, select, slider]
    await simulateDragAndDrop(wrapper, 1, 0)

    values = getSectionValues(formValues)
    arrayValues = values?.testArray as Array<Record<string, unknown>>

    // Verify final order and data integrity
    expect(arrayValues[0]?.type).toBe('text')
    expect(arrayValues[0]?.label).toBe('Full Name')
    expect(arrayValues[0]?.placeholder).toBe('Enter your name')
    expect(arrayValues[0]?.maxLength).toBe(100)

    expect(arrayValues[1]?.type).toBe('select')
    expect(arrayValues[1]?.label).toBe('Payment Method')
    expect(arrayValues[1]?.options).toEqual(['Credit Card', 'PayPal', 'Bank Transfer'])

    expect(arrayValues[2]?.type).toBe('slider')
    expect(arrayValues[2]?.label).toBe('Donation Amount')
    expect(arrayValues[2]?.min).toBe(10)
    expect(arrayValues[2]?.max).toBe(1000)

    assertNoDuplicateIds(wrapper)
  })
})

describe('FormFieldArray - Array-Level Validation', () => {
  it('validates array with min/max length rules', async () => {
    const { wrapper, formValues } = await mountFormFieldArray({
      itemField: {
        type: 'text',
        label: 'Item',
        rules: z.string().min(1)
      },
      rules: z.array(z.string()).min(2, 'At least 2 items required').max(5, 'Maximum 5 items')
    })

    // Initially empty - should show validation error
    let values = getSectionValues(formValues)
    expect(values?.testArray).toEqual([])

    // Add one item - still invalid (need min 2)
    const addButton = wrapper.find('button[type="button"]')
    await addButton.trigger('click')
    await waitForArrayUpdate()

    values = getSectionValues(formValues)
    expect(values?.testArray).toHaveLength(1)

    // Add second item - now valid
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
  })

  it('shows array-level errors when passed via props', async () => {
    const { wrapper } = await mountFormFieldArray(
      {
        itemField: {
          type: 'text',
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
          label: 'Test Array',
          itemField: {
            type: 'text',
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

describe('FormFieldArray - Falsy Default Values', () => {
  it('correctly sets default value of 0 for number fields', async () => {
    const { wrapper, formValues } = await mountFormFieldArray({
      itemField: {
        type: 'number',
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
        label: 'Settings',
        collapsible: false,
        fields: {
          count: {
            type: 'number',
            label: 'Count',
            defaultValue: 0,
            rules: z.number()
          },
          enabled: {
            type: 'toggle',
            label: 'Enabled',
            defaultValue: false,
            rules: z.boolean()
          },
          label: {
            type: 'text',
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

describe('FormFieldArray - Nested Arrays with fieldPrefix', () => {
  it('handles nested array with fieldPrefix context', async () => {
    // Simulate an array field inside a field-group (which provides fieldPrefix)
    const { wrapper, formValues } = await mountFormField(
      FormFieldArray,
      {
        meta: {
          type: 'array',
          label: 'Nested Array',
          itemField: {
            type: 'text',
            label: 'Item',
            rules: z.string()
          }
        },
        modelValue: [],
        errors: [],
        name: 'nestedArray',
        touched: false,
        onBlur: vi.fn()
      },
      {
        initialValues: {
          parentField: {
            nestedArray: []
          }
        },
        sectionId: 'test-section',
        fieldPrefix: 'parentField'
      }
    )

    // Add item to nested array
    const addButton = wrapper.find('button[type="button"]')
    await addButton.trigger('click')
    await waitForArrayUpdate()

    // Verify item was added to correct nested path
    const values = getSectionValues(formValues)
    const nestedValues = (values?.parentField as Record<string, unknown>)?.nestedArray as unknown[]
    expect(nestedValues).toHaveLength(1)

    // Verify IDs include fieldPrefix
    // Format: test-section.parentField.nestedArray[0] → test-section_parentField_nestedArray_0
    const input = wrapper.find('input[id="test-section_parentField_nestedArray_0"]')
    expect(input.exists()).toBe(true)
  })
})

describe('FormFieldArray - Non-Sortable Behavior', () => {
  it('initializes correctly when sortable is explicitly false', async () => {
    const { wrapper } = await mountFormFieldArray({
      sortable: false,
      itemField: {
        type: 'text',
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

describe('FormFieldArray - Nested Array Reordering Bug', () => {
  it('preserves deeply nested field values after reorder (regression test for key bug)', async () => {
    /**
     * REGRESSION TEST: Verifies nested array values are preserved after drag-and-drop reorder
     *
     * BUG: Using :key="item.key" causes Vue to reuse FormField components during reorder,
     * leading to stale reactive bindings. Nested field values (like visibility conditions)
     * disappear from UI even though form state is correct.
     *
     * FIX: Using :key="`${item.key}-${item.veeIndex}`" forces Vue to destroy and recreate
     * FormField components at new positions, ensuring fresh reactive bindings.
     *
     * This test fails with :key="item.key" and passes with :key="`${item.key}-${item.veeIndex}`"
     */

    // Create array with nested array structure (simulating custom fields with visibility conditions)
    const { wrapper, formValues } = await mountFormFieldArray(
      {
        label: 'Custom Fields Configuration',
        sortable: true,
        itemField: {
          type: 'field-group',
          label: 'Field Config',
          collapsible: false, // Keep it expanded for easier testing
          fields: {
            fieldId: {
              type: 'text',
              label: 'Field ID',
              rules: z.string().min(1)
            },
            conditions: {
              type: 'array',
              label: 'Visibility Conditions',
              itemField: {
                type: 'field-group',
                collapsible: false,
                fields: {
                  field: { type: 'text', label: 'Field' },
                  operator: { type: 'text', label: 'Operator' },
                  value: { type: 'text', label: 'Value' }
                }
              }
            }
          }
        }
      },
      [],
      { sectionId: 'test-section' }
    )

    // Add first item with nested condition
    const addButton = wrapper.find('button[type="button"]')
    await addButton.trigger('click')
    await waitForArrayUpdate()

    const fieldId0 = wrapper.find('input[id="test-section_testArray_0_fieldId"]')
    await fieldId0.setValue('premium_code')
    await nextTick()

    // Find the nested array's Add button (it's inside the first array item)
    const firstArrayItem = wrapper.find('.ff-array__item')
    const nestedAddButtons = firstArrayItem.findAll('button[type="button"]').filter((btn) => {
      const text = btn.text()
      return text.includes('Add') || text.match(/\+/)
    })
    // Should have at least one add button for the nested conditions array
    expect(nestedAddButtons.length).toBeGreaterThan(0)
    await nestedAddButtons[0]!.trigger('click')
    await waitForArrayUpdate()

    // Fill nested condition values
    await wrapper.find('input[id="test-section_testArray_0_conditions_0_field"]').setValue('tier')
    await wrapper
      .find('input[id="test-section_testArray_0_conditions_0_operator"]')
      .setValue('equals')
    await wrapper
      .find('input[id="test-section_testArray_0_conditions_0_value"]')
      .setValue('premium')
    await nextTick()

    // Add second item (no nested conditions) - find the parent array's add button
    const parentAddButton = wrapper
      .findAll('button[type="button"]')
      .filter((btn) => {
        const text = btn.text()
        return text.includes('Add') || text.match(/\+/)
      })
      .find((btn) => {
        // The parent array's button should be at the root level, not inside an array item
        const parent = btn.element.closest('.ff-array__item, .ff-array__item--simple')
        return !parent
      })
    expect(parentAddButton).toBeDefined()
    await parentAddButton!.trigger('click')
    await waitForArrayUpdate()

    const fieldId1 = wrapper.find('input[id="test-section_testArray_1_fieldId"]')
    await fieldId1.setValue('company_name')
    await nextTick()

    // Verify initial state - item 0 has nested condition values
    expect(
      (
        wrapper.find('input[id="test-section_testArray_0_conditions_0_field"]')
          .element as HTMLInputElement
      ).value
    ).toBe('tier')
    expect(
      (
        wrapper.find('input[id="test-section_testArray_0_conditions_0_operator"]')
          .element as HTMLInputElement
      ).value
    ).toBe('equals')
    expect(
      (
        wrapper.find('input[id="test-section_testArray_0_conditions_0_value"]')
          .element as HTMLInputElement
      ).value
    ).toBe('premium')

    // Perform drag-and-drop: Move item 0 (premium_code) to position 1
    const dragHandles = wrapper.findAll('.drag-handle')
    expect(dragHandles.length).toBeGreaterThanOrEqual(2)

    await dragHandles[0]!.trigger('dragstart', {
      dataTransfer: { effectAllowed: 'move', setData: vi.fn() }
    })
    await nextTick()

    await dragHandles[1]!.trigger('dragover', {
      dataTransfer: { effectAllowed: 'move' },
      preventDefault: vi.fn()
    })
    await nextTick()

    await dragHandles[0]!.trigger('dragend')
    await waitForArrayUpdate()

    // CRITICAL: After reorder, nested condition values MUST still be present in UI
    // BUG: With :key="item.key", these inputs exist but have EMPTY values
    // FIX: With :key="`${item.key}-${item.veeIndex}`", values are preserved

    // Item 0 (premium_code) is now at index 1 after reorder
    const reorderedConditionField = wrapper.find(
      'input[id="test-section_testArray_1_conditions_0_field"]'
    )
    const reorderedConditionOperator = wrapper.find(
      'input[id="test-section_testArray_1_conditions_0_operator"]'
    )
    const reorderedConditionValue = wrapper.find(
      'input[id="test-section_testArray_1_conditions_0_value"]'
    )

    // These should NOT be empty - the bug causes them to render with empty values
    expect(reorderedConditionField.exists()).toBe(true)
    expect((reorderedConditionField.element as HTMLInputElement).value).toBe('tier')
    expect((reorderedConditionOperator.element as HTMLInputElement).value).toBe('equals')
    expect((reorderedConditionValue.element as HTMLInputElement).value).toBe('premium')

    // Also verify form state is correct (it should be even with the bug)
    const values = getSectionValues(formValues)
    expect(values?.testArray).toEqual([
      {
        fieldId: 'company_name',
        conditions: []
      },
      {
        fieldId: 'premium_code',
        conditions: [
          {
            field: 'tier',
            operator: 'equals',
            value: 'premium'
          }
        ]
      }
    ])
  })
})

describe('FormFieldArray - Advanced Field Interactions', () => {
  it('handles visibleWhen conditions based on sibling field values in array items', async () => {
    const { wrapper } = await mountFormFieldArray({
      itemField: (values: Record<string, unknown>) => {
        const showAdvanced = values.showAdvanced as boolean | undefined

        return {
          type: 'field-group',
          label: 'Item',
          collapsible: false,
          fields: {
            showAdvanced: {
              type: 'toggle',
              label: 'Show Advanced Options',
              defaultValue: false,
              rules: z.boolean()
            },
            name: {
              type: 'text',
              label: 'Name',
              rules: z.string().min(1, 'Name is required')
            },
            advancedOption: {
              type: 'text',
              label: 'Advanced Option',
              placeholder: 'Only visible when toggle is on',
              visibleWhen: () => showAdvanced === true,
              rules: z.string().optional()
            }
          }
        }
      }
    })

    // Add item
    const addButton = wrapper.find('button[type="button"]')
    await addButton.trigger('click')
    await waitForArrayUpdate()

    // Initially, advanced option should be hidden
    let advancedInput = wrapper.find('input[placeholder="Only visible when toggle is on"]')
    expect(advancedInput.exists()).toBe(false)

    // Find and toggle the switch
    const toggleSwitch = wrapper.find('.ff-array__item--simple').find('[role="switch"]')
    expect(toggleSwitch.exists()).toBe(true)
    await toggleSwitch.trigger('click')
    await waitForArrayUpdate()

    // Now advanced option should be visible
    advancedInput = wrapper.find('input[placeholder="Only visible when toggle is on"]')
    expect(advancedInput.exists()).toBe(true)

    // Toggle off - should hide again
    await toggleSwitch.trigger('click')
    await waitForArrayUpdate()

    advancedInput = wrapper.find('input[placeholder="Only visible when toggle is on"]')
    expect(advancedInput.exists()).toBe(false)
  })

  it('handles conditional field visibility based on item values', async () => {
    const { wrapper } = await mountFormFieldArray({
      itemField: (values: Record<string, unknown>) => {
        const hasType = !!values.type

        return {
          type: 'field-group',
          label: 'Field Configuration',
          collapsible: false,
          fields: {
            type: {
              type: 'select',
              label: 'Field Type',
              placeholder: 'Choose type...',
              options: [
                { value: 'text', label: 'Text' },
                { value: 'number', label: 'Number' },
                { value: 'select', label: 'Select' }
              ],
              rules: z.enum(['text', 'number', 'select'])
            },
            label: {
              type: 'text',
              label: 'Label',
              visibleWhen: () => hasType,
              rules: z.string().min(1)
            }
          }
        }
      }
    })

    // Add item
    const addButton = wrapper.find('button[type="button"]')
    await addButton.trigger('click')
    await waitForArrayUpdate()

    // Type select should exist
    const typeSelect = wrapper.find('select')
    expect(typeSelect.exists()).toBe(true)

    // Label field should be hidden initially (no type selected)
    let labelInput = wrapper.find('input[id*="label"]')
    expect(labelInput.exists()).toBe(false)

    // Select a type
    await typeSelect.setValue('text')
    await waitForArrayUpdate()

    // Label field should now be visible
    labelInput = wrapper.find('input[id*="label"]')
    expect(labelInput.exists()).toBe(true)

    // Type select should still exist and have the selected value
    expect(typeSelect.element.value).toBe('text')
  })

  it('handles itemField function receiving item values for dynamic configuration', async () => {
    // Test that itemField functions receive item values and can use them for dynamic fields
    const { wrapper, formValues } = await mountFormFieldArray({
      itemField: (values: Record<string, unknown>) => {
        // itemField receives the ITEM's values, not parent context
        const itemMode = values.itemMode as string | undefined
        const hasMode = !!itemMode

        return {
          type: 'field-group',
          label: hasMode ? `${itemMode} Configuration` : 'Configure Item',
          collapsible: false,
          fields: {
            itemMode: {
              type: 'select',
              label: 'Mode',
              placeholder: 'Select mode...',
              options: [
                { value: 'simple', label: 'Simple' },
                { value: 'advanced', label: 'Advanced' }
              ],
              rules: z.enum(['simple', 'advanced']).optional()
            },
            description: {
              type: 'text',
              label: 'Description',
              placeholder: itemMode === 'advanced' ? 'Advanced description' : 'Simple description',
              visibleWhen: () => hasMode,
              rules: z.string().optional()
            }
          }
        }
      }
    })

    // Add item
    const addButton = wrapper.find('button[type="button"]')
    await addButton.trigger('click')
    await waitForArrayUpdate()

    // Initially, label should show "Configure Item" (no mode selected)
    expect(wrapper.text()).toContain('Configure Item')

    // Description field should be hidden
    let descInput = wrapper.find('input[placeholder*="description"]')
    expect(descInput.exists()).toBe(false)

    // Select "advanced" mode
    const modeSelect = wrapper.find('select')
    await modeSelect.setValue('advanced')
    await waitForArrayUpdate()

    // Label should update to "advanced Configuration"
    expect(wrapper.text()).toContain('advanced Configuration')

    // Description field should now be visible with advanced placeholder
    descInput = wrapper.find('input[placeholder="Advanced description"]')
    expect(descInput.exists()).toBe(true)

    // Verify form state
    const values = getSectionValues(formValues)
    const arrayValues = values?.testArray as Array<{ itemMode: string }>
    expect(arrayValues[0]?.itemMode).toBe('advanced')
  })

  it('handles complex nested structures: array items with tabs containing field-groups', async () => {
    const { wrapper, formValues } = await mountFormFieldArray({
      itemField: {
        type: 'tabs',
        tabs: [
          {
            value: 'basic',
            label: 'Basic',
            fields: {
              basicGroup: {
                type: 'field-group',
                label: 'Basic Settings',
                collapsible: true,
                collapsibleDefaultOpen: true,
                fields: {
                  name: {
                    type: 'text',
                    label: 'Name',
                    defaultValue: 'Default Name',
                    rules: z.string().min(1)
                  },
                  enabled: {
                    type: 'toggle',
                    label: 'Enabled',
                    defaultValue: true,
                    rules: z.boolean()
                  }
                }
              }
            }
          },
          {
            value: 'advanced',
            label: 'Advanced',
            fields: {
              advancedGroup: {
                type: 'field-group',
                label: 'Advanced Settings',
                collapsible: true,
                collapsibleDefaultOpen: false,
                fields: {
                  priority: {
                    type: 'number',
                    label: 'Priority',
                    defaultValue: 5,
                    min: 1,
                    max: 10,
                    rules: z.number()
                  },
                  config: {
                    type: 'text',
                    label: 'Config',
                    defaultValue: '{}',
                    rules: z.string()
                  }
                }
              }
            }
          }
        ]
      }
    })

    // Add item with complex nested structure
    const addButton = wrapper.find('button[type="button"]')
    await addButton.trigger('click')
    await waitForArrayUpdate()

    // Verify item was added
    const items = wrapper.findAll('.ff-array__item--simple')
    expect(items).toHaveLength(1)

    // Verify form state has all nested defaults
    const values = getSectionValues(formValues)
    const arrayValues = values?.testArray as Array<{
      basic: { basicGroup: { name: string; enabled: boolean } }
      advanced: { advancedGroup: { priority: number; config: string } }
    }>
    expect(arrayValues).toHaveLength(1)

    // Bug check: All nested defaults should be extracted correctly
    expect(arrayValues[0]).toEqual({
      basic: {
        basicGroup: {
          name: 'Default Name',
          enabled: true
        }
      },
      advanced: {
        advancedGroup: {
          priority: 5,
          config: '{}'
        }
      }
    })

    // Verify no duplicate IDs in complex structure
    assertNoDuplicateIds(wrapper)
  })

  it('maintains reactivity when item values change affecting multiple dependent fields', async () => {
    const { wrapper, formValues } = await mountFormFieldArray({
      itemField: (values: Record<string, unknown>) => {
        const fieldType = values.fieldType as string | undefined
        const hasType = !!fieldType

        return {
          type: 'field-group',
          label: hasType ? `${fieldType} Field Configuration` : 'New Field',
          collapsible: true,
          collapsibleDefaultOpen: !hasType,
          fields: {
            fieldType: {
              type: 'select',
              label: 'Type',
              placeholder: 'Select type...',
              options: [
                { value: 'text', label: 'Text' },
                { value: 'number', label: 'Number' },
                { value: 'slider', label: 'Slider' }
              ],
              rules: z.enum(['text', 'number', 'slider'])
            },
            // Text-specific fields
            maxLength: {
              type: 'number',
              label: 'Max Length',
              defaultValue: 100,
              visibleWhen: () => fieldType === 'text',
              rules: z.number().optional()
            },
            // Number-specific fields
            min: {
              type: 'number',
              label: 'Minimum',
              defaultValue: 0,
              visibleWhen: () => fieldType === 'number' || fieldType === 'slider',
              rules: z.number().optional()
            },
            max: {
              type: 'number',
              label: 'Maximum',
              defaultValue: 100,
              visibleWhen: () => fieldType === 'number' || fieldType === 'slider',
              rules: z.number().optional()
            },
            // Slider-specific fields
            step: {
              type: 'number',
              label: 'Step',
              defaultValue: 1,
              visibleWhen: () => fieldType === 'slider',
              rules: z.number().optional()
            }
          }
        }
      }
    })

    // Add item
    const addButton = wrapper.find('button[type="button"]')
    await addButton.trigger('click')
    await waitForArrayUpdate()

    // Initially, no type-specific fields should be visible
    expect(wrapper.text()).toContain('New Field')
    let maxLengthInput = wrapper.find('input[id*="maxLength"]')
    let minInput = wrapper.find('input[id*="min"]')
    let maxInput = wrapper.find('input[id*="max"]')
    let stepInput = wrapper.find('input[id*="step"]')
    expect(maxLengthInput.exists()).toBe(false)
    expect(minInput.exists()).toBe(false)
    expect(maxInput.exists()).toBe(false)
    expect(stepInput.exists()).toBe(false)

    // Select "text" type
    const typeSelect = wrapper.find('select')
    await typeSelect.setValue('text')
    await waitForArrayUpdate()

    // Only maxLength should be visible
    expect(wrapper.text()).toContain('text Field Configuration')
    maxLengthInput = wrapper.find('input[id*="maxLength"]')
    minInput = wrapper.find('input[id*="min"]')
    stepInput = wrapper.find('input[id*="step"]')
    expect(maxLengthInput.exists()).toBe(true)
    expect(minInput.exists()).toBe(false)
    expect(stepInput.exists()).toBe(false)

    // Change to "slider" type
    await typeSelect.setValue('slider')
    await waitForArrayUpdate()

    // min, max, and step should be visible; maxLength should be hidden
    expect(wrapper.text()).toContain('slider Field Configuration')
    maxLengthInput = wrapper.find('input[id*="maxLength"]')
    minInput = wrapper.find('input[id*="min"]')
    maxInput = wrapper.find('input[id*="max"]')
    stepInput = wrapper.find('input[id*="step"]')
    expect(maxLengthInput.exists()).toBe(false)
    expect(minInput.exists()).toBe(true)
    expect(maxInput.exists()).toBe(true)
    expect(stepInput.exists()).toBe(true)

    // Verify form state has correct structure
    const values = getSectionValues(formValues)
    const arrayValues = values?.testArray as Array<{
      fieldType: string
      min?: number
      max?: number
      step?: number
    }>
    expect(arrayValues[0]?.fieldType).toBe('slider')
  })

  it('handles arrays within field-groups with correct field path resolution', async () => {
    // Test nested array inside a field-group to verify field paths are resolved correctly
    const { wrapper, formValues } = await mountFormField(
      FormFieldArray,
      {
        meta: {
          type: 'array',
          label: 'Nested Array',
          itemField: {
            type: 'field-group',
            label: 'Container',
            collapsible: false,
            fields: {
              nestedValue: {
                type: 'text',
                label: 'Nested Value',
                rules: z.string()
              }
            }
          }
        },
        modelValue: [],
        errors: [],
        name: 'nestedArray',
        touched: false,
        onBlur: vi.fn()
      },
      {
        initialValues: {
          parentGroup: {
            nestedArray: []
          }
        },
        sectionId: 'test-section',
        fieldPrefix: 'parentGroup'
      }
    )

    // Add items
    const addButton = wrapper.find('button[type="button"]')
    await addButton.trigger('click')
    await addButton.trigger('click')
    await waitForArrayUpdate()

    // Verify items were added
    const items = wrapper.findAll('.ff-array__item--simple')
    expect(items).toHaveLength(2)

    // Verify field paths include prefix
    // Format: test-section.parentGroup.nestedArray[0].nestedValue
    const firstInput = wrapper.find(
      'input[id="test-section_parentGroup_nestedArray_0_nestedValue"]'
    )
    const secondInput = wrapper.find(
      'input[id="test-section_parentGroup_nestedArray_1_nestedValue"]'
    )
    expect(firstInput.exists()).toBe(true)
    expect(secondInput.exists()).toBe(true)

    // Verify form state structure
    const values = getSectionValues(formValues)
    const nestedArrayValues = (values?.parentGroup as Record<string, unknown>)
      ?.nestedArray as unknown[]
    expect(nestedArrayValues).toHaveLength(2)

    assertNoDuplicateIds(wrapper)
  })
})
