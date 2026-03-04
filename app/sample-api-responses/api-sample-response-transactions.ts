import type {
  Transaction,
  GiftAidDeclaration,
  ConsentRecord,
  TransactionStatus,
  PaymentProcessor,
  PaymentMethodType
} from '~/features/donor-portal/types'
import type { Subscription } from '~/features/subscriptions/shared/types'
import type { CampaignDonation, CampaignStats } from '~/features/campaigns/shared/types'

// ============================================
// SEEDED PRNG — deterministic random generation
// ============================================

/** Mulberry32: simple seeded 32-bit PRNG */
function mulberry32(seed: number): () => number {
  let s = seed | 0
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// ============================================
// TRANSACTION GENERATOR
// ============================================

interface CampaignTransactionConfig {
  campaignId: string
  campaignName: string
  charityName: string
  count: number
  avgAmount: number
  currency: string
  dateRange: [string, string]
  products: { id: string; title: string; unitPrice: number }[]
  /** Match periods — transactions within a period's date range get matchedAmount */
  matchPeriods?: {
    id: string
    multiplier: number
    startDate: string
    endDate: string
    poolAmount: number
  }[]
  /** Probability of edge cases (0-1) */
  failRate?: number
  refundRate?: number
  anonymousRate?: number
  crossCurrencyRate?: number
  tributeRate?: number
  coverCostsRate?: number
  multiItemRate?: number
  /** Seed for deterministic generation */
  seed: number
}

const DONOR_POOL = [
  { id: 'donor-001', name: 'Wild Amer', email: 'awesome@charity.co.uk' },
  { id: 'donor-002', name: 'Emma Wilson', email: 'emma.wilson@example.com' },
  { id: 'donor-003', name: 'Michael Lee', email: 'michael.lee@example.com' },
  { id: 'donor-004', name: 'John Smith', email: 'john.smith@example.com' },
  { id: 'donor-005', name: 'Rachel Green', email: 'rachel.green@example.com' },
  { id: 'donor-006', name: 'Sarah Mitchell', email: 'sarah.mitchell@example.com' },
  { id: 'donor-007', name: 'Tom Wilson', email: 'tom.wilson@example.com' },
  { id: 'donor-008', name: 'Emma Davis', email: 'emma.davis@example.com' },
  { id: 'donor-009', name: 'Alice Cooper', email: 'alice.cooper@example.com' },
  { id: 'donor-010', name: 'Bob Harris', email: 'bob.harris@example.com' },
  { id: 'donor-011', name: 'Claire Wang', email: 'claire.wang@example.com' },
  { id: 'donor-012', name: 'Dan Patel', email: 'dan.patel@example.com' },
  { id: 'donor-013', name: 'Laura Kim', email: 'laura.kim@example.com' },
  { id: 'donor-014', name: 'Mark Johnson', email: 'mark.johnson@example.com' },
  { id: 'donor-015', name: 'Sophie Turner', email: 'sophie.turner@example.com' },
  { id: 'donor-016', name: 'James Brown', email: 'james.brown@example.com' },
  { id: 'donor-017', name: 'Olivia Chen', email: 'olivia.chen@example.com' },
  { id: 'donor-018', name: 'Noah Williams', email: 'noah.williams@example.com' },
  { id: 'donor-019', name: 'Isla Thompson', email: 'isla.thompson@example.com' },
  { id: 'donor-020', name: 'Liam Davies', email: 'liam.davies@example.com' }
]

const MESSAGES = [
  'Keep up the great work!',
  'Happy to support this cause!',
  'Love what you do!',
  'Making a difference together!',
  'For a better future!',
  'Great cause!',
  'Every little helps!',
  'Proud to contribute!',
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined // Most donations have no message
]

const TRIBUTE_NAMES = [
  'Rose Amer',
  'Michael Chen',
  'David Thompson',
  'Margaret Wilson',
  'James Lee'
]

const CARD_BRANDS = ['visa', 'mastercard', 'amex'] as const
const CARD_LAST4S = ['4242', '5556', '1234', '8901', '6789', '0019', '3344', '7799', '1122', '9900']

const CROSS_CURRENCIES: { currency: string; rate: number }[] = [
  { currency: 'USD', rate: 0.79 },
  { currency: 'EUR', rate: 0.86 },
  { currency: 'CAD', rate: 0.58 },
  { currency: 'AUD', rate: 0.52 }
]

const ADDRESSES = [
  {
    line1: '42 Oakwood Drive',
    city: 'London',
    region: 'Greater London',
    postcode: 'SW1A 2AA',
    country: 'GB'
  },
  { line1: '15 Elm Street', city: 'Birmingham', postcode: 'B1 1AA', country: 'GB' },
  { line1: '28 Maple Road', city: 'Bristol', postcode: 'BS1 4DJ', country: 'GB' },
  { line1: '9 Cherry Close', city: 'Leeds', postcode: 'LS1 5AA', country: 'GB' },
  { line1: '55 Pine Avenue', city: 'Oxford', postcode: 'OX1 2AA', country: 'GB' },
  { line1: '12 Willow Court', city: 'Cambridge', postcode: 'CB2 1TN', country: 'GB' },
  { line1: '34 Birch Lane', city: 'Bath', postcode: 'BA1 1AA', country: 'GB' }
]

function buildCampaignTransactions(config: CampaignTransactionConfig): Transaction[] {
  const rand = mulberry32(config.seed)
  const pick = <T>(arr: T[]): T => arr[Math.floor(rand() * arr.length)]!
  const rangeAmount = (avg: number) => {
    // Generate amounts from 0.3x to 2.5x the average, rounded to nearest penny
    const raw = avg * (0.3 + rand() * 2.2)
    return Math.round(raw * 100) / 100
  }

  const startMs = new Date(config.dateRange[0]).getTime()
  // Cap end date at "now" — no future-dated transactions (a scheduled match period
  // shouldn't have pool drawn because no transactions exist in its window yet)
  const nowMs = Date.now()
  const endMs = Math.min(new Date(config.dateRange[1]).getTime(), nowMs)

  const failRate = config.failRate ?? 0.02
  const refundRate = config.refundRate ?? 0.03
  const anonRate = config.anonymousRate ?? 0.12
  const crossRate = config.crossCurrencyRate ?? 0.08
  const tributeRate = config.tributeRate ?? 0.05
  const coverRate = config.coverCostsRate ?? 0.35
  const multiItemRate = config.multiItemRate ?? 0.15

  // Track pool remaining per match period
  const poolRemaining = new Map<string, number>()
  for (const mp of config.matchPeriods ?? []) {
    poolRemaining.set(mp.id, mp.poolAmount)
  }

  const results: Transaction[] = []

  for (let i = 0; i < config.count; i++) {
    const id = `gen-${config.campaignId}-${String(i).padStart(4, '0')}`
    const createdAt = new Date(startMs + rand() * (endMs - startMs)).toISOString()

    // Determine status
    let status: TransactionStatus = 'succeeded'
    const statusRoll = rand()
    if (statusRoll < failRate) status = 'failed'
    else if (statusRoll < failRate + refundRate) status = 'refunded'

    // Pick donor
    const isAnonymous = rand() < anonRate
    const donor = pick(DONOR_POOL)

    // Cross-currency?
    const isCross = rand() < crossRate
    const crossCurr = isCross ? pick(CROSS_CURRENCIES) : null
    const currency = crossCurr?.currency ?? config.currency
    const exchangeRate = crossCurr?.rate ?? 1

    // Processor
    const processor: PaymentProcessor = rand() < 0.15 ? 'paypal' : 'stripe'
    const paymentMethod: {
      type: PaymentMethodType
      last4?: string
      brand?: string
      email?: string
    } =
      processor === 'paypal'
        ? { type: 'paypal', email: donor.email }
        : {
            type: rand() < 0.05 ? 'bank_transfer' : 'card',
            last4: pick(CARD_LAST4S),
            brand: pick([...CARD_BRANDS])
          }

    // Products / line items
    const isMultiItem = rand() < multiItemRate && config.products.length > 1
    const selectedProducts = isMultiItem
      ? config.products.filter(() => rand() < 0.5).slice(0, 3)
      : [pick(config.products)]
    // Ensure at least one product
    const products = selectedProducts.length > 0 ? selectedProducts : [pick(config.products)]

    const lineItems = products.map((p) => {
      const qty = rand() < 0.1 ? Math.ceil(rand() * 5) : 1
      const unitPrice = rangeAmount(p.unitPrice)
      return {
        productId: p.id,
        productTitle: p.title,
        quantity: qty,
        unitPrice,
        frequency: 'once' as const
      }
    })

    const subtotal = lineItems.reduce((sum, li) => sum + li.unitPrice * li.quantity, 0)
    const coverCosts = rand() < coverRate
    const coverCostsAmount = coverCosts ? Math.round(subtotal * 0.03 * 100) / 100 : 0
    const totalAmount = Math.round((subtotal + coverCostsAmount) * 100) / 100

    // Tribute
    const hasTribute = rand() < tributeRate
    const tribute = hasTribute
      ? {
          type: (rand() < 0.5 ? 'gift' : 'memorial') as 'gift' | 'memorial',
          honoreeName: pick(TRIBUTE_NAMES)
        }
      : undefined

    // Gift Aid (only UK donors with address, ~30%)
    const hasGiftAid = !isCross && rand() < 0.3
    const address = hasGiftAid ? pick(ADDRESSES) : rand() < 0.15 ? pick(ADDRESSES) : undefined

    // Message
    const message = rand() < 0.25 ? pick(MESSAGES) : undefined

    // Match period check
    let matchedAmount = 0
    let matchPeriodId: string | undefined
    if (status === 'succeeded' && config.matchPeriods) {
      const txDate = new Date(createdAt).getTime()
      for (const mp of config.matchPeriods) {
        const mpStart = new Date(mp.startDate).getTime()
        const mpEnd = new Date(mp.endDate).getTime()
        if (txDate >= mpStart && txDate <= mpEnd) {
          const remaining = poolRemaining.get(mp.id) ?? 0
          if (remaining > 0) {
            // Match amount = totalAmount * (multiplier - 1) in campaign currency
            const matchable = totalAmount * exchangeRate * (mp.multiplier - 1)
            matchedAmount = Math.round(Math.min(matchable, remaining) * 100) / 100
            matchPeriodId = mp.id
            poolRemaining.set(mp.id, remaining - matchedAmount)
          }
          break
        }
      }
    }

    // Processor transaction ID
    const processorTxId =
      processor === 'paypal'
        ? `PAYID-${id.slice(-8).toUpperCase()}`
        : `pi_${id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 20)}`

    const txn: Transaction = {
      id,
      organizationId: 'org-001',
      processor,
      processorTransactionId: processorTxId,
      type: status === 'refunded' ? 'refund' : 'one_time',
      campaignId: config.campaignId,
      campaignName: config.campaignName,
      charityName: config.charityName,
      lineItems,
      subtotal: Math.round(subtotal * 100) / 100,
      coverCostsAmount,
      totalAmount,
      currency,
      baseCurrency: 'GBP',
      exchangeRate,
      campaignCurrency: config.currency,
      campaignExchangeRate: exchangeRate,
      paymentMethod,
      status,
      donorId: isAnonymous ? '' : donor.id,
      donorName: isAnonymous ? 'Anonymous' : donor.name,
      donorEmail: isAnonymous ? `anon-${id}@example.com` : donor.email,
      isAnonymous,
      ...(message ? { message } : {}),
      ...(tribute ? { tribute } : {}),
      giftAid: hasGiftAid,
      ...(hasGiftAid ? { giftAidAmount: Math.round(subtotal * 0.25 * 100) / 100 } : {}),
      ...(address ? { donorAddress: address } : {}),
      matchedAmount,
      ...(matchPeriodId ? { matchPeriodId } : {}),
      legalBasis: 'contractual_necessity',
      createdAt,
      receiptUrl: status !== 'failed' ? '#' : undefined
    }

    results.push(txn)
  }

  return results
}

// ============================================
// CAMPAIGN CONFIGS
// ============================================

const ORANGUTAN_PRODUCTS = [
  { id: 'tree-planting', title: 'Plant 10 Native Rainforest Trees for Wildlife', unitPrice: 30 },
  { id: 'education-program', title: 'Support Local Conservation Education Program', unitPrice: 50 },
  { id: 'adopt-bumi', title: 'Adopt Bumi the Rescued Baby', unitPrice: 15 },
  { id: 'adopt-maya', title: 'Adopt Maya the Survivor', unitPrice: 10 }
]

const BIRTHDAY_PRODUCTS = [
  { id: 'tree-planting', title: 'Plant 10 Native Rainforest Trees for Wildlife', unitPrice: 30 },
  { id: 'adopt-bumi', title: 'Adopt Bumi the Rescued Baby', unitPrice: 25 },
  { id: 'adopt-maya', title: 'Adopt Maya the Survivor', unitPrice: 20 },
  { id: 'education-program', title: 'Support Local Conservation Education Program', unitPrice: 50 }
]

const campaignConfigs: CampaignTransactionConfig[] = [
  {
    campaignId: 'adopt-orangutan',
    campaignName: 'Adopt an Orangutan',
    charityName: 'Borneo Orangutan Survival',
    count: 340,
    avgAmount: 135,
    currency: 'GBP',
    dateRange: ['2025-06-01', '2026-02-28'],
    products: ORANGUTAN_PRODUCTS,
    seed: 1001
  },
  {
    campaignId: 'birthday-p2p-template',
    campaignName: 'Birthday Fundraiser Template',
    charityName: 'Borneo Orangutan Survival',
    count: 12,
    avgAmount: 45,
    currency: 'GBP',
    dateRange: ['2025-10-01', '2026-02-15'],
    products: BIRTHDAY_PRODUCTS,
    seed: 1002
  },
  {
    campaignId: 'wild-amer-birthday-fundraiser',
    campaignName: "Wild Amer's Birthday Fundraiser",
    charityName: 'Borneo Orangutan Survival',
    count: 10,
    avgAmount: 12.5,
    currency: 'GBP',
    dateRange: ['2026-02-26', '2026-03-15'],
    products: BIRTHDAY_PRODUCTS,
    matchPeriods: [
      {
        id: 'mp-p2p-1',
        multiplier: 2,
        startDate: '2026-03-01T00:00:00Z',
        endDate: '2026-03-31T00:00:00Z',
        poolAmount: 10000
      }
    ],
    seed: 2001
  },
  {
    campaignId: 'wild-amer-birthday-2-fundraiser',
    campaignName: "Wild Amer's Mini Fundraiser",
    charityName: 'Borneo Orangutan Survival',
    count: 5,
    avgAmount: 20,
    currency: 'GBP',
    dateRange: ['2025-12-20', '2026-01-31'],
    products: BIRTHDAY_PRODUCTS,
    // Match period exists but date range is entirely before it → zero matched
    matchPeriods: [
      {
        id: 'mp-p2p-1',
        multiplier: 2,
        startDate: '2026-03-01T00:00:00Z',
        endDate: '2026-03-31T00:00:00Z',
        poolAmount: 10000
      }
    ],
    seed: 2002
  },
  {
    campaignId: 'tribute-p2p-template',
    campaignName: 'In Memory of a Loved One',
    charityName: 'Borneo Orangutan Survival',
    count: 85,
    avgAmount: 140,
    currency: 'GBP',
    dateRange: ['2025-06-01', '2026-02-15'],
    products: ORANGUTAN_PRODUCTS,
    tributeRate: 0.6,
    seed: 1003
  },
  {
    campaignId: 'challenge-p2p-template',
    campaignName: 'Marathon Challenge Fundraiser',
    charityName: 'Borneo Orangutan Survival',
    count: 200,
    avgAmount: 132,
    currency: 'GBP',
    dateRange: ['2025-06-01', '2026-02-15'],
    products: ORANGUTAN_PRODUCTS,
    seed: 1004
  },
  {
    campaignId: 'wedding-p2p-template',
    campaignName: 'Our Wedding Fundraiser',
    charityName: 'Borneo Orangutan Survival',
    count: 60,
    avgAmount: 136,
    currency: 'GBP',
    dateRange: ['2025-06-01', '2026-02-15'],
    products: ORANGUTAN_PRODUCTS,
    seed: 1005
  },
  {
    campaignId: 'matched-giving-spring',
    campaignName: 'Spring Matched Giving Appeal',
    charityName: 'Borneo Orangutan Survival',
    count: 120,
    avgAmount: 42,
    currency: 'GBP',
    dateRange: ['2026-02-25', '2026-03-31'],
    products: ORANGUTAN_PRODUCTS,
    matchPeriods: [
      {
        id: 'mp-1',
        multiplier: 2,
        startDate: '2026-03-01T00:00:00Z',
        endDate: '2026-03-15T00:00:00Z',
        poolAmount: 30000
      },
      {
        id: 'mp-2',
        multiplier: 3,
        startDate: '2026-03-16T00:00:00Z',
        endDate: '2026-03-31T00:00:00Z',
        poolAmount: 20000
      }
    ],
    seed: 3001
  }
]

// Generate all one-time transactions from configs
const generatedTransactions: Transaction[] = campaignConfigs.flatMap(buildCampaignTransactions)

// ============================================
// HAND-CRAFTED SUBSCRIPTION PAYMENTS
// These must link to specific subscription IDs and can't be generated.
// ============================================

const subscriptionPayments: Transaction[] = [
  // sub-004 payments (Emma Wilson, adopt-maya, paused sub)
  {
    id: 'txn-033',
    organizationId: 'org-001',
    processor: 'stripe',
    processorTransactionId: 'pi_3RhA1aK2x9B1mN4m',
    type: 'subscription_payment',
    subscriptionId: 'sub-004',
    campaignId: 'adopt-orangutan',
    campaignName: 'Adopt an Orangutan',
    charityName: 'Borneo Orangutan Survival',
    lineItems: [
      {
        productId: 'adopt-maya',
        productTitle: 'Adopt Maya the Survivor',
        quantity: 1,
        unitPrice: 10,
        frequency: 'monthly'
      }
    ],
    subtotal: 10,
    coverCostsAmount: 0,
    totalAmount: 10,
    currency: 'GBP',
    baseCurrency: 'GBP',
    exchangeRate: 1,
    campaignCurrency: 'GBP',
    campaignExchangeRate: 1,
    paymentMethod: { type: 'card', last4: '5556', brand: 'mastercard' },
    status: 'succeeded',
    donorName: 'Emma Wilson',
    donorId: 'donor-002',
    donorEmail: 'emma.wilson@example.com',
    isAnonymous: false,
    giftAid: false,
    matchedAmount: 0,
    legalBasis: 'contractual_necessity',
    createdAt: '2025-11-01T00:00:00Z',
    receiptUrl: '#'
  },
  {
    id: 'txn-034',
    organizationId: 'org-001',
    processor: 'stripe',
    processorTransactionId: 'pi_3RhB2bK2x9B1mN5n',
    type: 'subscription_payment',
    subscriptionId: 'sub-004',
    campaignId: 'adopt-orangutan',
    campaignName: 'Adopt an Orangutan',
    charityName: 'Borneo Orangutan Survival',
    lineItems: [
      {
        productId: 'adopt-maya',
        productTitle: 'Adopt Maya the Survivor',
        quantity: 1,
        unitPrice: 10,
        frequency: 'monthly'
      }
    ],
    subtotal: 10,
    coverCostsAmount: 0,
    totalAmount: 10,
    currency: 'GBP',
    baseCurrency: 'GBP',
    exchangeRate: 1,
    campaignCurrency: 'GBP',
    campaignExchangeRate: 1,
    paymentMethod: { type: 'card', last4: '5556', brand: 'mastercard' },
    status: 'succeeded',
    donorName: 'Emma Wilson',
    donorId: 'donor-002',
    donorEmail: 'emma.wilson@example.com',
    isAnonymous: false,
    giftAid: false,
    matchedAmount: 0,
    legalBasis: 'contractual_necessity',
    createdAt: '2025-12-01T00:00:00Z',
    receiptUrl: '#'
  },
  // sub-005 payments (Rachel Green, tree-planting, cancelled sub)
  {
    id: 'txn-035',
    organizationId: 'org-001',
    processor: 'stripe',
    processorTransactionId: 'pi_3RhC3cK2x9B1mN6o',
    type: 'subscription_payment',
    subscriptionId: 'sub-005',
    campaignId: 'birthday-p2p-template',
    campaignName: 'Birthday Fundraiser Template',
    charityName: 'Borneo Orangutan Survival',
    lineItems: [
      {
        productId: 'tree-planting',
        productTitle: 'Plant 10 Native Rainforest Trees for Wildlife',
        quantity: 1,
        unitPrice: 10,
        frequency: 'monthly'
      }
    ],
    subtotal: 10,
    coverCostsAmount: 0,
    totalAmount: 10,
    currency: 'GBP',
    baseCurrency: 'GBP',
    exchangeRate: 1,
    campaignCurrency: 'GBP',
    campaignExchangeRate: 1,
    paymentMethod: { type: 'card', last4: '4242', brand: 'visa' },
    status: 'succeeded',
    donorName: 'Rachel Green',
    donorId: 'donor-005',
    donorEmail: 'rachel.green@example.com',
    isAnonymous: false,
    giftAid: false,
    matchedAmount: 0,
    legalBasis: 'contractual_necessity',
    createdAt: '2025-10-01T00:00:00Z',
    receiptUrl: '#'
  },
  {
    id: 'txn-036',
    organizationId: 'org-001',
    processor: 'stripe',
    processorTransactionId: 'pi_3RhD4dK2x9B1mN7p',
    type: 'subscription_payment',
    subscriptionId: 'sub-005',
    campaignId: 'birthday-p2p-template',
    campaignName: 'Birthday Fundraiser Template',
    charityName: 'Borneo Orangutan Survival',
    lineItems: [
      {
        productId: 'tree-planting',
        productTitle: 'Plant 10 Native Rainforest Trees for Wildlife',
        quantity: 1,
        unitPrice: 10,
        frequency: 'monthly'
      }
    ],
    subtotal: 10,
    coverCostsAmount: 0,
    totalAmount: 10,
    currency: 'GBP',
    baseCurrency: 'GBP',
    exchangeRate: 1,
    campaignCurrency: 'GBP',
    campaignExchangeRate: 1,
    paymentMethod: { type: 'card', last4: '4242', brand: 'visa' },
    status: 'succeeded',
    donorName: 'Rachel Green',
    donorId: 'donor-005',
    donorEmail: 'rachel.green@example.com',
    isAnonymous: false,
    giftAid: false,
    matchedAmount: 0,
    legalBasis: 'contractual_necessity',
    createdAt: '2025-11-01T00:00:00Z',
    receiptUrl: '#'
  },
  // sub-006 payments (Sarah Mitchell, education-program, USD)
  {
    id: 'txn-037',
    organizationId: 'org-001',
    processor: 'stripe',
    processorTransactionId: 'pi_3RhE5eK2x9B1mN8q',
    type: 'subscription_payment',
    subscriptionId: 'sub-006',
    campaignId: 'adopt-orangutan',
    campaignName: 'Adopt an Orangutan',
    charityName: 'Borneo Orangutan Survival',
    lineItems: [
      {
        productId: 'education-program',
        productTitle: 'Support Local Conservation Education Program',
        quantity: 1,
        unitPrice: 25,
        frequency: 'monthly'
      }
    ],
    subtotal: 25,
    coverCostsAmount: 0,
    totalAmount: 25,
    currency: 'USD',
    baseCurrency: 'GBP',
    exchangeRate: 0.79,
    campaignCurrency: 'GBP',
    campaignExchangeRate: 0.79,
    paymentMethod: { type: 'card', last4: '4242', brand: 'visa' },
    status: 'succeeded',
    donorName: 'Sarah Mitchell',
    donorId: 'donor-006',
    donorEmail: 'sarah.mitchell@example.com',
    isAnonymous: false,
    giftAid: false,
    matchedAmount: 0,
    legalBasis: 'contractual_necessity',
    createdAt: '2025-12-10T00:00:00Z',
    receiptUrl: '#'
  },
  {
    id: 'txn-038',
    organizationId: 'org-001',
    processor: 'stripe',
    processorTransactionId: 'pi_3RhF6fK2x9B1mN9r',
    type: 'subscription_payment',
    subscriptionId: 'sub-006',
    campaignId: 'adopt-orangutan',
    campaignName: 'Adopt an Orangutan',
    charityName: 'Borneo Orangutan Survival',
    lineItems: [
      {
        productId: 'education-program',
        productTitle: 'Support Local Conservation Education Program',
        quantity: 1,
        unitPrice: 25,
        frequency: 'monthly'
      }
    ],
    subtotal: 25,
    coverCostsAmount: 0,
    totalAmount: 25,
    currency: 'USD',
    baseCurrency: 'GBP',
    exchangeRate: 0.79,
    campaignCurrency: 'GBP',
    campaignExchangeRate: 0.79,
    paymentMethod: { type: 'card', last4: '4242', brand: 'visa' },
    status: 'succeeded',
    donorName: 'Sarah Mitchell',
    donorId: 'donor-006',
    donorEmail: 'sarah.mitchell@example.com',
    isAnonymous: false,
    giftAid: false,
    matchedAmount: 0,
    legalBasis: 'contractual_necessity',
    createdAt: '2026-01-10T00:00:00Z',
    receiptUrl: '#'
  },
  // sub-007 payment (Tom Wilson, adopt-maya)
  {
    id: 'txn-039',
    organizationId: 'org-001',
    processor: 'stripe',
    processorTransactionId: 'pi_3RhG7gK2x9B1mN0s',
    type: 'subscription_payment',
    subscriptionId: 'sub-007',
    campaignId: 'adopt-orangutan',
    campaignName: 'Adopt an Orangutan',
    charityName: 'Borneo Orangutan Survival',
    lineItems: [
      {
        productId: 'adopt-maya',
        productTitle: 'Adopt Maya the Survivor',
        quantity: 1,
        unitPrice: 10,
        frequency: 'monthly'
      }
    ],
    subtotal: 10,
    coverCostsAmount: 0,
    totalAmount: 10,
    currency: 'GBP',
    baseCurrency: 'GBP',
    exchangeRate: 1,
    campaignCurrency: 'GBP',
    campaignExchangeRate: 1,
    paymentMethod: { type: 'card', last4: '5556', brand: 'mastercard' },
    status: 'succeeded',
    donorName: 'Tom Wilson',
    donorId: 'donor-007',
    donorEmail: 'tom.wilson@example.com',
    isAnonymous: false,
    giftAid: false,
    matchedAmount: 0,
    legalBasis: 'contractual_necessity',
    createdAt: '2026-01-01T00:00:00Z',
    receiptUrl: '#'
  },
  // sub-008 payments (Alice Cooper, education-program, EUR PayPal)
  {
    id: 'txn-040',
    organizationId: 'org-001',
    processor: 'paypal',
    processorTransactionId: 'PAYID-M7R2K7M6',
    type: 'subscription_payment',
    subscriptionId: 'sub-008',
    campaignId: 'birthday-p2p-template',
    campaignName: 'Birthday Fundraiser Template',
    charityName: 'Borneo Orangutan Survival',
    lineItems: [
      {
        productId: 'education-program',
        productTitle: 'Support Local Conservation Education Program',
        quantity: 1,
        unitPrice: 30,
        frequency: 'monthly'
      }
    ],
    subtotal: 30,
    coverCostsAmount: 0,
    totalAmount: 30,
    currency: 'EUR',
    baseCurrency: 'GBP',
    exchangeRate: 0.86,
    campaignCurrency: 'GBP',
    campaignExchangeRate: 0.86,
    paymentMethod: { type: 'paypal', email: 'alice.cooper@example.com' },
    status: 'succeeded',
    donorName: 'Alice Cooper',
    donorId: 'donor-009',
    donorEmail: 'alice.cooper@example.com',
    isAnonymous: false,
    giftAid: false,
    matchedAmount: 0,
    legalBasis: 'contractual_necessity',
    createdAt: '2025-12-05T00:00:00Z',
    receiptUrl: '#'
  },
  {
    id: 'txn-041',
    organizationId: 'org-001',
    processor: 'paypal',
    processorTransactionId: 'PAYID-M7S3K8N7',
    type: 'subscription_payment',
    subscriptionId: 'sub-008',
    campaignId: 'birthday-p2p-template',
    campaignName: 'Birthday Fundraiser Template',
    charityName: 'Borneo Orangutan Survival',
    lineItems: [
      {
        productId: 'education-program',
        productTitle: 'Support Local Conservation Education Program',
        quantity: 1,
        unitPrice: 30,
        frequency: 'monthly'
      }
    ],
    subtotal: 30,
    coverCostsAmount: 0,
    totalAmount: 30,
    currency: 'EUR',
    baseCurrency: 'GBP',
    exchangeRate: 0.86,
    campaignCurrency: 'GBP',
    campaignExchangeRate: 0.86,
    paymentMethod: { type: 'paypal', email: 'alice.cooper@example.com' },
    status: 'succeeded',
    donorName: 'Alice Cooper',
    donorId: 'donor-009',
    donorEmail: 'alice.cooper@example.com',
    isAnonymous: false,
    giftAid: false,
    matchedAmount: 0,
    legalBasis: 'contractual_necessity',
    createdAt: '2026-01-05T00:00:00Z',
    receiptUrl: '#'
  },

  // ============================================
  // BACKFILL SUBSCRIPTION PAYMENTS (sub-001 through sub-008)
  // ============================================

  // sub-001 backfill (Wild Amer, adopt-bumi, £15.45/mo — Aug–Nov 2025)
  ...(['2025-08-15', '2025-09-15', '2025-10-15', '2025-11-15'] as const).map(
    (date, i) =>
      ({
        id: `txn-${42 + i}`.padStart(7, '0').replace(/^0+txn/, 'txn'),
        organizationId: 'org-001',
        processor: 'stripe' as const,
        processorTransactionId: `pi_3RiA${i + 1}${String.fromCharCode(97 + i)}K2x9B1mN${4 + i}${String.fromCharCode(97 + i)}`,
        type: 'subscription_payment' as const,
        subscriptionId: 'sub-001',
        campaignId: 'adopt-orangutan',
        campaignName: 'Adopt an Orangutan',
        charityName: 'Borneo Orangutan Survival',
        lineItems: [
          {
            productId: 'adopt-bumi',
            productTitle: 'Adopt Bumi the Rescued Baby',
            quantity: 1,
            unitPrice: 15,
            frequency: 'monthly' as const
          }
        ],
        subtotal: 15,
        coverCostsAmount: 0.45,
        totalAmount: 15.45,
        currency: 'GBP',
        baseCurrency: 'GBP',
        exchangeRate: 1,
        campaignCurrency: 'GBP',
        campaignExchangeRate: 1,
        paymentMethod: { type: 'card' as const, last4: '4242', brand: 'visa' },
        status: 'succeeded' as const,
        donorName: 'Wild Amer',
        donorId: 'donor-001',
        donorEmail: 'awesome@charity.co.uk',
        isAnonymous: false,
        giftAid: true,
        giftAidDeclarationId: 'gad-001',
        giftAidAmount: 3.75,
        donorAddress: {
          line1: '42 Oakwood Drive',
          city: 'London',
          region: 'Greater London',
          postcode: 'SW1A 2AA',
          country: 'GB'
        },
        matchedAmount: 0,
        legalBasis: 'contractual_necessity' as const,
        createdAt: `${date}T00:00:00Z`,
        receiptUrl: '#'
      }) satisfies Transaction
  ),

  // sub-002 backfill (Wild Amer, bumi+maya, £25.75/mo — Oct–Nov 2025)
  ...(['2025-10-15', '2025-11-15'] as const).map(
    (date, i) =>
      ({
        id: `txn-0${46 + i}`,
        organizationId: 'org-001',
        processor: 'stripe' as const,
        processorTransactionId: `pi_3RiB${i + 1}${String.fromCharCode(101 + i)}K2x9B1mN${8 + i}${String.fromCharCode(101 + i)}`,
        type: 'subscription_payment' as const,
        subscriptionId: 'sub-002',
        campaignId: 'adopt-orangutan',
        campaignName: 'Adopt an Orangutan',
        charityName: 'Borneo Orangutan Survival',
        lineItems: [
          {
            productId: 'adopt-bumi',
            productTitle: 'Adopt Bumi the Rescued Baby',
            quantity: 1,
            unitPrice: 15,
            frequency: 'monthly' as const
          },
          {
            productId: 'adopt-maya',
            productTitle: 'Adopt Maya the Survivor',
            quantity: 1,
            unitPrice: 10,
            frequency: 'monthly' as const
          }
        ],
        subtotal: 25,
        coverCostsAmount: 0.75,
        totalAmount: 25.75,
        currency: 'GBP',
        baseCurrency: 'GBP',
        exchangeRate: 1,
        campaignCurrency: 'GBP',
        campaignExchangeRate: 1,
        paymentMethod: { type: 'card' as const, last4: '4242', brand: 'visa' },
        status: 'succeeded' as const,
        donorName: 'Wild Amer',
        donorId: 'donor-001',
        donorEmail: 'awesome@charity.co.uk',
        isAnonymous: false,
        giftAid: true,
        giftAidDeclarationId: 'gad-001',
        giftAidAmount: 6.25,
        donorAddress: {
          line1: '42 Oakwood Drive',
          city: 'London',
          region: 'Greater London',
          postcode: 'SW1A 2AA',
          country: 'GB'
        },
        matchedAmount: 0,
        legalBasis: 'contractual_necessity' as const,
        createdAt: `${date}T00:00:00Z`,
        receiptUrl: '#'
      }) satisfies Transaction
  ),

  // sub-003 backfill (Wild Amer, education-program, £25/mo PayPal — Sep–Nov 2025)
  ...(['2025-09-01', '2025-10-01', '2025-11-01'] as const).map(
    (date, i) =>
      ({
        id: `txn-0${48 + i}`,
        organizationId: 'org-001',
        processor: 'paypal' as const,
        processorTransactionId: `PAYID-M6${String.fromCharCode(81 + i)}${i + 1}K${6 + i}L${5 + i}`,
        type: 'subscription_payment' as const,
        subscriptionId: 'sub-003',
        campaignId: 'adopt-orangutan',
        campaignName: 'Adopt an Orangutan',
        charityName: 'Borneo Orangutan Survival',
        lineItems: [
          {
            productId: 'education-program',
            productTitle: 'Support Local Conservation Education Program',
            quantity: 1,
            unitPrice: 25,
            frequency: 'monthly' as const
          }
        ],
        subtotal: 25,
        coverCostsAmount: 0,
        totalAmount: 25,
        currency: 'GBP',
        baseCurrency: 'GBP',
        exchangeRate: 1,
        campaignCurrency: 'GBP',
        campaignExchangeRate: 1,
        paymentMethod: { type: 'paypal' as const, email: 'awesome@charity.co.uk' },
        status: 'succeeded' as const,
        donorName: 'Wild Amer',
        donorId: 'donor-001',
        donorEmail: 'awesome@charity.co.uk',
        isAnonymous: false,
        giftAid: false,
        matchedAmount: 0,
        legalBasis: 'contractual_necessity' as const,
        createdAt: `${date}T00:00:00Z`,
        receiptUrl: '#'
      }) satisfies Transaction
  ),

  // sub-004 backfill (Emma Wilson, adopt-maya, £10/mo — Jun–Sep 2025)
  ...(['2025-06-01', '2025-07-01', '2025-08-01', '2025-09-01'] as const).map(
    (date, i) =>
      ({
        id: `txn-0${51 + i}`,
        organizationId: 'org-001',
        processor: 'stripe' as const,
        processorTransactionId: `pi_3RiC${i + 1}${String.fromCharCode(103 + i)}K2x9B1mN${i}${String.fromCharCode(103 + i)}`,
        type: 'subscription_payment' as const,
        subscriptionId: 'sub-004',
        campaignId: 'adopt-orangutan',
        campaignName: 'Adopt an Orangutan',
        charityName: 'Borneo Orangutan Survival',
        lineItems: [
          {
            productId: 'adopt-maya',
            productTitle: 'Adopt Maya the Survivor',
            quantity: 1,
            unitPrice: 10,
            frequency: 'monthly' as const
          }
        ],
        subtotal: 10,
        coverCostsAmount: 0,
        totalAmount: 10,
        currency: 'GBP',
        baseCurrency: 'GBP',
        exchangeRate: 1,
        campaignCurrency: 'GBP',
        campaignExchangeRate: 1,
        paymentMethod: { type: 'card' as const, last4: '5556', brand: 'mastercard' },
        status: 'succeeded' as const,
        donorName: 'Emma Wilson',
        donorId: 'donor-002',
        donorEmail: 'emma.wilson@example.com',
        isAnonymous: false,
        giftAid: false,
        matchedAmount: 0,
        legalBasis: 'contractual_necessity' as const,
        createdAt: `${date}T00:00:00Z`,
        receiptUrl: '#'
      }) satisfies Transaction
  ),

  // sub-005 backfill (Rachel Green, tree-planting, £10/mo — Jul–Sep 2025)
  ...(['2025-07-01', '2025-08-01', '2025-09-01'] as const).map(
    (date, i) =>
      ({
        id: `txn-0${55 + i}`,
        organizationId: 'org-001',
        processor: 'stripe' as const,
        processorTransactionId: `pi_3RiD${i + 1}${String.fromCharCode(107 + i)}K2x9B1mN${4 + i}${String.fromCharCode(107 + i)}`,
        type: 'subscription_payment' as const,
        subscriptionId: 'sub-005',
        campaignId: 'birthday-p2p-template',
        campaignName: 'Birthday Fundraiser Template',
        charityName: 'Borneo Orangutan Survival',
        lineItems: [
          {
            productId: 'tree-planting',
            productTitle: 'Plant 10 Native Rainforest Trees for Wildlife',
            quantity: 1,
            unitPrice: 10,
            frequency: 'monthly' as const
          }
        ],
        subtotal: 10,
        coverCostsAmount: 0,
        totalAmount: 10,
        currency: 'GBP',
        baseCurrency: 'GBP',
        exchangeRate: 1,
        campaignCurrency: 'GBP',
        campaignExchangeRate: 1,
        paymentMethod: { type: 'card' as const, last4: '4242', brand: 'visa' },
        status: 'succeeded' as const,
        donorName: 'Rachel Green',
        donorId: 'donor-005',
        donorEmail: 'rachel.green@example.com',
        isAnonymous: false,
        giftAid: false,
        matchedAmount: 0,
        legalBasis: 'contractual_necessity' as const,
        createdAt: `${date}T00:00:00Z`,
        receiptUrl: '#'
      }) satisfies Transaction
  ),

  // sub-006 backfill (Sarah Mitchell, education-program, $25/mo — Oct–Nov 2025)
  ...(['2025-10-10', '2025-11-10'] as const).map(
    (date, i) =>
      ({
        id: `txn-0${58 + i}`,
        organizationId: 'org-001',
        processor: 'stripe' as const,
        processorTransactionId: `pi_3RiE${i + 1}${String.fromCharCode(110 + i)}K2x9B1mN${7 + i}${String.fromCharCode(110 + i)}`,
        type: 'subscription_payment' as const,
        subscriptionId: 'sub-006',
        campaignId: 'adopt-orangutan',
        campaignName: 'Adopt an Orangutan',
        charityName: 'Borneo Orangutan Survival',
        lineItems: [
          {
            productId: 'education-program',
            productTitle: 'Support Local Conservation Education Program',
            quantity: 1,
            unitPrice: 25,
            frequency: 'monthly' as const
          }
        ],
        subtotal: 25,
        coverCostsAmount: 0,
        totalAmount: 25,
        currency: 'USD',
        baseCurrency: 'GBP',
        exchangeRate: 0.79,
        campaignCurrency: 'GBP',
        campaignExchangeRate: 0.79,
        paymentMethod: { type: 'card' as const, last4: '4242', brand: 'visa' },
        status: 'succeeded' as const,
        donorName: 'Sarah Mitchell',
        donorId: 'donor-006',
        donorEmail: 'sarah.mitchell@example.com',
        isAnonymous: false,
        giftAid: false,
        matchedAmount: 0,
        legalBasis: 'contractual_necessity' as const,
        createdAt: `${date}T00:00:00Z`,
        receiptUrl: '#'
      }) satisfies Transaction
  ),

  // sub-007 backfill (Tom Wilson, adopt-maya, £10/mo — Nov–Dec 2025)
  ...(['2025-11-01', '2025-12-01'] as const).map(
    (date, i) =>
      ({
        id: `txn-0${60 + i}`,
        organizationId: 'org-001',
        processor: 'stripe' as const,
        processorTransactionId: `pi_3RiF${i + 1}${String.fromCharCode(112 + i)}K2x9B1mN${9 + i}${String.fromCharCode(112 + i)}`,
        type: 'subscription_payment' as const,
        subscriptionId: 'sub-007',
        campaignId: 'adopt-orangutan',
        campaignName: 'Adopt an Orangutan',
        charityName: 'Borneo Orangutan Survival',
        lineItems: [
          {
            productId: 'adopt-maya',
            productTitle: 'Adopt Maya the Survivor',
            quantity: 1,
            unitPrice: 10,
            frequency: 'monthly' as const
          }
        ],
        subtotal: 10,
        coverCostsAmount: 0,
        totalAmount: 10,
        currency: 'GBP',
        baseCurrency: 'GBP',
        exchangeRate: 1,
        campaignCurrency: 'GBP',
        campaignExchangeRate: 1,
        paymentMethod: { type: 'card' as const, last4: '5556', brand: 'mastercard' },
        status: 'succeeded' as const,
        donorName: 'Tom Wilson',
        donorId: 'donor-007',
        donorEmail: 'tom.wilson@example.com',
        isAnonymous: false,
        giftAid: false,
        matchedAmount: 0,
        legalBasis: 'contractual_necessity' as const,
        createdAt: `${date}T00:00:00Z`,
        receiptUrl: '#'
      }) satisfies Transaction
  ),

  // sub-008 backfill (Alice Cooper, education-program, €30/mo PayPal — Nov 2025)
  {
    id: 'txn-062',
    organizationId: 'org-001',
    processor: 'paypal',
    processorTransactionId: 'PAYID-M7Q1K6M5',
    type: 'subscription_payment',
    subscriptionId: 'sub-008',
    campaignId: 'birthday-p2p-template',
    campaignName: 'Birthday Fundraiser Template',
    charityName: 'Borneo Orangutan Survival',
    lineItems: [
      {
        productId: 'education-program',
        productTitle: 'Support Local Conservation Education Program',
        quantity: 1,
        unitPrice: 30,
        frequency: 'monthly'
      }
    ],
    subtotal: 30,
    coverCostsAmount: 0,
    totalAmount: 30,
    currency: 'EUR',
    baseCurrency: 'GBP',
    exchangeRate: 0.86,
    campaignCurrency: 'GBP',
    campaignExchangeRate: 0.86,
    paymentMethod: { type: 'paypal', email: 'alice.cooper@example.com' },
    status: 'succeeded',
    donorName: 'Alice Cooper',
    donorId: 'donor-009',
    donorEmail: 'alice.cooper@example.com',
    isAnonymous: false,
    giftAid: false,
    matchedAmount: 0,
    legalBasis: 'contractual_necessity',
    createdAt: '2025-11-05T00:00:00Z',
    receiptUrl: '#'
  }
]

/**
 * All transactions — generated one-time + hand-crafted subscription payments.
 *
 * In production this is the `transactions` table in Supabase.
 * Helper functions below derive campaign-specific views (recent donations,
 * stats) so that campaigns.ts doesn't duplicate this data.
 */
export const transactions: Transaction[] = [...generatedTransactions, ...subscriptionPayments]

// ============================================
// SUBSCRIPTIONS
// ============================================

/**
 * Sample subscriptions for donor portal
 *
 * Covers: active, paused, cancelled, past_due, single-item, multi-item,
 * Stripe, PayPal, monthly, yearly.
 */
export const subscriptions: Subscription[] = [
  // 1. Active monthly - single item (Adopt Bumi via Stripe)
  {
    id: 'sub-001',
    processor: 'stripe',
    processorSubscriptionId: 'sub_1PqR7sK2x9B1mN4o',
    campaignId: 'adopt-orangutan',
    campaignName: 'Adopt an Orangutan',
    charityName: 'Borneo Orangutan Survival',
    donorId: 'donor-001',
    donorName: 'Wild Amer',
    donorEmail: 'awesome@charity.co.uk',
    lineItems: [
      {
        productId: 'adopt-bumi',
        productTitle: 'Adopt Bumi the Rescued Baby',
        quantity: 1,
        unitPrice: 15,
        frequency: 'monthly'
      }
    ],
    subtotal: 15,
    coverCostsAmount: 0.45,
    totalAmount: 15.45,
    currency: 'GBP',
    baseCurrency: 'GBP',
    exchangeRate: 1,
    frequency: 'monthly',
    paymentMethod: { type: 'card', last4: '4242', brand: 'visa' },
    status: 'active',
    currentPeriodStart: '2026-01-15T00:00:00Z',
    currentPeriodEnd: '2026-02-15T00:00:00Z',
    nextBillingDate: '2026-02-15T00:00:00Z',
    createdAt: '2025-08-15T10:00:00Z',
    totalPaid: 92.7,
    paymentCount: 6
  },
  // 2. Active monthly - multi-item Impact Cart (Bumi + Maya via Stripe)
  {
    id: 'sub-002',
    processor: 'stripe',
    processorSubscriptionId: 'sub_1PqS2tK2x9B1mN5p',
    campaignId: 'adopt-orangutan',
    campaignName: 'Adopt an Orangutan',
    charityName: 'Borneo Orangutan Survival',
    donorId: 'donor-001',
    donorName: 'Wild Amer',
    donorEmail: 'awesome@charity.co.uk',
    lineItems: [
      {
        productId: 'adopt-bumi',
        productTitle: 'Adopt Bumi the Rescued Baby',
        quantity: 1,
        unitPrice: 15,
        frequency: 'monthly'
      },
      {
        productId: 'adopt-maya',
        productTitle: 'Adopt Maya the Survivor',
        quantity: 1,
        unitPrice: 10,
        frequency: 'monthly'
      }
    ],
    subtotal: 25,
    coverCostsAmount: 0.75,
    totalAmount: 25.75,
    currency: 'GBP',
    baseCurrency: 'GBP',
    exchangeRate: 1,
    frequency: 'monthly',
    paymentMethod: { type: 'card', last4: '4242', brand: 'visa' },
    status: 'active',
    currentPeriodStart: '2026-01-15T00:00:00Z',
    currentPeriodEnd: '2026-02-15T00:00:00Z',
    nextBillingDate: '2026-02-15T00:00:00Z',
    createdAt: '2025-10-15T12:00:00Z',
    totalPaid: 77.25,
    paymentCount: 3
  },
  // 3. Active monthly - PayPal (Education Program)
  {
    id: 'sub-003',
    processor: 'paypal',
    processorSubscriptionId: 'I-BW452GLLEP1G',
    campaignId: 'adopt-orangutan',
    campaignName: 'Adopt an Orangutan',
    charityName: 'Borneo Orangutan Survival',
    donorId: 'donor-001',
    donorName: 'Wild Amer',
    donorEmail: 'awesome@charity.co.uk',
    lineItems: [
      {
        productId: 'education-program',
        productTitle: 'Support Local Conservation Education Program',
        quantity: 1,
        unitPrice: 25,
        frequency: 'monthly'
      }
    ],
    subtotal: 25,
    coverCostsAmount: 0,
    totalAmount: 25,
    currency: 'GBP',
    baseCurrency: 'GBP',
    exchangeRate: 1,
    frequency: 'monthly',
    paymentMethod: { type: 'paypal', email: 'awesome@charity.co.uk' },
    status: 'active',
    currentPeriodStart: '2026-01-01T00:00:00Z',
    currentPeriodEnd: '2026-02-01T00:00:00Z',
    nextBillingDate: '2026-02-01T00:00:00Z',
    createdAt: '2025-09-01T09:00:00Z',
    totalPaid: 125,
    paymentCount: 5
  },
  // 4. Paused subscription (Emma Wilson, adopt-maya)
  {
    id: 'sub-004',
    processor: 'stripe',
    processorSubscriptionId: 'sub_1PqT8uK2x9B1mN6q',
    campaignId: 'adopt-orangutan',
    campaignName: 'Adopt an Orangutan',
    charityName: 'Borneo Orangutan Survival',
    donorId: 'donor-002',
    donorName: 'Emma Wilson',
    donorEmail: 'emma.wilson@example.com',
    lineItems: [
      {
        productId: 'adopt-maya',
        productTitle: 'Adopt Maya the Survivor',
        quantity: 1,
        unitPrice: 10,
        frequency: 'monthly'
      }
    ],
    subtotal: 10,
    coverCostsAmount: 0,
    totalAmount: 10,
    currency: 'GBP',
    baseCurrency: 'GBP',
    exchangeRate: 1,
    frequency: 'monthly',
    paymentMethod: { type: 'card', last4: '5556', brand: 'mastercard' },
    status: 'paused',
    currentPeriodStart: '2025-12-01T00:00:00Z',
    currentPeriodEnd: '2026-01-01T00:00:00Z',
    pausedAt: '2025-12-20T14:00:00Z',
    createdAt: '2025-06-01T08:00:00Z',
    totalPaid: 60,
    paymentCount: 6
  },
  // 5. Cancelled subscription (Rachel Green, tree-planting)
  {
    id: 'sub-005',
    processor: 'stripe',
    processorSubscriptionId: 'sub_1PqU9vK2x9B1mN7r',
    campaignId: 'birthday-p2p-template',
    campaignName: 'Birthday Fundraiser Template',
    charityName: 'Borneo Orangutan Survival',
    donorId: 'donor-005',
    donorName: 'Rachel Green',
    donorEmail: 'rachel.green@example.com',
    lineItems: [
      {
        productId: 'tree-planting',
        productTitle: 'Plant 10 Native Rainforest Trees for Wildlife',
        quantity: 1,
        unitPrice: 10,
        frequency: 'monthly'
      }
    ],
    subtotal: 10,
    coverCostsAmount: 0,
    totalAmount: 10,
    currency: 'GBP',
    baseCurrency: 'GBP',
    exchangeRate: 1,
    frequency: 'monthly',
    paymentMethod: { type: 'card', last4: '4242', brand: 'visa' },
    status: 'cancelled',
    currentPeriodStart: '2025-11-01T00:00:00Z',
    currentPeriodEnd: '2025-12-01T00:00:00Z',
    cancelledAt: '2025-11-25T16:00:00Z',
    createdAt: '2025-07-01T10:00:00Z',
    totalPaid: 50,
    paymentCount: 5
  },
  // 6. Active monthly - education program, USD $25/mo (Sarah Mitchell)
  {
    id: 'sub-006',
    processor: 'stripe',
    processorSubscriptionId: 'sub_2AbC3dK2x9B1mN8s',
    campaignId: 'adopt-orangutan',
    campaignName: 'Adopt an Orangutan',
    charityName: 'Borneo Orangutan Survival',
    donorId: 'donor-006',
    donorName: 'Sarah Mitchell',
    donorEmail: 'sarah.mitchell@example.com',
    lineItems: [
      {
        productId: 'education-program',
        productTitle: 'Support Local Conservation Education Program',
        quantity: 1,
        unitPrice: 25,
        frequency: 'monthly'
      }
    ],
    subtotal: 25,
    coverCostsAmount: 0,
    totalAmount: 25,
    currency: 'USD',
    baseCurrency: 'GBP',
    exchangeRate: 0.79,
    frequency: 'monthly',
    paymentMethod: { type: 'card', last4: '4242', brand: 'visa' },
    status: 'active',
    currentPeriodStart: '2026-01-10T00:00:00Z',
    currentPeriodEnd: '2026-02-10T00:00:00Z',
    nextBillingDate: '2026-02-10T00:00:00Z',
    createdAt: '2025-10-10T11:00:00Z',
    totalPaid: 100,
    paymentCount: 4
  },
  // 7. Active monthly - adopt-maya, GBP £10/mo (Tom Wilson)
  {
    id: 'sub-007',
    processor: 'stripe',
    processorSubscriptionId: 'sub_3CdE4fK2x9B1mN9t',
    campaignId: 'adopt-orangutan',
    campaignName: 'Adopt an Orangutan',
    charityName: 'Borneo Orangutan Survival',
    donorId: 'donor-007',
    donorName: 'Tom Wilson',
    donorEmail: 'tom.wilson@example.com',
    lineItems: [
      {
        productId: 'adopt-maya',
        productTitle: 'Adopt Maya the Survivor',
        quantity: 1,
        unitPrice: 10,
        frequency: 'monthly'
      }
    ],
    subtotal: 10,
    coverCostsAmount: 0,
    totalAmount: 10,
    currency: 'GBP',
    baseCurrency: 'GBP',
    exchangeRate: 1,
    frequency: 'monthly',
    paymentMethod: { type: 'card', last4: '5556', brand: 'mastercard' },
    status: 'active',
    currentPeriodStart: '2026-01-01T00:00:00Z',
    currentPeriodEnd: '2026-02-01T00:00:00Z',
    nextBillingDate: '2026-02-01T00:00:00Z',
    createdAt: '2025-11-01T09:30:00Z',
    totalPaid: 30,
    paymentCount: 3
  },
  // 8. Active monthly - education program, EUR €30/mo via PayPal (Alice Cooper)
  {
    id: 'sub-008',
    processor: 'paypal',
    processorSubscriptionId: 'I-CW563HMMFP2H',
    campaignId: 'birthday-p2p-template',
    campaignName: 'Birthday Fundraiser Template',
    charityName: 'Borneo Orangutan Survival',
    donorId: 'donor-009',
    donorName: 'Alice Cooper',
    donorEmail: 'alice.cooper@example.com',
    lineItems: [
      {
        productId: 'education-program',
        productTitle: 'Support Local Conservation Education Program',
        quantity: 1,
        unitPrice: 30,
        frequency: 'monthly'
      }
    ],
    subtotal: 30,
    coverCostsAmount: 0,
    totalAmount: 30,
    currency: 'EUR',
    baseCurrency: 'GBP',
    exchangeRate: 0.86,
    frequency: 'monthly',
    paymentMethod: { type: 'paypal', email: 'alice.cooper@example.com' },
    status: 'active',
    currentPeriodStart: '2026-01-05T00:00:00Z',
    currentPeriodEnd: '2026-02-05T00:00:00Z',
    nextBillingDate: '2026-02-05T00:00:00Z',
    createdAt: '2025-11-05T14:00:00Z',
    totalPaid: 90,
    paymentCount: 3
  }
]

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get recent donations for a campaign's crowdfunding page.
 * Converts Transaction records into the lightweight CampaignDonation format.
 * Only includes succeeded transactions, sorted newest first.
 */
export function getRecentDonations(campaignId: string, limit?: number): CampaignDonation[] {
  const donations = transactions
    .filter((t) => t.campaignId === campaignId && t.status === 'succeeded')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((t) => ({
      id: t.id,
      donorName: t.isAnonymous ? 'Anonymous' : t.donorName,
      amount: t.subtotal,
      currency: t.currency,
      message: t.message,
      isAnonymous: t.isAnonymous,
      createdAt: t.createdAt,
      matchedAmount: t.matchedAmount,
      ...(t.matchPeriodId ? { matchPeriodId: t.matchPeriodId } : {})
    }))

  return limit ? donations.slice(0, limit) : donations
}

/**
 * Compute aggregate stats for a campaign from its transactions.
 * Uses totalAmount * exchangeRate for consistent org-currency totals (cover costs go to charity).
 * totalMatched is the sum of matchedAmount from this campaign's succeeded transactions.
 */
export function computeCampaignStats(campaignId: string, campaignCurrency: string): CampaignStats {
  const succeeded = transactions.filter(
    (t) => t.campaignId === campaignId && t.status === 'succeeded'
  )

  const totalRaised = succeeded.reduce((sum, t) => sum + t.totalAmount * t.campaignExchangeRate, 0)
  const totalMatched = succeeded.reduce((sum, t) => sum + (t.matchedAmount ?? 0), 0)
  const totalDonations = succeeded.length
  const uniqueEmails = new Set(succeeded.map((t) => t.donorEmail))
  const totalDonors = uniqueEmails.size
  const averageDonation = totalDonations > 0 ? totalRaised / totalDonations : 0
  const topDonation = succeeded.reduce(
    (max, t) => Math.max(max, t.totalAmount * t.campaignExchangeRate),
    0
  )

  return {
    totalRaised,
    totalMatched,
    totalDonations,
    totalDonors,
    averageDonation,
    topDonation,
    currency: campaignCurrency
  }
}

/** Compute raisedAmount, donationCount, and totalMatched for a fundraiser from its transactions */
export function computeFundraiserStats(
  campaignId: string,
  campaignCurrency: string
): {
  raisedAmount: number
  donationCount: number
  totalMatched: number
  currency: string
} {
  const succeeded = transactions.filter(
    (t) => t.campaignId === campaignId && t.status === 'succeeded'
  )
  return {
    raisedAmount: succeeded.reduce((sum, t) => sum + t.totalAmount * t.campaignExchangeRate, 0),
    donationCount: succeeded.length,
    totalMatched: succeeded.reduce((sum, t) => sum + (t.matchedAmount ?? 0), 0),
    currency: campaignCurrency
  }
}

/** Compute total poolDrawn for a match period from actual transactions */
export function computePoolDrawn(matchPeriodId: string): number {
  return transactions
    .filter((t) => t.matchPeriodId === matchPeriodId && t.status === 'succeeded')
    .reduce((sum, t) => sum + t.matchedAmount, 0)
}

/** Get transactions for a specific donor (by email) */
export function getUserTransactions(email: string): Transaction[] {
  return transactions.filter((t) => t.donorEmail === email)
}

/** Get subscriptions for a specific donor (by email — matches payment method email or donor email) */
export function getUserSubscriptions(email: string): Subscription[] {
  return subscriptions.filter(
    (s) =>
      s.donorEmail === email ||
      (s.paymentMethod.type === 'paypal' && s.paymentMethod.email === email)
  )
}

// ============================================
// COMPLIANCE SAMPLE DATA
// ============================================

/**
 * Sample Gift Aid declarations (HMRC compliance)
 * One declaration can cover all future donations from a donor.
 */
export const giftAidDeclarations: GiftAidDeclaration[] = [
  {
    id: 'gad-001',
    organizationId: 'org-001',
    donorUserId: 'donor-001',
    donorName: 'Wild Amer',
    donorEmail: 'awesome@charity.co.uk',
    donorAddress: {
      line1: '42 Oakwood Drive',
      city: 'London',
      region: 'Greater London',
      postcode: 'SW1A 2AA',
      country: 'GB'
    },
    declaredAt: '2025-01-15T10:00:00Z',
    coversFrom: '2021-01-15T00:00:00Z',
    isActive: true,
    createdAt: '2025-01-15T10:00:00Z'
  },
  {
    id: 'gad-002',
    organizationId: 'org-001',
    donorUserId: 'donor-011',
    donorName: 'Claire Wang',
    donorEmail: 'claire.wang@example.com',
    donorAddress: {
      line1: '12 Willow Court',
      city: 'Cambridge',
      postcode: 'CB2 1TN',
      country: 'GB'
    },
    declaredAt: '2025-06-01T14:30:00Z',
    isActive: true,
    createdAt: '2025-06-01T14:30:00Z'
  }
]

/**
 * Sample consent records (GDPR compliance)
 * Logs every opt-in/out event with timestamp and wording shown.
 */
export const consentRecords: ConsentRecord[] = [
  {
    id: 'cr-001',
    organizationId: 'org-001',
    donorUserId: 'donor-001',
    donorEmail: 'awesome@charity.co.uk',
    purpose: 'marketing_email',
    granted: true,
    legalBasis: 'consent',
    sourceFormId: 'form-001',
    wordingShown:
      'Join our email list. Get updates on our impact and latest news. Unsubscribe anytime.',
    recordedAt: '2026-01-28T14:30:00Z',
    ipAddress: '203.0.113.42'
  },
  {
    id: 'cr-002',
    organizationId: 'org-001',
    donorUserId: 'donor-011',
    donorEmail: 'claire.wang@example.com',
    purpose: 'marketing_email',
    granted: true,
    legalBasis: 'consent',
    sourceFormId: 'form-001',
    wordingShown:
      'Join our email list. Get updates on our impact and latest news. Unsubscribe anytime.',
    recordedAt: '2025-12-15T10:20:00Z'
  },
  {
    id: 'cr-003',
    organizationId: 'org-001',
    donorUserId: 'donor-011',
    donorEmail: 'claire.wang@example.com',
    purpose: 'marketing_email',
    granted: false,
    legalBasis: 'consent',
    wordingShown: 'Unsubscribed via email preferences',
    recordedAt: '2026-01-10T08:45:00Z'
  }
]

/** Get Gift Aid declarations for a donor */
export function getUserGiftAidDeclarations(email: string): GiftAidDeclaration[] {
  return giftAidDeclarations.filter((d) => d.donorEmail === email)
}

/** Get consent records for a donor */
export function getUserConsentRecords(email: string): ConsentRecord[] {
  return consentRecords.filter((r) => r.donorEmail === email)
}
