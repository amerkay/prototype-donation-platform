<script setup lang="ts">
import EmailCardMediaStack from '~/emails/components/cards/layouts/EmailCardMediaStack.vue'
import EmailCardActionButton from '~/emails/components/cards/layouts/EmailCardActionButton.vue'

interface Props {
  campaignName?: string
  description: string
  imageUrl?: string
  campaignUrl?: string
  buttonBackgroundColor?: string
}

const props = defineProps<Props>()
</script>

<template>
  <EmailCardMediaStack
    :image-url="imageUrl"
    :image-alt="campaignName || 'Campaign image'"
    :image-max-width="320"
    :image-max-height="320"
  >
    <div v-if="campaignName" style="font-weight: 600">
      {{ campaignName }}
    </div>
    <table
      v-if="campaignName"
      width="100%"
      role="presentation"
      cellspacing="0"
      cellpadding="0"
      border="0"
    >
      <tbody>
        <tr>
          <td style="height: 4px; font-size: 0">&nbsp;</td>
        </tr>
      </tbody>
    </table>
    <div style="opacity: 0.9">{{ description }}</div>
    <template v-if="campaignUrl">
      <table width="100%" role="presentation" cellspacing="0" cellpadding="0" border="0">
        <tbody>
          <tr>
            <td style="height: 10px; font-size: 0">&nbsp;</td>
          </tr>
        </tbody>
      </table>
      <EmailCardActionButton
        :href="campaignUrl"
        label="View campaign"
        :background-color="props.buttonBackgroundColor"
      />
    </template>
  </EmailCardMediaStack>
</template>
