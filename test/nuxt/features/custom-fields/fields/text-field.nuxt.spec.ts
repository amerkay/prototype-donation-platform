import { describe, expect, it } from 'vitest'
import type { ZodTypeAny } from 'zod'
import {
  createTextFieldAdminConfig,
  textFieldToFieldMeta,
  getTextFieldDefaultValue,
  type TextFieldConfig
} from '~/features/custom-fields/fields/text-field'
import type { FieldGroupMeta, TextFieldMeta } from '~/features/form-builder/types'

describe('text-field factory', () => {
  describe('createTextFieldAdminConfig', () => {
    it('returns correct admin config structure', () => {
      const adminConfig = createTextFieldAdminConfig()

      expect(adminConfig).toHaveProperty('advancedSettings')
      const advancedSettings = adminConfig.advancedSettings as FieldGroupMeta
      expect(advancedSettings.type).toBe('field-group')
      expect(advancedSettings.fields).toHaveProperty('placeholder')
      expect(advancedSettings.fields).toHaveProperty('maxLength')
      expect(advancedSettings.fields).toHaveProperty('optional')
      expect(advancedSettings.fields).toHaveProperty('defaultValue')
    })

    it('includes validation rules for each field', () => {
      const adminConfig = createTextFieldAdminConfig()
      const advancedSettings = adminConfig.advancedSettings as FieldGroupMeta
      const fields = advancedSettings.fields!

      expect(fields.placeholder?.rules).toBeDefined()
      expect(fields.maxLength?.rules).toBeDefined()
      expect(fields.optional?.rules).toBeDefined()
      expect(fields.defaultValue?.rules).toBeDefined()
    })

    it('sets correct field types in admin config', () => {
      const adminConfig = createTextFieldAdminConfig()
      const advancedSettings = adminConfig.advancedSettings as FieldGroupMeta
      const fields = advancedSettings.fields!

      expect(fields.placeholder?.type).toBe('text')
      expect(fields.maxLength?.type).toBe('number')
      expect(fields.optional?.type).toBe('toggle')
      expect(fields.defaultValue?.type).toBe('text')
    })
  })

  describe('textFieldToFieldMeta', () => {
    it('converts basic config to FieldMeta', () => {
      const config: TextFieldConfig = {
        id: 'username',
        label: 'Username'
      }

      const fieldMeta = textFieldToFieldMeta(config)

      expect(fieldMeta.type).toBe('text')
      expect(fieldMeta.label).toBe('Username')
      expect(fieldMeta.optional).toBe(true)
      expect(fieldMeta.defaultValue).toBe('')
    })

    it('handles optional=false (required field)', () => {
      const config: TextFieldConfig = {
        id: 'email',
        label: 'Email Address',
        optional: false
      }

      const fieldMeta = textFieldToFieldMeta(config)

      expect(fieldMeta.optional).toBe(false)
      expect(fieldMeta.rules).toBeDefined()

      // Verify validation rejects empty string
      const schema = fieldMeta.rules as ZodTypeAny
      const result = schema.safeParse('')
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('required')
      }
    })

    it('handles optional=true (optional field)', () => {
      const config: TextFieldConfig = {
        id: 'nickname',
        label: 'Nickname',
        optional: true
      }

      const fieldMeta = textFieldToFieldMeta(config)

      expect(fieldMeta.optional).toBe(true)

      // Verify validation accepts empty string
      const schema = fieldMeta.rules as ZodTypeAny
      const result = schema.safeParse('')
      expect(result.success).toBe(true)
    })

    it('applies placeholder from config', () => {
      const config: TextFieldConfig = {
        id: 'company',
        label: 'Company Name',
        placeholder: 'Acme Corp'
      }

      const fieldMeta = textFieldToFieldMeta(config) as TextFieldMeta

      expect(fieldMeta.placeholder).toBe('Acme Corp')
    })

    it('applies maxLength from config', () => {
      const config: TextFieldConfig = {
        id: 'zipcode',
        label: 'Zip Code',
        maxLength: 5
      }

      const fieldMeta = textFieldToFieldMeta(config) as TextFieldMeta

      expect(fieldMeta.maxLength).toBe(5)
    })

    it('applies defaultValue from config', () => {
      const config: TextFieldConfig = {
        id: 'country',
        label: 'Country',
        defaultValue: 'USA'
      }

      const fieldMeta = textFieldToFieldMeta(config)

      expect(fieldMeta.defaultValue).toBe('USA')
    })

    it('extracts settings from nested advancedSettings', () => {
      const config = {
        id: 'address',
        label: 'Address',
        advancedSettings: {
          placeholder: 'Enter your address',
          maxLength: 200,
          optional: false,
          defaultValue: '123 Main St'
        }
      } as unknown as TextFieldConfig

      const fieldMeta = textFieldToFieldMeta(config) as TextFieldMeta

      expect(fieldMeta.placeholder).toBe('Enter your address')
      expect(fieldMeta.maxLength).toBe(200)
      expect(fieldMeta.optional).toBe(false)
      expect(fieldMeta.defaultValue).toBe('123 Main St')
    })

    it('prioritizes top-level config over advancedSettings', () => {
      const config = {
        id: 'title',
        label: 'Job Title',
        placeholder: 'Top level',
        optional: false,
        advancedSettings: {
          placeholder: 'Nested',
          optional: true
        }
      } as unknown as TextFieldConfig

      const fieldMeta = textFieldToFieldMeta(config) as TextFieldMeta

      expect(fieldMeta.placeholder).toBe('Top level')
      expect(fieldMeta.optional).toBe(false)
    })

    it('handles missing advancedSettings gracefully', () => {
      const config: TextFieldConfig = {
        id: 'simple',
        label: 'Simple Field'
      }

      const fieldMeta = textFieldToFieldMeta(config)

      expect(fieldMeta.type).toBe('text')
      expect(fieldMeta.label).toBe('Simple Field')
      expect(fieldMeta.optional).toBe(true)
    })

    it('handles empty string values correctly', () => {
      const config: TextFieldConfig = {
        id: 'empty',
        label: 'Empty Field',
        placeholder: '',
        defaultValue: ''
      }

      const fieldMeta = textFieldToFieldMeta(config) as TextFieldMeta

      expect(fieldMeta.placeholder).toBe('')
      expect(fieldMeta.defaultValue).toBe('')
    })

    it('handles special characters in label', () => {
      const config: TextFieldConfig = {
        id: 'special',
        label: 'Field with "quotes" & <tags>',
        optional: false
      }

      const fieldMeta = textFieldToFieldMeta(config)

      expect(fieldMeta.label).toBe('Field with "quotes" & <tags>')

      // Verify validation message preserves special characters in error
      const schema = fieldMeta.rules as ZodTypeAny
      const result = schema.safeParse('')
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('Field with "quotes" & <tags>')
      }
    })

    it('handles unicode characters in label', () => {
      const config: TextFieldConfig = {
        id: 'unicode',
        label: '名前 (Name) 🎉',
        optional: false
      }

      const fieldMeta = textFieldToFieldMeta(config)

      expect(fieldMeta.label).toBe('名前 (Name) 🎉')

      // Verify validation message works with unicode
      const schema = fieldMeta.rules as ZodTypeAny
      const validateResult = schema.safeParse('')
      expect(validateResult.success).toBe(false)
      if (!validateResult.success) {
        expect(validateResult.error.issues[0]?.message).toContain('名前 (Name) 🎉')
      }
    })
  })

  describe('getTextFieldDefaultValue', () => {
    it('returns defaultValue from config', () => {
      const config: TextFieldConfig = {
        id: 'country',
        label: 'Country',
        defaultValue: 'USA'
      }

      const defaultValue = getTextFieldDefaultValue(config)

      expect(defaultValue).toBe('USA')
    })

    it('returns empty string when no defaultValue', () => {
      const config: TextFieldConfig = {
        id: 'empty',
        label: 'Empty Field'
      }

      const defaultValue = getTextFieldDefaultValue(config)

      expect(defaultValue).toBe('')
    })

    it('extracts defaultValue from advancedSettings', () => {
      const config = {
        id: 'nested',
        label: 'Nested Default',
        advancedSettings: {
          defaultValue: 'From nested'
        }
      } as unknown as TextFieldConfig

      const defaultValue = getTextFieldDefaultValue(config)

      expect(defaultValue).toBe('From nested')
    })

    it('prioritizes top-level defaultValue', () => {
      const config = {
        id: 'priority',
        label: 'Priority Test',
        defaultValue: 'Top level',
        advancedSettings: {
          defaultValue: 'Nested'
        }
      } as unknown as TextFieldConfig

      const defaultValue = getTextFieldDefaultValue(config)

      expect(defaultValue).toBe('Top level')
    })

    it('handles empty string as valid defaultValue', () => {
      const config: TextFieldConfig = {
        id: 'explicit-empty',
        label: 'Explicit Empty',
        defaultValue: ''
      }

      const defaultValue = getTextFieldDefaultValue(config)

      expect(defaultValue).toBe('')
    })
  })

  describe('field factory integration', () => {
    it('creates complete field lifecycle', () => {
      // 1. Get admin config
      const adminConfig = createTextFieldAdminConfig()
      expect(adminConfig).toBeDefined()

      // 2. Simulate admin filling out config
      const userConfig: TextFieldConfig = {
        id: 'full_name',
        label: 'Full Name',
        placeholder: 'John Doe',
        maxLength: 100,
        optional: false,
        defaultValue: ''
      }

      // 3. Convert to runtime FieldMeta
      const fieldMeta = textFieldToFieldMeta(userConfig) as TextFieldMeta
      expect(fieldMeta.type).toBe('text')
      expect(fieldMeta.label).toBe('Full Name')
      expect(fieldMeta.placeholder).toBe('John Doe')
      expect(fieldMeta.maxLength).toBe(100)
      expect(fieldMeta.optional).toBe(false)

      // 4. Extract default value
      const defaultValue = getTextFieldDefaultValue(userConfig)
      expect(defaultValue).toBe('')

      // 5. Verify validation works
      const schema = fieldMeta.rules as ZodTypeAny
      expect(schema.safeParse('').success).toBe(false) // required
      expect(schema.safeParse('John').success).toBe(true)
    })
  })
})
