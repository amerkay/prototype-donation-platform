import { toValue, type MaybeRefOrGetter } from 'vue'
import type { EmailTemplateCategory, EmailTemplateType } from '~/features/templates/admin/types'
import { EMAIL_TEMPLATE_META } from '~/features/templates/admin/email-templates'
import type { TransactionLineItem, PaymentMethod } from '~/features/donor-portal/types'
import { useCampaigns } from '~/features/campaigns/shared/composables/useCampaigns'
import { useDonations } from '~/features/donations/admin/composables/useDonations'
import { useProducts } from '~/features/products/admin/composables/useProducts'
import { useAdminSubscriptions } from '~/features/subscriptions/admin/composables/useAdminSubscriptions'
import { useCharitySettingsStore } from '~/features/settings/admin/stores/charitySettings'
import { useBrandingSettingsStore } from '~/features/settings/admin/stores/brandingSettings'
import type { EmailCardsPayload } from '~/emails/components/cards/types'

function toAbsoluteUrl(url: string | null | undefined, siteUrl?: string): string | undefined {
  if (!url) return undefined
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url
  const base = siteUrl || (import.meta.client ? window.location.origin : '')
  if (!base) return url
  return `${base.replace(/\/$/, '')}${url.startsWith('/') ? '' : '/'}${url}`
}

