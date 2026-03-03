<script setup lang="ts">
import { useCampaignConfigStore } from '~/features/campaigns/shared/stores/campaignConfig'
import { useCampaignFormatters } from '~/features/campaigns/shared/composables/useCampaignFormatters'
import { getPeriodStatus } from '~/features/campaigns/features/matched-giving/shared/utils/matchPeriodUtils'
import { createMatchPeriodForm } from '~/features/campaigns/features/matched-giving/admin/forms/match-period-form'
import type {
  MatchPeriod,
  MatchPeriodStatus
} from '~/features/campaigns/features/matched-giving/shared/types'
import FormRenderer from '~/features/_library/form-builder/FormRenderer.vue'
import BaseDialogOrDrawer from '@/components/BaseDialogOrDrawer.vue'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import AdminDeleteDialog from '~/features/_admin/components/AdminDeleteDialog.vue'
import {
  ICON_CREATE,
  ICON_EDIT,
  ICON_DELETE,
  ICON_MONEY,
  ICON_TRENDING,
  ICON_TARGET
} from '~/lib/icons'

const store = useCampaignConfigStore()
const { formatAmount, formatDate, getInitials } = useCampaignFormatters()

// Dialog state
const showEditDialog = ref(false)
const editingPeriod = ref<MatchPeriod | null>(null)
const showDeleteConfirm = ref(false)
const deletingPeriodId = ref<string | null>(null)

// FormRenderer state for the dialog (TributeModal pattern)
const periodFormRef = ref<InstanceType<typeof FormRenderer> | null>(null)
const periodFormData = ref<Record<string, unknown>>({})
const periodFormKey = ref(0)

const periods = computed(() => store.matchedGiving.periods)
const currency = computed(() => store.currency)

// Form section — recreated when editing changes (to pass correct overlap exclusion)
const periodFormSection = computed(() =>
  createMatchPeriodForm(periods.value, editingPeriod.value?.id ?? null)
)

const isFormValid = computed(() => {
  if (!periodFormRef.value) return true
  return periodFormRef.value.isValid ?? false
})

// Stats
const totalCommitted = computed(() => periods.value.reduce((s, p) => s + p.poolAmount, 0))
const totalDrawn = computed(() => periods.value.reduce((s, p) => s + p.poolDrawn, 0))
const totalRemaining = computed(() => totalCommitted.value - totalDrawn.value)

function statusBadgeVariant(status: MatchPeriodStatus) {
  switch (status) {
    case 'active':
      return 'default'
    case 'scheduled':
      return 'secondary'
    case 'exhausted':
    case 'ended':
      return 'outline'
  }
}

function statusLabel(status: MatchPeriodStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

function canDelete(period: MatchPeriod) {
  return period.poolDrawn === 0
}

function openAddDialog() {
  editingPeriod.value = null
  periodFormData.value = { multiplier: 2 }
  periodFormKey.value++
  showEditDialog.value = true
}

function openEditDialog(period: MatchPeriod) {
  editingPeriod.value = period
  periodFormData.value = {
    name: period.name,
    multiplier: period.multiplier,
    poolAmount: period.poolAmount,
    startDate: period.startDate.slice(0, 10),
    endDate: period.endDate.slice(0, 10),
    matcherName: period.matcherName ?? '',
    matcherLogo: period.matcherLogo ?? '',
    displayMessage: period.displayMessage ?? ''
  }
  periodFormKey.value++
  showEditDialog.value = true
}

function handleSave() {
  if (isFormValid.value) {
    savePeriod()
    return
  }
  // Trigger validation to show errors
  periodFormRef.value?.onSubmit()
}

function savePeriod() {
  const d = periodFormData.value

  const periodData: MatchPeriod = {
    id: editingPeriod.value?.id ?? `mp-${Date.now()}`,
    name: (d.name as string) || '',
    multiplier: (d.multiplier as number) || 2,
    poolAmount: (d.poolAmount as number) || 0,
    poolDrawn: editingPeriod.value?.poolDrawn ?? 0,
    startDate: new Date(d.startDate as string).toISOString(),
    endDate: new Date(d.endDate as string).toISOString(),
    ...((d.matcherName as string)?.trim() ? { matcherName: (d.matcherName as string).trim() } : {}),
    ...((d.matcherLogo as string)?.trim() ? { matcherLogo: (d.matcherLogo as string).trim() } : {}),
    ...((d.displayMessage as string)?.trim()
      ? { displayMessage: (d.displayMessage as string).trim() }
      : {})
  }

  const existing = store.matchedGiving.periods
  if (editingPeriod.value) {
    const idx = existing.findIndex((p) => p.id === editingPeriod.value!.id)
    if (idx >= 0) existing.splice(idx, 1, periodData)
  } else {
    existing.push(periodData)
  }

  // Sort by startDate
  existing.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())

  store.markDirty()
  showEditDialog.value = false
}

function confirmDelete(periodId: string) {
  deletingPeriodId.value = periodId
  showDeleteConfirm.value = true
}

