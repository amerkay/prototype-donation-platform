<script setup lang="ts">
import { computed } from 'vue'
import { useReceiptTemplateStore } from '~/features/templates/admin/stores/receiptTemplate'
import { useCharitySettingsStore } from '~/features/settings/admin/stores/charitySettings'
import { useBrandingSettingsStore } from '~/features/settings/admin/stores/brandingSettings'
import { useCurrencySettingsStore } from '~/features/settings/admin/stores/currencySettings'
import { formatCurrency } from '~/lib/formatCurrency'
import { buildReceiptFragment } from '~/features/templates/admin/builders/receipt-fragment'

const props = defineProps<{
  currency?: string
}>()

const receipt = useReceiptTemplateStore()
const charityStore = useCharitySettingsStore()
const branding = useBrandingSettingsStore()
const currencyStore = useCurrencySettingsStore()

const activeCurrency = computed(() => props.currency || currencyStore.defaultCurrency)
const charityInfo = computed(() => charityStore.getCharityForCurrency(activeCurrency.value))
const sampleAmount = computed(() => formatCurrency(50, activeCurrency.value))

const sampleDate = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric'
}).format(new Date())

const fragment = computed(() =>
  buildReceiptFragment({
    headerText: receipt.headerText,
    footerText: receipt.footerText,
    showGiftAid: receipt.showGiftAid,
    showPaymentMethod: receipt.showPaymentMethod,
    showCampaignName: receipt.showCampaignName,
    showLogo: receipt.showLogo,
    branding: {
      logoUrl: branding.logoUrl,
      primaryColor: branding.primaryColor
    },
    charity: {
      name: charityInfo.value.name,
      registrationNumber: charityInfo.value.registrationNumber,
      address: charityInfo.value.address
    },
    donation: {
      receiptNumber: 'RCP-2025-001234',
      date: sampleDate,
      donorName: 'John Smith',
      amount: sampleAmount.value,
      campaign: 'Emergency Relief Fund',
      paymentMethod: 'Visa \u2022\u2022\u2022\u2022 4242'
    }
  })
)
</script>

<template>
  <div
    class="relative overflow-hidden rounded-lg border shadow-sm aspect-[210/297] mx-auto max-w-95"
  >
    <!-- eslint-disable-next-line vue/no-v-html -- trusted builder output -->
    <div class="h-full" v-html="fragment" />
  </div>
</template>
