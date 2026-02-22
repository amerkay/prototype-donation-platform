<script setup lang="ts">
import BaseDialogOrDrawer from '~/components/BaseDialogOrDrawer.vue'
import { Button } from '@/components/ui/button'
import { sanitizeRichText } from '~/features/_library/form-builder/utils/sanitize-html'

defineProps<{
  open: boolean
  richContent: string
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  accept: []
  decline: []
}>()
</script>

<template>
  <BaseDialogOrDrawer :open="open" @update:open="emit('update:open', $event)">
    <template #header>Terms & Conditions</template>

    <template #content>
      <!-- eslint-disable vue/no-v-html -- sanitized via sanitizeRichText() -->
      <div
        class="max-h-[60vh] overflow-y-auto rounded-md border bg-muted/30 p-4"
        v-html="sanitizeRichText(richContent)"
      />
      <!-- eslint-enable vue/no-v-html -->
    </template>

    <template #footer>
      <div class="flex gap-2 w-full">
        <Button variant="outline" class="flex-1" @click="emit('decline')"> Decline </Button>
        <Button class="flex-1" @click="emit('accept')"> Accept Terms </Button>
      </div>
    </template>
  </BaseDialogOrDrawer>
</template>
