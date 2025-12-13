<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '@/components/ui/button'
import type { TributeData } from '@/lib/common/types'

interface Props {
  tribute: TributeData
}

const props = defineProps<Props>()

const emit = defineEmits<{
  edit: []
  remove: []
}>()

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
  <div
    class="rounded-lg border bg-card p-3 transition-all cursor-pointer hover:bg-accent"
    @click="emit('edit')"
  >
    <div class="flex items-center gap-3">
      <div class="text-2xl">{{ tributeIcon }}</div>
      <div class="flex-1 min-w-0">
        <p class="font-medium text-sm">{{ tributeTitle }}</p>
        <div class="flex items-center gap-2">
          <p class="text-xs text-muted-foreground truncate">
            {{ honoreeName }}
            <span v-if="relationshipLabel"> ({{ relationshipLabel }})</span>
          </p>
          <button class="text-xs text-primary hover:underline pointer-events-none" @click.stop>
            Edit
          </button>
        </div>
        <p v-if="eCardRecipient" class="text-xs text-muted-foreground mt-1 truncate">
          📧 eCard to {{ eCardRecipient.name || eCardRecipient.email }}
        </p>
      </div>
      <Button variant="ghost" size="sm" @click.stop="emit('remove')"> ✕ </Button>
    </div>
  </div>
</template>
