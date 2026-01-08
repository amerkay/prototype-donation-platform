import { describe, expect, it } from 'vitest'
import { createDonationCustomFieldsConfigSection } from '~/features/donation-form/custom-fields/forms/donation-custom-fields-config-form'
import type {
  ArrayFieldMeta,
  FieldGroupMeta,
  ArrayItemContext,
  TabsFieldMeta
} from '~/features/form-builder/types'

describe('donation-custom-fields-config-form', () => {
  /**
   * Helper to extract condition field options from a step's fields array
   * Tests which fields are available for use in visibility conditions
   */
  function getConditionFieldOptions(
    fieldsArray: ArrayFieldMeta,
    rootValues: Record<string, unknown>,
    precedingFields: Record<string, unknown>[] = []
  ): Array<{ value: string; label: string }> {
    const itemFieldFn = fieldsArray.itemField as (v: unknown, c: ArrayItemContext) => FieldGroupMeta
    const newItem = itemFieldFn(
      { type: 'text', label: 'Test Field' },
      { index: precedingFields.length, items: precedingFields, root: rootValues }
    )

    // Navigate to the condition field selector to test available fields
    const conditionGroup = newItem.fields?.visibilityConditions as FieldGroupMeta | undefined
    expect(conditionGroup, 'visibilityConditions should exist').toBeDefined()

    const visibleWhen = conditionGroup?.fields?.visibleWhen as FieldGroupMeta | undefined
    expect(visibleWhen, 'visibleWhen should exist').toBeDefined()

    const conditionsArray = visibleWhen?.fields?.conditions as ArrayFieldMeta | undefined
    expect(conditionsArray, 'conditions array should exist').toBeDefined()

    const conditionItemFn = conditionsArray?.itemField as
      | ((v: unknown) => FieldGroupMeta)
      | undefined
    expect(conditionItemFn, 'condition itemField should exist').toBeDefined()

    const conditionItem = conditionItemFn!({})
    expect(conditionItem.fields, 'condition item should have fields').toBeDefined()

    const fieldSelector = conditionItem.fields?.field
    expect(fieldSelector, 'field selector should exist').toBeDefined()
    expect(fieldSelector?.type, 'field selector should be a select').toBe('select')

    return (fieldSelector as { options: Array<{ value: string; label: string }> }).options
  }

  describe('createDonationCustomFieldsConfigSection', () => {
    it('creates Step 2 and Step 3 tabs for custom fields configuration', () => {
      const config = createDonationCustomFieldsConfigSection()

      const tabsField = config.fields.customFieldsTabs as TabsFieldMeta
      expect(tabsField.type).toBe('tabs')
      expect(tabsField.tabs).toHaveLength(2)
      expect(tabsField.tabs[0]?.value).toBe('step2')
      expect(tabsField.tabs[1]?.value).toBe('step3')
    })

    it('restricts context fields to those available at each step', () => {
      const contextSchema = {
        alwaysAvailable: { label: 'Always', type: 'string' as const },
        step2Only: { label: 'Step 2', type: 'string' as const, availableFromStep: 2 },
        step3Only: { label: 'Step 3', type: 'string' as const, availableFromStep: 3 },
        step4Future: { label: 'Step 4', type: 'string' as const, availableFromStep: 4 }
      }

      const config = createDonationCustomFieldsConfigSection(contextSchema)
      const tabsField = config.fields.customFieldsTabs as TabsFieldMeta
      const step2Tabs = tabsField.tabs[0]
      expect(step2Tabs).toBeDefined()

      const step2Fields = step2Tabs!.fields.fields as ArrayFieldMeta

      const fieldOptions = getConditionFieldOptions(step2Fields, {})
      const availableKeys = fieldOptions.map((o) => o.value)

      // Step 2 should see alwaysAvailable and step2Only
      expect(availableKeys).toContain('alwaysAvailable')
      expect(availableKeys).toContain('step2Only')
      // Should NOT see step3Only or step4Future
      expect(availableKeys).not.toContain('step3Only')
      expect(availableKeys).not.toContain('step4Future')
    })

    describe('Cross-Step Field Resolution', () => {
      it('allows Step 3 fields to reference fields defined in Step 2', () => {
        const config = createDonationCustomFieldsConfigSection()
        const tabsField = config.fields.customFieldsTabs as TabsFieldMeta
        const step3Tabs = tabsField.tabs[1]
        expect(step3Tabs).toBeDefined()

        const step3Fields = step3Tabs!.fields.fields as ArrayFieldMeta

        // Mock a root state where Step 2 has a defined field
        const rootValues = {
          customFieldsTabs: {
            step2: {
              fields: [{ id: 'step2_q1', type: 'text', label: 'Question from Step 2' }]
            }
          }
        }

        const fieldOptions = getConditionFieldOptions(step3Fields, rootValues)

        // Find the Step 2 field in options
        const step2Option = fieldOptions.find((o) => o.value === 'step2_q1')

        expect(step2Option).toBeDefined()
        expect(step2Option?.label).toBe('Question from Step 2 (Custom)')
      })

      it('prevents Step 2 from referencing later Step 3 fields', () => {
        const config = createDonationCustomFieldsConfigSection()
        const tabsField = config.fields.customFieldsTabs as TabsFieldMeta
        const step2Tabs = tabsField.tabs[0]
        expect(step2Tabs).toBeDefined()

        const step2Fields = step2Tabs!.fields.fields as ArrayFieldMeta

        // Mock root having Step 3 fields
        const rootValues = {
          customFieldsTabs: {
            step3: {
              fields: [{ id: 'step3_q1', type: 'text', label: 'Question from Step 3' }]
            }
          }
        }

        const fieldOptions = getConditionFieldOptions(step2Fields, rootValues)

        // Step 3 field should NOT be available in Step 2
        expect(fieldOptions.find((o) => o.value === 'step3_q1')).toBeUndefined()
      })

      it('resolves Step 2 fields from nested configuration paths', () => {
        const config = createDonationCustomFieldsConfigSection()
        const tabsField = config.fields.customFieldsTabs as TabsFieldMeta
        const step3Tabs = tabsField.tabs[1]
        expect(step3Tabs).toBeDefined()

        const step3Fields = step3Tabs!.fields.fields as ArrayFieldMeta

        // Test alternative nesting structure
        const rootValues = {
          customFields: {
            customFieldsTabs: {
              step2: {
                fields: [{ id: 'nested_field', type: 'text', label: 'Nested Field' }]
              }
            }
          }
        }

        const fieldOptions = getConditionFieldOptions(step3Fields, rootValues)

        const nestedOption = fieldOptions.find((o) => o.value === 'nested_field')
        expect(nestedOption).toBeDefined()
        expect(nestedOption?.label).toBe('Nested Field (Custom)')
      })

      it('handles missing Step 2 data gracefully', () => {
        const config = createDonationCustomFieldsConfigSection()
        const tabsField = config.fields.customFieldsTabs as TabsFieldMeta
        const step3Tabs = tabsField.tabs[1]
        expect(step3Tabs).toBeDefined()

        const step3Fields = step3Tabs!.fields.fields as ArrayFieldMeta

        // No Step 2 data in root
        const rootValues = {}

        // Should not throw
        expect(() => getConditionFieldOptions(step3Fields, rootValues)).not.toThrow()
      })

      it('combines Step 2 fields with external context schema correctly', () => {
        const contextSchema = {
          systemField: { label: 'System Field', type: 'string' as const }
        }

        const config = createDonationCustomFieldsConfigSection(contextSchema)
        const tabsField = config.fields.customFieldsTabs as TabsFieldMeta
        const step3Tabs = tabsField.tabs[1]
        expect(step3Tabs).toBeDefined()

        const step3Fields = step3Tabs!.fields.fields as ArrayFieldMeta

        const rootValues = {
          customFieldsTabs: {
            step2: {
              fields: [{ id: 'step2_field', type: 'text', label: 'Step 2 Field' }]
            }
          }
        }

        const fieldOptions = getConditionFieldOptions(step3Fields, rootValues)

        // Should have Step 2 field with (Custom)
        const step2Option = fieldOptions.find((o) => o.value === 'step2_field')
        expect(step2Option?.label).toBe('Step 2 Field (Custom)')

        // Should have system field WITHOUT (Custom)
        const systemOption = fieldOptions.find((o) => o.value === 'systemField')
        expect(systemOption?.label).toBe('System Field')
      })
    })
  })
})
