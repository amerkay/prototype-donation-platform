<script setup lang="ts">
import { useReceiptTemplateStore } from '~/features/templates/admin/stores/receiptTemplate'
import { useCharitySettingsStore } from '~/features/settings/admin/stores/charitySettings'
import { useBrandingSettingsStore } from '~/features/settings/admin/stores/brandingSettings'
import { Separator } from '@/components/ui/separator'

const receipt = useReceiptTemplateStore()
const charity = useCharitySettingsStore()
const branding = useBrandingSettingsStore()

const sampleDate = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric'
}).format(new Date())
</script>

<template>
  <div class="bg-white text-black rounded-lg border shadow-sm p-8 max-w-md mx-auto text-sm">
    <!-- Header bar -->
    <div class="h-1.5 rounded-full mb-6" :style="{ backgroundColor: branding.primaryColor }" />

    <!-- Charity info -->
    <div class="text-center mb-4">
      <h3 class="text-lg font-bold">{{ charity.name }}</h3>
      <p class="text-xs text-gray-500">Reg. No. {{ charity.registrationNumber }}</p>
      <p class="text-xs text-gray-500">{{ charity.address }}</p>
    </div>

    <h4 class="text-center font-semibold mb-4" :style="{ color: branding.primaryColor }">
      Donation Receipt
    </h4>

    <p class="text-center text-gray-600 mb-4 text-xs italic">{{ receipt.headerText }}</p>

    <Separator class="my-4" />

    <!-- Donation details -->
    <div class="space-y-2 text-xs">
      <div class="flex justify-between">
        <span class="text-gray-500">Receipt No.</span>
        <span class="font-medium">RCP-2025-001234</span>
      </div>
      <div class="flex justify-between">
        <span class="text-gray-500">Date</span>
        <span class="font-medium">{{ sampleDate }}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-gray-500">Donor</span>
        <span class="font-medium">John Smith</span>
      </div>
      <div v-if="receipt.showCampaignName" class="flex justify-between">
        <span class="text-gray-500">Campaign</span>
        <span class="font-medium">Emergency Relief Fund</span>
      </div>
      <div v-if="receipt.showPaymentMethod" class="flex justify-between">
        <span class="text-gray-500">Payment</span>
        <span class="font-medium">Visa •••• 4242</span>
      </div>

      <Separator class="my-3" />

      <div class="flex justify-between text-base font-bold">
        <span>Amount</span>
        <span :style="{ color: branding.primaryColor }">£50.00</span>
      </div>
    </div>

    <!-- Gift Aid -->
    <div
      v-if="receipt.showGiftAid"
      class="mt-4 p-3 rounded border border-dashed text-xs text-gray-600"
    >
      <p class="font-medium text-black mb-1">Gift Aid Declaration</p>
      <p>
        This donation qualifies for Gift Aid, increasing its value by 25% at no extra cost to you.
      </p>
    </div>

    <Separator class="my-4" />

    <!-- Footer -->
    <p class="text-xs text-gray-400 text-center">{{ receipt.footerText }}</p>

    <!-- Bottom bar -->
    <div class="h-1 rounded-full mt-6" :style="{ backgroundColor: branding.primaryColor }" />
  </div>
</template>
