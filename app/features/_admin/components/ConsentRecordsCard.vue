<script setup lang="ts">
import type { ConsentRecord } from '~/features/donor-portal/types'
import { formatDate } from '~/lib/formatDate'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Badge } from '@/components/ui/badge'
import { ShieldCheck, ChevronRight } from 'lucide-vue-next'

const props = defineProps<{
  records: ConsentRecord[]
}>()

const PURPOSE_LABELS: Record<string, string> = {
  marketing_email: 'Marketing Emails'
}

/** Group by purpose, latest first within each group */
const byPurpose = computed(() => {
  const grouped: Record<string, ConsentRecord[]> = {}
  for (const r of props.records) {
    ;(grouped[r.purpose] ??= []).push(r)
  }
  for (const key in grouped) {
    grouped[key].sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())
  }
  return grouped
})
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle class="text-base flex items-center gap-2">
        <ShieldCheck class="h-4 w-4" />
        Consent Records
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div v-if="records.length === 0" class="text-sm text-muted-foreground">
        No consent records on file.
      </div>
      <div v-else class="space-y-4">
        <div v-for="(group, purpose) in byPurpose" :key="purpose" class="text-sm">
          <div class="flex items-center justify-between gap-2">
            <span class="font-medium">{{ PURPOSE_LABELS[purpose] ?? purpose }}</span>
            <Badge :variant="group[0].granted ? 'default' : 'secondary'">
              {{ group[0].granted ? 'Opted In' : 'Opted Out' }}
            </Badge>
          </div>
          <p class="text-xs text-muted-foreground mt-0.5">
            {{ formatDate(group[0].recordedAt) }}
          </p>
          <p class="text-xs text-muted-foreground mt-1 border-t border-dashed pt-1">
            {{
              group[0].wordingShown.length > 80
                ? group[0].wordingShown.slice(0, 80) + '...'
                : group[0].wordingShown
            }}
          </p>

          <Collapsible v-if="group.length > 1" class="mt-2">
            <CollapsibleTrigger
              class="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors group"
            >
              <ChevronRight class="h-3 w-3 transition-transform group-data-[state=open]:rotate-90" />
              {{ group.length - 1 }} earlier {{ group.length - 1 === 1 ? 'record' : 'records' }}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div class="mt-1.5 ml-4 border-l pl-3 space-y-1.5">
                <div
                  v-for="record in group.slice(1)"
                  :key="record.id"
                  class="flex items-center gap-2 text-xs text-muted-foreground"
                >
                  <span>{{ formatDate(record.recordedAt) }}</span>
                  <Badge variant="outline" class="text-[10px] px-1.5 py-0">
                    {{ record.granted ? 'Opted In' : 'Opted Out' }}
                  </Badge>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
