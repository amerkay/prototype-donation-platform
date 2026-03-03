import type { Transaction, TransactionLineItem } from '~/features/donor-portal/types'
import { useDonationFormStore } from '~/features/donation-form/donor/stores/donationForm'
import { useFormConfigStore } from '~/features/donation-form/shared/stores/formConfig'
import { useCampaigns } from '~/features/campaigns/shared/composables/useCampaigns'
import { useCurrencySettingsStore } from '~/features/settings/admin/stores/currencySettings'
import { getExchangeRatesForBase } from '~/sample-api-responses/api-sample-response-exchange-rates'
import { generateEntityId } from '~/lib/generateEntityId'

type DonationStore = ReturnType<typeof useDonationFormStore>

function buildLineItems(
  store: DonationStore,
  formTitle: string | undefined
): TransactionLineItem[] {
  const frequency = store.activeTab === 'multiple' ? 'once' : store.activeTab
  if (store.activeTab === 'multiple') {
    return store.multipleCart.map((item) => ({
      productId: item.id,
      productTitle: item.title,
      quantity: item.quantity || 1,
      unitPrice: item.price || 0,
      frequency: (item.frequency || 'once') as 'once' | 'monthly' | 'yearly'
    }))
  }
  const product =
    store.activeTab !== 'once'
      ? store.selectedProducts[store.activeTab as 'monthly' | 'yearly']
      : null
  return [
    {
      productId: product?.id || 'general-donation',
      productTitle: product?.title || formTitle || 'Donation',
      quantity: 1,
      unitPrice: store.totalDonationAmount,
      frequency: frequency as 'once' | 'monthly' | 'yearly'
    }
  ]
}

function computeExchangeRate(donorCurrency: string, baseCurrency: string): number {
  if (donorCurrency === baseCurrency) return 1
  const rates = getExchangeRatesForBase(donorCurrency)
  return rates.rates[baseCurrency] ?? 1
}

function buildDonorInfo(donorInfo: Record<string, unknown>): {
  donorName: string
  donorEmail: string
} {
  const name = donorInfo.name as Record<string, string> | undefined
  return {
    donorName: `${name?.firstName || ''} ${name?.lastName || ''}`.trim(),
    donorEmail: (donorInfo.email as string) || ''
  }
}

function buildDonorAddress(shippingInfo: Record<string, string> | undefined) {
  if (!shippingInfo?.line1) return undefined
  return {
    line1: shippingInfo.line1,
    ...(shippingInfo.line2 && { line2: shippingInfo.line2 }),
    city: shippingInfo.city || '',
    ...(shippingInfo.region && { region: shippingInfo.region }),
    postcode: shippingInfo.postcode || '',
    country: shippingInfo.country || 'GB'
  }
}

/**
 * Builds a Transaction record from the current donation form state.
 * Used at submission time to persist the donation into the reactive transactions store.
 */
export function useBuildTransaction() {
  const store = useDonationFormStore()
  const formConfig = useFormConfigStore()
  const { getCampaignById } = useCampaigns()
  const currencySettings = useCurrencySettingsStore()

  function buildTransaction(): Transaction {
    const route = useRoute()
    const campaignId = (route.params.campaign_slug as string) || 'unknown'
    const campaign = getCampaignById(campaignId)
    const donorInfo = store.formSections.donorInfo as Record<string, unknown>
    const shippingInfo = store.formSections.shipping as Record<string, string> | undefined
    const giftAidData = store.formSections.giftAid as Record<string, boolean> | undefined
    const now = new Date().toISOString()

    const donorCurrency = store.selectedCurrency
    const baseCurrency = currencySettings.defaultCurrency
    const exchangeRate = computeExchangeRate(donorCurrency, baseCurrency)
    const lineItems = buildLineItems(store, formConfig.form?.title)
    const { donorName, donorEmail } = buildDonorInfo(donorInfo)
    const donorAddress = buildDonorAddress(shippingInfo)
    const giftAid = !!giftAidData?.claimGiftAid
    const subtotal = store.totalDonationAmount

    return {
      id: generateEntityId('txn'),
      organizationId: 'org-001',
      processor: 'stripe',
      processorTransactionId: `pi_demo_${Math.random().toString(36).slice(2, 10)}`,
      type:
        store.activeTab === 'once' || store.activeTab === 'multiple'
          ? 'one_time'
          : 'subscription_payment',
      campaignId,
      campaignName: campaign?.name || 'Donation',
      charityName: 'Borneo Orangutan Survival',
      lineItems,
      subtotal,
      coverCostsAmount: store.coverCostsAmount,
      totalAmount: store.totalAmount,
      currency: donorCurrency,
      baseCurrency,
      exchangeRate,
      campaignCurrency: baseCurrency, // TODO: use actual campaign currency
      campaignExchangeRate: exchangeRate, // TODO: compute donor→campaign rate
      paymentMethod: { type: 'card', last4: '4242', brand: 'visa' },
      status: 'succeeded',
      donorId: `donor-${Date.now()}`,
      donorName,
      donorEmail,
      isAnonymous: false,
      giftAid,
      ...(giftAid && { giftAidAmount: Math.round(subtotal * 25) / 100 }),
      ...(donorAddress && { donorAddress }),
      ...(Object.keys(store.formSections.customFields || {}).length > 0 && {
        customFields: store.formSections.customFields as Record<string, string>
      }),
      matchedAmount: 0,
      legalBasis: 'contractual_necessity',
      createdAt: now,
      receiptUrl: '#'
    }
  }

  return { buildTransaction }
}
