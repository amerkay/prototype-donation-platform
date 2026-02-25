import { describe, it, expect } from 'vitest'
import { convertTemplateAmounts } from '~/features/donation-form/admin/templates'
import type { FullFormConfig } from '~/features/donation-form/shared/stores/formConfig'
import type { Product } from '~/features/donation-form/features/product/shared/types'

/** Minimal FullFormConfig with just enough donationAmounts structure for conversion tests */
function makeConfig(
  frequencies: Record<
    string,
    {
      presetAmounts: { amount: number }[]
      customAmount: { min: number; max: number }
    }
  >
): FullFormConfig {
  const freqDefaults = {
    enabled: true,
    label: '',
    presetAmounts: [],
    customAmount: { min: 0, max: 0 }
  }
  return {
    donationAmounts: {
      baseDefaultCurrency: 'GBP',
      frequencies: {
        once: { ...freqDefaults, ...frequencies.once },
        monthly: { ...freqDefaults, ...frequencies.monthly },
        yearly: { ...freqDefaults, ...frequencies.yearly }
      }
    }
  } as FullFormConfig
}

function makeProduct(overrides: Partial<Product> & { id: string; name: string }): Product {
  return {
    title: overrides.name,
    description: '',
    frequency: 'once',
    image: null,
    ...overrides
  } as Product
}

describe('convertTemplateAmounts', () => {
  it('converts preset amounts in each frequency via convertFn', () => {
    const config = makeConfig({
      once: { presetAmounts: [{ amount: 10 }, { amount: 20 }], customAmount: { min: 5, max: 100 } },
      monthly: {
        presetAmounts: [{ amount: 5 }],
        customAmount: { min: 1, max: 50 }
      }
    })

    const result = convertTemplateAmounts({ config, products: [] }, (x) => x * 2)

    expect(result.config.donationAmounts.frequencies.once.presetAmounts[0]!.amount).toBe(20)
    expect(result.config.donationAmounts.frequencies.once.presetAmounts[1]!.amount).toBe(40)
    expect(result.config.donationAmounts.frequencies.monthly.presetAmounts[0]!.amount).toBe(10)
  })

  it('converts customAmount.min and customAmount.max per frequency', () => {
    const config = makeConfig({
      once: { presetAmounts: [], customAmount: { min: 5, max: 100 } },
      monthly: { presetAmounts: [], customAmount: { min: 3, max: 200 } }
    })

    const result = convertTemplateAmounts({ config, products: [] }, (x) => x * 3)

    expect(result.config.donationAmounts.frequencies.once.customAmount).toEqual({
      min: 15,
      max: 300
    })
    expect(result.config.donationAmounts.frequencies.monthly.customAmount).toEqual({
      min: 9,
      max: 600
    })
  })

  it('handles multiple frequencies (monthly, yearly, one-time)', () => {
    const config = makeConfig({
      once: { presetAmounts: [{ amount: 10 }], customAmount: { min: 1, max: 50 } },
      monthly: { presetAmounts: [{ amount: 20 }], customAmount: { min: 2, max: 100 } },
      yearly: { presetAmounts: [{ amount: 30 }], customAmount: { min: 5, max: 500 } }
    })

    const result = convertTemplateAmounts({ config, products: [] }, (x) => x + 1)

    expect(result.config.donationAmounts.frequencies.once.presetAmounts[0]!.amount).toBe(11)
    expect(result.config.donationAmounts.frequencies.monthly.presetAmounts[0]!.amount).toBe(21)
    expect(result.config.donationAmounts.frequencies.yearly.presetAmounts[0]!.amount).toBe(31)
  })

  it('converts product price, minPrice, default fields', () => {
    const config = makeConfig({})
    const products = [
      makeProduct({ id: 'p1', name: 'Shirt', price: 25, minPrice: 10, default: 15 })
    ]

    const result = convertTemplateAmounts({ config, products }, (x) => x * 2)

    expect(result.products[0]!.price).toBe(50)
    expect(result.products[0]!.minPrice).toBe(20)
    expect(result.products[0]!.default).toBe(30)
  })

  it('skips undefined product fields (no NaN values)', () => {
    const config = makeConfig({})
    const products = [makeProduct({ id: 'p1', name: 'Basic', price: 10 })]
    // minPrice and default are undefined

    const result = convertTemplateAmounts({ config, products }, (x) => x * 2)

    expect(result.products[0]!.price).toBe(20)
    expect(result.products[0]!.minPrice).toBeUndefined()
    expect(result.products[0]!.default).toBeUndefined()
  })

  it('identity conversion (x => x) returns equivalent values', () => {
    const config = makeConfig({
      once: {
        presetAmounts: [{ amount: 10 }, { amount: 25 }],
        customAmount: { min: 5, max: 500 }
      }
    })
    const products = [makeProduct({ id: 'p1', name: 'Item', price: 30, minPrice: 10 })]

    const result = convertTemplateAmounts({ config, products }, (x) => x)

    expect(result.config.donationAmounts.frequencies.once.presetAmounts[0]!.amount).toBe(10)
    expect(result.config.donationAmounts.frequencies.once.presetAmounts[1]!.amount).toBe(25)
    expect(result.products[0]!.price).toBe(30)
    expect(result.products[0]!.minPrice).toBe(10)
  })

  it('works with empty products array', () => {
    const config = makeConfig({
      once: { presetAmounts: [{ amount: 10 }], customAmount: { min: 1, max: 100 } }
    })

    const result = convertTemplateAmounts({ config, products: [] }, (x) => x * 2)

    expect(result.products).toEqual([])
    expect(result.config.donationAmounts.frequencies.once.presetAmounts[0]!.amount).toBe(20)
  })

  it('works with products that have no price fields', () => {
    const config = makeConfig({})
    const products = [makeProduct({ id: 'p1', name: 'Free Item' })]

    const result = convertTemplateAmounts({ config, products }, (x) => x * 2)

    expect(result.products[0]!.price).toBeUndefined()
    expect(result.products[0]!.minPrice).toBeUndefined()
    expect(result.products[0]!.default).toBeUndefined()
    // Non-price fields preserved
    expect(result.products[0]!.name).toBe('Free Item')
  })
})
