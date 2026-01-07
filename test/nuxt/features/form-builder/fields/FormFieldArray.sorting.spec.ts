import { describe, it, expect } from 'vitest'
import * as z from 'zod'
import type { DOMWrapper } from '@vue/test-utils'
import { mountFormFieldArray, waitForArrayUpdate } from './FormFieldArray.shared'
import { getSectionValues, assertNoDuplicateIds } from '../test-utils'
import { simulateDragAndDrop } from '../../../../utils/simulateDragAndDrop'

/**
 * FormFieldArray - Drag and Drop & Reordering
 *
 * Tests drag-drop functionality, verifies visual order updates AND vee-validate state commits.
 * CRITICAL: Every reorder test verifies BOTH visual feedback AND final committed state.
 *
 * DRAG-AND-DROP IMPLEMENTATION (Native HTML5):
 * - Uses real DragEvent dispatching, no mocking needed
 * - Visual order updates in real-time during drag (visualOrder state)
 * - Order commits to vee-validate on dragend via move() operation
 * - Tests verify BOTH visual feedback AND final committed state
 */

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const itemFieldFn = (values: Record<string, unknown>): any => {
      const type = values.type as string | undefined
      const label = (values.label as string) || 'Unnamed Field'

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fields: Record<string, any> = {
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
