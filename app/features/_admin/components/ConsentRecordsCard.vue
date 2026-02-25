<script setup lang="ts">
import type { ConsentRecord } from '~/features/donor-portal/types'
import { formatDate } from '~/lib/formatDate'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Badge } from '@/components/ui/badge'
import { ICON_SECTION_CONSENT, ICON_CHEVRON_RIGHT } from '~/lib/icons'

const props = defineProps<{
  records: ConsentRecord[]
}>()

const PURPOSE_LABELS: Record<string, string> = {
  marketing_email: 'Marketing Emails'
}

interface PurposeGroup {
  purpose: string
  latest: ConsentRecord
  older: ConsentRecord[]
}

/** Group by purpose, latest first within each group */
const groups = computed<PurposeGroup[]>(() => {
  const map = new Map<string, ConsentRecord[]>()
  for (const r of props.records) {
    const list = map.get(r.purpose)
    if (list) list.push(r)
    else map.set(r.purpose, [r])
  }
  const result: PurposeGroup[] = []
  for (const [purpose, list] of map) {
    list.sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())
    result.push({ purpose, latest: list[0]!, older: list.slice(1) })
  }
  return result
})
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle class="text-base flex items-center gap-2">
        <ICON_SECTION_CONSENT class="h-4 w-4" />
        Consent Records
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div v-if="records.length === 0" class="text-sm text-muted-foreground">
        No consent records on file.
      </div>
      <div v-else class="space-y-4">
        <div v-for="{ purpose, latest, older } in groups" :key="purpose" class="text-sm">
          <div class="flex items-center justify-between gap-2">
            <span class="font-medium">{{ PURPOSE_LABELS[purpose] ?? purpose }}</span>
            <Badge :variant="latest.granted ? 'default' : 'secondary'">
              {{ latest.granted ? 'Opted In' : 'Opted Out' }}
            </Badge>
          </div>
          <p class="text-xs text-muted-foreground mt-0.5">
            {{ formatDate(latest.recordedAt) }}
          </p>
          <p class="text-xs text-muted-foreground mt-1 border-t border-dashed pt-1">
            {{
              latest.wordingShown.length > 80
                ? latest.wordingShown.slice(0, 80) + '...'
                : latest.wordingShown
            }}
          </p>

          <Collapsible v-if="older.length > 0" class="mt-2">
            <CollapsibleTrigger
              class="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors group"
            >
              <ICON_CHEVRON_RIGHT
                class="h-3 w-3 transition-transform group-data-[state=open]:rotate-90"
              />
              {{ older.length }} earlier {{ older.length === 1 ? 'record' : 'records' }}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div class="mt-1.5 ml-4 border-l pl-3 space-y-1.5">
                <div
                  v-for="record in older"
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
