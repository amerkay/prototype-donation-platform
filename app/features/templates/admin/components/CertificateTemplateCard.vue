<script setup lang="ts">
import type { CertificateTemplate } from '~/features/templates/admin/types'
import CertificatePreviewThumbnail from './CertificatePreviewThumbnail.vue'
import InlineEditableText from '~/features/_admin/components/InlineEditableText.vue'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Copy, Pencil, Trash2 } from 'lucide-vue-next'
import { formatDistance } from 'date-fns'

const props = defineProps<{
  template: CertificateTemplate
}>()

defineEmits<{
  rename: [name: string]
  duplicate: []
  delete: []
}>()

const formattedDate = computed(() =>
  formatDistance(new Date(props.template.updatedAt), new Date(), { addSuffix: true })
)
</script>

<template>
  <Card class="transition-all hover:shadow-md overflow-hidden pt-0">
    <NuxtLink :to="`/admin/templates/certificates/${template.id}`" class="block">
      <div class="bg-muted/30 border-b p-3">
        <CertificatePreviewThumbnail :template="template" />
      </div>
    </NuxtLink>

    <CardHeader class="pb-2">
      <InlineEditableText
        :model-value="template.name"
        display-class="text-base font-semibold"
        @update:model-value="$emit('rename', $event)"
      />
      <p class="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Calendar class="w-3 h-3" />
        Updated {{ formattedDate }}
      </p>
    </CardHeader>

    <CardContent class="flex gap-2">
      <Button variant="default" size="sm" class="flex-1" as-child>
        <NuxtLink :to="`/admin/templates/certificates/${template.id}`">
          <Pencil class="w-3.5 h-3.5 mr-1.5" />
          Edit
        </NuxtLink>
      </Button>
      <Button variant="outline" size="sm" @click="$emit('duplicate')">
        <Copy class="w-3.5 h-3.5" />
      </Button>
      <Button variant="outline" size="sm" @click="$emit('delete')">
        <Trash2 class="w-3.5 h-3.5 text-destructive" />
      </Button>
    </CardContent>
  </Card>
</template>