function formatDate(value?: string): string {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function formatMoney(amount?: number, currency = 'USD'): string {
  if (typeof amount !== 'number') return ''
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

function formatFrequency(value?: string): string {
  if (!value) return ''
  if (value === 'once') return 'one-time'
  return value
}

function formatPaymentMethod(method?: PaymentMethod): string {
  if (!method) return ''
  if (method.type === 'card') {
    const brand = method.brand ? method.brand.toUpperCase() : 'CARD'
    return `${brand} •••• ${method.last4 || '----'}`
  }
  if (method.type === 'paypal') {
    return method.email ? `PayPal (${method.email})` : 'PayPal'
  }
  return 'Bank transfer'
}

function titleCase(value: string): string {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}

function fallbackImageUrl(
  primary?: string | null,
  secondary?: string | null,
  tertiary?: string | null,
  siteUrl?: string
): string | undefined {
  return (
    toAbsoluteUrl(primary, siteUrl) ||
    toAbsoluteUrl(secondary, siteUrl) ||
    toAbsoluteUrl(tertiary, siteUrl)
  )
}

export function useEmailPreviewContext(
  templateType?: MaybeRefOrGetter<EmailTemplateType | undefined>
) {
  const { campaigns } = useCampaigns()
  const { allTransactions } = useDonations()
  const { allSubscriptions } = useAdminSubscriptions()
  const { activeProducts } = useProducts()
  const charityStore = useCharitySettingsStore()
  const brandingStore = useBrandingSettingsStore()
  const siteUrl = (useRuntimeConfig().public.siteUrl as string | undefined) || ''
  const templateCategory = computed<EmailTemplateCategory>(() => {
    const type = toValue(templateType)
    return type ? EMAIL_TEMPLATE_META[type].category : 'donor'
  })
  const isAdminFacingTemplate = computed(
    () => templateCategory.value === 'admin' || templateCategory.value === 'team'
  )

  const latestCampaign = computed(() => {
    const standardCampaigns = campaigns.value.filter((campaign) => campaign.type === 'standard')
    const source = standardCampaigns.length > 0 ? standardCampaigns : campaigns.value
    return [...source].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )[0]
  })

  const latestDonation = computed(() => allTransactions.value[0])
  const latestSucceededDonation = computed(
    () => allTransactions.value.find((txn) => txn.status === 'succeeded') ?? latestDonation.value
  )
  const latestFailedDonation = computed(() =>
    allTransactions.value.find((txn) => txn.status === 'failed')
  )
  const latestSubscription = computed(() => allSubscriptions.value[0])

  const latestDonor = computed(() => {
    const txn = latestSucceededDonation.value
    if (!txn) return undefined
    const [firstName, ...rest] = txn.donorName.split(' ')
    return {
      firstName: firstName || txn.donorName,
      lastName: rest.join(' ').trim(),
      fullName: txn.donorName,
      email: txn.donorEmail
    }
  })

  const latestProduct = computed(
    () => activeProducts.value.find((product) => product.image) ?? activeProducts.value[0]
  )

  const impactCardImageUrl = computed(() =>
    fallbackImageUrl(
      latestProduct.value?.image,
      latestCampaign.value?.crowdfunding?.coverPhoto,
      '/imgs/orangutan-images/baimah.jpg',
      siteUrl
    )
  )
  const campaignCardImageUrl = computed(() =>
    fallbackImageUrl(
      latestCampaign.value?.crowdfunding?.coverPhoto,
      latestProduct.value?.image,
      '/imgs/orangutan-images/baimah.jpg',
      siteUrl
    )
  )
  const donorPortalUrl = computed(() => toAbsoluteUrl('/portal', siteUrl))
  const buttonBackgroundColor = computed(() => brandingStore.primaryColor || '#5f259f')
  const campaignCardUrl = computed(() => {
    const campaign = latestCampaign.value
    if (!campaign?.id) return undefined
    if (isAdminFacingTemplate.value) {
      return toAbsoluteUrl(`/admin/campaigns/${campaign.id}`, siteUrl)
    }
    const orgSlug = charityStore.slug?.trim()
    const donorPath = orgSlug ? `/${orgSlug}/${campaign.id}` : `/admin/campaigns/${campaign.id}`
    return toAbsoluteUrl(donorPath, siteUrl)
  })

  const orderLineItems = computed(() => {
    const sourceItems =
      latestSucceededDonation.value?.lineItems || latestSubscription.value?.lineItems || []
    return sourceItems.map((item: TransactionLineItem) => {
      const product = activeProducts.value.find((p) => p.id === item.productId)
      return {
        name: item.productName,
        quantity: item.quantity,
        amount: formatMoney(
          item.unitPrice * item.quantity,
          latestSucceededDonation.value?.currency || latestSubscription.value?.currency || 'USD'
        ),
        imageUrl: toAbsoluteUrl(product?.image, siteUrl)
      }
    })
  })

  const donationAmount = computed(() =>
    formatMoney(
      latestSucceededDonation.value?.totalAmount,
      latestSucceededDonation.value?.currency || 'USD'
    )
  )

  const subscriptionAmount = computed(() =>
    formatMoney(latestSubscription.value?.amount, latestSubscription.value?.currency || 'USD')
  )

  const sampleVariablesByCategory = computed<Record<EmailTemplateCategory, Record<string, string>>>(
    () => ({
      ecard: {
        FIRST_NAME: latestDonor.value?.firstName || 'Friend',
        LAST_NAME: latestDonor.value?.lastName || 'Supporter',
        DONOR_NAME: latestDonor.value?.fullName || 'A generous supporter',
        AMOUNT: donationAmount.value || '$0.00',
        DATE:
          formatDate(latestSucceededDonation.value?.createdAt) ||
          formatDate(new Date().toISOString()),
        HONOREE_NAME: 'Someone Special'
      },
      donor: {
        FIRST_NAME: latestDonor.value?.firstName || 'Friend',
        LAST_NAME: latestDonor.value?.lastName || 'Supporter',
        AMOUNT: donationAmount.value || subscriptionAmount.value || '$0.00',
        DATE:
          formatDate(latestSucceededDonation.value?.createdAt) ||
          formatDate(new Date().toISOString()),
        CAMPAIGN_NAME:
          latestCampaign.value?.name ||
          latestSucceededDonation.value?.campaignName ||
          'Our Mission Fund',
        FREQUENCY:
          formatFrequency(
            latestSubscription.value?.frequency ||
              latestSucceededDonation.value?.lineItems[0]?.frequency
          ) || 'monthly',
        NEXT_BILLING_DATE: formatDate(latestSubscription.value?.nextBillingDate) || ''
      },
      admin: {
        DONOR_NAME: latestDonor.value?.fullName || 'Unknown donor',
        AMOUNT: donationAmount.value || '$0.00',
        DATE:
          formatDate(latestSucceededDonation.value?.createdAt) ||
          formatDate(new Date().toISOString()),
        CAMPAIGN_NAME:
          latestCampaign.value?.name ||
          latestSucceededDonation.value?.campaignName ||
          'Our Mission Fund',
        FREQUENCY:
          formatFrequency(
            latestSubscription.value?.frequency ||
              latestSucceededDonation.value?.lineItems[0]?.frequency
          ) || 'one-time',
        FUNDRAISER_NAME: 'Community Champion',
        GOAL_AMOUNT:
          formatMoney(
            latestCampaign.value?.crowdfunding?.goalAmount,
            latestCampaign.value?.stats?.currency || 'USD'
          ) || '$0.00'
      },
      p2p: {
        DONOR_NAME: latestDonor.value?.fullName || 'A supporter',
        AMOUNT: donationAmount.value || '$0.00',
        FUNDRAISER_NAME: latestCampaign.value?.name || 'Fundraiser',
        TOTAL_RAISED:
          formatMoney(
            latestCampaign.value?.stats?.totalRaised,
            latestCampaign.value?.stats?.currency || 'USD'
          ) || '$0.00'
      },
      team: {
        INVITEE_NAME: latestDonor.value?.fullName || 'Team Member',
        ROLE: 'Editor',
        ORG_NAME:
          charityStore.emailSenderName || latestCampaign.value?.name || 'Community Organization',
        INVITE_LINK: 'https://example.com/invite/latest'
      }
    })
  )

  const cards = computed<EmailCardsPayload>(() => ({
    IMPACT_PRODUCT_CARD: {
      name: latestProduct.value?.name || 'Direct support for our mission',
      description:
        latestProduct.value?.description ||
        latestCampaign.value?.crowdfunding?.shortDescription ||
        'Your support helps deliver practical services and long-term impact.',
      imageUrl: impactCardImageUrl.value
    },
    DONATION_SUMMARY_CARD: latestSucceededDonation.value
      ? {
          amount: donationAmount.value,
          date: formatDate(latestSucceededDonation.value.createdAt),
          frequency: formatFrequency(latestSucceededDonation.value.lineItems[0]?.frequency),
          campaignName: latestSucceededDonation.value.campaignName,
          reference: latestSucceededDonation.value.id.toUpperCase()
        }
      : undefined,
    SUBSCRIPTION_STATUS_CARD: latestSubscription.value
      ? {
          status: titleCase(latestSubscription.value.status),
          amount: subscriptionAmount.value,
          frequency: formatFrequency(latestSubscription.value.frequency),
          nextBillingDate: formatDate(latestSubscription.value.nextBillingDate),
          effectiveDate: formatDate(latestSubscription.value.currentPeriodStart)
        }
      : undefined,
    ORDER_BREAKDOWN_CARD: {
      items:
        orderLineItems.value.length > 0
          ? orderLineItems.value
          : [{ name: 'General donation', quantity: 1, amount: donationAmount.value }],
      total: donationAmount.value || subscriptionAmount.value,
      frequency: formatFrequency(
        latestSubscription.value?.frequency ||
          latestSucceededDonation.value?.lineItems[0]?.frequency
      )
    },
    PAYMENT_RETRY_CARD: {
      amount: formatMoney(
        latestFailedDonation.value?.totalAmount,
        latestFailedDonation.value?.currency || latestSubscription.value?.currency || 'USD'
      ),
      failedDate: formatDate(latestFailedDonation.value?.createdAt),
      retryDate: formatDate(latestSubscription.value?.nextBillingDate),
      actionText: 'Please update your payment details so your ongoing support can continue.',
      portalUrl: donorPortalUrl.value,
      portalLinkText: 'Open donor portal',
      buttonBackgroundColor: buttonBackgroundColor.value
    },
    PAYMENT_METHOD_CARD: {
      methodLabel: formatPaymentMethod(
        latestSubscription.value?.paymentMethod || latestSucceededDonation.value?.paymentMethod
      ),
      expiry: latestSubscription.value?.nextBillingDate
        ? `Next bill ${formatDate(latestSubscription.value.nextBillingDate)}`
        : undefined,
      billingContact: latestDonor.value?.email || charityStore.emailSenderAddress,
      actionText: 'Update payment details any time in your donor portal.',
      portalUrl: donorPortalUrl.value,
      portalLinkText: 'Open donor portal',
      buttonBackgroundColor: buttonBackgroundColor.value
    },
    CAMPAIGN_CONTEXT_CARD: {
      campaignName: latestCampaign.value?.name || latestSucceededDonation.value?.campaignName,
      description:
        latestCampaign.value?.crowdfunding?.shortDescription ||
        latestCampaign.value?.crowdfunding?.title ||
        'Your support helps us continue practical services and long-term impact.',
      imageUrl: campaignCardImageUrl.value,
      campaignUrl: campaignCardUrl.value,
      buttonBackgroundColor: buttonBackgroundColor.value
    }
  }))

  return {
    sampleVariablesByCategory,
    cards,
    latestCampaign,
    latestDonation,
    latestDonor,
    latestSubscription
  }
}
