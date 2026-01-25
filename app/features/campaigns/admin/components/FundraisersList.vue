<script setup lang="ts">
import { useCampaignConfigStore } from '~/features/campaigns/shared/stores/campaignConfig'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { UserPlus, Mail, Copy, Users, User, Check } from 'lucide-vue-next'
import { useClipboard } from '@vueuse/core'

const store = useCampaignConfigStore()

// Invite dialog state
const showInviteDialog = ref(false)
const inviteEmail = ref('')
const inviteSent = ref(false)

// Copy invite link
const inviteLink = computed(() => `https://donate.example.com/join/${store.id}`)
const { copy, copied } = useClipboard({ source: inviteLink })

// Format helpers
const formatAmount = (amount: number) => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

const formatDate = (dateString: string) => {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(new Date(dateString))
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const getFundraiserTypeIcon = (type: string) => {
  return type === 'team' ? Users : User
}

// Send invite (mock)
const sendInvite = async () => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 500))
  inviteSent.value = true
  setTimeout(() => {
    inviteSent.value = false
    inviteEmail.value = ''
    showInviteDialog.value = false
  }, 2000)
}

// Stats
const totalFundraiserRaised = computed(() => {
  return store.fundraisers.reduce((sum, f) => sum + f.raisedAmount, 0)
})
</script>

<template>
  <div>
    <h3 class="text-sm mb-3 flex items-center gap-2">
      <Users class="size-4" />
      Active Fundraisers
    </h3>
    <p class="text-sm text-muted-foreground mb-4">
      {{ store.fundraisers.length }} fundraiser{{ store.fundraisers.length !== 1 ? 's' : '' }} have
      raised {{ formatAmount(totalFundraiserRaised) }}
    </p>

    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Fundraiser</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Joined</TableHead>
          <TableHead class="text-right">Raised</TableHead>
          <TableHead class="text-right">Donations</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="fundraiser in store.fundraisers" :key="fundraiser.id">
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
            <Badge variant="outline" class="capitalize">
              <component :is="getFundraiserTypeIcon(fundraiser.type)" class="w-3 h-3 mr-1" />
              {{ fundraiser.type }}
            </Badge>
          </TableCell>
          <TableCell class="text-muted-foreground">
            {{ formatDate(fundraiser.joinedAt) }}
          </TableCell>
          <TableCell class="text-right font-medium">
            {{ formatAmount(fundraiser.raisedAmount) }}
          </TableCell>
          <TableCell class="text-right text-muted-foreground">
            {{ fundraiser.donationCount }}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>

    <div v-if="store.fundraisers.length === 0" class="text-center py-8 border rounded-lg">
      <Users class="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
      <p class="text-muted-foreground">No fundraisers yet</p>
      <p class="text-sm text-muted-foreground">
        Invite supporters to start their own fundraising pages
      </p>
    </div>

    <Dialog v-model:open="showInviteDialog">
      <div :class="store.fundraisers.length === 0 ? '' : 'flex justify-end'">
        <DialogTrigger as-child>
          <Button
            :disabled="!store.peerToPeer?.enabled"
            :size="store.fundraisers.length === 0 ? 'default' : 'sm'"
            :class="store.fundraisers.length === 0 ? 'mt-4' : 'mt-2'"
          >
            <UserPlus class="w-4 h-4 mr-2" />
            Invite Fundraiser
          </Button>
        </DialogTrigger>
      </div>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite a Fundraiser</DialogTitle>
          <DialogDescription>
            Send an invitation to join your campaign as a fundraiser
          </DialogDescription>
        </DialogHeader>

        <div class="space-y-4 py-4">
          <!-- Email Invite -->
          <div class="space-y-2">
            <Label>Email Address</Label>
            <div class="flex gap-2">
              <Input v-model="inviteEmail" type="email" placeholder="fundraiser@example.com" />
              <Button :disabled="!inviteEmail || inviteSent" @click="sendInvite">
                <Check v-if="inviteSent" class="w-4 h-4 mr-2" />
                <Mail v-else class="w-4 h-4 mr-2" />
                {{ inviteSent ? 'Sent!' : 'Send' }}
              </Button>
            </div>
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

        <DialogFooter>
          <Button variant="outline" @click="showInviteDialog = false">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
