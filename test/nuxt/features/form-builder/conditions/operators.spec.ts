/**
 * Condition Operators Tests
 * Tests behavior of the 10 supported comparison operators
 */
import { describe, it, expect } from 'vitest'
import { OPERATORS } from '~/features/form-builder/conditions/operators'

describe('Condition Operators', () => {
  describe('contains', () => {
    it('finds substring in string', () => {
      expect(OPERATORS.contains('hello world', 'world')).toBe(true)
      expect(OPERATORS.contains('hello world', 'hello')).toBe(true)
      expect(OPERATORS.contains('hello world', 'lo wo')).toBe(true)
    })

    it('returns false when substring not found', () => {
      expect(OPERATORS.contains('hello world', 'xyz')).toBe(false)
      expect(OPERATORS.contains('hello', 'hello world')).toBe(false)
    })

    it('checks array membership', () => {
      expect(OPERATORS.contains(['a', 'b', 'c'], 'b')).toBe(true)
      expect(OPERATORS.contains(['a', 'b', 'c'], 'd')).toBe(false)
      expect(OPERATORS.contains([1, 2, 3], 2)).toBe(true)
    })

    it('returns false for non-string/non-array values', () => {
      expect(OPERATORS.contains(123, '2')).toBe(false)
      expect(OPERATORS.contains(null, 'test')).toBe(false)
      expect(OPERATORS.contains(undefined, 'test')).toBe(false)
    })
  })

  describe('notContains', () => {
    it('returns opposite of contains for strings', () => {
      expect(OPERATORS.notContains('hello world', 'xyz')).toBe(true)
      expect(OPERATORS.notContains('hello world', 'world')).toBe(false)
    })

    it('returns opposite of contains for arrays', () => {
      expect(OPERATORS.notContains(['a', 'b'], 'c')).toBe(true)
      expect(OPERATORS.notContains(['a', 'b'], 'a')).toBe(false)
    })
  })

  describe('greaterOrEqual', () => {
    it('compares numbers correctly', () => {
      expect(OPERATORS.greaterOrEqual(10, 5)).toBe(true)
      expect(OPERATORS.greaterOrEqual(10, 10)).toBe(true)
      expect(OPERATORS.greaterOrEqual(5, 10)).toBe(false)
    })

    it('converts string numbers', () => {
      expect(OPERATORS.greaterOrEqual('10', '5')).toBe(true)
      expect(OPERATORS.greaterOrEqual('10', 5)).toBe(true)
      expect(OPERATORS.greaterOrEqual(10, '5')).toBe(true)
    })

    it('returns false for non-numeric values', () => {
      expect(OPERATORS.greaterOrEqual('abc', 5)).toBe(false)
      expect(OPERATORS.greaterOrEqual(null, 5)).toBe(false)
      expect(OPERATORS.greaterOrEqual(undefined, 5)).toBe(false)
    })
  })

  describe('lessOrEqual', () => {
    it('compares numbers correctly', () => {
      expect(OPERATORS.lessOrEqual(5, 10)).toBe(true)
      expect(OPERATORS.lessOrEqual(10, 10)).toBe(true)
      expect(OPERATORS.lessOrEqual(10, 5)).toBe(false)
    })

    it('converts string numbers', () => {
      expect(OPERATORS.lessOrEqual('5', '10')).toBe(true)
      expect(OPERATORS.lessOrEqual('5', 10)).toBe(true)
      expect(OPERATORS.lessOrEqual(5, '10')).toBe(true)
    })

    it('returns false for non-numeric values', () => {
      expect(OPERATORS.lessOrEqual('abc', 5)).toBe(false)
      expect(OPERATORS.lessOrEqual(null, 5)).toBe(false)
    })
  })

  describe('empty', () => {
    it('identifies empty values', () => {
      expect(OPERATORS.empty(null, undefined)).toBe(true)
      expect(OPERATORS.empty(undefined, undefined)).toBe(true)
      expect(OPERATORS.empty('', undefined)).toBe(true)
      expect(OPERATORS.empty([], undefined)).toBe(true)
      expect(OPERATORS.empty({}, undefined)).toBe(true)
    })

    it('identifies non-empty values', () => {
      expect(OPERATORS.empty('text', undefined)).toBe(false)
      expect(OPERATORS.empty(0, undefined)).toBe(false)
      expect(OPERATORS.empty(false, undefined)).toBe(false)
      expect(OPERATORS.empty([1], undefined)).toBe(false)
      expect(OPERATORS.empty({ key: 'value' }, undefined)).toBe(false)
    })
  })

  describe('notEmpty', () => {
    it('returns opposite of empty', () => {
      expect(OPERATORS.notEmpty('', undefined)).toBe(false)
      expect(OPERATORS.notEmpty('text', undefined)).toBe(true)
      expect(OPERATORS.notEmpty(null, undefined)).toBe(false)
      expect(OPERATORS.notEmpty(0, undefined)).toBe(true)
      expect(OPERATORS.notEmpty([], undefined)).toBe(false)
      expect(OPERATORS.notEmpty([1], undefined)).toBe(true)
    })
  })

  describe('isTrue', () => {
    it('checks for true boolean value', () => {
      expect(OPERATORS.isTrue(true, undefined)).toBe(true)
      expect(OPERATORS.isTrue(false, undefined)).toBe(false)
    })

    it('does not coerce truthy values', () => {
      expect(OPERATORS.isTrue(1, undefined)).toBe(false)
      expect(OPERATORS.isTrue('true', undefined)).toBe(false)
      expect(OPERATORS.isTrue('yes', undefined)).toBe(false)
      expect(OPERATORS.isTrue([], undefined)).toBe(false)
    })
  })

  describe('isFalse', () => {
    it('checks for false boolean value', () => {
      expect(OPERATORS.isFalse(false, undefined)).toBe(true)
      expect(OPERATORS.isFalse(true, undefined)).toBe(false)
    })

    it('does not coerce falsy values', () => {
      expect(OPERATORS.isFalse(0, undefined)).toBe(false)
      expect(OPERATORS.isFalse('', undefined)).toBe(false)
      expect(OPERATORS.isFalse(null, undefined)).toBe(false)
      expect(OPERATORS.isFalse(undefined, undefined)).toBe(false)
    })
  })

  describe('in', () => {
    it('checks if value is in array', () => {
      expect(OPERATORS.in('gold', ['silver', 'gold', 'bronze'])).toBe(true)
      expect(OPERATORS.in('platinum', ['silver', 'gold'])).toBe(false)
    })

    it('works with numbers', () => {
      expect(OPERATORS.in(2, [1, 2, 3])).toBe(true)
      expect(OPERATORS.in(5, [1, 2, 3])).toBe(false)
    })

    it('uses strict equality', () => {
      expect(OPERATORS.in('2', [1, 2, 3])).toBe(false)
      expect(OPERATORS.in(2, ['1', '2', '3'])).toBe(false)
    })

    it('returns false for non-array condition', () => {
      expect(OPERATORS.in('value', 'not-an-array')).toBe(false)
      expect(OPERATORS.in('value', null)).toBe(false)
      expect(OPERATORS.in('value', undefined)).toBe(false)
    })
  })

  describe('notIn', () => {
    it('returns opposite of in', () => {
      expect(OPERATORS.notIn('gold', ['silver', 'bronze'])).toBe(true)
      expect(OPERATORS.notIn('gold', ['silver', 'gold', 'bronze'])).toBe(false)
    })

    it('handles edge cases', () => {
      expect(OPERATORS.notIn('value', [])).toBe(true)
      expect(OPERATORS.notIn('value', 'not-array')).toBe(true)
    })
  })

  describe('real-world scenarios', () => {
    it('validates donation amount threshold', () => {
      const donationAmount = 100
      expect(OPERATORS.greaterOrEqual(donationAmount, 50)).toBe(true)
      expect(OPERATORS.greaterOrEqual(donationAmount, 150)).toBe(false)
    })

    it('checks if donation frequency is in allowed list', () => {
      const frequency = 'monthly'
      expect(OPERATORS.in(frequency, ['monthly', 'yearly'])).toBe(true)
      expect(OPERATORS.in(frequency, ['once', 'yearly'])).toBe(false)
    })

    it('validates required fields are not empty', () => {
      expect(OPERATORS.notEmpty('John Doe', undefined)).toBe(true)
      expect(OPERATORS.notEmpty('', undefined)).toBe(false)
      expect(OPERATORS.notEmpty(null, undefined)).toBe(false)
    })

    it('checks boolean flags', () => {
      const giftAidConsent = true
      expect(OPERATORS.isTrue(giftAidConsent, undefined)).toBe(true)
      expect(OPERATORS.isFalse(giftAidConsent, undefined)).toBe(false)
    })

    it('filters by message content', () => {
      const message = 'In memory of John Smith'
      expect(OPERATORS.contains(message, 'memory')).toBe(true)
      expect(OPERATORS.notContains(message, 'honor')).toBe(true)
    })
  })
})
