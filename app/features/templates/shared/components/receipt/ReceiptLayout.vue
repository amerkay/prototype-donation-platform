<script setup lang="ts">
import type { ReceiptModel } from '~/features/templates/shared/types'

defineProps<{
  model: ReceiptModel
}>()
</script>

<template>
  <div class="w-full h-full bg-white overflow-hidden">
    <div class="p-8 text-lg text-black">
      <!-- Top accent bar -->
      <div
        class="h-2 w-full rounded-full mb-6"
        :style="{ backgroundColor: model.branding.primaryColor }"
      />

      <!-- Header: Logo + Org Info side by side -->
      <div class="flex items-start gap-6 mb-6">
        <img
          v-if="model.showLogo && model.branding.logoUrl"
          :src="model.branding.logoUrl"
          alt="Logo"
          class="h-16 w-auto object-contain flex-shrink-0"
        />
        <div class="min-w-0">
          <div class="font-semibold text-xl leading-tight">{{ model.charity.name }}</div>
          <div class="text-sm text-gray-500 mt-1">
            Reg. No. {{ model.charity.registrationNumber }} · {{ model.charity.address }}
          </div>
        </div>
      </div>

      <!-- Title -->
      <div class="text-center font-semibold text-xl mb-6 uppercase tracking-wide">
        Donation Receipt
      </div>

      <!-- Header text -->
      <p v-if="model.headerText" class="text-center text-gray-600 mb-6 text-base">
        {{ model.headerText }}
      </p>

      <!-- Details table -->
      <div class="space-y-3 mb-4">
        <div class="flex justify-between">
          <span class="text-gray-500">Receipt No.</span>
          <span class="font-medium">{{ model.donation.receiptNumber }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-500">Date</span>
          <span class="font-medium">{{ model.donation.date }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-500">Donor</span>
          <span class="font-medium">{{ model.donation.donorName }}</span>
        </div>
        <div v-if="model.showCampaignName && model.donation.campaign" class="flex justify-between">
          <span class="text-gray-500">Campaign</span>
          <span class="font-medium">{{ model.donation.campaign }}</span>
        </div>
        <div
          v-if="model.showPaymentMethod && model.donation.paymentMethod"
          class="flex justify-between"
        >
          <span class="text-gray-500">Payment</span>
          <span class="font-medium">{{ model.donation.paymentMethod }}</span>
        </div>
      </div>

      <!-- Amount row - emphasized with separator -->
      <div class="border-t border-gray-200 pt-4 mt-4">
        <div class="flex justify-between font-bold text-xl">
          <span>Amount</span>
          <span>{{ model.donation.amount }}</span>
        </div>
      </div>

      <!-- Gift Aid declaration -->
      <div
        v-if="model.showGiftAid"
        class="mt-6 p-4 border border-dashed border-gray-300 rounded text-sm text-gray-600"
      >
        <span class="font-medium text-black">Gift Aid:</span> This donation qualifies for Gift Aid,
        increasing its value by 25% at no extra cost to you.
      </div>

      <!-- Footer text -->
      <p v-if="model.footerText" class="mt-6 text-center text-gray-400 text-sm">
        {{ model.footerText }}
      </p>

      <!-- Bottom accent bar -->
      <div
        class="h-1 w-full rounded-full mt-6"
        :style="{ backgroundColor: model.branding.primaryColor }"
      />
    </div>
  </div>
</template>
