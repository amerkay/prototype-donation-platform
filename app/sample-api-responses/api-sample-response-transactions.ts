import type { Transaction, Subscription } from '~/features/donor-portal/types'
import type { CampaignDonation, CampaignStats } from '~/features/campaigns/shared/types'

/**
 * Sample transactions — master table for ALL donations across ALL donors.
 *
 * In production this is the `transactions` table in Supabase.
 * Helper functions below derive campaign-specific views (recent donations,
 * stats) so that campaigns.ts doesn't duplicate this data.
 *
 * Records 1–12: Wild Amer (awesome@charity.co.uk) — donor portal demo data
 * Records 13–15: Other donors → adopt-orangutan campaign
 * Records 16–17: Other donors → birthday-p2p-template campaign
 * Records 18–20: Other donors → wild-amer-birthday-fundraiser campaign
 * Records 21–22: Other donors → wild-amer-birthday-2-fundraiser campaign
 */
export const transactions: Transaction[] = [
  // ============================================
  // WILD AMER TRANSACTIONS (donor portal)
  // ============================================

  // 1. Simple one-time Stripe card donation
  {
    id: 'txn-001',
    processor: 'stripe',
    processorTransactionId: 'pi_3PqR7sK2x9B1mN4o',
    type: 'one_time',
    campaignId: 'adopt-orangutan',
    campaignName: 'Adopt an Orangutan',
    charityName: 'Borneo Orangutan Survival',
    lineItems: [
      {
        productId: 'tree-planting',
        productName: 'Plant 10 Trees',
        productIcon: '🌳',
        quantity: 2,
        unitPrice: 30,
        frequency: 'once'
      }
    ],
    subtotal: 60,
    coverCostsAmount: 1.8,
    totalAmount: 61.8,
    currency: 'GBP',
    paymentMethod: { type: 'card', last4: '4242', brand: 'visa' },
    status: 'succeeded',
    donorName: 'Wild Amer',
    donorEmail: 'awesome@charity.co.uk',
    isAnonymous: false,
    giftAid: true,
    createdAt: '2026-01-28T14:30:00Z',
    receiptUrl: '#'
  },

  // 2. PayPal one-time donation with tribute
  {
    id: 'txn-002',
    processor: 'paypal',
    processorTransactionId: 'PAYID-M5N8K3L2',
    type: 'one_time',
    campaignId: 'adopt-orangutan',
    campaignName: 'Adopt an Orangutan',
    charityName: 'Borneo Orangutan Survival',
    lineItems: [
      {
        productId: 'custom-amount',
        productName: 'Donation',
        productIcon: '🦧',
        quantity: 1,
        unitPrice: 100,
        frequency: 'once'
      }
    ],
    subtotal: 100,
    coverCostsAmount: 0,
    totalAmount: 100,
    currency: 'GBP',
    paymentMethod: { type: 'paypal', email: 'awesome@charity.co.uk' },
    status: 'succeeded',
    donorName: 'Wild Amer',
    donorEmail: 'awesome@charity.co.uk',
    isAnonymous: false,
    message: 'In loving memory of Grandma Rose',
    tribute: { type: 'memorial', honoreeName: 'Rose Amer' },
    giftAid: false,
    createdAt: '2026-01-20T10:15:00Z',
    receiptUrl: '#'
  },

  // 3. Subscription payment (monthly Adopt Bumi)
  {
    id: 'txn-003',
    processor: 'stripe',
    processorTransactionId: 'pi_3PqS2tK2x9B1mN5p',
    type: 'subscription_payment',
    subscriptionId: 'sub-001',
    campaignId: 'adopt-orangutan',
    campaignName: 'Adopt an Orangutan',
    charityName: 'Borneo Orangutan Survival',
    lineItems: [
      {
        productId: 'adopt-bumi',
        productName: 'Adopt Bumi the Orangutan',
        productIcon: '🦧',
        quantity: 1,
        unitPrice: 15,
        frequency: 'monthly'
      }
    ],
    subtotal: 15,
    coverCostsAmount: 0.45,
    totalAmount: 15.45,
    currency: 'GBP',
    paymentMethod: { type: 'card', last4: '4242', brand: 'visa' },
    status: 'succeeded',
    donorName: 'Wild Amer',
    donorEmail: 'awesome@charity.co.uk',
    isAnonymous: false,
    giftAid: true,
    createdAt: '2026-01-15T00:00:00Z',
    receiptUrl: '#'
  },

  // 4. Impact Cart multi-item checkout (mixed frequencies via Stripe)
  {
    id: 'txn-004',
    processor: 'stripe',
    processorTransactionId: 'pi_3PqT8uK2x9B1mN6q',
    type: 'one_time',
    campaignId: 'adopt-orangutan',
    campaignName: 'Adopt an Orangutan',
    charityName: 'Borneo Orangutan Survival',
    lineItems: [
      {
        productId: 'tree-planting',
        productName: 'Plant 10 Trees',
        productIcon: '🌳',
        quantity: 1,
        unitPrice: 30,
        frequency: 'once'
      },
      {
        productId: 'custom-amount',
        productName: 'Donation',
        productIcon: '🦧',
        quantity: 1,
        unitPrice: 50,
        frequency: 'once'
      }
    ],
    subtotal: 80,
    coverCostsAmount: 2.4,
    totalAmount: 82.4,
    currency: 'GBP',
    paymentMethod: { type: 'card', last4: '5556', brand: 'mastercard' },
    status: 'succeeded',
    donorName: 'Wild Amer',
    donorEmail: 'awesome@charity.co.uk',
    isAnonymous: false,
    message: 'Keep up the great work!',
    giftAid: true,
    createdAt: '2026-01-10T16:45:00Z',
    receiptUrl: '#'
  },

  // 5. Subscription payment (monthly education program via PayPal)
  {
    id: 'txn-005',
    processor: 'paypal',
    processorTransactionId: 'PAYID-M5N9K4L3',
    type: 'subscription_payment',
    subscriptionId: 'sub-003',
    campaignId: 'adopt-orangutan',
    campaignName: 'Adopt an Orangutan',
    charityName: 'Borneo Orangutan Survival',
    lineItems: [
      {
        productId: 'education-program',
        productName: 'Support Education Program',
        productIcon: '📚',
        quantity: 1,
        unitPrice: 25,
        frequency: 'monthly'
      }
    ],
    subtotal: 25,
    coverCostsAmount: 0,
    totalAmount: 25,
    currency: 'GBP',
    paymentMethod: { type: 'paypal', email: 'awesome@charity.co.uk' },
    status: 'succeeded',
    donorName: 'Wild Amer',
    donorEmail: 'awesome@charity.co.uk',
    isAnonymous: false,
    giftAid: false,
    createdAt: '2026-01-01T00:00:00Z',
    receiptUrl: '#'
  },

  // 6. Failed transaction
  {
    id: 'txn-006',
    processor: 'stripe',
    processorTransactionId: 'pi_3PqU9vK2x9B1mN7r',
    type: 'one_time',
    campaignId: 'wild-amer-birthday-fundraiser',
    campaignName: "Wild Amer's Birthday Fundraiser",
    charityName: 'Borneo Orangutan Survival',
    lineItems: [
      {
        productId: 'custom-amount',
        productName: 'Donation',
        productIcon: '🎂',
        quantity: 1,
        unitPrice: 50,
        frequency: 'once'
      }
    ],
    subtotal: 50,
    coverCostsAmount: 0,
    totalAmount: 50,
    currency: 'GBP',
    paymentMethod: { type: 'card', last4: '0019', brand: 'visa' },
    status: 'failed',
    donorName: 'Wild Amer',
    donorEmail: 'awesome@charity.co.uk',
    isAnonymous: false,
    giftAid: false,
    createdAt: '2025-12-28T09:20:00Z'
  },

  // 7. Refunded transaction
  {
    id: 'txn-007',
    processor: 'stripe',
    processorTransactionId: 'pi_3PqV0wK2x9B1mN8s',
    type: 'one_time',
    campaignId: 'adopt-orangutan',
    campaignName: 'Adopt an Orangutan',
    charityName: 'Borneo Orangutan Survival',
    lineItems: [
      {
        productId: 'custom-amount',
        productName: 'Donation',
        productIcon: '🦧',
        quantity: 1,
        unitPrice: 200,
        frequency: 'once'
      }
    ],
    subtotal: 200,
    coverCostsAmount: 6,
    totalAmount: 206,
    currency: 'GBP',
    paymentMethod: { type: 'card', last4: '4242', brand: 'visa' },
    status: 'refunded',
    donorName: 'Wild Amer',
    donorEmail: 'awesome@charity.co.uk',
    isAnonymous: false,
    giftAid: true,
    createdAt: '2025-12-15T11:00:00Z',
    receiptUrl: '#'
  },

  // 8. Subscription payment for multi-item subscription (Bumi + Maya)
  {
    id: 'txn-008',
    processor: 'stripe',
    processorTransactionId: 'pi_3PqW1xK2x9B1mN9t',
    type: 'subscription_payment',
    subscriptionId: 'sub-002',
    campaignId: 'adopt-orangutan',
    campaignName: 'Adopt an Orangutan',
    charityName: 'Borneo Orangutan Survival',
    lineItems: [
      {
        productId: 'adopt-bumi',
        productName: 'Adopt Bumi the Orangutan',
        productIcon: '🦧',
        quantity: 1,
        unitPrice: 15,
        frequency: 'monthly'
      },
      {
        productId: 'adopt-maya',
        productName: 'Adopt Maya the Orangutan',
        productIcon: '🦧',
        quantity: 1,
        unitPrice: 10,
        frequency: 'monthly'
      }
    ],
    subtotal: 25,
    coverCostsAmount: 0.75,
    totalAmount: 25.75,
    currency: 'GBP',
    paymentMethod: { type: 'card', last4: '4242', brand: 'visa' },
    status: 'succeeded',
    donorName: 'Wild Amer',
    donorEmail: 'awesome@charity.co.uk',
    isAnonymous: false,
    giftAid: true,
    createdAt: '2025-12-15T00:00:00Z',
    receiptUrl: '#'
  },

  // 9. One-time donation to birthday fundraiser with gift tribute
  {
    id: 'txn-009',
    processor: 'stripe',
    processorTransactionId: 'pi_3PqX2yK2x9B1mN0u',
    type: 'one_time',
    campaignId: 'birthday-p2p-template',
    campaignName: 'Birthday Fundraiser Template',
    charityName: 'Borneo Orangutan Survival',
    lineItems: [
      {
        productId: 'custom-amount',
        productName: 'Birthday Donation',
        productIcon: '🎂',
        quantity: 1,
        unitPrice: 25,
        frequency: 'once'
      }
    ],
    subtotal: 25,
    coverCostsAmount: 0,
    totalAmount: 25,
    currency: 'GBP',
    paymentMethod: { type: 'card', last4: '5556', brand: 'mastercard' },
    status: 'succeeded',
    donorName: 'Wild Amer',
    donorEmail: 'awesome@charity.co.uk',
    isAnonymous: false,
    message: 'Happy Birthday Michael!',
    tribute: { type: 'gift', honoreeName: 'Michael Chen' },
    giftAid: true,
    createdAt: '2025-12-01T18:30:00Z',
    receiptUrl: '#'
  },

  // 10. Older subscription payment
  {
    id: 'txn-010',
    processor: 'stripe',
    processorTransactionId: 'pi_3PqY3zK2x9B1mN1v',
    type: 'subscription_payment',
    subscriptionId: 'sub-001',
    campaignId: 'adopt-orangutan',
    campaignName: 'Adopt an Orangutan',
    charityName: 'Borneo Orangutan Survival',
    lineItems: [
      {
        productId: 'adopt-bumi',
        productName: 'Adopt Bumi the Orangutan',
        productIcon: '🦧',
        quantity: 1,
        unitPrice: 15,
        frequency: 'monthly'
      }
    ],
    subtotal: 15,
    coverCostsAmount: 0.45,
    totalAmount: 15.45,
    currency: 'GBP',
    paymentMethod: { type: 'card', last4: '4242', brand: 'visa' },
    status: 'succeeded',
    donorName: 'Wild Amer',
    donorEmail: 'awesome@charity.co.uk',
    isAnonymous: false,
    giftAid: true,
    createdAt: '2025-12-15T00:00:00Z',
    receiptUrl: '#'
  },

  // 11. Impact Cart multi-item via PayPal (recurring items)
  {
    id: 'txn-011',
    processor: 'paypal',
    processorTransactionId: 'PAYID-M5P0K5L4',
    type: 'subscription_payment',
    subscriptionId: 'sub-003',
    campaignId: 'adopt-orangutan',
    campaignName: 'Adopt an Orangutan',
    charityName: 'Borneo Orangutan Survival',
    lineItems: [
      {
        productId: 'education-program',
        productName: 'Support Education Program',
        productIcon: '📚',
        quantity: 1,
        unitPrice: 25,
        frequency: 'monthly'
      }
    ],
    subtotal: 25,
    coverCostsAmount: 0,
    totalAmount: 25,
    currency: 'GBP',
    paymentMethod: { type: 'paypal', email: 'awesome@charity.co.uk' },
    status: 'succeeded',
    donorName: 'Wild Amer',
    donorEmail: 'awesome@charity.co.uk',
    isAnonymous: false,
    giftAid: false,
    createdAt: '2025-12-01T00:00:00Z',
    receiptUrl: '#'
  },

  // 12. Older one-time donation via bank transfer
  {
    id: 'txn-012',
    processor: 'stripe',
    processorTransactionId: 'pi_3PqZ4aK2x9B1mN2w',
    type: 'one_time',
    campaignId: 'adopt-orangutan',
    campaignName: 'Adopt an Orangutan',
    charityName: 'Borneo Orangutan Survival',
    lineItems: [
      {
        productId: 'custom-amount',
        productName: 'Donation',
        productIcon: '🦧',
        quantity: 1,
        unitPrice: 500,
        frequency: 'once'
      }
    ],
    subtotal: 500,
    coverCostsAmount: 15,
    totalAmount: 515,
    currency: 'GBP',
    paymentMethod: { type: 'bank_transfer' },
    status: 'succeeded',
    donorName: 'Wild Amer',
    donorEmail: 'awesome@charity.co.uk',
    isAnonymous: true,
    giftAid: true,
    createdAt: '2025-11-10T14:00:00Z',
    receiptUrl: '#'
  },

  // ============================================
  // ADOPT-ORANGUTAN CAMPAIGN — other donors
  // ============================================

  // 13. Emma Wilson — £250
  {
    id: 'txn-013',
    processor: 'stripe',
    processorTransactionId: 'pi_3RaA1bK2x9B1mN3x',
    type: 'one_time',
    campaignId: 'adopt-orangutan',
    campaignName: 'Adopt an Orangutan',
    charityName: 'Borneo Orangutan Survival',
    lineItems: [
      {
        productId: 'custom-amount',
        productName: 'Donation',
        productIcon: '🦧',
        quantity: 1,
        unitPrice: 250,
        frequency: 'once'
      }
    ],
    subtotal: 250,
    coverCostsAmount: 7.5,
    totalAmount: 257.5,
    currency: 'GBP',
    paymentMethod: { type: 'card', last4: '1234', brand: 'visa' },
    status: 'succeeded',
    donorName: 'Emma Wilson',
    donorEmail: 'emma.wilson@example.com',
    isAnonymous: false,
    message: 'Keep up the amazing work saving these beautiful creatures!',
    giftAid: true,
    createdAt: '2026-01-14T09:30:00Z',
    receiptUrl: '#'
  },

  // 14. Anonymous — £1000 (bank transfer)
  {
    id: 'txn-014',
    processor: 'stripe',
    processorTransactionId: 'pi_3RaE5fK2x9B1mN7b',
    type: 'one_time',
    campaignId: 'adopt-orangutan',
    campaignName: 'Adopt an Orangutan',
    charityName: 'Borneo Orangutan Survival',
    lineItems: [
      {
        productId: 'custom-amount',
        productName: 'Donation',
        productIcon: '🦧',
        quantity: 1,
        unitPrice: 1000,
        frequency: 'once'
      }
    ],
    subtotal: 1000,
    coverCostsAmount: 30,
    totalAmount: 1030,
    currency: 'GBP',
    paymentMethod: { type: 'bank_transfer' },
    status: 'succeeded',
    donorName: 'Anonymous',
    donorEmail: 'anon2@example.com',
    isAnonymous: true,
    giftAid: true,
    createdAt: '2026-01-13T14:20:00Z',
    receiptUrl: '#'
  },

  // 15. Michael Lee — £300
  {
    id: 'txn-015',
    processor: 'stripe',
    processorTransactionId: 'pi_3RaJ0kK2x9B1mN2g',
    type: 'one_time',
    campaignId: 'adopt-orangutan',
    campaignName: 'Adopt an Orangutan',
    charityName: 'Borneo Orangutan Survival',
    lineItems: [
      {
        productId: 'custom-amount',
        productName: 'Donation',
        productIcon: '🦧',
        quantity: 1,
        unitPrice: 300,
        frequency: 'once'
      }
    ],
    subtotal: 300,
    coverCostsAmount: 9,
    totalAmount: 309,
    currency: 'GBP',
    paymentMethod: { type: 'card', last4: '8901', brand: 'mastercard' },
    status: 'succeeded',
    donorName: 'Michael Lee',
    donorEmail: 'michael.lee@example.com',
    isAnonymous: false,
    message: 'Donated on behalf of my company.',
    giftAid: false,
    createdAt: '2026-01-11T09:00:00Z',
    receiptUrl: '#'
  },

  // ============================================
  // BIRTHDAY P2P TEMPLATE — other donors
  // ============================================

  // 16. John Smith — £100
  {
    id: 'txn-016',
    processor: 'stripe',
    processorTransactionId: 'pi_3RbA1lK2x9B1mN3h',
    type: 'one_time',
    campaignId: 'birthday-p2p-template',
    campaignName: 'Birthday Fundraiser Template',
    charityName: 'Borneo Orangutan Survival',
    lineItems: [
      {
        productId: 'custom-amount',
        productName: 'Birthday Donation',
        productIcon: '🎂',
        quantity: 1,
        unitPrice: 100,
        frequency: 'once'
      }
    ],
    subtotal: 100,
    coverCostsAmount: 0,
    totalAmount: 100,
    currency: 'GBP',
    paymentMethod: { type: 'card', last4: '4567', brand: 'visa' },
    status: 'succeeded',
    donorName: 'John Smith',
    donorEmail: 'john.smith@example.com',
    isAnonymous: false,
    message: 'Happy Birthday Sarah!',
    giftAid: false,
    createdAt: '2026-01-10T12:30:00Z',
    receiptUrl: '#'
  },

  // 17. Rachel Green — £75
  {
    id: 'txn-017',
    processor: 'stripe',
    processorTransactionId: 'pi_3RbC3nK2x9B1mN5j',
    type: 'one_time',
    campaignId: 'birthday-p2p-template',
    campaignName: 'Birthday Fundraiser Template',
    charityName: 'Borneo Orangutan Survival',
    lineItems: [
      {
        productId: 'custom-amount',
        productName: 'Birthday Donation',
        productIcon: '🎂',
        quantity: 1,
        unitPrice: 75,
        frequency: 'once'
      }
    ],
    subtotal: 75,
    coverCostsAmount: 0,
    totalAmount: 75,
    currency: 'GBP',
    paymentMethod: { type: 'card', last4: '6789', brand: 'visa' },
    status: 'succeeded',
    donorName: 'Rachel Green',
    donorEmail: 'rachel.green@example.com',
    isAnonymous: false,
    message: 'Great cause!',
    giftAid: true,
    createdAt: '2026-01-09T18:20:00Z',
    receiptUrl: '#'
  },

  // ============================================
  // WILD AMER BIRTHDAY FUNDRAISER — other donors
  // ============================================

  // 18. Sarah Mitchell — £25
  {
    id: 'txn-018',
    processor: 'stripe',
    processorTransactionId: 'pi_3RcA1oK2x9B1mN6k',
    type: 'one_time',
    campaignId: 'wild-amer-birthday-fundraiser',
    campaignName: "Wild Amer's Birthday Fundraiser",
    charityName: 'Borneo Orangutan Survival',
    lineItems: [
      {
        productId: 'custom-amount',
        productName: 'Donation',
        productIcon: '🎂',
        quantity: 1,
        unitPrice: 25,
        frequency: 'once'
      }
    ],
    subtotal: 25,
    coverCostsAmount: 0,
    totalAmount: 25,
    currency: 'GBP',
    paymentMethod: { type: 'card', last4: '1111', brand: 'visa' },
    status: 'succeeded',
    donorName: 'Sarah Mitchell',
    donorEmail: 'sarah.mitchell@example.com',
    isAnonymous: false,
    message: 'Happy Birthday Wild! Great cause!',
    giftAid: false,
    createdAt: '2026-01-15T09:30:00Z',
    receiptUrl: '#'
  },

  // 19. Tom Wilson — £50
  {
    id: 'txn-019',
    processor: 'stripe',
    processorTransactionId: 'pi_3RcB2pK2x9B1mN7l',
    type: 'one_time',
    campaignId: 'wild-amer-birthday-fundraiser',
    campaignName: "Wild Amer's Birthday Fundraiser",
    charityName: 'Borneo Orangutan Survival',
    lineItems: [
      {
        productId: 'custom-amount',
        productName: 'Donation',
        productIcon: '🎂',
        quantity: 1,
        unitPrice: 50,
        frequency: 'once'
      }
    ],
    subtotal: 50,
    coverCostsAmount: 0,
    totalAmount: 50,
    currency: 'GBP',
    paymentMethod: { type: 'card', last4: '2222', brand: 'mastercard' },
    status: 'succeeded',
    donorName: 'Tom Wilson',
    donorEmail: 'tom.wilson@example.com',
    isAnonymous: false,
    message: 'Amazing initiative! Keep up the good work.',
    giftAid: true,
    createdAt: '2026-01-14T18:20:00Z',
    receiptUrl: '#'
  },

  // 20. Anonymous — £10
  {
    id: 'txn-020',
    processor: 'stripe',
    processorTransactionId: 'pi_3RcC3qK2x9B1mN8m',
    type: 'one_time',
    campaignId: 'wild-amer-birthday-fundraiser',
    campaignName: "Wild Amer's Birthday Fundraiser",
    charityName: 'Borneo Orangutan Survival',
    lineItems: [
      {
        productId: 'custom-amount',
        productName: 'Donation',
        productIcon: '🎂',
        quantity: 1,
        unitPrice: 10,
        frequency: 'once'
      }
    ],
    subtotal: 10,
    coverCostsAmount: 0,
    totalAmount: 10,
    currency: 'GBP',
    paymentMethod: { type: 'card', last4: '3333', brand: 'visa' },
    status: 'succeeded',
    donorName: 'Anonymous',
    donorEmail: 'anon5@example.com',
    isAnonymous: true,
    giftAid: false,
    createdAt: '2026-01-14T14:10:00Z',
    receiptUrl: '#'
  },

  // ============================================
  // WILD AMER BIRTHDAY 2 FUNDRAISER — other donors
  // ============================================

  // 21. Emma Davis — £25
  {
    id: 'txn-021',
    processor: 'stripe',
    processorTransactionId: 'pi_3RdA1fK2x9B1mN3b',
    type: 'one_time',
    campaignId: 'wild-amer-birthday-2-fundraiser',
    campaignName: "Wild Amer's Mini Fundraiser",
    charityName: 'Borneo Orangutan Survival',
    lineItems: [
      {
        productId: 'custom-amount',
        productName: 'Donation',
        productIcon: '🎂',
        quantity: 1,
        unitPrice: 25,
        frequency: 'once'
      }
    ],
    subtotal: 25,
    coverCostsAmount: 0,
    totalAmount: 25,
    currency: 'GBP',
    paymentMethod: { type: 'card', last4: '3355', brand: 'visa' },
    status: 'succeeded',
    donorName: 'Emma Davis',
    donorEmail: 'emma.davis@example.com',
    isAnonymous: false,
    message: 'Great work!',
    giftAid: false,
    createdAt: '2026-01-10T15:00:00Z',
    receiptUrl: '#'
  },

  // 22. John Smith — £15
  {
    id: 'txn-022',
    processor: 'stripe',
    processorTransactionId: 'pi_3RdB2gK2x9B1mN4c',
    type: 'one_time',
    campaignId: 'wild-amer-birthday-2-fundraiser',
    campaignName: "Wild Amer's Mini Fundraiser",
    charityName: 'Borneo Orangutan Survival',
    lineItems: [
      {
        productId: 'custom-amount',
        productName: 'Donation',
        productIcon: '🎂',
        quantity: 1,
        unitPrice: 15,
        frequency: 'once'
      }
    ],
    subtotal: 15,
    coverCostsAmount: 0,
    totalAmount: 15,
    currency: 'GBP',
    paymentMethod: { type: 'card', last4: '4466', brand: 'mastercard' },
    status: 'succeeded',
    donorName: 'John Smith',
    donorEmail: 'john.smith@example.com',
    isAnonymous: false,
    giftAid: true,
    createdAt: '2026-01-09T12:30:00Z',
    receiptUrl: '#'
  }
]

