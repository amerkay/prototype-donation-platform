<script setup lang="ts">
import { ICON_SECTION_CUSTOM_FIELDS } from '~/lib/icons'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import AdminDetailRow from '~/features/_admin/components/AdminDetailRow.vue'

const props = defineProps<{
  customFields: Record<string, string>
}>()

const entries = computed(() => Object.entries(props.customFields))

function formatLabel(key: string): string {
  return key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}
</script>

<template>
  <Card v-if="entries.length > 0">
    <CardHeader>
      <CardTitle class="text-base flex items-center gap-2">
        <ICON_SECTION_CUSTOM_FIELDS class="h-4 w-4" />
        Custom Fields
      </CardTitle>
    </CardHeader>
    <CardContent class="space-y-2 text-sm">
      <AdminDetailRow
        v-for="[key, value] in entries"
        :key="key"
        :label="formatLabel(key)"
        :value="value"
      />
    </CardContent>
  </Card>
</template>
