<script setup lang="ts">
import { computed } from 'vue'
import EmailCardMediaRow from '~/emails/components/cards/layouts/EmailCardMediaRow.vue'

interface Props {
  name: string
  description: string
  imageUrl?: string
}

const props = defineProps<Props>()

const shortDescription = computed(() =>
  props.description.length > 100 ? `${props.description.slice(0, 100)}...` : props.description
)
const resolvedImageUrl = computed(() => props.imageUrl || '/imgs/orangutan-images/baimah.jpg')
</script>

<template>
  <EmailCardMediaRow :image-url="resolvedImageUrl" :image-alt="name">
    <div style="font-weight: 600">
      {{ name }}
    </div>
    <table width="100%" role="presentation" cellspacing="0" cellpadding="0" border="0">
      <tbody>
        <tr>
          <td style="height: 4px; font-size: 0">&nbsp;</td>
        </tr>
      </tbody>
    </table>
    <div style="opacity: 0.9">{{ shortDescription }}</div>
  </EmailCardMediaRow>
</template>