/**
 * Sample subscriptions for donor portal
 *
 * Covers: active, paused, cancelled, past_due, single-item, multi-item,
 * Stripe, PayPal, monthly, yearly
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
    lineItems: [
      {
        productId: 'adopt-bumi',
        productName: 'Adopt Bumi the Orangutan',
        productIcon: '🦧',
        quantity: 1,
        unitPrice: 15,
        frequency: 'monthly'
      }
    ],
    amount: 15.45,
    currency: 'GBP',
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
    lineItems: [
      {
        productId: 'adopt-bumi',
        productName: 'Adopt Bumi the Orangutan',
        productIcon: '🦧',
        quantity: 1,
        unitPrice: 15,
        frequency: 'monthly'
      },
      {
        productId: 'adopt-maya',
        productName: 'Adopt Maya the Orangutan',
        productIcon: '🦧',
        quantity: 1,
        unitPrice: 10,
        frequency: 'monthly'
      }
    ],
    amount: 25.75,
    currency: 'GBP',
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
    lineItems: [
      {
        productId: 'education-program',
        productName: 'Support Education Program',
        productIcon: '📚',
        quantity: 1,
        unitPrice: 25,
        frequency: 'monthly'
      }
    ],
    amount: 25,
    currency: 'GBP',
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

  // 4. Paused subscription
  {
    id: 'sub-004',
    processor: 'stripe',
    processorSubscriptionId: 'sub_1PqT8uK2x9B1mN6q',
    campaignId: 'adopt-orangutan',
    campaignName: 'Adopt an Orangutan',
    charityName: 'Borneo Orangutan Survival',
    lineItems: [
      {
        productId: 'adopt-maya',
        productName: 'Adopt Maya the Orangutan',
        productIcon: '🦧',
        quantity: 1,
        unitPrice: 10,
        frequency: 'monthly'
      }
    ],
    amount: 10,
    currency: 'GBP',
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

  // 5. Cancelled subscription
  {
    id: 'sub-005',
    processor: 'stripe',
    processorSubscriptionId: 'sub_1PqU9vK2x9B1mN7r',
    campaignId: 'birthday-p2p-template',
    campaignName: 'Birthday Fundraiser Template',
    charityName: 'Borneo Orangutan Survival',
    lineItems: [
      {
        productId: 'custom-amount',
        productName: 'Monthly Birthday Fund',
        productIcon: '🎂',
        quantity: 1,
        unitPrice: 10,
        frequency: 'monthly'
      }
    ],
    amount: 10,
    currency: 'GBP',
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

  // ============================================
  // OTHER CHARITIES
  // ============================================

  // 6. Active monthly - British Red Cross
  {
    id: 'sub-006',
    processor: 'stripe',
    processorSubscriptionId: 'sub_2AbC3dK2x9B1mN8s',
    campaignId: 'emergency-appeal-2025',
    campaignName: 'Emergency Appeal 2025',
    charityName: 'British Red Cross',
    lineItems: [
      {
        productId: 'emergency-donation',
        productName: 'Emergency Relief Fund',
        productIcon: '🏥',
        quantity: 1,
        unitPrice: 20,
        frequency: 'monthly'
      }
    ],
    amount: 20,
    currency: 'GBP',
    frequency: 'monthly',
    paymentMethod: { type: 'card', last4: '4242', brand: 'visa' },
    status: 'active',
    currentPeriodStart: '2026-01-10T00:00:00Z',
    currentPeriodEnd: '2026-02-10T00:00:00Z',
    nextBillingDate: '2026-02-10T00:00:00Z',
    createdAt: '2025-10-10T11:00:00Z',
    totalPaid: 80,
    paymentCount: 4
  },

  // 7. Active yearly - RSPCA
  {
    id: 'sub-007',
    processor: 'stripe',
    processorSubscriptionId: 'sub_3CdE4fK2x9B1mN9t',
    campaignId: 'rspca-winter-appeal',
    campaignName: 'Winter Animal Rescue',
    charityName: 'RSPCA',
    lineItems: [
      {
        productId: 'animal-rescue',
        productName: 'Animal Rescue Support',
        productIcon: '🐾',
        quantity: 1,
        unitPrice: 120,
        frequency: 'yearly'
      }
    ],
    amount: 120,
    currency: 'GBP',
    frequency: 'yearly',
    paymentMethod: { type: 'card', last4: '5556', brand: 'mastercard' },
    status: 'active',
    currentPeriodStart: '2025-11-01T00:00:00Z',
    currentPeriodEnd: '2026-11-01T00:00:00Z',
    nextBillingDate: '2026-11-01T00:00:00Z',
    createdAt: '2024-11-01T09:30:00Z',
    totalPaid: 240,
    paymentCount: 2
  },

  // 8. Active monthly - British Red Cross (second campaign)
  {
    id: 'sub-008',
    processor: 'paypal',
    processorSubscriptionId: 'I-CW563HMMFP2H',
    campaignId: 'first-aid-training',
    campaignName: 'Community First Aid Training',
    charityName: 'British Red Cross',
    lineItems: [
      {
        productId: 'training-support',
        productName: 'First Aid Training Fund',
        productIcon: '🩹',
        quantity: 1,
        unitPrice: 10,
        frequency: 'monthly'
      }
    ],
    amount: 10,
    currency: 'GBP',
    frequency: 'monthly',
    paymentMethod: { type: 'paypal', email: 'awesome@charity.co.uk' },
    status: 'active',
    currentPeriodStart: '2026-01-05T00:00:00Z',
    currentPeriodEnd: '2026-02-05T00:00:00Z',
    nextBillingDate: '2026-02-05T00:00:00Z',
    createdAt: '2025-11-05T14:00:00Z',
    totalPaid: 30,
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
      message: t.message,
      isAnonymous: t.isAnonymous,
      createdAt: t.createdAt
    }))

  return limit ? donations.slice(0, limit) : donations
}

/**
 * Compute aggregate stats for a campaign from its transactions.
 * Accepts optional overrides for fields where we want to show larger "realistic"
 * numbers (since mock data only has ~40 records but production would have thousands).
 */
