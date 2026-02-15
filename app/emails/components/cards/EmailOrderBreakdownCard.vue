<script setup lang="ts">
import { computed } from 'vue'
import EmailCardMediaRow from '~/emails/components/cards/layouts/EmailCardMediaRow.vue'
import type { EmailOrderBreakdownItem } from '~/emails/components/cards/types'

interface Props {
  items: EmailOrderBreakdownItem[]
  total?: string
  frequency?: string
}

const props = defineProps<Props>()

const leadItem = computed(() => props.items[0])
const remainingCount = computed(() => Math.max(props.items.length - 1, 0))
</script>

<template>
  <EmailCardMediaRow :image-url="leadItem?.imageUrl" :image-alt="leadItem?.name || 'Order item'">
    <p style="margin: 0; font-weight: 600">Order details</p>
    <p style="margin: 4px 0 0; opacity: 0.9">
      <template v-if="leadItem">
        {{ leadItem.name }}<template v-if="leadItem.quantity"> x{{ leadItem.quantity }}</template>
      </template>
      <template v-if="remainingCount"> and {{ remainingCount }} more</template>
      <template v-if="total"><br /><strong>Total:</strong> {{ total }}</template>
      <template v-if="frequency"><br /><strong>Frequency:</strong> {{ frequency }}</template>
    </p>
  </EmailCardMediaRow>
</template>
