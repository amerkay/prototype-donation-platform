import type { Transaction, GiftAidDeclaration, ConsentRecord } from '~/features/donor-portal/types'
import type { Subscription } from '~/features/subscriptions/shared/types'
import type { CampaignDonation, CampaignStats } from '~/features/campaigns/shared/types'

/**
 * Sample transactions — master table for ALL donations across ALL donors.
 *
 * In production this is the `transactions` table in Supabase.
 * Helper functions below derive campaign-specific views (recent donations,
 * stats) so that campaigns.ts doesn't duplicate this data.
 *
 * Donor ID mapping (named donors only, anonymous = ''):
 *   donor-001  Wild Amer         awesome@charity.co.uk
 *   donor-002  Emma Wilson       emma.wilson@example.com
 *   donor-003  Michael Lee       michael.lee@example.com
 *   donor-004  John Smith        john.smith@example.com
 *   donor-005  Rachel Green      rachel.green@example.com
 *   donor-006  Sarah Mitchell    sarah.mitchell@example.com
 *   donor-007  Tom Wilson        tom.wilson@example.com
 *   donor-008  Emma Davis        emma.davis@example.com
 *   donor-009  Alice Cooper      alice.cooper@example.com
 *   donor-010  Bob Harris        bob.harris@example.com
 *   donor-011  Claire Wang       claire.wang@example.com
 *   donor-012  Dan Patel         dan.patel@example.com
 *   donor-013  Laura Kim         laura.kim@example.com
 *   donor-014  Mark Johnson      mark.johnson@example.com
 *   donor-015  Sophie Turner     sophie.turner@example.com
 *   donor-016  James Brown       james.brown@example.com
 *
 * Records 1-12:  Wild Amer (awesome@charity.co.uk) — donor portal demo data
 * Records 13-15: Other donors → adopt-orangutan campaign
 * Records 16-17: Other donors → birthday-p2p-template campaign
 * Records 18-20: Other donors → wild-amer-birthday-fundraiser campaign
 * Records 21-22: Other donors → wild-amer-birthday-2-fundraiser campaign
 * Records 23-27: Other donors → spread across existing campaigns
 * Records 28-32: Other donors → spread across existing campaigns
 * Records 33-41: Subscription payments for sub-004 through sub-008
 * Records 42-62: Backfill subscription payments for sub-001 through sub-008
 */
