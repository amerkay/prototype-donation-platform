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

    it('returns empty array when limitIndex is 0', () => {
      const input = [
        { id: '1', type: 'text', label: 'One' },
        { id: '2', type: 'text', label: 'Two' }
      ]

      const result = extractAvailableFields(input, 0)

      expect(result).toHaveLength(0)
    })

    it('returns empty array when input is empty', () => {
      const result = extractAvailableFields([])

      expect(result).toHaveLength(0)
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

    it('sets group property to "Form Fields" for all fields', () => {
      const input = [
        { id: 'f1', type: 'text', label: 'Field 1' },
        { id: 'f2', type: 'number', label: 'Field 2' }
      ]

      const result = extractAvailableFields(input)

      expect(result.every((f) => f.group === 'Form Fields')).toBe(true)
    })

    it('handles checkbox without options as boolean type', () => {
      const input = [{ id: 'cb1', type: 'checkbox', label: 'Agree' }]

      const result = extractAvailableFields(input)

      expect(result[0]?.type).toBe('boolean')
      expect(result[0]?.options).toBeUndefined()
    })

    it('handles checkbox with options as string type with options', () => {
      const input = [
        {
          id: 'cb1',
          type: 'checkbox',
          label: 'Multi',
          options: ['A', 'B']
        }
      ]

      const result = extractAvailableFields(input)

      expect(result[0]?.type).toBe('string')
      expect(result[0]?.options).toEqual([
        { value: 'A', label: 'A' },
        { value: 'B', label: 'B' }
      ])
    })
  })
})
