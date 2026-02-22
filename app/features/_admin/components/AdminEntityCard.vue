<script setup lang="ts">
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Calendar } from 'lucide-vue-next'
import { formatDistance } from 'date-fns'

const props = defineProps<{
  title: string
  href: string
  updatedAt: string
  description?: string
}>()

const slots = defineSlots<{
  image?: () => unknown
  badges?: () => unknown
  stats?: () => unknown
  actions?: () => unknown
}>()

const formattedDate = computed(() =>
  formatDistance(new Date(props.updatedAt), new Date(), { addSuffix: true })
)
</script>

<template>
  <Card class="transition-all hover:shadow-md h-full overflow-hidden pt-0">
    <NuxtLink :to="href" class="block">
      <div class="relative aspect-2/1 bg-muted overflow-hidden">
        <slot name="image" />
      </div>
    </NuxtLink>

    <CardHeader class="pb-2">
      <NuxtLink :to="href" class="hover:underline">
        <CardTitle class="text-base truncate">{{ title }}</CardTitle>
      </NuxtLink>
      <CardDescription v-if="description" class="text-xs mt-1">
        {{ description }}
      </CardDescription>
      <div class="flex items-center gap-1.5 flex-wrap mt-1">
        <slot name="badges" />
      </div>
      <p class="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
        <Calendar class="w-3 h-3" />
        Updated {{ formattedDate }}
      </p>
    </CardHeader>

    <CardContent v-if="slots.stats" class="space-y-4 pt-0">
      <slot name="stats" />
    </CardContent>

    <CardContent v-if="slots.actions">
      <slot name="actions" />
    </CardContent>
  </Card>
</template>
