<script setup lang="ts">
import { ref } from 'vue'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { useDonationFormStore } from '~/features/donation-form/donor/stores/donationForm'
import { useAfterSaleSettingsStore } from '~/features/settings/admin/stores/afterSaleSettings'
import { useCampaigns } from '~/features/campaigns/shared/composables/useCampaigns'
import { useCurrency } from '~/features/donation-form/shared/composables/useCurrency'
import { useCurrencySettingsStore } from '~/features/settings/admin/stores/currencySettings'
import { getExchangeRatesForBase } from '~/sample-api-responses/api-sample-response-exchange-rates'
import { useReactiveTransactions } from '~/sample-api-responses/useReactiveTransactions'
import { formatCurrency } from '~/lib/formatCurrency'
import { sanitizeRichText } from '~/features/_library/form-builder/utils/sanitize-html'
import { generateEntityId } from '~/lib/generateEntityId'
import type { Subscription } from '~/features/subscriptions/shared/types'

const store = useDonationFormStore()
const afterSale = useAfterSaleSettingsStore()
const { getCampaignById } = useCampaigns()

const route = useRoute()
const campaignId = computed(() => (route.params.campaign_slug as string) || '')
const campaignName = computed(() => getCampaignById(campaignId.value)?.name || 'this campaign')

const { smartRound } = useCurrency(() => store.selectedCurrency)
const currencySettings = useCurrencySettingsStore()
const { transactions, addSubscription } = useReactiveTransactions()
const upgraded = ref(false)

const suggestedMonthly = computed(() =>
  smartRound(
    store.totalDonationAmount * Number(afterSale.recurringUpsellFraction),
    store.selectedCurrency
  )
)

const monthlyFormatted = computed(() =>
  formatCurrency(suggestedMonthly.value, store.selectedCurrency)
)

const yearlyFormatted = computed(() =>
  formatCurrency(suggestedMonthly.value * 12, store.selectedCurrency)
)

function replaceTokens(template: string): string {
  return template
    .replace(/\{\{amount\}\}/g, monthlyFormatted.value)
    .replace(/\{\{yearly\}\}/g, yearlyFormatted.value)
    .replace(/\{\{campaign\}\}/g, campaignName.value)
}

const upsellBody = computed(() => sanitizeRichText(replaceTokens(afterSale.recurringUpsellBody)))

const oneTimeFormatted = computed(() =>
  formatCurrency(store.totalDonationAmount, store.selectedCurrency)
)

const nextMonthDate = computed(() => {
  const date = new Date()
  date.setMonth(date.getMonth() + 1)
  return new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' }).format(date)
})

const handleConfirmUpgrade = () => {
  // In admin preview (no campaign_slug), just show the visual upgrade
  if (!campaignId.value) {
    upgraded.value = true
    return
  }

  const campaign = getCampaignById(campaignId.value)
  const now = new Date()
  const nextMonth = new Date(now)
  nextMonth.setMonth(nextMonth.getMonth() + 1)

  const originalTxn = store.transactionId
    ? transactions.value.find((t) => t.id === store.transactionId)
    : null

  const monthlyAmount = suggestedMonthly.value

  const subscription: Subscription = {
    id: generateEntityId('sub'),
    processor: 'stripe',
    processorSubscriptionId: `sub_demo_${Math.random().toString(36).slice(2, 10)}`,
    campaignId: campaignId.value,
    campaignName: campaign?.name || 'Donation',
    charityName: 'Borneo Orangutan Survival',
    donorId: originalTxn?.donorId,
    donorName: originalTxn?.donorName,
    donorEmail: originalTxn?.donorEmail,
    lineItems: originalTxn?.lineItems?.map((li) => ({
      ...li,
      unitPrice: monthlyAmount,
      frequency: 'monthly' as const
    })) || [
      {
        productId: 'general-donation',
        productTitle: 'Monthly Donation',
        quantity: 1,
        unitPrice: monthlyAmount,
        frequency: 'monthly' as const
      }
    ],
    subtotal: monthlyAmount,
    coverCostsAmount: 0,
    totalAmount: monthlyAmount,
    currency: store.selectedCurrency,
    baseCurrency: currencySettings.defaultCurrency,
    exchangeRate:
      store.selectedCurrency !== currencySettings.defaultCurrency
        ? (getExchangeRatesForBase(store.selectedCurrency).rates[
            currencySettings.defaultCurrency
          ] ?? 1)
        : 1,
    frequency: 'monthly',
    paymentMethod: { type: 'card', last4: '4242', brand: 'visa' },
    status: 'active',
    currentPeriodStart: now.toISOString(),
    currentPeriodEnd: nextMonth.toISOString(),
    nextBillingDate: nextMonth.toISOString(),
    createdAt: now.toISOString(),
    totalPaid: 0,
    paymentCount: 0
  }

  addSubscription(subscription)
  upgraded.value = true
}
</script>

<template>
  <Card v-if="!upgraded" class="border-primary/20 bg-primary/5">
    <CardContent class="space-y-3">
      <div class="flex items-center gap-2">
        <Icon name="lucide:repeat" class="h-5 w-5 text-primary" />
        <h3 class="font-semibold">{{ afterSale.recurringUpsellHeadline }}</h3>
      </div>
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div class="text-sm text-muted-foreground" v-html="upsellBody" />
      <AlertDialog>
        <AlertDialogTrigger as-child>
          <Button class="w-full">
            <Icon name="lucide:heart" class="mr-2 h-4 w-4" />
            Give {{ monthlyFormatted }}/month
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Upgrade to Monthly Giving?</AlertDialogTitle>
            <AlertDialogDescription>
              You'll be charged {{ monthlyFormatted }}/month starting {{ nextMonthDate }}. Your
              one-time donation of {{ oneTimeFormatted }} has already been processed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction @click="handleConfirmUpgrade">Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </CardContent>
  </Card>

  <Card v-else class="border-green-500/20 bg-green-50 dark:bg-green-950/20">
    <CardContent class="flex items-center gap-3">
      <Icon name="lucide:check-circle-2" class="h-5 w-5 text-green-600" />
      <p class="text-sm font-medium text-green-700 dark:text-green-400">
        Upgraded to {{ monthlyFormatted }}/month. Thank you!
      </p>
    </CardContent>
  </Card>
</template>
