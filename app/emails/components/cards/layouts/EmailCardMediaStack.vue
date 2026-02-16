<script setup lang="ts">
import { computed } from 'vue'
import EmailCardShell from '~/emails/components/cards/layouts/EmailCardShell.vue'

interface Props {
  imageUrl?: string
  imageAlt?: string
  imageMaxWidth?: number
  imageMaxHeight?: number
  linkUrl?: string
}

const props = withDefaults(defineProps<Props>(), {
  imageAlt: 'Card image',
  imageMaxWidth: 280,
  imageMaxHeight: undefined
})

const imageStyle = computed(() => {
  const maxHeight = props.imageMaxHeight ? ` max-height: ${props.imageMaxHeight}px;` : ''
  return `max-width: 100%; height: auto;${maxHeight} border-radius: 8px`
})
</script>

<template>
  <EmailCardShell>
    <table width="100%" role="presentation" cellspacing="0" cellpadding="0" border="0">
      <tbody>
        <tr v-if="imageUrl">
          <td style="padding: 12px 12px 0; text-align: left">
            <img
              :src="imageUrl"
              :alt="imageAlt"
              :width="imageMaxWidth"
              :height="imageMaxHeight"
              :style="imageStyle"
            />
          </td>
        </tr>
        <tr>
          <td style="padding: 12px; vertical-align: top">
            <a v-if="linkUrl" :href="linkUrl" style="text-decoration: none; color: inherit">
              <slot />
            </a>
            <slot v-else />
          </td>
        </tr>
      </tbody>
    </table>
  </EmailCardShell>
</template>
