import { describe, expect, it } from 'vitest'
import {
  createCustomFieldsFormSection,
  extractCustomFieldDefaults
} from '~/features/custom-fields/utils'
import type { CustomFieldDefinition } from '~/features/custom-fields/types'

describe('custom-fields utils', () => {
  describe('createCustomFieldsFormSection', () => {
    it('creates FormDef with correct structure', () => {
      const customFields: CustomFieldDefinition[] = [
        {
          type: 'text',
          id: 'full_name',
          label: 'Full Name',
          optional: false
        }
      ]

      const formDef = createCustomFieldsFormSection(customFields)

      expect(formDef).toHaveProperty('id', 'customFields')
      expect(formDef).toHaveProperty('fields')
      expect(formDef.fields).toHaveProperty('full_name')
    })

    it('converts text field correctly', () => {
      const customFields: CustomFieldDefinition[] = [
        {
          type: 'text',
          id: 'email',
          label: 'Email',
          placeholder: 'user@example.com',
          optional: false
        }
      ]

      const formDef = createCustomFieldsFormSection(customFields)
      const emailField = formDef.fields.email

      expect(emailField).toBeDefined()
      expect(emailField?.type).toBe('text')
      expect(emailField?.label).toBe('Email')
      expect(emailField?.optional).toBe(false)
    })

    it('converts slider field correctly', () => {
      const customFields: CustomFieldDefinition[] = [
        {
          type: 'slider',
          id: 'donation_amount',
          label: 'Donation Amount',
          min: 10,
          max: 1000,
          step: 10,
          prefix: '$'
        }
      ]

      const formDef = createCustomFieldsFormSection(customFields)
      const sliderField = formDef.fields.donation_amount

      expect(sliderField).toBeDefined()
      expect(sliderField?.type).toBe('slider')
      expect(sliderField?.label).toBe('Donation Amount')
    })

    it('converts select field correctly', () => {
      const customFields: CustomFieldDefinition[] = [
        {
          type: 'select',
          id: 'country',
          label: 'Country',
          options: ['USA', 'Canada', 'UK']
        }
      ]

      const formDef = createCustomFieldsFormSection(customFields)
      const selectField = formDef.fields.country

      expect(selectField).toBeDefined()
      expect(selectField?.type).toBe('select')
      expect(selectField?.label).toBe('Country')
    })

    it('converts checkbox field correctly', () => {
      const customFields: CustomFieldDefinition[] = [
        {
          type: 'checkbox',
          id: 'interests',
          label: 'Interests',
          options: ['Sports', 'Music', 'Art']
        }
      ]

      const formDef = createCustomFieldsFormSection(customFields)
      const checkboxField = formDef.fields.interests

      expect(checkboxField).toBeDefined()
      expect(checkboxField?.type).toBe('checkbox')
      expect(checkboxField?.label).toBe('Interests')
    })

    it('converts radio-group field correctly', () => {
      const customFields: CustomFieldDefinition[] = [
        {
          type: 'radio-group',
          id: 'size',
          label: 'Size',
          options: ['Small', 'Medium', 'Large']
        }
      ]

      const formDef = createCustomFieldsFormSection(customFields)
      const radioField = formDef.fields.size

      expect(radioField).toBeDefined()
      expect(radioField?.type).toBe('radio-group')
      expect(radioField?.label).toBe('Size')
    })

    it('converts number field correctly', () => {
      const customFields: CustomFieldDefinition[] = [
        {
          type: 'number',
          id: 'age',
          label: 'Age',
          min: 0,
          max: 120
        }
      ]

      const formDef = createCustomFieldsFormSection(customFields)
      const numberField = formDef.fields.age

      expect(numberField).toBeDefined()
      expect(numberField?.type).toBe('number')
      expect(numberField?.label).toBe('Age')
    })

    it('converts textarea field correctly', () => {
      const customFields: CustomFieldDefinition[] = [
        {
          type: 'textarea',
          id: 'message',
          label: 'Message',
          rows: 5
        }
      ]

      const formDef = createCustomFieldsFormSection(customFields)
      const textareaField = formDef.fields.message

      expect(textareaField).toBeDefined()
      expect(textareaField?.type).toBe('textarea')
      expect(textareaField?.label).toBe('Message')
    })

    it('converts hidden field correctly', () => {
      const customFields: CustomFieldDefinition[] = [
        {
          type: 'hidden',
          id: 'utm_source',
          label: 'UTM Source',
          defaultValue: 'newsletter'
        }
      ]

      const formDef = createCustomFieldsFormSection(customFields)
      const hiddenField = formDef.fields.utm_source

      expect(hiddenField).toBeDefined()
      expect(hiddenField?.type).toBe('text')
      expect(hiddenField?.defaultValue).toBe('newsletter')
    })

    it('handles multiple fields of different types', () => {
      const customFields: CustomFieldDefinition[] = [
        {
          type: 'text',
          id: 'name',
          label: 'Name'
        },
        {
          type: 'number',
          id: 'age',
          label: 'Age'
        },
        {
          type: 'select',
          id: 'country',
          label: 'Country',
          options: ['USA', 'Canada']
        }
      ]

      const formDef = createCustomFieldsFormSection(customFields)

      expect(Object.keys(formDef.fields).length).toBe(3)
      expect(formDef.fields).toHaveProperty('name')
      expect(formDef.fields).toHaveProperty('age')
      expect(formDef.fields).toHaveProperty('country')
    })

    it('handles empty fields array', () => {
      const customFields: CustomFieldDefinition[] = []

      const formDef = createCustomFieldsFormSection(customFields)

      expect(formDef.id).toBe('customFields')
      expect(formDef.fields).toEqual({})
      expect(Object.keys(formDef.fields).length).toBe(0)
    })

    it('preserves field IDs as keys', () => {
      const customFields: CustomFieldDefinition[] = [
        {
          type: 'text',
          id: 'custom_field_123',
          label: 'Custom Field'
        }
      ]

      const formDef = createCustomFieldsFormSection(customFields)

      expect(formDef.fields).toHaveProperty('custom_field_123')
      expect(formDef.fields.custom_field_123).toBeDefined()
    })

    it('handles fields with special characters in IDs', () => {
      const customFields: CustomFieldDefinition[] = [
        {
          type: 'text',
          id: 'field_with_underscore',
          label: 'Field'
        }
      ]

      const formDef = createCustomFieldsFormSection(customFields)

      expect(formDef.fields).toHaveProperty('field_with_underscore')
    })
  })

  describe('extractCustomFieldDefaults', () => {
    it('extracts default values from text fields', () => {
      const customFields: CustomFieldDefinition[] = [
        {
          type: 'text',
          id: 'country',
          label: 'Country',
          defaultValue: 'USA'
        }
      ]

      const defaults = extractCustomFieldDefaults(customFields)

      expect(defaults).toHaveProperty('country', 'USA')
    })

    it('extracts default values from slider fields', () => {
      const customFields: CustomFieldDefinition[] = [
        {
          type: 'slider',
          id: 'amount',
          label: 'Amount',
          min: 0,
          max: 100,
          defaultValue: 50
        }
      ]

      const defaults = extractCustomFieldDefaults(customFields)

      expect(defaults).toHaveProperty('amount', 50)
    })

    it('extracts default values from select fields', () => {
      const customFields: CustomFieldDefinition[] = [
        {
          type: 'select',
          id: 'size',
          label: 'Size',
          options: ['Small', 'Medium', 'Large'],
          defaultValue: 'medium'
        }
      ]

      const defaults = extractCustomFieldDefaults(customFields)

      expect(defaults).toHaveProperty('size', 'medium')
    })

    it('extracts default values from checkbox fields', () => {
      const customFields: CustomFieldDefinition[] = [
        {
          type: 'checkbox',
          id: 'interests',
          label: 'Interests',
          options: ['Sports', 'Music'],
          defaultValue: []
        }
      ]

      const defaults = extractCustomFieldDefaults(customFields)

      expect(defaults).toHaveProperty('interests')
      expect(defaults.interests).toEqual([])
    })

    it('extracts default values from number fields', () => {
      const customFields: CustomFieldDefinition[] = [
        {
          type: 'number',
          id: 'quantity',
          label: 'Quantity',
          defaultValue: 1
        }
      ]

      const defaults = extractCustomFieldDefaults(customFields)

      expect(defaults).toHaveProperty('quantity', 1)
    })

    it('extracts default values from hidden fields', () => {
      const customFields: CustomFieldDefinition[] = [
        {
          type: 'hidden',
          id: 'tracking_id',
          label: 'Tracking ID',
          defaultValue: 'track_123'
        }
      ]

      const defaults = extractCustomFieldDefaults(customFields)

      expect(defaults).toHaveProperty('tracking_id', 'track_123')
    })

    it('extracts default values from multiple fields', () => {
      const customFields: CustomFieldDefinition[] = [
        {
          type: 'text',
          id: 'name',
          label: 'Name',
          defaultValue: 'John'
        },
        {
          type: 'number',
          id: 'age',
          label: 'Age',
          defaultValue: 30
        },
        {
          type: 'slider',
          id: 'rating',
          label: 'Rating',
          min: 1,
          max: 5,
          defaultValue: 3
        }
      ]

      const defaults = extractCustomFieldDefaults(customFields)

      expect(defaults).toEqual({
        name: 'John',
        age: 30,
        rating: 3
      })
    })

    it('handles fields without explicit default values', () => {
      const customFields: CustomFieldDefinition[] = [
        {
          type: 'text',
          id: 'optional_field',
          label: 'Optional Field'
        }
      ]

      const defaults = extractCustomFieldDefaults(customFields)

      expect(defaults).toHaveProperty('optional_field')
      // Text fields default to empty string
      expect(defaults.optional_field).toBe('')
    })

    it('handles empty fields array', () => {
      const customFields: CustomFieldDefinition[] = []

      const defaults = extractCustomFieldDefaults(customFields)

      expect(defaults).toEqual({})
      expect(Object.keys(defaults).length).toBe(0)
    })

    it('returns undefined for number fields without explicit default (distinguishes no-value from zero)', () => {
      const customFields: CustomFieldDefinition[] = [
        {
          type: 'number',
          id: 'optional_number',
          label: 'Optional Number',
          optional: true
        }
      ]

      const defaults = extractCustomFieldDefaults(customFields)

      expect(defaults).toHaveProperty('optional_number')
      // undefined means "no default set" - distinct from defaultValue: 0
      expect(defaults.optional_number).toBeUndefined()
    })

    it('preserves field IDs as object keys', () => {
      const customFields: CustomFieldDefinition[] = [
        {
          type: 'text',
          id: 'custom_key_123',
          label: 'Custom Key',
          defaultValue: 'value'
        }
      ]

      const defaults = extractCustomFieldDefaults(customFields)

      expect(Object.keys(defaults)).toContain('custom_key_123')
    })
  })

  describe('integration: createFormSection + extractDefaults', () => {
    it('creates consistent field structure and defaults', () => {
      const customFields: CustomFieldDefinition[] = [
        {
          type: 'text',
          id: 'username',
          label: 'Username',
          defaultValue: 'user123'
        },
        {
          type: 'slider',
          id: 'amount',
          label: 'Amount',
          min: 0,
          max: 100,
          defaultValue: 25
        },
        {
          type: 'select',
          id: 'country',
          label: 'Country',
          options: ['USA', 'Canada'],
          defaultValue: 'usa'
        }
      ]

      // Create form definition
      const formDef = createCustomFieldsFormSection(customFields)
      expect(Object.keys(formDef.fields).length).toBe(3)

      // Extract defaults
      const defaults = extractCustomFieldDefaults(customFields)
      expect(Object.keys(defaults).length).toBe(3)

      // Verify matching keys
      const formKeys = Object.keys(formDef.fields).sort()
      const defaultKeys = Object.keys(defaults).sort()
      expect(formKeys).toEqual(defaultKeys)

      // Verify field definitions match defaults
      expect(formDef.fields.username?.defaultValue).toBe(defaults.username)
      expect(formDef.fields.amount?.defaultValue).toBe(defaults.amount)
      expect(formDef.fields.country?.defaultValue).toBe(defaults.country)
    })
  })
})
