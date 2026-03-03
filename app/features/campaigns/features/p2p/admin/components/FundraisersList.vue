<script setup lang="ts">
import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { useCampaignConfigStore } from '~/features/campaigns/shared/stores/campaignConfig'
import { useCampaignFormatters } from '~/features/campaigns/shared/composables/useCampaignFormatters'
import { useFundraisers } from '~/features/campaigns/features/p2p/admin/composables/useFundraisers'
import { useClipboard } from '@vueuse/core'
import type { CampaignFundraiser } from '~/features/campaigns/shared/types'
import DataTable from '~/features/_shared/components/DataTable.vue'
import {
  embeddedFundraiserColumns,
  type FundraiserMatchContext
} from '~/features/campaigns/features/p2p/admin/columns/fundraiserColumns'
import BaseDialogOrDrawer from '@/components/BaseDialogOrDrawer.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  ICON_USER_PLUS,
  ICON_EMAIL,
  ICON_COPY,
  ICON_DONORS,
  ICON_CONFIRM,
  ICON_MORE_ACTIONS,
  ICON_VIEW,
  ICON_COMPLETE,
  ICON_TERMINAL_STOP,
  ICON_REFUND,
  ICON_TRENDING,
  ICON_TARGET
} from '~/lib/icons'

const store = useCampaignConfigStore()
const { formatAmount } = useCampaignFormatters()
const { completeFundraiser, endFundraiser, reactivateFundraiser } = useFundraisers()

// Invite sheet state
const showInviteSheet = ref(false)
const inviteEmails = ref('')
const inviteSent = ref(false)
const inviteMessage = ref(store.peerToPeer?.customMessage || '')

// Copy invite link
const inviteLink = computed(() => `https://donate.example.com/join/${store.id}`)
const { copy, copied } = useClipboard({ source: inviteLink })

// Stats
const totalFundraiserRaised = computed(() =>
  store.fundraisers.reduce((sum, f) => sum + f.raisedAmount, 0)
)

const activeFundraisers = computed(() => store.fundraisers.filter((f) => f.status === 'active'))

const averageRaised = computed(() => {
  if (store.fundraisers.length === 0) return 0
  return totalFundraiserRaised.value / store.fundraisers.length
})

// Action column with dropdown
function createActionColumn(): ColumnDef<CampaignFundraiser> {
  return {
    id: 'actions',
    header: '',
    cell: ({ row }) => {
      const f = row.original
      const items: ReturnType<typeof h>[] = []

      // View detail link
      items.push(
        h(DropdownMenuItem, { onClick: () => navigateTo(`/admin/p2p/fundraisers/${f.id}`) }, () => [
          h(ICON_VIEW, { class: 'size-4 mr-2' }),
          'View'
        ])
      )

      // Reactivate (completed/ended only)
      if (f.status !== 'active') {
        items.push(
          h(DropdownMenuItem, { onClick: () => reactivateFundraiser(f.id) }, () => [
            h(ICON_REFUND, { class: 'size-4 mr-2' }),
            'Reactivate'
          ])
        )
      }

      // Complete / End (active only)
      if (f.status === 'active') {
        items.push(
          h(DropdownMenuItem, { onClick: () => completeFundraiser(f.id) }, () => [
            h(ICON_COMPLETE, { class: 'size-4 mr-2' }),
            'Complete'
          ])
        )
        items.push(
          h(
            DropdownMenuItem,
            {
              class: 'text-destructive focus:text-destructive',
              onClick: () => endFundraiser(f.id)
            },
            () => [h(ICON_TERMINAL_STOP, { class: 'size-4 mr-2' }), 'End']
          )
        )
      }

      return h('div', { class: 'flex justify-end' }, [
        h(DropdownMenu, {}, () => [
          h(DropdownMenuTrigger, { asChild: true }, () =>
            h(Button, { variant: 'outline', size: 'icon', class: 'h-8 w-8' }, () =>
              h(ICON_MORE_ACTIONS, { class: 'size-4' })
            )
          ),
          h(DropdownMenuContent, { align: 'end' }, () => items)
        ])
      ])
    }
  }
}

const getMatchContext = (): FundraiserMatchContext | null => {
  if (!store.matchedGiving?.periods?.length) return null
  const totalMatched = store.matchedGiving.periods.reduce((sum, p) => sum + p.poolDrawn, 0)
  return { matchedGiving: store.matchedGiving, totalMatched }
}

const columns = computed(() => [
  ...embeddedFundraiserColumns(() => getMatchContext()),
  createActionColumn()
])

// Send invite (mock)
const sendInvites = async () => {
  if (store.peerToPeer) {
    store.peerToPeer.customMessage = inviteMessage.value
  }
  await new Promise((resolve) => setTimeout(resolve, 500))
  inviteSent.value = true
  setTimeout(() => {
    inviteSent.value = false
    inviteEmails.value = ''
    showInviteSheet.value = false
  }, 2000)
}
</script>

