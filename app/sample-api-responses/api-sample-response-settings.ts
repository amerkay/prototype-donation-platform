import type {
  CurrencySettings,
  CharitySettings,
  GeneralSettings,
  BrandingSettings,
  PaymentProcessorSettings,
  TeamSettings,
  BillingSettings,
  ApiSettings
} from '~/features/settings/admin/types'

export const currencySettings: CurrencySettings = {
  supportedCurrencies: ['GBP', 'USD', 'EUR'],
  defaultCurrency: 'GBP',
  currencyMultipliers: {
    USD: 2.0,
    EUR: 1.0
  }
}

export const charitySettings: CharitySettings = {
  slug: 'bosf',
  name: 'Borneo Orangutan Survival Foundation',
  registrationNumber: 'RCN123456',
  address: '123 Conservation Way, Palangka Raya, Central Kalimantan, Indonesia',
  website: 'https://borneoorangutansurvival.org/',
  description:
    'We rescue, rehabilitate, and release orangutans while protecting their natural habitat through community engagement and sustainable forest management programs across Borneo and Sumatra.',
  currencyOverrides: {
    GBP: { enabled: false, name: '', registrationNumber: '', address: '' },
    USD: { enabled: false, name: '', registrationNumber: '', address: '' },
    EUR: { enabled: false, name: '', registrationNumber: '', address: '' }
  }
}

export const generalSettings: GeneralSettings = {
  timezone: 'Europe/London',
  dateFormat: 'DD/MM/YYYY',
  language: 'en',
  emailSenderName: 'Borneo Orangutan Survival',
  emailSenderAddress: 'noreply@borneoorangutansurvival.org',
  supportEmail: 'support@borneoorangutansurvival.org'
}

export const brandingSettings: BrandingSettings = {
  logoUrl: '',
  faviconUrl: '',
  primaryColor: '#16a34a',
  secondaryColor: '#065f46',
  accentColor: '#f59e0b',
  fontFamily: 'Inter',
  customCss: ''
}

export const paymentProcessorSettings: PaymentProcessorSettings = {
  stripe: {
    enabled: true,
    testMode: true,
    connected: true,
    accountId: 'acct_1NqBGm2eZvKYlo2C',
    connectedAt: '2025-11-15T10:30:00Z'
  },
  paypal: {
    enabled: true,
    testMode: true,
    connected: false
  }
}

export const teamSettings: TeamSettings = {
  members: [
    {
      id: 'member-001',
      name: 'Wild Amer',
      email: 'awesome@charity.co.uk',
      role: 'owner',
      status: 'active',
      joinedAt: '2024-06-01T00:00:00Z',
      lastActiveAt: '2026-02-06T10:30:00Z'
    },
    {
      id: 'member-002',
      name: 'Sarah Johnson',
      email: 'sarah@borneoorangutansurvival.org',
      role: 'admin',
      status: 'active',
      joinedAt: '2024-08-15T00:00:00Z',
      lastActiveAt: '2026-02-05T14:20:00Z'
    },
    {
      id: 'member-003',
      name: 'David Chen',
      email: 'david@borneoorangutansurvival.org',
      role: 'editor',
      status: 'active',
      joinedAt: '2025-01-10T00:00:00Z',
      lastActiveAt: '2026-02-04T09:15:00Z'
    },
    {
      id: 'member-004',
      name: 'Lisa Park',
      email: 'lisa@borneoorangutansurvival.org',
      role: 'viewer',
      status: 'invited',
      joinedAt: '2026-01-20T00:00:00Z',
      lastActiveAt: '2026-01-20T00:00:00Z'
    }
  ]
}

export const billingSettings: BillingSettings = {
  billingEmail: 'billing@borneoorangutansurvival.org',
  paymentCard: { brand: 'Visa', last4: '4242', expMonth: 12, expYear: 2027 },
  taxRate: 0.2,
  statements: [
    {
      id: 'stmt-2026-01',
      month: '2026-01',
      paymentCount: 312,
      totalIncome: 18_740,
      platformFee: 562.2,
      tax: 112.44,
      total: 674.64,
      status: 'paid',
      paidAt: '2026-02-01T00:00:00Z'
    },
    {
      id: 'stmt-2025-12',
      month: '2025-12',
      paymentCount: 287,
      totalIncome: 22_430,
      platformFee: 672.9,
      tax: 134.58,
      total: 807.48,
      status: 'paid',
      paidAt: '2026-01-01T00:00:00Z'
    },
    {
      id: 'stmt-2025-11',
      month: '2025-11',
      paymentCount: 265,
      totalIncome: 15_980,
      platformFee: 479.4,
      tax: 95.88,
      total: 575.28,
      status: 'paid',
      paidAt: '2025-12-01T00:00:00Z'
    },
    {
      id: 'stmt-2025-10',
      month: '2025-10',
      paymentCount: 198,
      totalIncome: 12_350,
      platformFee: 370.5,
      tax: 74.1,
      total: 444.6,
      status: 'paid',
      paidAt: '2025-11-01T00:00:00Z'
    },
    {
      id: 'stmt-2026-02',
      month: '2026-02',
      paymentCount: 145,
      totalIncome: 9_870,
      platformFee: 296.1,
      tax: 59.22,
      total: 355.32,
      status: 'pending'
    }
  ]
}

export const apiSettings: ApiSettings = {
  apiKeys: [
    {
      id: 'key-001',
      name: 'Production API Key',
      prefix: 'dp_live_7kX9...',
      createdAt: '2025-06-01T00:00:00Z',
      lastUsedAt: '2026-02-06T08:45:00Z'
    },
    {
      id: 'key-002',
      name: 'Test API Key',
      prefix: 'dp_test_3mP2...',
      createdAt: '2025-06-01T00:00:00Z',
      lastUsedAt: '2026-02-05T16:30:00Z'
    }
  ],
  webhooks: [
    {
      id: 'wh-001',
      url: 'https://hooks.example.com/donations',
      events: ['donation.succeeded', 'donation.failed', 'donation.refunded'],
      enabled: true,
      createdAt: '2025-07-01T00:00:00Z',
      lastTriggeredAt: '2026-02-06T09:00:00Z'
    },
    {
      id: 'wh-002',
      url: 'https://crm.example.com/webhooks/subscriptions',
      events: ['subscription.created', 'subscription.cancelled'],
      enabled: true,
      createdAt: '2025-09-15T00:00:00Z',
      lastTriggeredAt: '2026-01-28T14:30:00Z'
    }
  ]
}
