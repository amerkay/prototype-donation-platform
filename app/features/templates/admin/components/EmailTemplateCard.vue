<script setup lang="ts">
import type { EmailTemplate } from '~/features/templates/admin/types'
import {
  EMAIL_TEMPLATE_META,
  EMAIL_CATEGORY_LABELS
} from '~/features/templates/admin/email-templates'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Pencil } from 'lucide-vue-next'
import { formatDistance } from 'date-fns'

const props = defineProps<{
  template: EmailTemplate
}>()

const meta = computed(() => EMAIL_TEMPLATE_META[props.template.type])
const formattedDate = computed(() =>
  formatDistance(new Date(props.template.updatedAt), new Date(), { addSuffix: true })
)
</script>

<template>
  <Card class="transition-all hover:shadow-md overflow-hidden pt-0">
    <NuxtLink :to="`/admin/templates/emails/${template.id}`" class="block">
      <img
        v-if="meta.hasImage && template.imageUrl"
        :src="template.imageUrl"
        :alt="template.name"
        class="w-full h-36 object-cover"
      />
      <div
        v-else
        class="w-full h-24 bg-muted flex items-center justify-center text-muted-foreground text-xs"
      >
        {{ meta.displayName }}
      </div>
    </NuxtLink>

    <CardHeader class="pb-2">
      <NuxtLink :to="`/admin/templates/emails/${template.id}`" class="hover:underline">
        <CardTitle class="text-base truncate">{{ template.name }}</CardTitle>
      </NuxtLink>
      <div class="flex items-center gap-1.5 flex-wrap">
        <Badge variant="outline" class="text-[10px] px-1.5 py-0">
          {{ EMAIL_CATEGORY_LABELS[meta.category] }}
        </Badge>
        <Badge variant="secondary" class="text-[10px] px-1.5 py-0">
          {{ meta.displayName }}
        </Badge>
        <p class="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar class="w-3 h-3" />
          Updated {{ formattedDate }}
        </p>
      </div>
    </CardHeader>

    <CardContent>
      <Button variant="default" size="sm" class="w-full" as-child>
        <NuxtLink :to="`/admin/templates/emails/${template.id}`">
          <Pencil class="w-3.5 h-3.5 mr-1.5" />
          Edit
        </NuxtLink>
      </Button>
    </CardContent>
  </Card>
</template>
