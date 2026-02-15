<script setup lang="ts">
import EmailCardInfoPanel from '~/emails/components/cards/layouts/EmailCardInfoPanel.vue'

interface Props {
  amount?: string
  failedDate?: string
  retryDate?: string
  actionText?: string
  portalUrl?: string
  portalLinkText?: string
}

withDefaults(defineProps<Props>(), {
  portalLinkText: 'Go to donor portal'
})
</script>

<template>
  <EmailCardInfoPanel title="Payment action needed">
    <p style="margin: 0">
      <template v-if="amount"><strong>Amount:</strong> {{ amount }}<br /></template>
      <template v-if="failedDate"><strong>Attempted:</strong> {{ failedDate }}<br /></template>
      <template v-if="retryDate"><strong>Next retry:</strong> {{ retryDate }}<br /></template>
    </p>
    <p v-if="actionText || portalUrl" style="margin: 10px 0 0; opacity: 0.9">
      <template v-if="actionText">{{ actionText }}</template>
      <template v-if="portalUrl">
        <br />
        <a :href="portalUrl" style="text-decoration: underline; opacity: 0.92">
          {{ portalLinkText }}
        </a>
      </template>
    </p>
  </EmailCardInfoPanel>
</template>
