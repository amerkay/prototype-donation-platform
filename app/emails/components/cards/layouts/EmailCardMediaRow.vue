<script setup lang="ts">
import EmailCardShell from '~/emails/components/cards/layouts/EmailCardShell.vue'

interface Props {
  imageUrl?: string
  imageAlt?: string
  imageSize?: number
}

withDefaults(defineProps<Props>(), {
  imageAlt: 'Card image',
  imageSize: 84
})
</script>

<template>
  <EmailCardShell>
    <table width="100%" role="presentation" cellspacing="0" cellpadding="0" border="0">
      <tbody>
        <tr>
          <td v-if="imageUrl" :width="imageSize" style="padding: 12px; vertical-align: middle">
            <img
              :src="imageUrl"
              :alt="imageAlt"
              :width="imageSize"
              :height="imageSize"
              style="display: block; border-radius: 8px; height: auto"
            />
          </td>
          <td
            :style="
              imageUrl
                ? 'padding: 12px 12px 12px 0; vertical-align: middle'
                : 'padding: 12px; vertical-align: middle'
            "
          >
            <slot />
          </td>
        </tr>
      </tbody>
    </table>
  </EmailCardShell>
</template>
