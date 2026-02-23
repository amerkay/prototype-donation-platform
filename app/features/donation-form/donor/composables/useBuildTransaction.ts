import type { Transaction, TransactionLineItem } from '~/features/donor-portal/types'
import { useDonationFormStore } from '~/features/donation-form/donor/stores/donationForm'
import { useFormConfigStore } from '~/features/donation-form/shared/stores/formConfig'
import { useCampaigns } from '~/features/campaigns/shared/composables/useCampaigns'
import { generateEntityId } from '~/lib/generateEntityId'

/**
 * Builds a Transaction record from the current donation form state.
 * Used at submission time to persist the donation into the reactive transactions store.
 */
export function useBuildTransaction() {
  const store = useDonationFormStore()
  const formConfig = useFormConfigStore()
  const { getCampaignById } = useCampaigns()

  function buildTransaction(): Transaction {
    const route = useRoute()
    const campaignId = (route.params.campaign_slug as string) || 'unknown'
    const campaign = getCampaignById(campaignId)
    const donorInfo = store.formSections.donorInfo as Record<string, unknown>
    const donorName = donorInfo.name as Record<string, string> | undefined
    const frequency = store.activeTab === 'multiple' ? 'once' : store.activeTab
    const now = new Date().toISOString()

    // Build line items from selected products or cart
    let lineItems: TransactionLineItem[]
    if (store.activeTab === 'multiple') {
      lineItems = store.multipleCart.map((item) => ({
        productId: item.id,
        productTitle: item.title,
        quantity: item.quantity || 1,
        unitPrice: item.price || 0,
        frequency: (item.frequency || 'once') as 'once' | 'monthly' | 'yearly'
      }))
    } else {
      const product =
        store.activeTab !== 'once'
          ? store.selectedProducts[store.activeTab as 'monthly' | 'yearly']
          : null
      lineItems = [
        {
          productId: product?.id || 'general-donation',
          productTitle: product?.title || formConfig.form?.title || 'Donation',
          quantity: 1,
          unitPrice: store.totalDonationAmount,
          frequency: frequency as 'once' | 'monthly' | 'yearly'
        }
      ]
    }

    const shippingInfo = store.formSections.shipping as Record<string, string> | undefined
    const giftAidData = store.formSections.giftAid as Record<string, boolean> | undefined

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
      subtotal: store.totalDonationAmount,
      coverCostsAmount: store.coverCostsAmount,
      totalAmount: store.totalAmount,
      currency: store.selectedCurrency,
      baseCurrency: store.selectedCurrency,
      exchangeRate: 1,
      paymentMethod: { type: 'card', last4: '4242', brand: 'visa' },
      status: 'succeeded',
      donorId: `donor-${Date.now()}`,
      donorName: `${donorName?.firstName || ''} ${donorName?.lastName || ''}`.trim(),
      donorEmail: (donorInfo.email as string) || '',
      isAnonymous: false,
      giftAid: !!giftAidData?.claimGiftAid,
      ...(shippingInfo?.line1 && {
        donorAddress: {
          line1: shippingInfo.line1,
          ...(shippingInfo.line2 && { line2: shippingInfo.line2 }),
          city: shippingInfo.city || '',
          ...(shippingInfo.region && { region: shippingInfo.region }),
          postcode: shippingInfo.postcode || '',
          country: shippingInfo.country || 'GB'
        }
      }),
      ...(Object.keys(store.formSections.customFields || {}).length > 0 && {
        customFields: store.formSections.customFields as Record<string, string>
      }),
      legalBasis: 'contractual_necessity',
      createdAt: now,
      receiptUrl: '#'
    }
  }

  return { buildTransaction }
}
