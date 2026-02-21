import { describe, it, expect } from 'vitest'
import * as z from 'zod'
import {
  mountFormFieldArray,
  createDynamicItemField,
  waitForArrayUpdate
} from './FormFieldArray.shared'
import { getSectionValues, assertNoDuplicateIds } from '../test-utils'

/**
 * FormFieldArray - Dynamic Features & Advanced Interactions
 *
 * Tests dynamic itemField functions, tabs support, visibility conditions,
 * reactive field updates based on item values, and complex field interactions.
 */

describe('FormFieldArray - Dynamic itemField Function', () => {
  it('resolves dynamic itemField function with correct item values', async () => {
    const { wrapper } = await mountFormFieldArray(
      {
        itemField: createDynamicItemField()
      },
      []
    )

    // Add first item
    const addButton = wrapper.find('button[type="button"]')
    await addButton.trigger('click')
    await waitForArrayUpdate()

    // Verify the item was rendered (collapsed by default since type is empty)
    // The label shows "Item: " part from createDynamicItemField
    const text = wrapper.text()
    expect(text).toContain('Item')
    expect(text).toContain('Type') // The type select field should be visible
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
    const items = wrapper.findAll('[data-array-item]')
    expect(items).toHaveLength(2)

    // Items have collapsibleDefaultOpen: !type, so they start collapsed
    // since type is set. With unmount-on-hide="true", content is not rendered
    // until accordion is opened. Verify the accordions exist with correct labels.
    const firstItem = items[0]!
    const secondItem = items[1]!
    expect(firstItem.text()).toContain('Text Field')
    expect(secondItem.text()).toContain('Number Field')

    // Open first accordion to verify text-specific fields
    const accordionTriggers = wrapper.findAll('[data-slot="accordion-trigger"]')
    await accordionTriggers[0]!.trigger('click')
    await waitForArrayUpdate()

    // First item should now show text-specific field (maxLength)
    expect(firstItem.text()).toContain('Max Length')
    expect(firstItem.text()).not.toContain('Minimum')

    // Open second accordion to verify number-specific fields
    await accordionTriggers[1]!.trigger('click')
    await waitForArrayUpdate()

    // Second item should show number-specific fields (min/max)
    expect(secondItem.text()).toContain('Minimum')
    expect(secondItem.text()).toContain('Maximum')
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
    const items = wrapper.findAll('[data-array-item]')
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

describe('FormFieldArray - Tabs Support', () => {
  it('adds items with tabs type and extracts default values from all tabs', async () => {
    const { wrapper, formValues } = await mountFormFieldArray({
      itemField: {
        type: 'tabs',
        name: '',
        tabs: [
          {
            value: 'basic',
            label: 'Basic Info',
            fields: {
              name: {
                type: 'text',
                name: '',
                label: 'Name',
                defaultValue: 'Default Name',
                rules: z.string()
              },
              email: {
                type: 'text',
                name: '',
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
                name: '',
                label: 'Priority',
                defaultValue: 10,
                rules: z.number()
              },
              enabled: {
                type: 'toggle',
                name: '',
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
    const items = wrapper.findAll('[data-array-item]')
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
        name: '',
        tabs: [
          {
            value: 'tab1',
            label: 'Tab 1',
            fields: {
              field1: {
                type: 'text',
                name: '',
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

describe('FormFieldArray - Advanced Field Interactions', () => {
  it('handles visibleWhen conditions based on sibling field values in array items', async () => {
    const { wrapper } = await mountFormFieldArray({
      itemField: (values: Record<string, unknown>) => {
        const showAdvanced = values.showAdvanced as boolean | undefined

        return {
          type: 'field-group',
          name: '',
          label: 'Item',
          collapsible: false,
          fields: {
            showAdvanced: {
              type: 'toggle',
              name: '',
              label: 'Show Advanced Options',
              defaultValue: false,
              rules: z.boolean()
            },
            name: {
              type: 'text',
              name: '',
              label: 'Name',
              rules: z.string().min(1, 'Name is required')
            },
            advancedOption: {
              type: 'text',
              name: '',
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
    const toggleSwitch = wrapper.find('[data-array-item]').find('[role="switch"]')
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
          name: '',
          label: 'Field Configuration',
          collapsible: false,
          fields: {
            type: {
              type: 'select',
              name: '',
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
              name: '',
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
          name: '',
          label: hasMode ? `${itemMode} Configuration` : 'Configure Item',
          collapsible: false,
          fields: {
            itemMode: {
              type: 'select',
              name: '',
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
              name: '',
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
        name: '',
        tabs: [
          {
            value: 'basic',
            label: 'Basic',
            fields: {
              basicGroup: {
                type: 'field-group',
                name: '',
                label: 'Basic Settings',
                collapsible: true,
                collapsibleDefaultOpen: true,
                fields: {
                  name: {
                    type: 'text',
                    name: '',
                    label: 'Name',
                    defaultValue: 'Default Name',
                    rules: z.string().min(1)
                  },
                  enabled: {
                    type: 'toggle',
                    name: '',
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
                name: '',
                label: 'Advanced Settings',
                collapsible: true,
                collapsibleDefaultOpen: false,
                fields: {
                  priority: {
                    type: 'number',
                    name: '',
                    label: 'Priority',
                    defaultValue: 5,
                    min: 1,
                    max: 10,
                    rules: z.number()
                  },
                  config: {
                    type: 'text',
                    name: '',
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
    const items = wrapper.findAll('[data-array-item]')
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
          name: '',
          label: hasType ? `${fieldType} Field Configuration` : 'New Field',
          collapsible: true,
          collapsibleDefaultOpen: !hasType,
          fields: {
            fieldType: {
              type: 'select',
              name: '',
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
              name: '',
              label: 'Max Length',
              defaultValue: 100,
              visibleWhen: () => fieldType === 'text',
              rules: z.number().optional()
            },
            // Number-specific fields
            min: {
              type: 'number',
              name: '',
              label: 'Minimum',
              defaultValue: 0,
              visibleWhen: () => fieldType === 'number' || fieldType === 'slider',
              rules: z.number().optional()
            },
            max: {
              type: 'number',
              name: '',
              label: 'Maximum',
              defaultValue: 100,
              visibleWhen: () => fieldType === 'number' || fieldType === 'slider',
              rules: z.number().optional()
            },
            // Slider-specific fields
            step: {
              type: 'number',
              name: '',
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
})
