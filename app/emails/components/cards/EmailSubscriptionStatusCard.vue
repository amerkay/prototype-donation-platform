<script setup lang="ts">
import EmailCardInfoPanel from '~/emails/components/cards/layouts/EmailCardInfoPanel.vue'

interface Props {
  status: string
  amount?: string
  frequency?: string
  nextBillingDate?: string
  effectiveDate?: string
}

defineProps<Props>()
</script>

<template>
  <EmailCardInfoPanel title="Subscription status" :status="status">
    <div>
      <template v-if="amount"><strong>Amount:</strong> {{ amount }}<br /></template>
      <template v-if="frequency"><strong>Frequency:</strong> {{ frequency }}<br /></template>
      <template v-if="nextBillingDate"
        ><strong>Next billing:</strong> {{ nextBillingDate }}<br
      /></template>
      <template v-if="effectiveDate"><strong>Effective:</strong> {{ effectiveDate }}</template>
    </div>
  </EmailCardInfoPanel>
</template>
