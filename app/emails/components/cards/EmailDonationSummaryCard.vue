<script setup lang="ts">
import EmailCardInfoPanel from '~/emails/components/cards/layouts/EmailCardInfoPanel.vue'

interface Props {
  amount: string
  date: string
  frequency?: string
  campaignName?: string
  reference?: string
}

defineProps<Props>()
</script>

<template>
  <EmailCardInfoPanel title="Donation summary">
    <p style="margin: 0">
      <strong>Amount:</strong> {{ amount }}<br />
      <strong>Date:</strong> {{ date }}<br />
      <template v-if="frequency"><strong>Frequency:</strong> {{ frequency }}<br /></template>
      <template v-if="campaignName"><strong>Fund:</strong> {{ campaignName }}<br /></template>
      <template v-if="reference"><strong>Reference:</strong> {{ reference }}</template>
    </p>
  </EmailCardInfoPanel>
</template>
