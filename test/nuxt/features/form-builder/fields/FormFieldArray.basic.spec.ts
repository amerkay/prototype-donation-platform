import { describe, it, expect } from 'vitest'
import { mountFormFieldArray } from './FormFieldArray.shared'

/**
 * FormFieldArray - Basic Rendering
 *
 * Tests initial render state, label display, and empty array initialization.
 * Verifies that the component renders correctly with minimal configuration.
 */

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
    const items = wrapper.findAll('[data-array-item]')
    expect(items).toHaveLength(0)
  })
})
