import { describe, expect, it } from 'vitest'
import {
  createCustomFieldsFormSection,
  extractCustomFieldDefaults
} from '~/features/custom-fields/utils'
import type { CustomFieldDefinition } from '~/features/custom-fields/types'

describe('custom-fields utils', () => {
  describe('createCustomFieldsFormSection', () => {
    it('returns FormDef with customFields id and fields map', () => {
      const customFields: CustomFieldDefinition[] = [
        {
          type: 'text',
          id: 'full_name',
          label: 'Full Name',
          optional: false
        }
      ]

      const formDef = createCustomFieldsFormSection(customFields)

      expect(formDef.id).toBe('customFields')
      expect(formDef.fields.full_name).toBeDefined()
      expect(formDef.fields.full_name?.type).toBe('text')
      expect(formDef.fields.full_name?.label).toBe('Full Name')
    })

    it.each([
      {
        type: 'text' as const,
        id: 'email',
        label: 'Email',
        placeholder: 'user@example.com',
        optional: false,
        expectedType: 'text'
      },
      {
        type: 'slider' as const,
        id: 'donation_amount',
        label: 'Donation Amount',
        min: 10,
        max: 1000,
        step: 10,
        prefix: '$',
        expectedType: 'slider'
      },
      {
        type: 'select' as const,
        id: 'country',
        label: 'Country',
        options: ['USA', 'Canada', 'UK'],
        expectedType: 'select'
      },
      {
        type: 'checkbox' as const,
        id: 'interests',
        label: 'Interests',
        options: ['Sports', 'Music', 'Art'],
        expectedType: 'checkbox'
      },
      {
        type: 'radio-group' as const,
        id: 'size',
        label: 'Size',
        options: ['Small', 'Medium', 'Large'],
        expectedType: 'radio-group'
      },
      {
        type: 'number' as const,
        id: 'age',
        label: 'Age',
        min: 0,
        max: 120,
        expectedType: 'number'
      },
      {
        type: 'textarea' as const,
        id: 'message',
        label: 'Message',
        rows: 5,
        expectedType: 'textarea'
      },
      {
        type: 'hidden' as const,
        id: 'utm_source',
        label: 'UTM Source',
        defaultValue: 'newsletter',
        expectedType: 'text'
      }
    ])(
      'transforms $type field to form-builder FieldMeta with type $expectedType',
      (fieldConfig) => {
        const { expectedType, ...customField } = fieldConfig
        const customFields: CustomFieldDefinition[] = [customField as CustomFieldDefinition]

        const formDef = createCustomFieldsFormSection(customFields)
        const field = formDef.fields[customField.id]

        expect(field).toBeDefined()
        expect(field?.type).toBe(expectedType)
        expect(field?.label).toBe(customField.label)
      }
    )

    it('transforms all fields when multiple provided', () => {
      const customFields: CustomFieldDefinition[] = [
        { type: 'text', id: 'name', label: 'Name' },
        { type: 'number', id: 'age', label: 'Age' },
        { type: 'select', id: 'country', label: 'Country', options: ['USA', 'Canada'] }
      ]

      const formDef = createCustomFieldsFormSection(customFields)

      expect(formDef.fields.name?.type).toBe('text')
      expect(formDef.fields.age?.type).toBe('number')
      expect(formDef.fields.country?.type).toBe('select')
    })

    it('returns empty fields map when no fields provided', () => {
      const formDef = createCustomFieldsFormSection([])

      expect(formDef.id).toBe('customFields')
      expect(formDef.fields).toEqual({})
    })
  })

  describe('extractCustomFieldDefaults', () => {
    it.each([
      {
        type: 'text' as const,
        id: 'country',
        label: 'Country',
        defaultValue: 'USA',
        expected: 'USA'
      },
      {
        type: 'slider' as const,
        id: 'amount',
        label: 'Amount',
        min: 0,
        max: 100,
        defaultValue: 50,
        expected: 50
      },
      {
        type: 'select' as const,
        id: 'size',
        label: 'Size',
        options: ['Small', 'Medium', 'Large'],
        defaultValue: 'medium',
        expected: 'medium'
      },
      {
        type: 'checkbox' as const,
        id: 'interests',
        label: 'Interests',
        options: ['Sports', 'Music'],
        defaultValue: [],
        expected: []
      },
      {
        type: 'number' as const,
        id: 'quantity',
        label: 'Quantity',
        defaultValue: 1,
        expected: 1
      },
      {
        type: 'hidden' as const,
        id: 'tracking_id',
        label: 'Tracking ID',
        defaultValue: 'track_123',
        expected: 'track_123'
      }
    ])('returns $expected for $type field with defaultValue', ({ expected, ...fieldConfig }) => {
      const customFields: CustomFieldDefinition[] = [fieldConfig as CustomFieldDefinition]

      const defaults = extractCustomFieldDefaults(customFields)

      expect(defaults[fieldConfig.id]).toEqual(expected)
    })

    it('returns defaults for all fields when multiple provided', () => {
      const customFields: CustomFieldDefinition[] = [
        { type: 'text', id: 'name', label: 'Name', defaultValue: 'John' },
        { type: 'number', id: 'age', label: 'Age', defaultValue: 30 },
        { type: 'slider', id: 'rating', label: 'Rating', min: 1, max: 5, defaultValue: 3 }
      ]

      const defaults = extractCustomFieldDefaults(customFields)

      expect(defaults).toEqual({
        name: 'John',
        age: 30,
        rating: 3
      })
    })

    it('returns empty string for text field without explicit default', () => {
      const customFields: CustomFieldDefinition[] = [
        { type: 'text', id: 'optional_field', label: 'Optional Field' }
      ]

      const defaults = extractCustomFieldDefaults(customFields)

      expect(defaults.optional_field).toBe('')
    })

    it('returns undefined for number field without explicit default', () => {
      const customFields: CustomFieldDefinition[] = [
        { type: 'number', id: 'optional_number', label: 'Optional Number', optional: true }
      ]

      const defaults = extractCustomFieldDefaults(customFields)

      expect(defaults.optional_number).toBeUndefined()
    })

    it('returns empty object when no fields provided', () => {
      const defaults = extractCustomFieldDefaults([])

      expect(defaults).toEqual({})
    })
  })

  describe('integration: createFormSection + extractDefaults', () => {
    it('produces matching keys in FormDef fields and defaults object', () => {
      const customFields: CustomFieldDefinition[] = [
        { type: 'text', id: 'username', label: 'Username', defaultValue: 'user123' },
        { type: 'slider', id: 'amount', label: 'Amount', min: 0, max: 100, defaultValue: 25 },
        {
          type: 'select',
          id: 'country',
          label: 'Country',
          options: ['USA', 'Canada'],
          defaultValue: 'usa'
        }
      ]

      const formDef = createCustomFieldsFormSection(customFields)
      const defaults = extractCustomFieldDefaults(customFields)

      // Both functions should create entries for the same field IDs
      const formKeys = Object.keys(formDef.fields).sort()
      const defaultKeys = Object.keys(defaults).sort()
      expect(formKeys).toEqual(defaultKeys)
    })

    it('ensures FormDef defaultValue matches extracted default', () => {
      const customFields: CustomFieldDefinition[] = [
        { type: 'text', id: 'username', label: 'Username', defaultValue: 'user123' },
        { type: 'slider', id: 'amount', label: 'Amount', min: 0, max: 100, defaultValue: 25 }
      ]

      const formDef = createCustomFieldsFormSection(customFields)
      const defaults = extractCustomFieldDefaults(customFields)

      // Verify that what we extract as a default matches what the form field declares
      expect(formDef.fields.username?.defaultValue).toBe(defaults.username)
      expect(formDef.fields.amount?.defaultValue).toBe(defaults.amount)
    })
  })
})
