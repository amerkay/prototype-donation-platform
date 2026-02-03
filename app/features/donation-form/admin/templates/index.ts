import type { FullFormConfig } from '~/features/donation-form/shared/stores/formConfig'
import type { Product } from '~/features/donation-form/features/product/shared/types'
import { Zap, Heart, TrendingUp, ShoppingCart, Sparkles, Crown } from 'lucide-vue-next'
import { createBasicTemplate } from './basic'
import { createBasicWithImpactTemplate } from './basic-with-impact'
import { createUpsellsTemplate } from './upsells'
import { createMultipleProductsTemplate } from './multiple-products'
import { createRecurringAdoptionsTemplate } from './recurring-adoptions'
import { createFullExperienceTemplate } from './full-experience'

/**
 * Template metadata for display in selection dialog
 */
export interface TemplateMetadata {
  id: string
  name: string
  description: string
  icon: typeof Zap
  category: 'simple' | 'enhanced' | 'advanced'
  requiresProducts?: boolean
}

/**
 * Template factory function that generates a complete form configuration
 */
export type TemplateFactory = (
  campaignId: string,
  defaultCurrency: string
) => {
  config: FullFormConfig
  products: Product[]
}

/**
 * Complete template definition with metadata and factory
 */
export interface DonationFormTemplate {
  metadata: TemplateMetadata
  factory: TemplateFactory
}

/**
 * Template registry - all available templates
 */
export const TEMPLATE_REGISTRY: DonationFormTemplate[] = [
  {
    metadata: {
      id: 'basic',
      name: 'Basic',
      description: 'One-time and monthly donations only, all features disabled',
      icon: Zap,
      category: 'simple'
    },
    factory: createBasicTemplate
  },
  {
    metadata: {
      id: 'basic-with-impact',
      name: 'Basic with Impact Statements',
      description: 'One-time and monthly with impact descriptions per amount',
      icon: Heart,
      category: 'simple'
    },
    factory: createBasicWithImpactTemplate
  },
  {
    metadata: {
      id: 'upsells',
      name: 'Upsells',
      description: 'Upsell features enabled (recurring boost, increase boost)',
      icon: TrendingUp,
      category: 'enhanced'
    },
    factory: createUpsellsTemplate
  },
  {
    metadata: {
      id: 'multiple-products',
      name: 'Multiple Products',
      description: 'Multi-item cart with product selection',
      icon: ShoppingCart,
      category: 'enhanced',
      requiresProducts: true
    },
    factory: createMultipleProductsTemplate
  },
  {
    metadata: {
      id: 'recurring-adoptions',
      name: 'Recurring Symbolic Adoptions',
      description: 'Product selector with symbolic adoption features',
      icon: Sparkles,
      category: 'enhanced',
      requiresProducts: true
    },
    factory: createRecurringAdoptionsTemplate
  },
  {
    metadata: {
      id: 'full-experience',
      name: 'Full Experience',
      description: 'All features enabled (except impact statements)',
      icon: Crown,
      category: 'advanced'
    },
    factory: createFullExperienceTemplate
  }
]

/**
 * Convert all amounts in a template result from GBP to the target currency.
 * Templates are authored with GBP amounts; this post-processes them
 * using a provided conversion function (e.g., smartRound from useCurrency).
 */
export function convertTemplateAmounts(
  result: { config: FullFormConfig; products: Product[] },
  convertFn: (amount: number) => number
): { config: FullFormConfig; products: Product[] } {
  const { config, products } = result

  // Convert frequency preset amounts and custom amount bounds
  for (const freq of Object.values(config.donationAmounts.frequencies)) {
    freq.presetAmounts = freq.presetAmounts.map((preset) => ({
      ...preset,
      amount: convertFn(preset.amount)
    }))
    freq.customAmount = {
      min: convertFn(freq.customAmount.min),
      max: convertFn(freq.customAmount.max)
    }
  }

  // Convert product prices
  const convertedProducts = products.map((product) => ({
    ...product,
    ...(product.price !== undefined && { price: convertFn(product.price) }),
    ...(product.minPrice !== undefined && { minPrice: convertFn(product.minPrice) }),
    ...(product.default !== undefined && { default: convertFn(product.default) })
  }))

  return { config, products: convertedProducts }
}

/**
 * Get template by ID
 */
export function getTemplateById(templateId: string): DonationFormTemplate | undefined {
  return TEMPLATE_REGISTRY.find((t) => t.metadata.id === templateId)
}

/**
 * Generate a unique form ID
 */
export function generateFormId(campaignId: string, templateId: string): string {
  const timestamp = Date.now()
  return `form-${campaignId}-${templateId}-${timestamp}`
}

/**
 * Generate form name from template
 */
export function generateFormName(templateName: string, existingFormNames: string[]): string {
  let name = templateName
  let counter = 1

  // Check if name exists, append number if it does
  while (existingFormNames.includes(name)) {
    name = `${templateName} ${counter}`
    counter++
  }

  return name
}
