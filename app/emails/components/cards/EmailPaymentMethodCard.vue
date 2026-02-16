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
    <div>
      <template v-if="methodLabel"><strong>Method:</strong> {{ methodLabel }}<br /></template>
      <template v-if="expiry"><strong>Expiry:</strong> {{ expiry }}<br /></template>
      <template v-if="billingContact"
        ><strong>Billing contact:</strong> {{ billingContact }}<br
      /></template>
    </div>
    <template v-if="actionText">
      <table width="100%" role="presentation" cellspacing="0" cellpadding="0" border="0">
        <tbody>
          <tr>
            <td style="height: 10px; font-size: 0">&nbsp;</td>
          </tr>
        </tbody>
      </table>
      <div>{{ actionText }}</div>
    </template>
    <table
      v-if="portalUrl"
      width="100%"
      role="presentation"
      cellspacing="0"
      cellpadding="0"
      border="0"
      style="border-collapse: separate"
    >
      <tbody>
        <tr>
          <td style="height: 10px; font-size: 0">&nbsp;</td>
        </tr>
        <tr>
          <td
            align="center"
            style="padding: 10px 12px; border: 1px solid #b8b8b8; border-radius: 8px"
          >
            <a :href="portalUrl" style="text-decoration: none; font-weight: 600">
              {{ portalLinkText }}
            </a>
          </td>
        </tr>
      </tbody>
    </table>
  </EmailCardInfoPanel>
</template>
