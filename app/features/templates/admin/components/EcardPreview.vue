<script setup lang="ts">
import { useEcardTemplateStore } from '~/features/templates/admin/stores/ecardTemplate'
import { processTemplateRichText } from '~/features/templates/admin/utils/template-rich-text'
import { Card, CardContent } from '@/components/ui/card'
import { Mail } from 'lucide-vue-next'

const store = useEcardTemplateStore()

const SAMPLE_VARIABLES: Record<string, string> = {
  FIRST_NAME: 'Sarah',
  LAST_NAME: 'Johnson',
  DONOR_NAME: 'Sarah Johnson',
  AMOUNT: '$50.00',
  DATE: 'February 14, 2026',
  HONOREE_NAME: 'John Smith'
}

const previewSubject = computed(() => {
  let subject = store.subject || 'No subject'
  for (const [key, value] of Object.entries(SAMPLE_VARIABLES)) {
    subject = subject.replace(new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g'), value)
  }
  return subject
})

const previewBodyHtml = computed(() =>
  processTemplateRichText(store.bodyHtml || '', SAMPLE_VARIABLES)
)
</script>

<template>
  <Card class="overflow-hidden pt-0">
    <!-- Email envelope header -->
    <div class="flex items-center gap-2 px-4 py-2.5 bg-muted/50 border-b">
      <Mail class="w-4 h-4 text-muted-foreground shrink-0" />
      <p class="text-xs font-medium truncate">{{ previewSubject }}</p>
    </div>

    <!-- Hero image -->
    <img
      v-if="store.imageUrl"
      :src="store.imageUrl"
      alt="eCard preview"
      class="w-full h-40 object-cover"
    />
    <div
      v-else
      class="w-full h-40 bg-muted flex items-center justify-center text-muted-foreground text-sm"
    >
      No image selected
    </div>

    <!-- Body content -->
    <CardContent>
      <div
        v-if="previewBodyHtml"
        class="prose prose-sm max-w-none text-sm"
        v-html="previewBodyHtml"
      />
      <p v-else class="text-sm text-muted-foreground italic">No body content</p>
    </CardContent>
  </Card>
</template>
