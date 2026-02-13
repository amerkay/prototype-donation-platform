<script setup lang="ts">
import CertDate from './CertDate.vue'
import CertSignature from './CertSignature.vue'
import CertFooter from './CertFooter.vue'
// import CertSeparator from './CertSeparator.vue'

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
  targets?: {
    footer: string
  }
}>()

const hasDate = computed(() => props.date?.show ?? false)
const hasSignature = computed(() => props.signature?.show ?? false)
const hasFooter = computed(() => !!props.footer?.text)
// const hasSeparator = computed(() => hasDate.value || hasSignature.value)
</script>

<template>
  <div class="w-full shrink-0">
    <!-- <CertSeparator v-if="hasSeparator" :color="separatorColor" :thickness="separatorThickness" /> -->

    <!-- Both date and signature -->
    <div v-if="hasDate && hasSignature" class="grid grid-cols-2 w-full items-end gap-8">
      <div class="text-left">
        <CertDate :date="date!.value" :data-field="targets?.footer" />
      </div>
      <div class="text-right">
        <CertSignature
          :name="signature!.name"
          :title="signature!.title"
          :font-family="signature!.fontFamily"
          :data-field="targets?.footer"
        />
      </div>
    </div>

    <!-- Only date -->
    <CertDate v-else-if="hasDate" :date="date!.value" :data-field="targets?.footer" />

    <!-- Only signature -->
    <CertSignature
      v-else-if="hasSignature"
      :name="signature!.name"
      :title="signature!.title"
      :font-family="signature!.fontFamily"
      :data-field="targets?.footer"
    />

    <CertFooter v-if="hasFooter" class="mt-4" :text="footer!.text" :data-field="targets?.footer" />
  </div>
</template>
