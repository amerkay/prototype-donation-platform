<script setup lang="ts">
import { cn } from '@/lib/utils'
import CertDate from './CertDate.vue'
import CertSignature from './CertSignature.vue'
import CertFooter from './CertFooter.vue'
import CertSeparator from './CertSeparator.vue'

const props = defineProps<{
  date?: { value: string; show: boolean }
  signature?: {
    show: boolean
    name: string
    title: string
    fontFamily: string
  }
  footer?: { text: string }
  separatorColor: string
  separatorThickness: string
  compact?: boolean
  targets?: {
    date: string
    signatureSettings: string
    footer: string
  }
}>()

const hasDate = computed(() => props.date?.show ?? false)
const hasSignature = computed(() => props.signature?.show ?? false)
const hasFooter = computed(() => !!props.footer?.text)
const hasSeparator = computed(() => hasDate.value || hasSignature.value)
</script>

<template>
  <div class="w-full shrink-0">
    <CertSeparator
      v-if="hasSeparator"
      :color="separatorColor"
      :thickness="separatorThickness"
      :compact="compact"
    />

    <!-- Both date and signature -->
    <div
      v-if="hasDate && hasSignature"
      :class="cn('grid grid-cols-2 w-full items-end', compact ? 'gap-4' : 'gap-8')"
    >
      <div class="text-left">
        <CertDate :date="date!.value" :compact="compact" :data-field="targets?.date" />
      </div>
      <div class="text-right">
        <CertSignature
          :name="signature!.name"
          :title="signature!.title"
          :font-family="signature!.fontFamily"
          :compact="compact"
          :data-field="targets?.signatureSettings"
        />
      </div>
    </div>

    <!-- Only date -->
    <CertDate
      v-else-if="hasDate"
      :date="date!.value"
      :compact="compact"
      :data-field="targets?.date"
    />

    <!-- Only signature -->
    <CertSignature
      v-else-if="hasSignature"
      :name="signature!.name"
      :title="signature!.title"
      :font-family="signature!.fontFamily"
      :compact="compact"
      :data-field="targets?.signatureSettings"
    />

    <CertFooter
      v-if="hasFooter"
      :text="footer!.text"
      :compact="compact"
      :data-field="targets?.footer"
    />
  </div>
</template>
