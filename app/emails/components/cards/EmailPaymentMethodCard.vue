<script setup lang="ts">
import EmailCardInfoPanel from '~/emails/components/cards/layouts/EmailCardInfoPanel.vue'

interface Props {
  methodLabel?: string
  expiry?: string
  billingContact?: string
  actionText?: string
  portalUrl?: string
  portalLinkText?: string
}

withDefaults(defineProps<Props>(), {
  portalLinkText: 'Go to donor portal'
})
</script>

<template>
  <EmailCardInfoPanel title="Payment method">
    <p style="margin: 0">
      <template v-if="methodLabel"><strong>Method:</strong> {{ methodLabel }}<br /></template>
      <template v-if="expiry"><strong>Expiry:</strong> {{ expiry }}<br /></template>
      <template v-if="billingContact"
        ><strong>Billing contact:</strong> {{ billingContact }}<br
      /></template>
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
