import { describe, it, expect, vi } from 'vitest'
import { nextTick } from 'vue'
import * as z from 'zod'
import { mountFormFieldArray, waitForArrayUpdate } from './FormFieldArray.shared'
import { mountFormField, getSectionValues, assertNoDuplicateIds } from '../test-utils'
import FormFieldArray from '~/features/form-builder/containers/FormFieldArray.vue'

/**
 * FormFieldArray - Regression Tests & Advanced Scenarios
 *
 * Tests for known bugs, edge cases, deeply nested structures, and scenarios
 * that commonly cause issues in production (nested arrays, field prefix, key bugs).
 */

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
    const conditionField0 = wrapper.find('input[id="test-section_testArray_0_conditions_0_field"]')
    const conditionOperator0 = wrapper.find(
      'input[id="test-section_testArray_0_conditions_0_operator"]'
    )
    const conditionValue0 = wrapper.find('input[id="test-section_testArray_0_conditions_0_value"]')
    await conditionField0.setValue('tier')
    await conditionOperator0.setValue('equals')
    await conditionValue0.setValue('premium')
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
    expect((conditionField0.element as HTMLInputElement).value).toBe('tier')
    expect((conditionOperator0.element as HTMLInputElement).value).toBe('equals')
    expect((conditionValue0.element as HTMLInputElement).value).toBe('premium')

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

describe('FormFieldArray - Advanced Field Interactions (Continued)', () => {
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

  it('enforces single-open accordion behavior in array items with collapsible field-groups', async () => {
    /**
     * Tests that FormFieldArray provides accordion group context for child field-groups,
     * ensuring only one accordion can be open at a time (single-select behavior).
     * Validates the shared accordion state management via useAccordionGroup composable.
     */
    const { wrapper } = await mountFormFieldArray(
      {
        sortable: false,
        itemField: {
          type: 'field-group',
          label: 'Item Settings',
          collapsible: true,
          collapsibleDefaultOpen: false,
          fields: {
            name: {
              type: 'text',
              label: 'Name',
              rules: z.string().min(1)
            },
            description: {
              type: 'textarea',
              label: 'Description',
              optional: true
            }
          }
        }
      },
      [
        { name: 'First', description: 'First item' },
        { name: 'Second', description: 'Second item' },
        { name: 'Third', description: 'Third item' }
      ]
    )

    await waitForArrayUpdate()

    // Find all accordion triggers
    const accordionTriggers = wrapper.findAll('[data-slot="accordion-trigger"]')
    expect(accordionTriggers).toHaveLength(3)

    // Initially all should be closed
    let openItems = wrapper.findAll('[data-slot="accordion-item"][data-state="open"]')
    expect(openItems).toHaveLength(0)

    // Click first accordion trigger to open it
    await accordionTriggers[0]!.trigger('click')
    await waitForArrayUpdate()

    // First should be open
    openItems = wrapper.findAll('[data-slot="accordion-item"][data-state="open"]')
    expect(openItems).toHaveLength(1)
    const firstInput = wrapper.find('input[id="test-section_testArray_0_name"]')
    expect(firstInput.exists()).toBe(true)
    expect(firstInput.isVisible()).toBe(true)

    // Click second accordion trigger
    await accordionTriggers[1]!.trigger('click')
    await waitForArrayUpdate()

    // Now only second should be open (first should auto-close)
    openItems = wrapper.findAll('[data-slot="accordion-item"][data-state="open"]')
    expect(openItems).toHaveLength(1)

    // Verify second input is visible in the open accordion
    const secondInput = wrapper.find('input[id="test-section_testArray_1_name"]')
    expect(secondInput.exists()).toBe(true)
    expect(secondInput.isVisible()).toBe(true)

    // Click third accordion trigger
    await accordionTriggers[2]!.trigger('click')
    await waitForArrayUpdate()

    // Now only third should be open
    openItems = wrapper.findAll('[data-slot="accordion-item"][data-state="open"]')
    expect(openItems).toHaveLength(1)

    const thirdInput = wrapper.find('input[id="test-section_testArray_2_name"]')
    expect(thirdInput.exists()).toBe(true)
    expect(thirdInput.isVisible()).toBe(true)

    // Click the same accordion again to close it
    await accordionTriggers[2]!.trigger('click')
    await waitForArrayUpdate()

    // All should be closed again
    openItems = wrapper.findAll('[data-slot="accordion-item"][data-state="open"]')
    expect(openItems).toHaveLength(0)
  })
})
