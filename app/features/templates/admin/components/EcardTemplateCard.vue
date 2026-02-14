<script setup lang="ts">
import type { ECardTemplate } from '~/features/templates/admin/types'
import { useEcardTemplates } from '~/features/templates/admin/composables/useEcardTemplates'
import InlineEditableText from '~/features/_admin/components/InlineEditableText.vue'
import AdminDeleteButton from '~/features/_admin/components/AdminDeleteButton.vue'
import StatusBadge from '~/components/StatusBadge.vue'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Copy, Pencil } from 'lucide-vue-next'
import { formatDistance } from 'date-fns'

const CATEGORY_LABELS: Record<string, string> = {
  'thank-you': 'Thank You',
  tribute: 'Tribute',
  celebration: 'Celebration',
  custom: 'Custom'
}

const props = defineProps<{
  template: ECardTemplate
}>()

defineEmits<{
  rename: [name: string]
  duplicate: []
  delete: []
}>()

const { getDeleteProtection } = useEcardTemplates()

const deleteProtection = computed(() => getDeleteProtection(props.template.id))
const formattedDate = computed(() =>
  formatDistance(new Date(props.template.updatedAt), new Date(), { addSuffix: true })
)
</script>

<template>
  <Card class="transition-all hover:shadow-md overflow-hidden pt-0">
    <NuxtLink :to="`/admin/templates/ecards/${template.id}`" class="block">
      <img :src="template.imageUrl" :alt="template.name" class="w-full h-36 object-cover" />
    </NuxtLink>

    <CardHeader class="pb-2">
      <InlineEditableText
        :model-value="template.name"
        display-class="text-base font-semibold"
        :max-length="75"
        @update:model-value="$emit('rename', $event)"
      />
      <div class="flex items-center gap-1.5 flex-wrap">
        <Badge variant="outline" class="text-[10px] px-1.5 py-0">
          {{ CATEGORY_LABELS[template.category] }}
        </Badge>
        <StatusBadge :status="template.status" class="text-[10px] px-1.5 py-0" />
        <p class="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar class="w-3 h-3" />
          Updated {{ formattedDate }}
        </p>
      </div>
    </CardHeader>

    <CardContent class="flex gap-2">
      <Button variant="default" size="sm" class="flex-1" as-child>
        <NuxtLink :to="`/admin/templates/ecards/${template.id}`">
          <Pencil class="w-3.5 h-3.5 mr-1.5" />
          Edit
        </NuxtLink>
      </Button>
      <Button variant="outline" size="sm" @click="$emit('duplicate')">
        <Copy class="w-3.5 h-3.5" />
      </Button>
      <AdminDeleteButton
        :entity-name="template.name"
        entity-type="eCard Template"
        :disabled="!deleteProtection.canDelete"
        :disabled-reason="deleteProtection.reason"
        @deleted="$emit('delete')"
      />
    </CardContent>
  </Card>
</template>
