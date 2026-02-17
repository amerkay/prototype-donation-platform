<script setup lang="ts">
import type { ReceiptModel } from '~/features/templates/shared/types'
import { sanitizeRichText } from '~/features/_library/form-builder/utils/sanitize-html'
import { computed } from 'vue'

const props = defineProps<{
  model: ReceiptModel
  /** Target field paths for editable preview navigation */
  targets?: Record<string, string>
}>()

const sanitizedTaxStatement = computed(() =>
  props.model.taxDeductibleStatement ? sanitizeRichText(props.model.taxDeductibleStatement) : ''
)

const showGiftAidSection = computed(
  () => props.model.showGiftAid && props.model.donation.currency === 'GBP'
)
</script>

<template>
  <div class="relative w-full h-full bg-white overflow-hidden flex">
    <!-- Left vertical accent stripe -->
    <div class="w-1.5 flex-shrink-0" :style="{ backgroundColor: model.branding.primaryColor }" />

    <!-- Content -->
    <div class="flex-1 flex flex-col p-12 text-black">
      <!-- Header: Logo + Org Info -->
      <div class="flex items-start gap-5 mb-8">
        <img
          v-if="model.showLogo && model.branding.logoUrl"
          :src="model.branding.logoUrl"
          alt="Logo"
          class="h-14 w-auto object-contain flex-shrink-0"
          :data-field="targets?.logo"
        />
        <div class="min-w-0" :data-field="targets?.charity">
          <div class="font-semibold text-xl leading-tight">{{ model.charity.name }}</div>
          <div class="text-sm text-gray-400 mt-1">
            Reg. No. {{ model.charity.registrationNumber }}
          </div>
          <div class="text-sm text-gray-400">{{ model.charity.address }}</div>
        </div>
      </div>

      <!-- Title -->
      <div class="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
        Donation Receipt
      </div>

      <!-- Header text -->
      <p v-if="model.headerText" class="text-gray-500 text-base mb-8" :data-field="targets?.header">
        {{ model.headerText }}
      </p>

      <!-- Details rows -->
      <div class="mb-6">
        <div class="flex justify-between py-2.5 border-b border-gray-100">
          <span class="text-gray-400 text-sm">Receipt No.</span>
          <span class="font-medium text-sm">{{ model.donation.receiptNumber }}</span>
        </div>
        <div class="flex justify-between py-2.5 border-b border-gray-100">
          <span class="text-gray-400 text-sm">Date</span>
          <span class="font-medium text-sm">{{ model.donation.date }}</span>
        </div>
        <div class="flex justify-between py-2.5 border-b border-gray-100">
          <span class="text-gray-400 text-sm">Donor</span>
          <span class="font-medium text-sm">{{ model.donation.donorName }}</span>
        </div>
        <div
          v-if="model.showDonorAddress && model.donation.donorAddress"
          class="flex justify-between py-2.5 border-b border-gray-100"
          :data-field="targets?.donorAddress"
        >
          <span class="text-gray-400 text-sm">Address</span>
          <span class="font-medium text-sm text-right whitespace-pre-line">{{
            model.donation.donorAddress
          }}</span>
        </div>
        <div
          v-if="model.showCampaignName && model.donation.campaign"
          class="flex justify-between py-2.5 border-b border-gray-100"
          :data-field="targets?.campaign"
        >
          <span class="text-gray-400 text-sm">Campaign</span>
          <span class="font-medium text-sm">{{ model.donation.campaign }}</span>
        </div>
        <div
          v-if="model.showPaymentMethod && model.donation.paymentMethod"
          class="flex justify-between py-2.5 border-b border-gray-100"
          :data-field="targets?.payment"
        >
          <span class="text-gray-400 text-sm">Payment</span>
          <span class="font-medium text-sm">{{ model.donation.paymentMethod }}</span>
        </div>
      </div>

      <!-- Amount card -->
      <div
        class="rounded-lg px-6 py-4 flex justify-between items-center mb-6"
        :style="{ backgroundColor: model.branding.primaryColor + '0D' }"
      >
        <span class="font-semibold text-base">Total Amount</span>
        <span class="font-bold text-xl">{{ model.donation.amount }}</span>
      </div>

      <!-- Tax deductible statement -->
      <div
        v-if="sanitizedTaxStatement"
        class="text-sm text-gray-600 mb-6 prose prose-sm max-w-none"
        :data-field="targets?.taxStatement"
        v-html="sanitizedTaxStatement"
      />

      <!-- Gift Aid declaration -->
      <div
        v-if="showGiftAidSection"
        class="p-4 border border-dashed border-gray-300 rounded-lg text-sm text-gray-600 mb-6"
        :data-field="targets?.giftAid"
      >
        <span class="font-medium text-black">Gift Aid Declaration:</span> This donation qualifies
        for Gift Aid, increasing its value by 25% at no extra cost to you.
      </div>

      <!-- Spacer to push footer down -->
      <div class="flex-1" />

      <!-- Footer text -->
      <p
        v-if="model.footerText"
        class="text-center text-gray-400 text-xs"
        :data-field="targets?.footer"
      >
        {{ model.footerText }}
      </p>
    </div>
  </div>
</template>
