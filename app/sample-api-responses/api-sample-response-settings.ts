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

const EMPTY_EMAIL_FIELDS = {
  emailSenderId: '',
  emailSenderName: '',
  emailSenderAddress: '',
  emailSignature: ''
}

export const charitySettings: CharitySettings = {
  slug: 'bosf',
  currencyEntries: {
    GBP: {
      currency: 'GBP',
      name: 'Borneo Orangutan Survival Foundation',
      registrationNumber: 'RCN123456',
      phone: '+44 20 7219 3000',
      replyToEmail: 'info@borneoorangutansurvival.org',
      website: 'https://borneoorangutansurvival.org/',
      description:
        'We rescue, rehabilitate, and release orangutans while protecting their natural habitat through community engagement and sustainable forest management programs across Borneo and Sumatra.',
      address: {
        address1: '4 Millbank',
        address2: '',
        city: 'London',
        region: 'Greater London',
        postcode: 'SW1P 3JA',
        country: 'GB'
      },
      emailSenderId: 'member-001',
      emailSenderName: 'Wild Amer',
      emailSenderAddress: 'awesome@charity.co.uk',
      emailSignature: 'With gratitude,\nThe Borneo Orangutan Survival Team'
    },
    USD: {
      currency: 'USD',
      name: 'Borneo Orangutan Survival Foundation USA',
      registrationNumber: 'EIN 84-1234567',
      phone: '+1 202 555 0180',
      replyToEmail: '',
      website: '',
      description: '',
      address: {
        address1: '1250 Connecticut Ave NW',
        address2: 'Suite 700',
        city: 'Washington',
        region: 'DC',
        postcode: '20036',
        country: 'US'
      },
      ...EMPTY_EMAIL_FIELDS
    },
    EUR: {
      currency: 'EUR',
      name: 'BOS Foundation Europe',
      registrationNumber: 'RSIN 8234.56.789',
      phone: '',
      replyToEmail: '',
      website: '',
      description: '',
      address: {
        address1: 'Keizersgracht 520',
        address2: '',
        city: 'Amsterdam',
        region: 'North Holland',
        postcode: '1017 EK',
        country: 'NL'
      },
      ...EMPTY_EMAIL_FIELDS
    }
  }
}

export const generalSettings: GeneralSettings = {
  timezone: 'Europe/London',
  dateFormat: 'DD/MM/YYYY'
}

export const brandingSettings: BrandingSettings = {
  logoUrl: '/imgs/BOS-USA-logo-green.webp',
  primaryColor: '#f97316',
  secondaryColor: '#166534',
  fontFamily: 'Montserrat',
  customCss: ''
}

export const paymentProcessorSettings: PaymentProcessorSettings = {
  stripe: {
    testMode: true,
    connected: true,
    accountId: 'acct_1NqBGm2eZvKYlo2C',
    connectedAt: '2025-11-15T10:30:00Z'
  },
  paypal: {
    testMode: false,
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
      role: 'admin',
      status: 'active',
      joinedAt: '2025-01-10T00:00:00Z',
      lastActiveAt: '2026-02-04T09:15:00Z'
    },
    {
      id: 'member-004',
      name: 'Lisa Park',
      email: 'lisa@borneoorangutansurvival.org',
      role: 'developer',
      status: 'active',
      joinedAt: '2025-08-20T00:00:00Z',
      lastActiveAt: '2026-02-03T11:45:00Z'
    },
    {
      id: 'member-005',
      name: 'Alex Turner',
      email: 'alex@borneoorangutansurvival.org',
      role: 'member',
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
