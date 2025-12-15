<script setup lang="ts">
import { computed } from 'vue'
import type { TributeData, FormConfig } from '@/lib/common/types'

interface Props {
  tribute: TributeData
  config: FormConfig['features']['tribute']
}

const props = defineProps<Props>()

const tributeIcon = computed(() => {
  if (props.tribute.type === 'gift') return props.config.icons.gift
  if (props.tribute.type === 'memorial') return props.config.icons.memorial
  return props.config.icons.tribute
})

const tributeTitle = computed(() => {
  if (props.tribute.type === 'gift') {
    return props.config.form.honoreeSection.legendGift
  }
  if (props.tribute.type === 'memorial') {
    return props.config.form.honoreeSection.legendMemorial
  }
  return props.config.form.honoreeSection.legendDefault
})

const honoreeName = computed(() => {
  const honoree = props.tribute.honoree
  if (!honoree) return ''
  return [honoree.firstName, honoree.lastName].filter(Boolean).join(' ')
})

const eCardRecipient = computed(() => {
  if (!props.tribute.eCard?.send) return null
  const recipient = props.tribute.eCard.recipient
  if (!recipient) return null

  const name = [recipient.firstName, recipient.lastName].filter(Boolean).join(' ')
  return {
    name,
    email: recipient.email
  }
})
</script>

<template>
  <div>
    <p class="text-xs text-muted-foreground truncate">
      {{ tributeIcon }} {{ tributeTitle }} {{ honoreeName }}
    </p>
    <p v-if="eCardRecipient" class="text-xs text-muted-foreground mt-0.5 truncate">
      {{
        config.line.eCardTemplate.replace(
          '{recipient}',
          eCardRecipient.name || eCardRecipient.email
        )
      }}
    </p>
  </div>
</template>
