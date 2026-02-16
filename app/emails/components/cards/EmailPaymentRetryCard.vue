<script setup lang="ts">
import EmailCardInfoPanel from '~/emails/components/cards/layouts/EmailCardInfoPanel.vue'
import EmailCardActionButton from '~/emails/components/cards/layouts/EmailCardActionButton.vue'

interface Props {
  amount?: string
  failedDate?: string
  retryDate?: string
  actionText?: string
  portalUrl?: string
  portalLinkText?: string
  buttonBackgroundColor?: string
}

withDefaults(defineProps<Props>(), {
  portalLinkText: 'Go to donor portal'
})
</script>

<template>
  <EmailCardInfoPanel title="Payment action needed">
    <div>
      <template v-if="amount"><strong>Amount:</strong> {{ amount }}<br /></template>
      <template v-if="failedDate"><strong>Attempted:</strong> {{ failedDate }}<br /></template>
      <template v-if="retryDate"><strong>Next retry:</strong> {{ retryDate }}<br /></template>
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
          <td>
            <EmailCardActionButton
              :href="portalUrl"
              :label="portalLinkText"
              :background-color="buttonBackgroundColor"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </EmailCardInfoPanel>
</template>
