<script setup lang="ts">
import { computed } from 'vue'
import type { TributeSettings, TributeData } from './types'

interface Props {
  tribute: TributeData
  config: TributeSettings
}

const props = defineProps<Props>()

const tributeIcon = computed(() => {
  if (props.tribute.type === 'gift') return props.config.icons.gift
  if (props.tribute.type === 'memorial') return props.config.icons.memorial
  return props.config.icons.tribute
})

const tributeTitle = computed(() => {
  if (props.tribute.type === 'gift') {
    return 'Gift to'
  }
  if (props.tribute.type === 'memorial') {
    return 'In Memory of'
  }
  return 'Honoree'
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

const hasMessage = computed(() => {
  return props.tribute.eCard?.isIncludeMessage && props.tribute.eCard?.message
})
</script>

<template>
  <div>
    <p class="text-xs text-muted-foreground truncate">
      {{ tributeIcon }} {{ tributeTitle }} {{ honoreeName }}
    </p>
    <p v-if="eCardRecipient" class="text-xs text-muted-foreground mt-0.5 truncate">
      📧 eCard to {{ eCardRecipient.name || eCardRecipient.email }}
    </p>
    <p v-if="hasMessage" class="text-xs text-muted-foreground mt-0.5 truncate">
      💬 "{{ tribute.eCard?.message }}"
    </p>
  </div>
</template>