<template>
  <div>
    <!-- Stats Header -->
    <div class="grid grid-cols-3 gap-4 mb-4">
      <div class="flex items-center gap-2 p-3 rounded-lg border bg-background">
        <ICON_DONORS class="size-4 text-muted-foreground" />
        <div>
          <p class="text-lg font-semibold leading-none">{{ activeFundraisers.length }}</p>
          <p class="text-xs text-muted-foreground mt-0.5">Active Fundraisers</p>
        </div>
      </div>
      <div class="flex items-center gap-2 p-3 rounded-lg border bg-background">
        <ICON_TRENDING class="size-4 text-muted-foreground" />
        <div>
          <p class="text-lg font-semibold leading-none">
            {{ formatAmount(totalFundraiserRaised, 'GBP') }}
          </p>
          <p class="text-xs text-muted-foreground mt-0.5">Total Raised</p>
        </div>
      </div>
      <div class="flex items-center gap-2 p-3 rounded-lg border bg-background">
        <ICON_TARGET class="size-4 text-muted-foreground" />
        <div>
          <p class="text-lg font-semibold leading-none">{{ formatAmount(averageRaised, 'GBP') }}</p>
          <p class="text-xs text-muted-foreground mt-0.5">Avg per Fundraiser</p>
        </div>
      </div>
    </div>

    <!-- DataTable -->
    <DataTable
      v-if="store.fundraisers.length > 0"
      :columns="columns"
      :data="store.fundraisers"
      :show-pagination="store.fundraisers.length > 10"
      @row-click="
        (row: { original: CampaignFundraiser }) =>
          navigateTo(`/admin/p2p/fundraisers/${row.original.id}`)
      "
    />

    <!-- Empty State -->
    <div v-else class="text-center py-10 border rounded-lg border-dashed">
      <ICON_DONORS class="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
      <p class="font-medium">No fundraisers yet</p>
      <p class="text-sm text-muted-foreground mt-1">
        Invite supporters to start their own fundraising pages
      </p>
      <Button class="mt-4" @click="showInviteSheet = true">
        <ICON_USER_PLUS class="w-4 h-4 mr-2" />
        Invite Fundraiser
      </Button>
    </div>

    <!-- Invite Button (when fundraisers exist) -->
    <div v-if="store.fundraisers.length > 0" class="flex justify-end mt-3">
      <Button size="sm" @click="showInviteSheet = true">
        <ICON_USER_PLUS class="w-4 h-4 mr-2" />
        Invite Fundraiser
      </Button>
    </div>

    <!-- Invite Dialog/Drawer -->
    <BaseDialogOrDrawer
      v-model:open="showInviteSheet"
      description="Send invitations to join your campaign as fundraisers"
      size="md"
    >
      <template #header>Invite Fundraisers</template>

      <template #content>
        <div class="space-y-6">
          <div class="space-y-2">
            <Label>Invite Message</Label>
            <p class="text-xs text-muted-foreground">
              Customize the message that will be shown to new fundraisers
            </p>
            <Textarea
              v-model="inviteMessage"
              placeholder="Join our community of fundraisers and help us make a difference!"
              :rows="3"
            />
          </div>

          <Separator />

          <div class="space-y-2">
            <Label>Email Addresses</Label>
            <p class="text-xs text-muted-foreground">
              Enter one or more email addresses, separated by commas
            </p>
            <Input
              v-model="inviteEmails"
              type="text"
              placeholder="email@example.com, another@example.com"
            />
            <Button
              class="w-full"
              :disabled="!inviteEmails.trim() || inviteSent"
              @click="sendInvites"
            >
              <ICON_CONFIRM v-if="inviteSent" class="w-4 h-4 mr-2" />
              <ICON_EMAIL v-else class="w-4 h-4 mr-2" />
              {{ inviteSent ? 'Invites Sent!' : 'Send Invites' }}
            </Button>
          </div>

          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div class="relative flex justify-center text-xs uppercase">
              <span class="bg-background px-2 text-muted-foreground">Or share link</span>
            </div>
          </div>

          <div class="space-y-2">
            <Label>Invite Link</Label>
            <div class="flex gap-2">
              <Input :model-value="inviteLink" readonly class="font-mono text-sm" />
              <Button variant="outline" @click="copy()">
                <ICON_CONFIRM v-if="copied" class="w-4 h-4" />
                <ICON_COPY v-else class="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </template>

      <template #footer>
        <Button variant="outline" class="w-full sm:w-auto" @click="showInviteSheet = false">
          Close
        </Button>
      </template>
    </BaseDialogOrDrawer>
  </div>
</template>
