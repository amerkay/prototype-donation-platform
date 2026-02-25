import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import { currencyField, numberField } from '~/features/_library/form-builder/api/defineForm'

/**
 * Tests that currencyField() and numberField() inject default Zod validation rules
 * so non-numeric input is rejected even when the caller provides no explicit rules.
 */
describe('currencyField default validation', () => {
  it('rejects non-numeric input with a readable message', () => {
    const field = currencyField('amount', { label: 'Amount' })
    const result = (field.rules as z.ZodTypeAny).safeParse('abc')
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error.issues[0]?.message).toBe('Must be a number')
  })

  it('rejects negative values (min 0)', () => {
    const field = currencyField('amount', { label: 'Amount' })
    const result = (field.rules as z.ZodTypeAny).safeParse(-1)
    expect(result.success).toBe(false)
  })

  it('accepts zero', () => {
    const field = currencyField('amount', { label: 'Amount' })
    expect((field.rules as z.ZodTypeAny).safeParse(0).success).toBe(true)
  })

  it('accepts positive values', () => {
    const field = currencyField('amount', { label: 'Amount' })
    expect((field.rules as z.ZodTypeAny).safeParse(50).success).toBe(true)
  })

  it('uses caller-provided rules when explicitly set (override wins)', () => {
    const field = currencyField('amount', {
      label: 'Amount',
      rules: z.number({ invalid_type_error: 'Custom error' }).min(10)
    })
    // Below custom min → fails
    const tooSmall = (field.rules as z.ZodTypeAny).safeParse(5)
    expect(tooSmall.success).toBe(false)

    // Non-numeric → custom message (not the default one)
    const nonNumeric = (field.rules as z.ZodTypeAny).safeParse('abc')
    expect(nonNumeric.success).toBe(false)
    if (!nonNumeric.success) expect(nonNumeric.error.issues[0]?.message).toBe('Custom error')
  })
})

describe('numberField default validation', () => {
  it('rejects non-numeric input with a readable message', () => {
    const field = numberField('quantity', { label: 'Quantity' })
    const result = (field.rules as z.ZodTypeAny).safeParse('abc')
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error.issues[0]?.message).toBe('Must be a number')
  })

  it('accepts negative values (no min restriction)', () => {
    const field = numberField('offset', { label: 'Offset' })
    expect((field.rules as z.ZodTypeAny).safeParse(-5).success).toBe(true)
  })

  it('accepts zero and positive values', () => {
    const field = numberField('quantity', { label: 'Quantity' })
    expect((field.rules as z.ZodTypeAny).safeParse(0).success).toBe(true)
    expect((field.rules as z.ZodTypeAny).safeParse(42).success).toBe(true)
  })

  it('uses caller-provided rules when explicitly set (override wins)', () => {
    const field = numberField('quantity', {
      label: 'Quantity',
      rules: z.number().min(1).max(10)
    })
    expect((field.rules as z.ZodTypeAny).safeParse(0).success).toBe(false) // below custom min
    expect((field.rules as z.ZodTypeAny).safeParse(11).success).toBe(false) // above custom max
    expect((field.rules as z.ZodTypeAny).safeParse(5).success).toBe(true)
  })
})
