<script setup lang="ts">
import ShareContent from './ShareContent.vue'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Share2 } from 'lucide-vue-next'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()
</script>

<template>
  <Dialog :open="props.open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <Share2 class="w-5 h-5" />
          Share this campaign
        </DialogTitle>
        <DialogDescription>
          Help spread the word by sharing with friends and family
        </DialogDescription>
      </DialogHeader>

      <div class="py-4">
        <ShareContent />
      </div>
    </DialogContent>
  </Dialog>
</template>
