/**
 * Condition Operators Tests
 * Tests for slug-aware string comparison in equals/notEquals operators
 */
import { describe, it, expect } from 'vitest'
import { OPERATORS } from '~/features/form-builder/conditions/operators'

describe('Condition Operators - Smart String Comparison', () => {
  describe('equals operator', () => {
    it('matches exact string values', () => {
      expect(OPERATORS.equals('scholarship_fund', 'scholarship_fund')).toBe(true)
      expect(OPERATORS.equals('General Fund', 'General Fund')).toBe(true)
    })

    it('matches slugified values against original labels', () => {
      // User stores "scholarship_fund" but condition checks "Scholarship Fund"
      expect(OPERATORS.equals('scholarship_fund', 'Scholarship Fund')).toBe(true)
      expect(OPERATORS.equals('general_fund', 'General Fund')).toBe(true)
      expect(OPERATORS.equals('building_fund', 'Building Fund')).toBe(true)
      expect(OPERATORS.equals('emergency_relief', 'Emergency Relief')).toBe(true)
    })

    it('matches original labels against slugified values', () => {
      // Reverse: condition has slug, field has label (edge case)
      expect(OPERATORS.equals('Scholarship Fund', 'scholarship_fund')).toBe(true)
      expect(OPERATORS.equals('General Fund', 'general_fund')).toBe(true)
    })

    it('does not match different values', () => {
      expect(OPERATORS.equals('scholarship_fund', 'general_fund')).toBe(false)
      expect(OPERATORS.equals('Scholarship Fund', 'General Fund')).toBe(false)
      expect(OPERATORS.equals('scholarship_fund', 'Building Fund')).toBe(false)
    })

    it('handles empty strings', () => {
      expect(OPERATORS.equals('', '')).toBe(true)
      expect(OPERATORS.equals('', 'value')).toBe(false)
      expect(OPERATORS.equals('value', '')).toBe(false)
    })

    it('handles null and undefined with strict equality', () => {
      expect(OPERATORS.equals(null, null)).toBe(true)
      expect(OPERATORS.equals(undefined, undefined)).toBe(true)
      expect(OPERATORS.equals(null, undefined)).toBe(false)
      expect(OPERATORS.equals(null, 'value')).toBe(false)
    })

    it('uses strict equality for non-string values', () => {
      expect(OPERATORS.equals(10, 10)).toBe(true)
      expect(OPERATORS.equals(10, 20)).toBe(false)
      expect(OPERATORS.equals(true, true)).toBe(true)
      expect(OPERATORS.equals(true, false)).toBe(false)
      expect(OPERATORS.equals(10, '10')).toBe(false) // No type coercion
    })

    it('handles complex slugification cases', () => {
      expect(OPERATORS.equals('hello_world', 'Hello World!')).toBe(true)
      expect(OPERATORS.equals('company_name', 'Company Name')).toBe(true)
      expect(OPERATORS.equals('my_special_value', 'My-Special Value!!')).toBe(true)
    })

    it('handles case-insensitive matching through slugification', () => {
      expect(OPERATORS.equals('scholarship_fund', 'SCHOLARSHIP FUND')).toBe(true)
      expect(OPERATORS.equals('SCHOLARSHIP_FUND', 'scholarship fund')).toBe(true)
    })
  })

  describe('notEquals operator', () => {
    it('returns opposite of equals for exact matches', () => {
      expect(OPERATORS.notEquals('scholarship_fund', 'scholarship_fund')).toBe(false)
      expect(OPERATORS.notEquals('value1', 'value2')).toBe(true)
    })

    it('returns opposite of equals for slug matches', () => {
      expect(OPERATORS.notEquals('scholarship_fund', 'Scholarship Fund')).toBe(false)
      expect(OPERATORS.notEquals('general_fund', 'Building Fund')).toBe(true)
    })

    it('handles non-string values', () => {
      expect(OPERATORS.notEquals(10, 10)).toBe(false)
      expect(OPERATORS.notEquals(10, 20)).toBe(true)
      expect(OPERATORS.notEquals(true, false)).toBe(true)
    })
  })

  describe('real-world scenario: custom field visibility conditions', () => {
    it('evaluates conditions with slugified select field values', () => {
      // Simulate form state where select stores "scholarship_fund"
      const formFieldValue = 'scholarship_fund'

      // Condition checks for original label "Scholarship Fund"
      const conditionValue = 'Scholarship Fund'

      // Should match due to smart slugification
      expect(OPERATORS.equals(formFieldValue, conditionValue)).toBe(true)
    })

    it('works with multiple select options', () => {
      const selectValues = ['general_fund', 'scholarship_fund', 'building_fund', 'emergency_relief']
      const conditionLabels = [
        'General Fund',
        'Scholarship Fund',
        'Building Fund',
        'Emergency Relief'
      ]

      // Each stored value should match its corresponding label
      for (let i = 0; i < selectValues.length; i++) {
        expect(OPERATORS.equals(selectValues[i], conditionLabels[i])).toBe(true)
      }
    })

    it('evaluates in operator with exact values', () => {
      const fieldValue = 'gold'
      const allowedValues = ['silver', 'gold']

      expect(OPERATORS.in(fieldValue, allowedValues)).toBe(true)
      expect(OPERATORS.in('bronze', allowedValues)).toBe(false)
    })

    it('evaluates in operator with slugified values against labels', () => {
      // Field stores slugified value, condition has display labels
      const fieldValue = 'scholarship_fund'
      const allowedLabels = ['Scholarship Fund', 'Building Fund']

      expect(OPERATORS.in(fieldValue, allowedLabels)).toBe(true)
      expect(OPERATORS.in('general_fund', allowedLabels)).toBe(false)
    })

    it('evaluates in operator with label against slugified values', () => {
      // Field has label, condition has slugified values (edge case)
      const fieldValue = 'Scholarship Fund'
      const allowedSlugs = ['scholarship_fund', 'building_fund']

      expect(OPERATORS.in(fieldValue, allowedSlugs)).toBe(true)
      expect(OPERATORS.in('General Fund', allowedSlugs)).toBe(false)
    })

    it('evaluates notIn operator with slugified values', () => {
      const fieldValue = 'general_fund'
      const excludedLabels = ['Scholarship Fund', 'Building Fund']

      expect(OPERATORS.notIn(fieldValue, excludedLabels)).toBe(true)
      expect(OPERATORS.notIn('scholarship_fund', excludedLabels)).toBe(false)
    })
  })
})
