<script setup lang="ts">
import type { EmailTemplate } from '~/features/templates/admin/types'
import {
  EMAIL_TEMPLATE_META,
  EMAIL_CATEGORY_LABELS
} from '~/features/templates/admin/email-templates'
import AdminEntityCard from '~/features/_admin/components/AdminEntityCard.vue'
import AdminEntityCardPlaceholder from '~/features/_admin/components/AdminEntityCardPlaceholder.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Pencil } from 'lucide-vue-next'

const props = defineProps<{
  template: EmailTemplate
}>()

const meta = computed(() => EMAIL_TEMPLATE_META[props.template.type])
const href = computed(() => `/admin/templates/emails/${props.template.id}`)
</script>

<template>
  <AdminEntityCard :title="template.name" :href="href" :updated-at="template.updatedAt">
    <template #image>
      <img
        v-if="meta.hasImage && template.imageUrl"
        :src="template.imageUrl"
        :alt="template.name"
        class="w-full h-full object-cover"
      />
      <AdminEntityCardPlaceholder v-else :label="meta.displayName" />
    </template>

    <template #badges>
      <Badge variant="outline" class="text-[10px] px-1.5 py-0">
        {{ EMAIL_CATEGORY_LABELS[meta.category] }}
      </Badge>
      <Badge variant="secondary" class="text-[10px] px-1.5 py-0">
        {{ meta.displayName }}
      </Badge>
    </template>

    <template #actions>
      <Button variant="default" size="sm" class="w-full" as-child>
        <NuxtLink :to="href">
          <Pencil class="w-3.5 h-3.5 mr-1.5" />
          Edit
        </NuxtLink>
      </Button>
    </template>
  </AdminEntityCard>
</template>
