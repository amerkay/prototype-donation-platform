<script setup lang="ts">
import EmailCardShell from '~/emails/components/cards/layouts/EmailCardShell.vue'

interface Props {
  imageUrl?: string
  imageAlt?: string
  imageSize?: number
}

withDefaults(defineProps<Props>(), {
  imageAlt: 'Card image',
  imageSize: 48
})
</script>

<template>
  <EmailCardShell>
    <table width="100%" role="presentation" cellspacing="0" cellpadding="0" border="0">
      <tbody>
        <tr>
          <td v-if="imageUrl" width="62" style="padding: 14px 10px 14px 14px; vertical-align: top">
            <img
              :src="imageUrl"
              :alt="imageAlt"
              :width="imageSize"
              :height="imageSize"
              style="border-radius: 8px; height: auto"
            />
          </td>
          <td
            :style="
              imageUrl
                ? 'padding: 12px 12px 12px 0; vertical-align: top'
                : 'padding: 12px; vertical-align: top'
            "
          >
            <slot />
          </td>
        </tr>
      </tbody>
    </table>
  </EmailCardShell>
</template>
