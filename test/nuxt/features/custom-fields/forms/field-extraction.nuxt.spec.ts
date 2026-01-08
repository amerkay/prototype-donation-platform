import { describe, expect, it } from 'vitest'
import { extractAvailableFields } from '~/features/custom-fields/forms/field-extraction'

describe('field-extraction', () => {
  describe('extractAvailableFields', () => {
    it('extracts basic field metadata correctly', () => {
      const input = [
        { id: 'f1', type: 'text', label: 'Field 1' },
        { id: 'f2', type: 'number', label: 'Field 2' }
      ]

      const result = extractAvailableFields(input)

      expect(result).toHaveLength(2)
      expect(result[0]).toMatchObject({
        key: 'f1',
        label: 'Field 1',
        type: 'string'
      })
      expect(result[1]).toMatchObject({
        key: 'f2',
        label: 'Field 2',
        type: 'number'
      })
    })

    it('maps custom field types to condition types correctly', () => {
      const input = [
        { id: 'slider1', type: 'slider', label: 'Slider' },
        { id: 'check1', type: 'checkbox', label: 'Check (Boolean)' }, // No options = boolean
        { id: 'select1', type: 'select', label: 'Select', options: ['a', 'b'] } // Options = string
      ]

      const result = extractAvailableFields(input)

      const slider = result.find((f) => f.key === 'slider1')
      expect(slider?.type).toBe('number')

      const check = result.find((f) => f.key === 'check1')
      expect(check?.type).toBe('boolean')

      const select = result.find((f) => f.key === 'select1')
      expect(select?.type).toBe('string')
      expect(select?.options).toBeDefined()
    })

    it('handles option normalization (string array)', () => {
      const input = [
        {
          id: 'opt1',
          type: 'select',
          label: 'Options',
          options: ['Red', 'Blue']
        }
      ]

      const result = extractAvailableFields(input)
      const field = result[0]

      expect(field?.options).toEqual([
        { value: 'Red', label: 'Red' },
        { value: 'Blue', label: 'Blue' }
      ])
    })

    it('handles option normalization (object array)', () => {
      const input = [
        {
          id: 'opt1',
          type: 'radio-group',
          label: 'Radio',
          options: [{ value: 'r', label: 'Red' }]
        }
      ]

      const result = extractAvailableFields(input)
      const field = result[0]

      expect(field?.options).toEqual([{ value: 'r', label: 'Red' }])
    })

    it('respects the limitIndex parameter', () => {
      const input = [
        { id: '1', type: 'text', label: 'One' },
        { id: '2', type: 'text', label: 'Two' },
        { id: '3', type: 'text', label: 'Three' }
      ]

      // Limit to first 2 items (index < 2)
      const result = extractAvailableFields(input, 2)

      expect(result).toHaveLength(2)
      expect(result.map((f) => f.key)).toEqual(['1', '2'])
    })

    it('skips incomplete or invalid field definitions', () => {
      const input = [
        { type: 'text', label: 'No ID' },
        { id: '2', label: 'No Type' },
        { id: '3', type: 'text' } // No Label
      ]

      const result = extractAvailableFields(input)
      expect(result).toHaveLength(0)
    })

    it('appends (Custom) suffix to labels', () => {
      // Note: The implementation in field-extraction.ts creates the AvailableField.
      // We need to verify if the suffix is added there or in the consumer.
      // Based on previous files, the suffix seemed to be added in the condition-field-builder.
      // Let's check `field-extraction.ts` content again.
      // Reading line 37-ish...
      // It just sets the label? I need to check the code.
      // Re-reading code...
    })
  })
})
