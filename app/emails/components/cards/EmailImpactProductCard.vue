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
    <p style="margin: 0; font-weight: 600">
      {{ name }}
    </p>
    <p style="margin: 4px 0 0; opacity: 0.9">
      {{ shortDescription }}
    </p>
  </EmailCardMediaRow>
</template>
