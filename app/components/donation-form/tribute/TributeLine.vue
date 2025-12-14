<script setup lang="ts">
import { computed } from 'vue'
import type { TributeData } from '@/lib/common/types'

interface Props {
  tribute: TributeData
}

const props = defineProps<Props>()

const tributeIcon = computed(() => {
  if (props.tribute.type === 'gift') return '🎁'
  if (props.tribute.type === 'memorial') return '🕊️'
  return '💝'
})

const tributeTitle = computed(() => {
  if (props.tribute.type === 'gift') return 'Gift'
  if (props.tribute.type === 'memorial') return 'In Memory'
  return 'Tribute'
})

const honoreeName = computed(() => {
  const honoree = props.tribute.honoree
  if (!honoree) return ''
  return [honoree.firstName, honoree.lastName].filter(Boolean).join(' ')
})

const relationshipLabel = computed(() => {
  const relationship = props.tribute.honoree?.relationship
  if (!relationship) return ''
  return relationship.charAt(0).toUpperCase() + relationship.slice(1)
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
      {{ tributeIcon }} {{ tributeTitle }} to {{ honoreeName
      }}<span v-if="relationshipLabel"> ({{ relationshipLabel }})</span>
    </p>
    <p v-if="eCardRecipient" class="text-xs text-muted-foreground mt-0.5 truncate">
      📧 eCard to {{ eCardRecipient.name || eCardRecipient.email }}
    </p>
  </div>
</template>