export const transactions: Transaction[] = [
  // ============================================
  // WILD AMER TRANSACTIONS (donor portal)
  // ============================================

  // 1. Simple one-time Stripe card donation
  {
    id: 'txn-001',
    organizationId: 'org-001',
    processor: 'stripe',
    processorTransactionId: 'pi_3PqR7sK2x9B1mN4o',
    type: 'one_time',
    campaignId: 'adopt-orangutan',
    campaignName: 'Adopt an Orangutan',
    charityName: 'Borneo Orangutan Survival',
    lineItems: [
      {
        productId: 'tree-planting',
        productTitle: 'Plant 10 Native Rainforest Trees for Wildlife',
        quantity: 2,
        unitPrice: 30,
        frequency: 'once'
      }
    ],
    subtotal: 60,
    coverCostsAmount: 1.8,
    totalAmount: 61.8,
    currency: 'GBP',
    baseCurrency: 'GBP',
    exchangeRate: 1,
    paymentMethod: { type: 'card', last4: '4242', brand: 'visa' },
    status: 'succeeded',
    donorName: 'Wild Amer',
    donorId: 'donor-001',
    donorEmail: 'awesome@charity.co.uk',
    isAnonymous: false,
    giftAid: true,
    giftAidDeclarationId: 'gad-001',
    giftAidAmount: 15,
    donorAddress: {
      line1: '42 Oakwood Drive',
      city: 'London',
      region: 'Greater London',
      postcode: 'SW1A 2AA',
      country: 'GB'
    },
    customFields: { source: 'website', company_name: 'Amer Holdings' },
    createdAt: '2026-01-28T14:30:00Z',
    legalBasis: 'contractual_necessity',
    receiptUrl: '#'
  },

  // 2. PayPal one-time donation with tribute
  {
    id: 'txn-002',
    organizationId: 'org-001',
    processor: 'paypal',
    processorTransactionId: 'PAYID-M5N8K3L2',
    type: 'one_time',
    campaignId: 'adopt-orangutan',
    campaignName: 'Adopt an Orangutan',
    charityName: 'Borneo Orangutan Survival',
    lineItems: [
      {
        productId: 'education-program',
        productTitle: 'Support Local Conservation Education Program',
        quantity: 1,
        unitPrice: 100,
        frequency: 'once'
      }
    ],
    subtotal: 100,
    coverCostsAmount: 0,
    totalAmount: 100,
    currency: 'GBP',
    baseCurrency: 'GBP',
    exchangeRate: 1,
    paymentMethod: { type: 'paypal', email: 'awesome@charity.co.uk' },
    status: 'succeeded',
    donorName: 'Wild Amer',
    donorId: 'donor-001',
    donorEmail: 'awesome@charity.co.uk',
    isAnonymous: false,
    message: 'In loving memory of Grandma Rose',
    tribute: { type: 'memorial', honoreeName: 'Rose Amer' },
    giftAid: false,
    customFields: { source: 'social_media', referral_code: 'MEMORIAL2026' },
    createdAt: '2026-01-20T10:15:00Z',
    legalBasis: 'contractual_necessity',
    receiptUrl: '#'
  },

  // 3. Subscription payment (monthly Adopt Bumi)
  {
    id: 'txn-003',
    organizationId: 'org-001',
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
    paymentMethod: { type: 'card', last4: '4242', brand: 'visa' },
    status: 'succeeded',
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
    createdAt: '2026-01-15T00:00:00Z',
    legalBasis: 'contractual_necessity',
    receiptUrl: '#'
  },

  // 4. Impact Cart multi-item checkout (mixed frequencies via Stripe)
  {
    id: 'txn-004',
    organizationId: 'org-001',
    processor: 'stripe',
    processorTransactionId: 'pi_3PqT8uK2x9B1mN6q',
    type: 'one_time',
    campaignId: 'adopt-orangutan',
    campaignName: 'Adopt an Orangutan',
    charityName: 'Borneo Orangutan Survival',
    lineItems: [
      {
        productId: 'tree-planting',
        productTitle: 'Plant 10 Native Rainforest Trees for Wildlife',
        quantity: 1,
        unitPrice: 30,
        frequency: 'once'
      },
      {
        productId: 'education-program',
        productTitle: 'Support Local Conservation Education Program',
        quantity: 1,
        unitPrice: 50,
        frequency: 'once'
      }
    ],
    subtotal: 80,
    coverCostsAmount: 2.4,
    totalAmount: 82.4,
    currency: 'USD',
    baseCurrency: 'GBP',
    exchangeRate: 1.33,
    paymentMethod: { type: 'card', last4: '5556', brand: 'mastercard' },
    status: 'succeeded',
    donorName: 'Wild Amer',
    donorId: 'donor-001',
    donorEmail: 'awesome@charity.co.uk',
    isAnonymous: false,
    message: 'Keep up the great work!',
    giftAid: true,
    giftAidDeclarationId: 'gad-001',
    giftAidAmount: 20,
    donorAddress: {
      line1: '42 Oakwood Drive',
      city: 'London',
      region: 'Greater London',
      postcode: 'SW1A 2AA',
      country: 'GB'
    },
    customFields: { source: 'email_campaign', department: 'Marketing' },
    createdAt: '2026-01-10T16:45:00Z',
    legalBasis: 'contractual_necessity',
    receiptUrl: '#'
  },

  // 5. Subscription payment (monthly education program via PayPal)
  {
    id: 'txn-005',
    organizationId: 'org-001',
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
    paymentMethod: { type: 'paypal', email: 'awesome@charity.co.uk' },
    status: 'succeeded',
    donorName: 'Wild Amer',
    donorId: 'donor-001',
    donorEmail: 'awesome@charity.co.uk',
    isAnonymous: false,
    giftAid: false,
    createdAt: '2026-01-01T00:00:00Z',
    legalBasis: 'contractual_necessity',
    receiptUrl: '#'
  },

  // 6. Failed transaction
  {
    id: 'txn-006',
    organizationId: 'org-001',
    processor: 'stripe',
    processorTransactionId: 'pi_3PqU9vK2x9B1mN7r',
    type: 'one_time',
    campaignId: 'wild-amer-birthday-fundraiser',
    campaignName: "Wild Amer's Birthday Fundraiser",
    charityName: 'Borneo Orangutan Survival',
    lineItems: [
      {
        productId: 'tree-planting',
        productTitle: 'Plant 10 Native Rainforest Trees for Wildlife',
        quantity: 1,
        unitPrice: 30,
        frequency: 'once'
      }
    ],
    subtotal: 30,
    coverCostsAmount: 0,
    totalAmount: 30,
    currency: 'GBP',
    baseCurrency: 'GBP',
    exchangeRate: 1,
    paymentMethod: { type: 'card', last4: '0019', brand: 'visa' },
    status: 'failed',
    donorName: 'Wild Amer',
    donorId: 'donor-001',
    donorEmail: 'awesome@charity.co.uk',
    isAnonymous: false,
    giftAid: false,
    legalBasis: 'contractual_necessity',
    createdAt: '2025-12-28T09:20:00Z'
  },

  // 7. Refunded transaction
  {
    id: 'txn-007',
    organizationId: 'org-001',
    processor: 'stripe',
    processorTransactionId: 'pi_3PqV0wK2x9B1mN8s',
    type: 'one_time',
    campaignId: 'adopt-orangutan',
    campaignName: 'Adopt an Orangutan',
    charityName: 'Borneo Orangutan Survival',
    lineItems: [
      {
        productId: 'adopt-bumi',
        productTitle: 'Adopt Bumi the Rescued Baby',
        quantity: 1,
        unitPrice: 200,
        frequency: 'once'
      }
    ],
    subtotal: 200,
    coverCostsAmount: 6,
    totalAmount: 206,
    currency: 'GBP',
    baseCurrency: 'GBP',
    exchangeRate: 1,
    paymentMethod: { type: 'card', last4: '4242', brand: 'visa' },
    status: 'refunded',
    donorName: 'Wild Amer',
    donorId: 'donor-001',
    donorEmail: 'awesome@charity.co.uk',
    isAnonymous: false,
    giftAid: true,
    giftAidDeclarationId: 'gad-001',
    giftAidAmount: 50,
    donorAddress: {
      line1: '42 Oakwood Drive',
      city: 'London',
      region: 'Greater London',
      postcode: 'SW1A 2AA',
      country: 'GB'
    },
    giftAidReversed: true,
    giftAidAmountReversed: 50,
    createdAt: '2025-12-15T11:00:00Z',
    legalBasis: 'contractual_necessity',
    receiptUrl: '#'
  },

  // 8. Subscription payment for multi-item subscription (Bumi + Maya)
  {
    id: 'txn-008',
    organizationId: 'org-001',
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
    paymentMethod: { type: 'card', last4: '4242', brand: 'visa' },
    status: 'succeeded',
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
    createdAt: '2025-12-15T00:00:00Z',
    legalBasis: 'contractual_necessity',
    receiptUrl: '#'
  },

  // 9. One-time donation to birthday fundraiser with gift tribute
  {
    id: 'txn-009',
    organizationId: 'org-001',
    processor: 'stripe',
    processorTransactionId: 'pi_3PqX2yK2x9B1mN0u',
    type: 'one_time',
    campaignId: 'birthday-p2p-template',
    campaignName: 'Birthday Fundraiser Template',
    charityName: 'Borneo Orangutan Survival',
    lineItems: [
      {
        productId: 'adopt-maya',
        productTitle: 'Adopt Maya the Survivor',
        quantity: 1,
        unitPrice: 25,
        frequency: 'once'
      }
    ],
    subtotal: 25,
    coverCostsAmount: 0,
    totalAmount: 25,
    currency: 'GBP',
    baseCurrency: 'GBP',
    exchangeRate: 1,
    paymentMethod: { type: 'card', last4: '5556', brand: 'mastercard' },
    status: 'succeeded',
    donorName: 'Wild Amer',
    donorId: 'donor-001',
    donorEmail: 'awesome@charity.co.uk',
    isAnonymous: false,
    message: 'Happy Birthday Michael!',
    tribute: { type: 'gift', honoreeName: 'Michael Chen' },
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
    createdAt: '2025-12-01T18:30:00Z',
    legalBasis: 'contractual_necessity',
    receiptUrl: '#'
  },

  // 10. Older subscription payment
  {
    id: 'txn-010',
    organizationId: 'org-001',
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
    paymentMethod: { type: 'card', last4: '4242', brand: 'visa' },
    status: 'succeeded',
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
    createdAt: '2025-12-15T00:00:00Z',
    legalBasis: 'contractual_necessity',
    receiptUrl: '#'
  },

  // 11. Impact Cart multi-item via PayPal (recurring items)
  {
    id: 'txn-011',
    organizationId: 'org-001',
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
    paymentMethod: { type: 'paypal', email: 'awesome@charity.co.uk' },
    status: 'succeeded',
    donorName: 'Wild Amer',
    donorId: 'donor-001',
    donorEmail: 'awesome@charity.co.uk',
    isAnonymous: false,
    giftAid: false,
    createdAt: '2025-12-01T00:00:00Z',
    legalBasis: 'contractual_necessity',
    receiptUrl: '#'
  },

  // 12. Older one-time donation via bank transfer
  {
    id: 'txn-012',
    organizationId: 'org-001',
    processor: 'stripe',
    processorTransactionId: 'pi_3PqZ4aK2x9B1mN2w',
    type: 'one_time',
    campaignId: 'adopt-orangutan',
    campaignName: 'Adopt an Orangutan',
    charityName: 'Borneo Orangutan Survival',
    lineItems: [
      {
        productId: 'tree-planting',
        productTitle: 'Plant 10 Native Rainforest Trees for Wildlife',
        quantity: 3,
        unitPrice: 30,
        frequency: 'once'
      },
      {
        productId: 'education-program',
        productTitle: 'Support Local Conservation Education Program',
        quantity: 1,
        unitPrice: 410,
        frequency: 'once'
      }
    ],
    subtotal: 500,
    coverCostsAmount: 15,
    totalAmount: 515,
    currency: 'GBP',
    baseCurrency: 'GBP',
    exchangeRate: 1,
    paymentMethod: { type: 'bank_transfer' },
    status: 'succeeded',
    donorName: 'Wild Amer',
    donorId: 'donor-001',
    donorEmail: 'awesome@charity.co.uk',
    isAnonymous: true,
    giftAid: true,
    giftAidDeclarationId: 'gad-001',
    giftAidAmount: 125,
    donorAddress: {
      line1: '42 Oakwood Drive',
      city: 'London',
      region: 'Greater London',
      postcode: 'SW1A 2AA',
      country: 'GB'
    },
    customFields: { source: 'direct_mail', designation: 'General Fund' },
    createdAt: '2025-11-10T14:00:00Z',
    legalBasis: 'contractual_necessity',
    receiptUrl: '#'
  },

  // ============================================
  // ADOPT-ORANGUTAN CAMPAIGN — other donors
  // ============================================

  // 13. Emma Wilson — $317 USD (education program)
  {
    id: 'txn-013',
    organizationId: 'org-001',
    processor: 'stripe',
    processorTransactionId: 'pi_3RaA1bK2x9B1mN3x',
    type: 'one_time',
    campaignId: 'adopt-orangutan',
    campaignName: 'Adopt an Orangutan',
    charityName: 'Borneo Orangutan Survival',
    lineItems: [
      {
        productId: 'education-program',
        productTitle: 'Support Local Conservation Education Program',
        quantity: 1,
        unitPrice: 317,
        frequency: 'once'
      }
    ],
    subtotal: 317,
    coverCostsAmount: 9.51,
    totalAmount: 326.51,
    currency: 'USD',
    baseCurrency: 'GBP',
    exchangeRate: 0.79,
    paymentMethod: { type: 'card', last4: '1234', brand: 'visa' },
    status: 'succeeded',
    donorName: 'Emma Wilson',
    donorId: 'donor-002',
    donorEmail: 'emma.wilson@example.com',
    isAnonymous: false,
    message: 'Keep up the amazing work saving these beautiful creatures!',
    giftAid: false,
    customFields: { source: 'google_ads', referral_code: 'GADS2026' },
    createdAt: '2026-01-14T09:30:00Z',
    legalBasis: 'contractual_necessity',
    receiptUrl: '#'
  },

  // 14. Anonymous — £1000 (bank transfer, education program)
  {
    id: 'txn-014',
    organizationId: 'org-001',
    processor: 'stripe',
    processorTransactionId: 'pi_3RaE5fK2x9B1mN7b',
    type: 'one_time',
    campaignId: 'adopt-orangutan',
    campaignName: 'Adopt an Orangutan',
    charityName: 'Borneo Orangutan Survival',
    lineItems: [
      {
        productId: 'education-program',
        productTitle: 'Support Local Conservation Education Program',
        quantity: 1,
        unitPrice: 1000,
        frequency: 'once'
      }
    ],
    subtotal: 1000,
    coverCostsAmount: 30,
    totalAmount: 1030,
    currency: 'GBP',
    baseCurrency: 'GBP',
    exchangeRate: 1,
    paymentMethod: { type: 'bank_transfer' },
    status: 'succeeded',
    donorName: 'Anonymous',
    donorId: '',
    donorEmail: 'anon2@example.com',
    isAnonymous: true,
    giftAid: true,
    giftAidDeclarationId: 'gad-003',
    giftAidAmount: 250,
    donorAddress: { line1: '15 Elm Street', city: 'Birmingham', postcode: 'B1 1AA', country: 'GB' },
    createdAt: '2026-01-13T14:20:00Z',
    legalBasis: 'contractual_necessity',
    receiptUrl: '#'
  },

  // 15. Michael Lee — £300 (tree planting bulk)
  {
    id: 'txn-015',
    organizationId: 'org-001',
    processor: 'stripe',
    processorTransactionId: 'pi_3RaJ0kK2x9B1mN2g',
    type: 'one_time',
    campaignId: 'adopt-orangutan',
    campaignName: 'Adopt an Orangutan',
    charityName: 'Borneo Orangutan Survival',
    lineItems: [
      {
        productId: 'tree-planting',
        productTitle: 'Plant 10 Native Rainforest Trees for Wildlife',
        quantity: 10,
        unitPrice: 30,
        frequency: 'once'
      }
    ],
    subtotal: 300,
    coverCostsAmount: 9,
    totalAmount: 309,
    currency: 'GBP',
    baseCurrency: 'GBP',
    exchangeRate: 1,
    paymentMethod: { type: 'card', last4: '8901', brand: 'mastercard' },
    status: 'succeeded',
    donorName: 'Michael Lee',
    donorId: 'donor-003',
    donorEmail: 'michael.lee@example.com',
    isAnonymous: false,
    message: 'Donated on behalf of my company.',
    giftAid: false,
    customFields: {
      source: 'website',
      company_name: 'Lee Enterprises',
      designation: 'Habitat Restoration'
    },
    createdAt: '2026-01-11T09:00:00Z',
    legalBasis: 'contractual_necessity',
    receiptUrl: '#'
  },

  // ============================================
  // BIRTHDAY P2P TEMPLATE — other donors
  // ============================================

  // 16. John Smith — £100 (adopt-maya one-time gift)
  {
    id: 'txn-016',
    organizationId: 'org-001',
    processor: 'stripe',
    processorTransactionId: 'pi_3RbA1lK2x9B1mN3h',
    type: 'one_time',
    campaignId: 'birthday-p2p-template',
    campaignName: 'Birthday Fundraiser Template',
    charityName: 'Borneo Orangutan Survival',
    lineItems: [
      {
        productId: 'adopt-maya',
        productTitle: 'Adopt Maya the Survivor',
        quantity: 1,
        unitPrice: 100,
        frequency: 'once'
      }
    ],
    subtotal: 100,
    coverCostsAmount: 0,
    totalAmount: 100,
    currency: 'GBP',
    baseCurrency: 'GBP',
    exchangeRate: 1,
    paymentMethod: { type: 'card', last4: '4567', brand: 'visa' },
    status: 'succeeded',
    donorName: 'John Smith',
    donorId: 'donor-004',
    donorEmail: 'john.smith@example.com',
    isAnonymous: false,
    message: 'Happy Birthday Sarah!',
    giftAid: false,
    createdAt: '2026-01-10T12:30:00Z',
    legalBasis: 'contractual_necessity',
    receiptUrl: '#'
  },

  // 17. Rachel Green — £75 (education program)
  {
    id: 'txn-017',
    organizationId: 'org-001',
    processor: 'stripe',
    processorTransactionId: 'pi_3RbC3nK2x9B1mN5j',
    type: 'one_time',
    campaignId: 'birthday-p2p-template',
    campaignName: 'Birthday Fundraiser Template',
    charityName: 'Borneo Orangutan Survival',
    lineItems: [
      {
        productId: 'education-program',
        productTitle: 'Support Local Conservation Education Program',
        quantity: 1,
        unitPrice: 75,
        frequency: 'once'
      }
    ],
    subtotal: 75,
    coverCostsAmount: 0,
    totalAmount: 75,
    currency: 'GBP',
    baseCurrency: 'GBP',
    exchangeRate: 1,
    paymentMethod: { type: 'card', last4: '6789', brand: 'visa' },
    status: 'succeeded',
    donorName: 'Rachel Green',
    donorId: 'donor-005',
    donorEmail: 'rachel.green@example.com',
    isAnonymous: false,
    message: 'Great cause!',
    giftAid: true,
    giftAidDeclarationId: 'gad-004',
    giftAidAmount: 18.75,
    donorAddress: { line1: '28 Maple Road', city: 'Bristol', postcode: 'BS1 4DJ', country: 'GB' },
    createdAt: '2026-01-09T18:20:00Z',
    legalBasis: 'contractual_necessity',
    receiptUrl: '#'
  },

  // ============================================
  // WILD AMER BIRTHDAY FUNDRAISER — other donors
  // ============================================

  // 18. Sarah Mitchell — £25 (adopt-bumi)
  {
    id: 'txn-018',
    organizationId: 'org-001',
    processor: 'stripe',
    processorTransactionId: 'pi_3RcA1oK2x9B1mN6k',
    type: 'one_time',
    campaignId: 'wild-amer-birthday-fundraiser',
    campaignName: "Wild Amer's Birthday Fundraiser",
    charityName: 'Borneo Orangutan Survival',
    lineItems: [
      {
        productId: 'adopt-bumi',
        productTitle: 'Adopt Bumi the Rescued Baby',
        quantity: 1,
        unitPrice: 25,
        frequency: 'once'
      }
    ],
    subtotal: 25,
    coverCostsAmount: 0,
    totalAmount: 25,
    currency: 'GBP',
    baseCurrency: 'GBP',
    exchangeRate: 1,
    paymentMethod: { type: 'card', last4: '1111', brand: 'visa' },
    status: 'succeeded',
    donorName: 'Sarah Mitchell',
    donorId: 'donor-006',
    donorEmail: 'sarah.mitchell@example.com',
    isAnonymous: false,
    message: 'Happy Birthday Wild! Great cause!',
    giftAid: false,
    createdAt: '2026-01-15T09:30:00Z',
    legalBasis: 'contractual_necessity',
    receiptUrl: '#'
  },

  // 19. Tom Wilson — $50 USD (education program)
  {
    id: 'txn-019',
    organizationId: 'org-001',
    processor: 'stripe',
    processorTransactionId: 'pi_3RcB2pK2x9B1mN7l',
    type: 'one_time',
    campaignId: 'wild-amer-birthday-fundraiser',
    campaignName: "Wild Amer's Birthday Fundraiser",
    charityName: 'Borneo Orangutan Survival',
    lineItems: [
      {
        productId: 'education-program',
        productTitle: 'Support Local Conservation Education Program',
        quantity: 1,
        unitPrice: 50,
        frequency: 'once'
      }
    ],
    subtotal: 50,
    coverCostsAmount: 0,
    totalAmount: 50,
    currency: 'USD',
    baseCurrency: 'GBP',
    exchangeRate: 0.75,
    paymentMethod: { type: 'card', last4: '2222', brand: 'mastercard' },
    status: 'succeeded',
    donorName: 'Tom Wilson',
    donorId: 'donor-007',
    donorEmail: 'tom.wilson@example.com',
    isAnonymous: false,
    message: 'Amazing initiative! Keep up the good work.',
    giftAid: true,
    giftAidDeclarationId: 'gad-005',
    giftAidAmount: 12.5,
    donorAddress: { line1: '9 Cherry Close', city: 'Leeds', postcode: 'LS1 5AA', country: 'GB' },
    createdAt: '2026-01-14T18:20:00Z',
    legalBasis: 'contractual_necessity',
    receiptUrl: '#'
  },

  // 20. Anonymous — £10 (adopt-maya)
  {
    id: 'txn-020',
    organizationId: 'org-001',
    processor: 'stripe',
    processorTransactionId: 'pi_3RcC3qK2x9B1mN8m',
    type: 'one_time',
    campaignId: 'wild-amer-birthday-fundraiser',
    campaignName: "Wild Amer's Birthday Fundraiser",
    charityName: 'Borneo Orangutan Survival',
    lineItems: [
      {
        productId: 'adopt-maya',
        productTitle: 'Adopt Maya the Survivor',
        quantity: 1,
        unitPrice: 10,
        frequency: 'once'
      }
    ],
    subtotal: 10,
    coverCostsAmount: 0,
    totalAmount: 10,
    currency: 'GBP',
    baseCurrency: 'GBP',
    exchangeRate: 1,
    paymentMethod: { type: 'card', last4: '3333', brand: 'visa' },
    status: 'succeeded',
    donorName: 'Anonymous',
    donorId: '',
    donorEmail: 'anon5@example.com',
    isAnonymous: true,
    giftAid: false,
    createdAt: '2026-01-14T14:10:00Z',
    legalBasis: 'contractual_necessity',
    receiptUrl: '#'
  },

  // ============================================
  // WILD AMER BIRTHDAY 2 FUNDRAISER — other donors
  // ============================================

  // 21. Emma Davis — £25 (education program)
  {
    id: 'txn-021',
    organizationId: 'org-001',
    processor: 'stripe',
    processorTransactionId: 'pi_3RdA1fK2x9B1mN3b',
    type: 'one_time',
    campaignId: 'wild-amer-birthday-2-fundraiser',
    campaignName: "Wild Amer's Mini Fundraiser",
    charityName: 'Borneo Orangutan Survival',
    lineItems: [
      {
        productId: 'education-program',
        productTitle: 'Support Local Conservation Education Program',
        quantity: 1,
        unitPrice: 25,
        frequency: 'once'
      }
    ],
    subtotal: 25,
    coverCostsAmount: 0,
    totalAmount: 25,
    currency: 'GBP',
    baseCurrency: 'GBP',
    exchangeRate: 1,
    paymentMethod: { type: 'card', last4: '3355', brand: 'visa' },
    status: 'succeeded',
    donorName: 'Emma Davis',
    donorId: 'donor-008',
    donorEmail: 'emma.davis@example.com',
    isAnonymous: false,
    message: 'Great work!',
    giftAid: false,
    createdAt: '2026-01-10T15:00:00Z',
    legalBasis: 'contractual_necessity',
    receiptUrl: '#'
  },

  // 22. John Smith — £15 (adopt-bumi)
  {
    id: 'txn-022',
    organizationId: 'org-001',
    processor: 'stripe',
    processorTransactionId: 'pi_3RdB2gK2x9B1mN4c',
    type: 'one_time',
    campaignId: 'wild-amer-birthday-2-fundraiser',
    campaignName: "Wild Amer's Mini Fundraiser",
    charityName: 'Borneo Orangutan Survival',
    lineItems: [
      {
        productId: 'adopt-bumi',
        productTitle: 'Adopt Bumi the Rescued Baby',
        quantity: 1,
        unitPrice: 15,
        frequency: 'once'
      }
    ],
    subtotal: 15,
    coverCostsAmount: 0,
    totalAmount: 15,
    currency: 'GBP',
    baseCurrency: 'GBP',
    exchangeRate: 1,
    paymentMethod: { type: 'card', last4: '4466', brand: 'mastercard' },
    status: 'succeeded',
    donorName: 'John Smith',
    donorId: 'donor-004',
    donorEmail: 'john.smith@example.com',
    isAnonymous: false,
    giftAid: true,
    giftAidDeclarationId: 'gad-006',
    giftAidAmount: 3.75,
    donorAddress: { line1: '55 Pine Avenue', city: 'Oxford', postcode: 'OX1 2AA', country: 'GB' },
    createdAt: '2026-01-09T12:30:00Z',
    legalBasis: 'contractual_necessity',
    receiptUrl: '#'
  },

  // ============================================
  // SPREAD ACROSS EXISTING CAMPAIGNS — other donors
  // ============================================

  // 23. Alice Cooper — €58 EUR (adopt-orangutan, adopt-maya)
  {
    id: 'txn-023',
    organizationId: 'org-001',
    processor: 'stripe',
    processorTransactionId: 'pi_3ReA1hK2x9B1mN5d',
    type: 'one_time',
    campaignId: 'adopt-orangutan',
    campaignName: 'Adopt an Orangutan',
    charityName: 'Borneo Orangutan Survival',
    lineItems: [
      {
        productId: 'adopt-maya',
        productTitle: 'Adopt Maya the Survivor',
        quantity: 1,
        unitPrice: 58,
        frequency: 'once'
      }
    ],
    subtotal: 58,
    coverCostsAmount: 0,
    totalAmount: 58,
    currency: 'EUR',
    baseCurrency: 'GBP',
    exchangeRate: 0.86,
    paymentMethod: { type: 'card', last4: '7788', brand: 'visa' },
    status: 'succeeded',
    donorName: 'Alice Cooper',
    donorId: 'donor-009',
    donorEmail: 'alice.cooper@example.com',
    isAnonymous: false,
    message: 'For the orangutans!',
    giftAid: false,
    customFields: { source: 'social_media' },
    createdAt: '2026-01-12T10:00:00Z',
    legalBasis: 'contractual_necessity',
    receiptUrl: '#'
  },

  // 24. Bob Harris — £100 (adopt-orangutan, adopt-bumi)
  {
    id: 'txn-024',
    organizationId: 'org-001',
    processor: 'stripe',
    processorTransactionId: 'pi_3ReB2iK2x9B1mN6e',
    type: 'one_time',
    campaignId: 'adopt-orangutan',
    campaignName: 'Adopt an Orangutan',
    charityName: 'Borneo Orangutan Survival',
    lineItems: [
      {
        productId: 'adopt-bumi',
        productTitle: 'Adopt Bumi the Rescued Baby',
        quantity: 1,
        unitPrice: 100,
        frequency: 'once'
      }
    ],
    subtotal: 100,
    coverCostsAmount: 3,
    totalAmount: 103,
    currency: 'GBP',
    baseCurrency: 'GBP',
    exchangeRate: 1,
    paymentMethod: { type: 'card', last4: '9900', brand: 'mastercard' },
    status: 'succeeded',
    donorName: 'Bob Harris',
    donorId: 'donor-010',
    donorEmail: 'bob.harris@example.com',
    isAnonymous: false,
    message: 'Great cause mate!',
    giftAid: false,
    customFields: { referral_code: 'BDAY25' },
    createdAt: '2026-01-10T14:30:00Z',
    legalBasis: 'contractual_necessity',
    receiptUrl: '#'
  },

  // 25. Claire Wang — £75 (birthday-p2p-template, multi-item cart)
  {
    id: 'txn-025',
    organizationId: 'org-001',
    processor: 'stripe',
    processorTransactionId: 'pi_3ReC3jK2x9B1mN7f',
    type: 'one_time',
    campaignId: 'birthday-p2p-template',
    campaignName: 'Birthday Fundraiser Template',
    charityName: 'Borneo Orangutan Survival',
    lineItems: [
      {
        productId: 'tree-planting',
        productTitle: 'Plant 10 Native Rainforest Trees for Wildlife',
        quantity: 1,
        unitPrice: 30,
        frequency: 'once'
      },
      {
        productId: 'adopt-bumi',
        productTitle: 'Adopt Bumi the Rescued Baby',
        quantity: 1,
        unitPrice: 45,
        frequency: 'once'
      }
    ],
    subtotal: 75,
    coverCostsAmount: 0,
    totalAmount: 75,
    currency: 'GBP',
    baseCurrency: 'GBP',
    exchangeRate: 1,
    paymentMethod: { type: 'card', last4: '1122', brand: 'visa' },
    status: 'succeeded',
    donorName: 'Claire Wang',
    donorId: 'donor-011',
    donorEmail: 'claire.wang@example.com',
    isAnonymous: false,
    giftAid: true,
    giftAidDeclarationId: 'gad-002',
    giftAidAmount: 18.75,
    donorAddress: {
      line1: '12 Willow Court',
      city: 'Cambridge',
      postcode: 'CB2 1TN',
      country: 'GB'
    },
    createdAt: '2026-01-08T16:15:00Z',
    legalBasis: 'contractual_necessity',
    receiptUrl: '#'
  },

  // 26. Anonymous — £30 (birthday-p2p-template, tree-planting)
  {
    id: 'txn-026',
    organizationId: 'org-001',
    processor: 'stripe',
    processorTransactionId: 'pi_3ReD4kK2x9B1mN8g',
    type: 'one_time',
    campaignId: 'birthday-p2p-template',
    campaignName: 'Birthday Fundraiser Template',
    charityName: 'Borneo Orangutan Survival',
    lineItems: [
      {
        productId: 'tree-planting',
        productTitle: 'Plant 10 Native Rainforest Trees for Wildlife',
        quantity: 1,
        unitPrice: 30,
        frequency: 'once'
      }
    ],
    subtotal: 30,
    coverCostsAmount: 0,
    totalAmount: 30,
    currency: 'GBP',
    baseCurrency: 'GBP',
    exchangeRate: 1,
    paymentMethod: { type: 'card', last4: '3344', brand: 'visa' },
    status: 'succeeded',
    donorName: 'Anonymous',
    donorId: '',
    donorEmail: 'anon6@example.com',
    isAnonymous: true,
    giftAid: false,
    createdAt: '2026-01-06T11:00:00Z',
    legalBasis: 'contractual_necessity',
    receiptUrl: '#'
  },

  // 27. Dan Patel — £25 (wild-amer-birthday-fundraiser, education-program)
  {
    id: 'txn-027',
    organizationId: 'org-001',
    processor: 'paypal',
    processorTransactionId: 'PAYID-M6Q1K6L5',
    type: 'one_time',
    campaignId: 'wild-amer-birthday-fundraiser',
    campaignName: "Wild Amer's Birthday Fundraiser",
    charityName: 'Borneo Orangutan Survival',
    lineItems: [
      {
        productId: 'education-program',
        productTitle: 'Support Local Conservation Education Program',
        quantity: 1,
        unitPrice: 25,
        frequency: 'once'
      }
    ],
    subtotal: 25,
    coverCostsAmount: 0,
    totalAmount: 25,
    currency: 'GBP',
    baseCurrency: 'GBP',
    exchangeRate: 1,
    paymentMethod: { type: 'paypal', email: 'dan.patel@example.com' },
    status: 'succeeded',
    donorName: 'Dan Patel',
    donorId: 'donor-012',
    donorEmail: 'dan.patel@example.com',
    isAnonymous: false,
    message: 'Happy Birthday Wild!',
    giftAid: false,
    createdAt: '2026-01-04T09:45:00Z',
    legalBasis: 'contractual_necessity',
    receiptUrl: '#'
  },

  // 28. Laura Kim — £20 (wild-amer-birthday-2-fundraiser, adopt-maya)
  {
    id: 'txn-028',
    organizationId: 'org-001',
    processor: 'stripe',
    processorTransactionId: 'pi_3RfA1lK2x9B1mN9h',
    type: 'one_time',
    campaignId: 'wild-amer-birthday-2-fundraiser',
    campaignName: "Wild Amer's Mini Fundraiser",
    charityName: 'Borneo Orangutan Survival',
    lineItems: [
      {
        productId: 'adopt-maya',
        productTitle: 'Adopt Maya the Survivor',
        quantity: 1,
        unitPrice: 20,
        frequency: 'once'
      }
    ],
    subtotal: 20,
    coverCostsAmount: 0,
    totalAmount: 20,
    currency: 'GBP',
    baseCurrency: 'GBP',
    exchangeRate: 1,
    paymentMethod: { type: 'card', last4: '5577', brand: 'visa' },
    status: 'succeeded',
    donorName: 'Laura Kim',
    donorId: 'donor-013',
    donorEmail: 'laura.kim@example.com',
    isAnonymous: false,
    message: 'Love this campaign!',
    giftAid: false,
    customFields: { source: 'social_media' },
    createdAt: '2026-01-20T10:00:00Z',
    legalBasis: 'contractual_necessity',
    receiptUrl: '#'
  },

  // 29. Mark Johnson — $63 USD (adopt-orangutan, adopt-bumi)
  {
    id: 'txn-029',
    organizationId: 'org-001',
    processor: 'stripe',
    processorTransactionId: 'pi_3RfB2mK2x9B1mN0i',
    type: 'one_time',
    campaignId: 'adopt-orangutan',
    campaignName: 'Adopt an Orangutan',
    charityName: 'Borneo Orangutan Survival',
    lineItems: [
      {
        productId: 'adopt-bumi',
        productTitle: 'Adopt Bumi the Rescued Baby',
        quantity: 1,
        unitPrice: 63,
        frequency: 'once'
      }
    ],
    subtotal: 63,
    coverCostsAmount: 1.89,
    totalAmount: 64.89,
    currency: 'USD',
    baseCurrency: 'GBP',
    exchangeRate: 0.79,
    paymentMethod: { type: 'card', last4: '6688', brand: 'mastercard' },
    status: 'succeeded',
    donorName: 'Mark Johnson',
    donorId: 'donor-014',
    donorEmail: 'mark.johnson@example.com',
    isAnonymous: false,
    giftAid: false,
    createdAt: '2026-01-18T15:30:00Z',
    legalBasis: 'contractual_necessity',
    receiptUrl: '#'
  },

  // 30. Anonymous — £15 (wild-amer-birthday-fundraiser, adopt-bumi)
  {
    id: 'txn-030',
    organizationId: 'org-001',
    processor: 'stripe',
    processorTransactionId: 'pi_3RfC3nK2x9B1mN1j',
    type: 'one_time',
    campaignId: 'wild-amer-birthday-fundraiser',
    campaignName: "Wild Amer's Birthday Fundraiser",
    charityName: 'Borneo Orangutan Survival',
    lineItems: [
      {
        productId: 'adopt-bumi',
        productTitle: 'Adopt Bumi the Rescued Baby',
        quantity: 1,
        unitPrice: 15,
        frequency: 'once'
      }
    ],
    subtotal: 15,
    coverCostsAmount: 0,
    totalAmount: 15,
    currency: 'GBP',
    baseCurrency: 'GBP',
    exchangeRate: 1,
    paymentMethod: { type: 'card', last4: '7799', brand: 'visa' },
    status: 'succeeded',
    donorName: 'Anonymous',
    donorId: '',
    donorEmail: 'anon7@example.com',
    isAnonymous: true,
    giftAid: false,
    createdAt: '2026-01-15T08:00:00Z',
    legalBasis: 'contractual_necessity',
    receiptUrl: '#'
  },

  // 31. Sophie Turner — £25 (birthday-p2p-template, adopt-bumi)
  {
    id: 'txn-031',
    organizationId: 'org-001',
    processor: 'stripe',
    processorTransactionId: 'pi_3RgA1oK2x9B1mN2k',
    type: 'one_time',
    campaignId: 'birthday-p2p-template',
    campaignName: 'Birthday Fundraiser Template',
    charityName: 'Borneo Orangutan Survival',
    lineItems: [
      {
        productId: 'adopt-bumi',
        productTitle: 'Adopt Bumi the Rescued Baby',
        quantity: 1,
        unitPrice: 25,
        frequency: 'once'
      }
    ],
    subtotal: 25,
    coverCostsAmount: 0,
    totalAmount: 25,
    currency: 'GBP',
    baseCurrency: 'GBP',
    exchangeRate: 1,
    paymentMethod: { type: 'card', last4: '8800', brand: 'visa' },
    status: 'succeeded',
    donorName: 'Sophie Turner',
    donorId: 'donor-015',
    donorEmail: 'sophie.turner@example.com',
    isAnonymous: false,
    message: 'Happy Birthday!',
    giftAid: true,
    giftAidDeclarationId: 'gad-008',
    giftAidAmount: 6.25,
    donorAddress: { line1: '34 Birch Lane', city: 'Bath', postcode: 'BA1 1AA', country: 'GB' },
    customFields: { source: 'email_campaign' },
    createdAt: '2025-12-05T12:00:00Z',
    legalBasis: 'contractual_necessity',
    receiptUrl: '#'
  },

  // 32. James Brown — £50 (adopt-orangutan, multi-item cart)
  {
    id: 'txn-032',
    organizationId: 'org-001',
    processor: 'stripe',
    processorTransactionId: 'pi_3RgB2pK2x9B1mN3l',
    type: 'one_time',
    campaignId: 'adopt-orangutan',
    campaignName: 'Adopt an Orangutan',
    charityName: 'Borneo Orangutan Survival',
    lineItems: [
      {
        productId: 'tree-planting',
        productTitle: 'Plant 10 Native Rainforest Trees for Wildlife',
        quantity: 1,
        unitPrice: 30,
        frequency: 'once'
      },
      {
        productId: 'adopt-maya',
        productTitle: 'Adopt Maya the Survivor',
        quantity: 1,
        unitPrice: 20,
        frequency: 'once'
      }
    ],
    subtotal: 50,
    coverCostsAmount: 1.5,
    totalAmount: 51.5,
    currency: 'GBP',
    baseCurrency: 'GBP',
    exchangeRate: 1,
    paymentMethod: { type: 'card', last4: '9911', brand: 'mastercard' },
    status: 'succeeded',
    donorName: 'James Brown',
    donorId: 'donor-016',
    donorEmail: 'james.brown@example.com',
    isAnonymous: false,
    giftAid: false,
    legalBasis: 'contractual_necessity',
    createdAt: '2025-12-02T16:45:00Z',
    receiptUrl: '#'
  },

  // ============================================
  // SUBSCRIPTION PAYMENTS — sub-004 through sub-008
  // ============================================

  // 33. sub-004 payment (Emma Wilson, adopt-maya, paused sub)
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
    paymentMethod: { type: 'card', last4: '5556', brand: 'mastercard' },
    status: 'succeeded',
    donorName: 'Emma Wilson',
    donorId: 'donor-002',
    donorEmail: 'emma.wilson@example.com',
    isAnonymous: false,
    giftAid: false,
    createdAt: '2025-11-01T00:00:00Z',
    legalBasis: 'contractual_necessity',
    receiptUrl: '#'
  },

  // 34. sub-004 payment (Emma Wilson, adopt-maya, paused sub)
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
    paymentMethod: { type: 'card', last4: '5556', brand: 'mastercard' },
    status: 'succeeded',
    donorName: 'Emma Wilson',
    donorId: 'donor-002',
    donorEmail: 'emma.wilson@example.com',
    isAnonymous: false,
    giftAid: false,
    createdAt: '2025-12-01T00:00:00Z',
    legalBasis: 'contractual_necessity',
    receiptUrl: '#'
  },

  // 35. sub-005 payment (Rachel Green, tree-planting, cancelled sub)
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
    paymentMethod: { type: 'card', last4: '4242', brand: 'visa' },
    status: 'succeeded',
    donorName: 'Rachel Green',
    donorId: 'donor-005',
    donorEmail: 'rachel.green@example.com',
    isAnonymous: false,
    giftAid: false,
    createdAt: '2025-10-01T00:00:00Z',
    legalBasis: 'contractual_necessity',
    receiptUrl: '#'
  },

  // 36. sub-005 payment (Rachel Green, tree-planting, cancelled sub)
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
    paymentMethod: { type: 'card', last4: '4242', brand: 'visa' },
    status: 'succeeded',
    donorName: 'Rachel Green',
    donorId: 'donor-005',
    donorEmail: 'rachel.green@example.com',
    isAnonymous: false,
    giftAid: false,
    createdAt: '2025-11-01T00:00:00Z',
    legalBasis: 'contractual_necessity',
    receiptUrl: '#'
  },

  // 37. sub-006 payment (Sarah Mitchell, education-program)
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
    paymentMethod: { type: 'card', last4: '4242', brand: 'visa' },
    status: 'succeeded',
    donorName: 'Sarah Mitchell',
    donorId: 'donor-006',
    donorEmail: 'sarah.mitchell@example.com',
    isAnonymous: false,
    giftAid: false,
    createdAt: '2025-12-10T00:00:00Z',
    legalBasis: 'contractual_necessity',
    receiptUrl: '#'
  },

  // 38. sub-006 payment (Sarah Mitchell, education-program)
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
    paymentMethod: { type: 'card', last4: '4242', brand: 'visa' },
    status: 'succeeded',
    donorName: 'Sarah Mitchell',
    donorId: 'donor-006',
    donorEmail: 'sarah.mitchell@example.com',
    isAnonymous: false,
    giftAid: false,
    createdAt: '2026-01-10T00:00:00Z',
    legalBasis: 'contractual_necessity',
    receiptUrl: '#'
  },

  // 39. sub-007 payment (Tom Wilson, adopt-maya)
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
    paymentMethod: { type: 'card', last4: '5556', brand: 'mastercard' },
    status: 'succeeded',
    donorName: 'Tom Wilson',
    donorId: 'donor-007',
    donorEmail: 'tom.wilson@example.com',
    isAnonymous: false,
    giftAid: false,
    createdAt: '2026-01-01T00:00:00Z',
    legalBasis: 'contractual_necessity',
    receiptUrl: '#'
  },

  // 40. sub-008 payment (Alice Cooper, education-program, PayPal)
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
    paymentMethod: { type: 'paypal', email: 'alice.cooper@example.com' },
    status: 'succeeded',
    donorName: 'Alice Cooper',
    donorId: 'donor-009',
    donorEmail: 'alice.cooper@example.com',
    isAnonymous: false,
    giftAid: false,
    createdAt: '2025-12-05T00:00:00Z',
    legalBasis: 'contractual_necessity',
    receiptUrl: '#'
  },

  // 41. sub-008 payment (Alice Cooper, education-program, PayPal)
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
    paymentMethod: { type: 'paypal', email: 'alice.cooper@example.com' },
    status: 'succeeded',
    donorName: 'Alice Cooper',
    donorId: 'donor-009',
    donorEmail: 'alice.cooper@example.com',
    isAnonymous: false,
    giftAid: false,
    createdAt: '2026-01-05T00:00:00Z',
    legalBasis: 'contractual_necessity',
    receiptUrl: '#'
  },

  // ============================================
  // BACKFILL SUBSCRIPTION PAYMENTS (sub-001 through sub-008)
  // ============================================

  // 42-45. sub-001 backfill (Wild Amer, adopt-bumi, £15.45/mo — 4 missing: Aug–Nov 2025)
  {
    id: 'txn-042',
    organizationId: 'org-001',
    processor: 'stripe',
    processorTransactionId: 'pi_3RiA1aK2x9B1mN4a',
    type: 'subscription_payment',
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
        frequency: 'monthly'
      }
    ],
    subtotal: 15,
    coverCostsAmount: 0.45,
    totalAmount: 15.45,
    currency: 'GBP',
    baseCurrency: 'GBP',
    exchangeRate: 1,
    paymentMethod: { type: 'card', last4: '4242', brand: 'visa' },
    status: 'succeeded',
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
    createdAt: '2025-08-15T00:00:00Z',
    legalBasis: 'contractual_necessity',
    receiptUrl: '#'
  },
  {
    id: 'txn-043',
    organizationId: 'org-001',
    processor: 'stripe',
    processorTransactionId: 'pi_3RiA2bK2x9B1mN5b',
    type: 'subscription_payment',
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
        frequency: 'monthly'
      }
    ],
    subtotal: 15,
    coverCostsAmount: 0.45,
    totalAmount: 15.45,
    currency: 'GBP',
    baseCurrency: 'GBP',
    exchangeRate: 1,
    paymentMethod: { type: 'card', last4: '4242', brand: 'visa' },
    status: 'succeeded',
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
    createdAt: '2025-09-15T00:00:00Z',
    legalBasis: 'contractual_necessity',
    receiptUrl: '#'
  },
  {
    id: 'txn-044',
    organizationId: 'org-001',
    processor: 'stripe',
    processorTransactionId: 'pi_3RiA3cK2x9B1mN6c',
    type: 'subscription_payment',
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
        frequency: 'monthly'
      }
    ],
    subtotal: 15,
    coverCostsAmount: 0.45,
    totalAmount: 15.45,
    currency: 'GBP',
    baseCurrency: 'GBP',
    exchangeRate: 1,
    paymentMethod: { type: 'card', last4: '4242', brand: 'visa' },
    status: 'succeeded',
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
    createdAt: '2025-10-15T00:00:00Z',
    legalBasis: 'contractual_necessity',
    receiptUrl: '#'
  },
  {
    id: 'txn-045',
    organizationId: 'org-001',
    processor: 'stripe',
    processorTransactionId: 'pi_3RiA4dK2x9B1mN7d',
    type: 'subscription_payment',
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
        frequency: 'monthly'
      }
    ],
    subtotal: 15,
    coverCostsAmount: 0.45,
    totalAmount: 15.45,
    currency: 'GBP',
    baseCurrency: 'GBP',
    exchangeRate: 1,
    paymentMethod: { type: 'card', last4: '4242', brand: 'visa' },
    status: 'succeeded',
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
    createdAt: '2025-11-15T00:00:00Z',
    legalBasis: 'contractual_necessity',
    receiptUrl: '#'
  },

  // 46-47. sub-002 backfill (Wild Amer, bumi+maya, £25.75/mo — 2 missing: Oct–Nov 2025)
  {
    id: 'txn-046',
    organizationId: 'org-001',
    processor: 'stripe',
    processorTransactionId: 'pi_3RiB1eK2x9B1mN8e',
    type: 'subscription_payment',
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
    paymentMethod: { type: 'card', last4: '4242', brand: 'visa' },
    status: 'succeeded',
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
    createdAt: '2025-10-15T00:00:00Z',
    legalBasis: 'contractual_necessity',
    receiptUrl: '#'
  },
  {
    id: 'txn-047',
    organizationId: 'org-001',
    processor: 'stripe',
    processorTransactionId: 'pi_3RiB2fK2x9B1mN9f',
    type: 'subscription_payment',
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
    paymentMethod: { type: 'card', last4: '4242', brand: 'visa' },
    status: 'succeeded',
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
    createdAt: '2025-11-15T00:00:00Z',
    legalBasis: 'contractual_necessity',
    receiptUrl: '#'
  },

  // 48-50. sub-003 backfill (Wild Amer, education-program, £25/mo PayPal — 3 missing: Sep–Nov 2025)
  {
    id: 'txn-048',
    organizationId: 'org-001',
    processor: 'paypal',
    processorTransactionId: 'PAYID-M6Q1K6L5',
    type: 'subscription_payment',
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
        frequency: 'monthly'
      }
    ],
    subtotal: 25,
    coverCostsAmount: 0,
    totalAmount: 25,
    currency: 'GBP',
    baseCurrency: 'GBP',
    exchangeRate: 1,
    paymentMethod: { type: 'paypal', email: 'awesome@charity.co.uk' },
    status: 'succeeded',
    donorName: 'Wild Amer',
    donorId: 'donor-001',
    donorEmail: 'awesome@charity.co.uk',
    isAnonymous: false,
    giftAid: false,
    createdAt: '2025-09-01T00:00:00Z',
    legalBasis: 'contractual_necessity',
    receiptUrl: '#'
  },
  {
    id: 'txn-049',
    organizationId: 'org-001',
    processor: 'paypal',
    processorTransactionId: 'PAYID-M6R2K7L6',
    type: 'subscription_payment',
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
        frequency: 'monthly'
      }
    ],
    subtotal: 25,
    coverCostsAmount: 0,
    totalAmount: 25,
    currency: 'GBP',
    baseCurrency: 'GBP',
    exchangeRate: 1,
    paymentMethod: { type: 'paypal', email: 'awesome@charity.co.uk' },
    status: 'succeeded',
    donorName: 'Wild Amer',
    donorId: 'donor-001',
    donorEmail: 'awesome@charity.co.uk',
    isAnonymous: false,
    giftAid: false,
    createdAt: '2025-10-01T00:00:00Z',
    legalBasis: 'contractual_necessity',
    receiptUrl: '#'
  },
  {
    id: 'txn-050',
    organizationId: 'org-001',
    processor: 'paypal',
    processorTransactionId: 'PAYID-M6S3K8L7',
    type: 'subscription_payment',
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
        frequency: 'monthly'
      }
    ],
    subtotal: 25,
    coverCostsAmount: 0,
    totalAmount: 25,
    currency: 'GBP',
    baseCurrency: 'GBP',
    exchangeRate: 1,
    paymentMethod: { type: 'paypal', email: 'awesome@charity.co.uk' },
    status: 'succeeded',
    donorName: 'Wild Amer',
    donorId: 'donor-001',
    donorEmail: 'awesome@charity.co.uk',
    isAnonymous: false,
    giftAid: false,
    createdAt: '2025-11-01T00:00:00Z',
    legalBasis: 'contractual_necessity',
    receiptUrl: '#'
  },

  // 51-54. sub-004 backfill (Emma Wilson, adopt-maya, £10/mo — 4 missing: Jun–Sep 2025)
  {
    id: 'txn-051',
    organizationId: 'org-001',
    processor: 'stripe',
    processorTransactionId: 'pi_3RiC1gK2x9B1mN0g',
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
    paymentMethod: { type: 'card', last4: '5556', brand: 'mastercard' },
    status: 'succeeded',
    donorName: 'Emma Wilson',
    donorId: 'donor-002',
    donorEmail: 'emma.wilson@example.com',
    isAnonymous: false,
    giftAid: false,
    createdAt: '2025-06-01T00:00:00Z',
    legalBasis: 'contractual_necessity',
    receiptUrl: '#'
  },
  {
    id: 'txn-052',
    organizationId: 'org-001',
    processor: 'stripe',
    processorTransactionId: 'pi_3RiC2hK2x9B1mN1h',
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
    paymentMethod: { type: 'card', last4: '5556', brand: 'mastercard' },
    status: 'succeeded',
    donorName: 'Emma Wilson',
    donorId: 'donor-002',
    donorEmail: 'emma.wilson@example.com',
    isAnonymous: false,
    giftAid: false,
    createdAt: '2025-07-01T00:00:00Z',
    legalBasis: 'contractual_necessity',
    receiptUrl: '#'
  },
  {
    id: 'txn-053',
    organizationId: 'org-001',
    processor: 'stripe',
    processorTransactionId: 'pi_3RiC3iK2x9B1mN2i',
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
    paymentMethod: { type: 'card', last4: '5556', brand: 'mastercard' },
    status: 'succeeded',
    donorName: 'Emma Wilson',
    donorId: 'donor-002',
    donorEmail: 'emma.wilson@example.com',
    isAnonymous: false,
    giftAid: false,
    createdAt: '2025-08-01T00:00:00Z',
    legalBasis: 'contractual_necessity',
    receiptUrl: '#'
  },
  {
    id: 'txn-054',
    organizationId: 'org-001',
    processor: 'stripe',
    processorTransactionId: 'pi_3RiC4jK2x9B1mN3j',
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
    paymentMethod: { type: 'card', last4: '5556', brand: 'mastercard' },
    status: 'succeeded',
    donorName: 'Emma Wilson',
    donorId: 'donor-002',
    donorEmail: 'emma.wilson@example.com',
    isAnonymous: false,
    giftAid: false,
    createdAt: '2025-09-01T00:00:00Z',
    legalBasis: 'contractual_necessity',
    receiptUrl: '#'
  },

  // 55-57. sub-005 backfill (Rachel Green, tree-planting, £10/mo — 3 missing: Jul–Sep 2025)
  {
    id: 'txn-055',
    organizationId: 'org-001',
    processor: 'stripe',
    processorTransactionId: 'pi_3RiD1kK2x9B1mN4k',
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
    paymentMethod: { type: 'card', last4: '4242', brand: 'visa' },
    status: 'succeeded',
    donorName: 'Rachel Green',
    donorId: 'donor-005',
    donorEmail: 'rachel.green@example.com',
    isAnonymous: false,
    giftAid: false,
    createdAt: '2025-07-01T00:00:00Z',
    legalBasis: 'contractual_necessity',
    receiptUrl: '#'
  },
  {
    id: 'txn-056',
    organizationId: 'org-001',
    processor: 'stripe',
    processorTransactionId: 'pi_3RiD2lK2x9B1mN5l',
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
    paymentMethod: { type: 'card', last4: '4242', brand: 'visa' },
    status: 'succeeded',
    donorName: 'Rachel Green',
    donorId: 'donor-005',
    donorEmail: 'rachel.green@example.com',
    isAnonymous: false,
    giftAid: false,
    createdAt: '2025-08-01T00:00:00Z',
    legalBasis: 'contractual_necessity',
    receiptUrl: '#'
  },
  {
    id: 'txn-057',
    organizationId: 'org-001',
    processor: 'stripe',
    processorTransactionId: 'pi_3RiD3mK2x9B1mN6m',
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
    paymentMethod: { type: 'card', last4: '4242', brand: 'visa' },
    status: 'succeeded',
    donorName: 'Rachel Green',
    donorId: 'donor-005',
    donorEmail: 'rachel.green@example.com',
    isAnonymous: false,
    giftAid: false,
    createdAt: '2025-09-01T00:00:00Z',
    legalBasis: 'contractual_necessity',
    receiptUrl: '#'
  },

  // 58-59. sub-006 backfill (Sarah Mitchell, education-program, $25/mo — 2 missing: Oct–Nov 2025)
  {
    id: 'txn-058',
    organizationId: 'org-001',
    processor: 'stripe',
    processorTransactionId: 'pi_3RiE1nK2x9B1mN7n',
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
    paymentMethod: { type: 'card', last4: '4242', brand: 'visa' },
    status: 'succeeded',
    donorName: 'Sarah Mitchell',
    donorId: 'donor-006',
    donorEmail: 'sarah.mitchell@example.com',
    isAnonymous: false,
    giftAid: false,
    createdAt: '2025-10-10T00:00:00Z',
    legalBasis: 'contractual_necessity',
    receiptUrl: '#'
  },
  {
    id: 'txn-059',
    organizationId: 'org-001',
    processor: 'stripe',
    processorTransactionId: 'pi_3RiE2oK2x9B1mN8o',
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
    paymentMethod: { type: 'card', last4: '4242', brand: 'visa' },
    status: 'succeeded',
    donorName: 'Sarah Mitchell',
    donorId: 'donor-006',
    donorEmail: 'sarah.mitchell@example.com',
    isAnonymous: false,
    giftAid: false,
    createdAt: '2025-11-10T00:00:00Z',
    legalBasis: 'contractual_necessity',
    receiptUrl: '#'
  },

  // 60-61. sub-007 backfill (Tom Wilson, adopt-maya, £10/mo — 2 missing: Nov–Dec 2025)
  {
    id: 'txn-060',
    organizationId: 'org-001',
    processor: 'stripe',
    processorTransactionId: 'pi_3RiF1pK2x9B1mN9p',
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
    paymentMethod: { type: 'card', last4: '5556', brand: 'mastercard' },
    status: 'succeeded',
    donorName: 'Tom Wilson',
    donorId: 'donor-007',
    donorEmail: 'tom.wilson@example.com',
    isAnonymous: false,
    giftAid: false,
    createdAt: '2025-11-01T00:00:00Z',
    legalBasis: 'contractual_necessity',
    receiptUrl: '#'
  },
  {
    id: 'txn-061',
    organizationId: 'org-001',
    processor: 'stripe',
    processorTransactionId: 'pi_3RiF2qK2x9B1mN0q',
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
    paymentMethod: { type: 'card', last4: '5556', brand: 'mastercard' },
    status: 'succeeded',
    donorName: 'Tom Wilson',
    donorId: 'donor-007',
    donorEmail: 'tom.wilson@example.com',
    isAnonymous: false,
    giftAid: false,
    createdAt: '2025-12-01T00:00:00Z',
    legalBasis: 'contractual_necessity',
    receiptUrl: '#'
  },

  // 62. sub-008 backfill (Alice Cooper, education-program, €30/mo PayPal — 1 missing: Nov 2025)
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
    paymentMethod: { type: 'paypal', email: 'alice.cooper@example.com' },
    status: 'succeeded',
    donorName: 'Alice Cooper',
    donorId: 'donor-009',
    donorEmail: 'alice.cooper@example.com',
    isAnonymous: false,
    giftAid: false,
    createdAt: '2025-11-05T00:00:00Z',
    legalBasis: 'contractual_necessity',
    receiptUrl: '#'
  }
]

