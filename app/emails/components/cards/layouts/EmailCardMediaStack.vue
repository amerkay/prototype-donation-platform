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
  return `display: inline-block; width: 100%; max-width: ${props.imageMaxWidth}px; height: auto;${maxHeight} border-radius: 8px`
})
</script>

<template>
  <EmailCardShell>
    <table width="100%" role="presentation" cellspacing="0" cellpadding="0" border="0">
      <tbody>
        <tr v-if="imageUrl">
          <td style="padding: 12px 12px 0; text-align: center">
            <a
              v-if="linkUrl"
              :href="linkUrl"
              style="display: inline-block; text-decoration: none"
            >
              <img :src="imageUrl" :alt="imageAlt" :style="imageStyle" />
            </a>
            <img v-else :src="imageUrl" :alt="imageAlt" :style="imageStyle" />
          </td>
        </tr>
        <tr>
          <td style="padding: 12px; vertical-align: top">
            <a
              v-if="linkUrl"
              :href="linkUrl"
              style="display: block; text-decoration: none"
            >
              <slot />
            </a>
            <slot v-else />
          </td>
        </tr>
      </tbody>
    </table>
  </EmailCardShell>
</template>
