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
    <div style="font-weight: 600">Order details</div>
    <table width="100%" role="presentation" cellspacing="0" cellpadding="0" border="0">
      <tbody>
        <tr>
          <td style="height: 4px; font-size: 0">&nbsp;</td>
        </tr>
      </tbody>
    </table>
    <div>
      <template v-if="leadItem">
        {{ leadItem.name }}<template v-if="leadItem.quantity"> x{{ leadItem.quantity }}</template>
      </template>
      <template v-if="remainingCount"> and {{ remainingCount }} more</template>
      <template v-if="total"><br /><strong>Total:</strong> {{ total }}</template>
      <template v-if="frequency"><br /><strong>Frequency:</strong> {{ frequency }}</template>
    </div>
  </EmailCardMediaRow>
</template>