/**
 * Sample subscriptions for donor portal
 *
 * Covers: active, paused, cancelled, past_due, single-item, multi-item,
 * Stripe, PayPal, monthly, yearly.
 * All subscriptions now include donorId/donorName/donorEmail.
 * sub-006/007/008 rewritten to use existing BOSF campaigns/products.
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
    amount: 15.45,
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
    amount: 25.75,
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
    amount: 25,
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
    amount: 10,
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
    amount: 10,
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
    amount: 25,
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
    amount: 10,
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
    amount: 30,
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
      createdAt: t.createdAt
    }))

  return limit ? donations.slice(0, limit) : donations
}

/**
 * Compute aggregate stats for a campaign from its transactions.
 * Uses totalAmount * exchangeRate for consistent org-currency totals (cover costs go to charity).
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

  const totalRaised = succeeded.reduce((sum, t) => sum + t.totalAmount * t.exchangeRate, 0)
  const totalDonations = succeeded.length
  const uniqueEmails = new Set(succeeded.map((t) => t.donorEmail))
  const totalDonors = uniqueEmails.size
  const averageDonation = totalDonations > 0 ? totalRaised / totalDonations : 0
  const topDonation = succeeded.reduce((max, t) => Math.max(max, t.totalAmount * t.exchangeRate), 0)

  return {
    totalRaised,
    totalDonations,
    totalDonors,
    averageDonation,
    topDonation,
    currency: 'GBP',
    ...overrides
  }
}

/** Compute raisedAmount and donationCount for a fundraiser from its transactions */
export function computeFundraiserStats(campaignId: string): {
  raisedAmount: number
  donationCount: number
  currency: string
} {
  const succeeded = transactions.filter(
    (t) => t.campaignId === campaignId && t.status === 'succeeded'
  )
  return {
    raisedAmount: succeeded.reduce((sum, t) => sum + t.totalAmount * t.exchangeRate, 0),
    donationCount: succeeded.length,
    currency: 'GBP'
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