function deletePeriod() {
  if (!deletingPeriodId.value) return
  const idx = store.matchedGiving.periods.findIndex((p) => p.id === deletingPeriodId.value)
  if (idx >= 0) {
    store.matchedGiving.periods.splice(idx, 1)
    store.markDirty()
  }
  showDeleteConfirm.value = false
  deletingPeriodId.value = null
}
</script>

<template>
  <div>
    <!-- Stats Header -->
    <div v-if="periods.length > 0" class="grid grid-cols-3 gap-4 mb-4">
      <div class="flex items-center gap-2 p-3 rounded-lg border bg-background">
        <ICON_MONEY class="size-4 text-muted-foreground" />
        <div>
          <p class="text-lg font-semibold leading-none">
            {{ formatAmount(totalCommitted, currency, 0) }}
          </p>
          <p class="text-xs text-muted-foreground mt-0.5">Committed</p>
        </div>
      </div>
      <div class="flex items-center gap-2 p-3 rounded-lg border bg-background">
        <ICON_TRENDING class="size-4 text-muted-foreground" />
        <div>
          <p class="text-lg font-semibold leading-none">
            {{ formatAmount(totalDrawn, currency, 0) }}
          </p>
          <p class="text-xs text-muted-foreground mt-0.5">Drawn</p>
        </div>
      </div>
      <div class="flex items-center gap-2 p-3 rounded-lg border bg-background">
        <ICON_TARGET class="size-4 text-muted-foreground" />
        <div>
          <p class="text-lg font-semibold leading-none">
            {{ formatAmount(totalRemaining, currency, 0) }}
          </p>
          <p class="text-xs text-muted-foreground mt-0.5">Remaining</p>
        </div>
      </div>
    </div>

    <!-- Periods List -->
    <div v-if="periods.length > 0" class="space-y-3 mb-4">
      <div v-for="period in periods" :key="period.id" class="rounded-lg border bg-background p-4">
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-start gap-3 min-w-0">
            <Avatar v-if="period.matcherName" class="h-8 w-8 shrink-0 mt-0.5">
              <AvatarImage v-if="period.matcherLogo" :src="period.matcherLogo" />
              <AvatarFallback class="text-[10px] bg-primary/10 text-primary">
                {{ getInitials(period.matcherName || '?') }}
              </AvatarFallback>
            </Avatar>
            <div class="min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <p class="font-semibold text-sm truncate">{{ period.name }}</p>
                <Badge :variant="statusBadgeVariant(getPeriodStatus(period))">
                  {{ statusLabel(getPeriodStatus(period)) }}
                </Badge>
              </div>
              <p class="text-xs text-muted-foreground mt-0.5">
                {{ period.multiplier }}x
                <template v-if="period.matcherName"> · {{ period.matcherName }}</template>
              </p>
              <p class="text-xs text-muted-foreground">
                {{ formatDate(period.startDate) }} – {{ formatDate(period.endDate) }} ·
                {{ formatAmount(period.poolAmount - period.poolDrawn, currency, 0) }} of
                {{ formatAmount(period.poolAmount, currency, 0) }} remaining
              </p>
            </div>
          </div>
          <div class="flex items-center gap-1 shrink-0">
            <Button variant="ghost" size="icon" class="h-8 w-8" @click="openEditDialog(period)">
              <ICON_EDIT class="size-4" />
            </Button>
            <Button
              v-if="canDelete(period)"
              variant="ghost"
              size="icon"
              class="h-8 w-8 text-destructive hover:text-destructive"
              @click="confirmDelete(period.id)"
            >
              <ICON_DELETE class="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-10 border rounded-lg border-dashed mb-4">
      <ICON_MONEY class="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
      <p class="font-medium">No match periods</p>
      <p class="text-sm text-muted-foreground mt-1">
        Add a match period to start matched giving for this campaign
      </p>
    </div>

    <!-- Add Button -->
    <Button size="sm" @click="openAddDialog">
      <ICON_CREATE class="w-4 h-4 mr-2" />
      Add Match Period
    </Button>

    <!-- Add/Edit Period Dialog -->
    <BaseDialogOrDrawer
      v-model:open="showEditDialog"
      :description="editingPeriod ? 'Edit match period settings' : 'Configure a new match period'"
      size="md"
    >
      <template #header>{{ editingPeriod ? 'Edit Match Period' : 'Add Match Period' }}</template>

      <template #content>
        <FormRenderer
          :key="periodFormKey"
          ref="periodFormRef"
          v-model="periodFormData"
          :section="periodFormSection"
          :validate-on-mount="false"
          @submit="handleSave"
        />
      </template>

      <template #footer>
        <Button variant="outline" @click="showEditDialog = false">Cancel</Button>
        <Button
          :class="[!isFormValid && 'opacity-50 cursor-not-allowed pointer-events-auto']"
          @click="handleSave"
        >
          {{ editingPeriod ? 'Save Changes' : 'Add Period' }}
        </Button>
      </template>
    </BaseDialogOrDrawer>

    <!-- Delete Confirmation -->
    <AdminDeleteDialog
      :open="showDeleteConfirm"
      title="Delete Match Period"
      description="Are you sure you want to delete this match period? This action cannot be undone."
      @confirm="deletePeriod"
      @update:open="showDeleteConfirm = $event"
    />
  </div>
</template>
