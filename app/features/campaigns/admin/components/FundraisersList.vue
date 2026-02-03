<script setup lang="ts">
import { useCampaignConfigStore } from '~/features/campaigns/shared/stores/campaignConfig'
import { useCampaignFormatters } from '~/features/campaigns/shared/composables/useCampaignFormatters'
import { useClipboard } from '@vueuse/core'
import type { CampaignFundraiser } from '~/features/campaigns/shared/types'
import BaseDialogOrDrawer from '@/components/BaseDialogOrDrawer.vue'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  UserPlus,
  Mail,
  Copy,
  Users,
  Check,
  Search,
  MoreHorizontal,
  ExternalLink,
  Pause,
  Play,
  Trash2,
  TrendingUp,
  Target
} from 'lucide-vue-next'

const store = useCampaignConfigStore()
const { formatAmount, formatDate, getInitials } = useCampaignFormatters()

// Search and filter state
const searchQuery = ref('')
const statusFilter = ref<string>('all')

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

// Filtered and sorted fundraisers
const filteredFundraisers = computed(() => {
  let results = [...store.fundraisers]

  // Text search
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    results = results.filter(
      (f) => f.name.toLowerCase().includes(q) || f.email.toLowerCase().includes(q)
    )
  }

  // Status filter
  if (statusFilter.value !== 'all') {
    results = results.filter((f) => f.status === statusFilter.value)
  }

  // Sort by raised amount descending
  return results.sort((a, b) => b.raisedAmount - a.raisedAmount)
})

const getProgressPercentage = (fundraiser: CampaignFundraiser) => {
  if (!fundraiser.goal || fundraiser.goal === 0) return 0
  return Math.min((fundraiser.raisedAmount / fundraiser.goal) * 100, 100)
}

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive'> = {
  active: 'default',
  paused: 'secondary',
  removed: 'destructive'
}

// Actions (mock)
const handleViewPage = (fundraiser: CampaignFundraiser) => {
  window.open(`https://donate.example.com/fundraise/${fundraiser.slug}`, '_blank')
}

const handlePause = async (fundraiser: CampaignFundraiser) => {
  // TODO: API call
  const idx = store.fundraisers.findIndex((f) => f.id === fundraiser.id)
  if (idx !== -1) {
    store.fundraisers[idx] = {
      ...store.fundraisers[idx]!,
      status: fundraiser.status === 'paused' ? 'active' : 'paused'
    }
  }
}

const handleRemove = async (fundraiser: CampaignFundraiser) => {
  // TODO: API call
  const idx = store.fundraisers.findIndex((f) => f.id === fundraiser.id)
  if (idx !== -1) {
    store.fundraisers[idx] = { ...store.fundraisers[idx]!, status: 'removed' }
  }
}

