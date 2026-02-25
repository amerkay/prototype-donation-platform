<script setup lang="ts">
import type { GiftAidDeclaration } from '~/features/donor-portal/types'
import { formatDate } from '~/lib/formatDate'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Badge } from '@/components/ui/badge'
import { ICON_SECTION_GIFT_AID, ICON_CHEVRON_RIGHT } from '~/lib/icons'

const props = defineProps<{
  declarations: GiftAidDeclaration[]
}>()

const sorted = computed(() =>
  [...props.declarations].sort(
    (a, b) => new Date(b.declaredAt).getTime() - new Date(a.declaredAt).getTime()
  )
)
const latest = computed(() => sorted.value[0] as GiftAidDeclaration | undefined)
const older = computed(() => sorted.value.slice(1))
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle class="text-base flex items-center gap-2">
        <ICON_SECTION_GIFT_AID class="h-4 w-4" />
        Gift Aid Declarations
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div v-if="!latest" class="text-sm text-muted-foreground">
        No Gift Aid declarations on file.
      </div>
      <div v-else class="text-sm">
        <div class="flex items-center justify-between gap-2">
          <span class="font-medium">Declaration</span>
          <Badge :variant="latest.isActive ? 'default' : 'secondary'">
            {{ latest.isActive ? 'Active' : 'Cancelled' }}
          </Badge>
        </div>
        <p class="text-xs text-muted-foreground mt-0.5">
          {{ formatDate(latest.declaredAt) }}
        </p>
        <p class="text-xs text-muted-foreground mt-1 border-t border-dashed pt-1">
          {{ latest.donorAddress.line1 }}, {{ latest.donorAddress.city }},
          {{ latest.donorAddress.postcode }}
        </p>
        <p v-if="latest.coversFrom" class="text-xs text-muted-foreground mt-0.5">
          Covers from {{ formatDate(latest.coversFrom) }}
        </p>

        <Collapsible v-if="older.length" class="mt-2">
          <CollapsibleTrigger
            class="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ICON_CHEVRON_RIGHT
              class="h-3 w-3 transition-transform group-data-[state=open]:rotate-90"
            />
            {{ older.length }} earlier {{ older.length === 1 ? 'declaration' : 'declarations' }}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div class="mt-1.5 ml-4 border-l pl-3 space-y-1.5">
              <div
                v-for="decl in older"
                :key="decl.id"
                class="flex items-center gap-2 text-xs text-muted-foreground"
              >
                <span>{{ formatDate(decl.declaredAt) }}</span>
                <Badge variant="outline" class="text-[10px] px-1.5 py-0">
                  {{ decl.isActive ? 'Active' : 'Cancelled' }}
                </Badge>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </CardContent>
  </Card>
</template>