export function computeCampaignStats(
  campaignId: string,
  overrides?: Partial<CampaignStats>
): CampaignStats {
  const succeeded = transactions.filter(
    (t) => t.campaignId === campaignId && t.status === 'succeeded'
  )

  const totalRaised = succeeded.reduce((sum, t) => sum + t.subtotal, 0)
  const totalDonations = succeeded.length
  const uniqueEmails = new Set(succeeded.map((t) => t.donorEmail))
  const totalDonors = uniqueEmails.size
  const averageDonation = totalDonations > 0 ? Math.round(totalRaised / totalDonations) : 0
  const topDonation = succeeded.reduce((max, t) => Math.max(max, t.subtotal), 0)

  return {
    totalRaised,
    totalDonations,
    totalDonors,
    averageDonation,
    topDonation,
    ...overrides
  }
}

/** Get transactions for a specific donor (by email) */
export function getUserTransactions(email: string): Transaction[] {
  return transactions.filter((t) => t.donorEmail === email)
}

/** Get subscriptions for a specific donor (by email — matches payment method email or donor email) */
export function getUserSubscriptions(email: string): Subscription[] {
  return subscriptions.filter(
    (s) =>
      (s.paymentMethod.type === 'paypal' && s.paymentMethod.email === email) ||
      subscriptions.some(
        (sub) =>
          sub.id === s.id &&
          transactions.some((t) => t.subscriptionId === s.id && t.donorEmail === email)
      )
  )
}