// Send invite (mock)
const sendInvites = async () => {
  // Save custom message to store
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
        <Users class="size-4 text-muted-foreground" />
        <div>
          <p class="text-lg font-semibold leading-none">{{ activeFundraisers.length }}</p>
          <p class="text-xs text-muted-foreground mt-0.5">Active Fundraisers</p>
        </div>
      </div>
      <div class="flex items-center gap-2 p-3 rounded-lg border bg-background">
        <TrendingUp class="size-4 text-muted-foreground" />
        <div>
          <p class="text-lg font-semibold leading-none">
            {{ formatAmount(totalFundraiserRaised) }}
          </p>
          <p class="text-xs text-muted-foreground mt-0.5">Total Raised</p>
        </div>
      </div>
      <div class="flex items-center gap-2 p-3 rounded-lg border bg-background">
        <Target class="size-4 text-muted-foreground" />
        <div>
          <p class="text-lg font-semibold leading-none">{{ formatAmount(averageRaised) }}</p>
          <p class="text-xs text-muted-foreground mt-0.5">Avg per Fundraiser</p>
        </div>
      </div>
    </div>

    <!-- Search / Filter Bar -->
    <div class="flex items-center gap-2 mb-4">
      <div class="relative flex-1">
        <Search class="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input v-model="searchQuery" placeholder="Search by name or email..." class="pl-9 h-9" />
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="outline" size="sm" class="h-9">
            {{ statusFilter === 'all' ? 'All Statuses' : statusFilter }}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem @click="statusFilter = 'all'">All Statuses</DropdownMenuItem>
          <DropdownMenuItem @click="statusFilter = 'active'">Active</DropdownMenuItem>
          <DropdownMenuItem @click="statusFilter = 'paused'">Paused</DropdownMenuItem>
          <DropdownMenuItem @click="statusFilter = 'removed'">Removed</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    <!-- Table -->
    <Table v-if="filteredFundraisers.length > 0">
      <TableHeader>
        <TableRow>
          <TableHead>Fundraiser</TableHead>
          <TableHead>Goal & Progress</TableHead>
          <TableHead>Joined</TableHead>
          <TableHead>Status</TableHead>
          <TableHead class="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="fundraiser in filteredFundraisers" :key="fundraiser.id">
          <TableCell>
            <div class="flex items-center gap-3">
              <Avatar class="w-8 h-8">
                <AvatarFallback class="text-xs">
                  {{ getInitials(fundraiser.name) }}
                </AvatarFallback>
              </Avatar>
              <div>
                <p class="font-medium">{{ fundraiser.name }}</p>
                <p class="text-xs text-muted-foreground">{{ fundraiser.email }}</p>
              </div>
            </div>
          </TableCell>
          <TableCell>
            <div class="min-w-[140px]">
              <div class="flex items-baseline justify-between text-sm mb-1">
                <span class="font-medium">{{ formatAmount(fundraiser.raisedAmount) }}</span>
                <span v-if="fundraiser.goal" class="text-xs text-muted-foreground">
                  of {{ formatAmount(fundraiser.goal) }}
                </span>
              </div>
              <Progress
                v-if="fundraiser.goal"
                :model-value="getProgressPercentage(fundraiser)"
                class="h-1.5"
              />
              <p class="text-xs text-muted-foreground mt-0.5">
                {{ fundraiser.donationCount }} donation{{
                  fundraiser.donationCount !== 1 ? 's' : ''
                }}
              </p>
            </div>
          </TableCell>
          <TableCell class="text-muted-foreground text-sm">
            {{ formatDate(fundraiser.joinedAt) }}
          </TableCell>
          <TableCell>
            <Badge :variant="STATUS_VARIANTS[fundraiser.status]" class="capitalize">
              {{ fundraiser.status }}
            </Badge>
          </TableCell>
          <TableCell class="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button variant="outline" size="icon" class="h-8 w-8">
                  <MoreHorizontal class="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem @click="handleViewPage(fundraiser)">
                  <ExternalLink class="w-4 h-4 mr-2" />
                  View Page
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  v-if="fundraiser.status !== 'removed'"
                  @click="handlePause(fundraiser)"
                >
                  <component
                    :is="fundraiser.status === 'paused' ? Play : Pause"
                    class="w-4 h-4 mr-2"
                  />
                  {{ fundraiser.status === 'paused' ? 'Resume' : 'Pause' }}
                </DropdownMenuItem>
                <DropdownMenuItem
                  v-if="fundraiser.status !== 'removed'"
                  class="text-destructive focus:text-destructive"
                  @click="handleRemove(fundraiser)"
                >
                  <Trash2 class="w-4 h-4 mr-2" />
                  Remove
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>

    <!-- Empty State -->
    <div
      v-else-if="store.fundraisers.length === 0"
      class="text-center py-10 border rounded-lg border-dashed"
    >
      <Users class="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
      <p class="font-medium">No fundraisers yet</p>
      <p class="text-sm text-muted-foreground mt-1">
        Invite supporters to start their own fundraising pages
      </p>
      <Button class="mt-4" @click="showInviteSheet = true">
        <UserPlus class="w-4 h-4 mr-2" />
        Invite Fundraiser
      </Button>
    </div>

    <!-- No Results State -->
    <div v-else class="text-center py-8 border rounded-lg">
      <Search class="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
      <p class="text-sm text-muted-foreground">No fundraisers match your filters</p>
    </div>

    <!-- Invite Button (when fundraisers exist) -->
    <div v-if="store.fundraisers.length > 0" class="flex justify-end mt-3">
      <Button size="sm" @click="showInviteSheet = true">
        <UserPlus class="w-4 h-4 mr-2" />
        Invite Fundraiser
      </Button>
    </div>

    <!-- Invite Dialog/Drawer -->
    <BaseDialogOrDrawer
      v-model:open="showInviteSheet"
      description="Send invitations to join your campaign as fundraisers"
      max-width="sm:max-w-lg"
    >
      <template #header>Invite Fundraisers</template>

      <template #content>
        <div class="space-y-6">
          <!-- Custom Invite Message -->
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

          <!-- Email Invite -->
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
              <Check v-if="inviteSent" class="w-4 h-4 mr-2" />
              <Mail v-else class="w-4 h-4 mr-2" />
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

          <!-- Copy Link -->
          <div class="space-y-2">
            <Label>Invite Link</Label>
            <div class="flex gap-2">
              <Input :model-value="inviteLink" readonly class="font-mono text-sm" />
              <Button variant="outline" @click="copy()">
                <Check v-if="copied" class="w-4 h-4" />
                <Copy v-else class="w-4 h-4" />
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
