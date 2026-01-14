<script setup lang="ts">
import { useCampaignConfigStore } from '~/stores/campaignConfig'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
import { UserPlus, Mail, Copy, Users, User, Check, Settings2 } from 'lucide-vue-next'
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

// Toggle P2P settings
const toggleP2P = (enabled: boolean) => {
  if (store.peerToPeer) {
    store.peerToPeer = { ...store.peerToPeer, enabled }
    store.markDirty()
  }
}

const toggleIndividuals = (enabled: boolean) => {
  if (store.peerToPeer) {
    store.peerToPeer = { ...store.peerToPeer, allowIndividuals: enabled }
    store.markDirty()
  }
}

const toggleTeams = (enabled: boolean) => {
  if (store.peerToPeer) {
    store.peerToPeer = { ...store.peerToPeer, allowTeams: enabled }
    store.markDirty()
  }
}

const updateDefaultGoal = (value: string | number) => {
  if (store.peerToPeer) {
    const amount = typeof value === 'string' ? parseInt(value) || undefined : value || undefined
    store.peerToPeer = { ...store.peerToPeer, fundraiserGoalDefault: amount }
    store.markDirty()
  }
}

const updateCustomMessage = (value: string | number) => {
  if (store.peerToPeer) {
    store.peerToPeer = { ...store.peerToPeer, customMessage: String(value) }
    store.markDirty()
  }
}

// Stats
const totalFundraiserRaised = computed(() => {
  return store.fundraisers.reduce((sum, f) => sum + f.raisedAmount, 0)
})
</script>

<template>
  <div class="space-y-6">
    <!-- P2P Settings Card -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <div>
            <CardTitle class="flex items-center gap-2">
              <Settings2 class="w-5 h-5" />
              Peer-to-Peer Settings
            </CardTitle>
            <CardDescription>
              Allow supporters to create their own fundraising pages for your campaign
            </CardDescription>
          </div>
          <Switch :checked="store.peerToPeer?.enabled" @update:checked="toggleP2P" />
        </div>
      </CardHeader>
      <CardContent v-if="store.peerToPeer?.enabled" class="space-y-4">
        <div class="grid gap-4 sm:grid-cols-2">
          <!-- Allow Individuals -->
          <div class="flex items-center justify-between p-3 rounded-lg border">
            <div class="flex items-center gap-3">
              <User class="w-5 h-5 text-muted-foreground" />
              <div>
                <Label>Individual Fundraisers</Label>
                <p class="text-xs text-muted-foreground">Allow individuals to fundraise</p>
              </div>
            </div>
            <Switch
              :checked="store.peerToPeer.allowIndividuals"
              @update:checked="toggleIndividuals"
            />
          </div>

          <!-- Allow Teams -->
          <div class="flex items-center justify-between p-3 rounded-lg border">
            <div class="flex items-center gap-3">
              <Users class="w-5 h-5 text-muted-foreground" />
              <div>
                <Label>Team Fundraisers</Label>
                <p class="text-xs text-muted-foreground">Allow teams to fundraise together</p>
              </div>
            </div>
            <Switch :checked="store.peerToPeer.allowTeams" @update:checked="toggleTeams" />
          </div>
        </div>

        <Separator />

        <div class="grid gap-4 sm:grid-cols-2">
          <!-- Default Goal -->
          <div class="space-y-2">
            <Label>Default Fundraiser Goal</Label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">£</span>
              <Input
                type="number"
                :model-value="store.peerToPeer.fundraiserGoalDefault"
                class="pl-7"
                placeholder="500"
                @update:model-value="updateDefaultGoal"
              />
            </div>
            <p class="text-xs text-muted-foreground">Suggested goal for new fundraisers</p>
          </div>

          <!-- Custom Message -->
          <div class="space-y-2">
            <Label>Invite Message</Label>
            <Textarea
              :model-value="store.peerToPeer.customMessage"
              placeholder="Join our community of fundraisers..."
              rows="2"
              @update:model-value="updateCustomMessage"
            />
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Fundraisers List -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <div>
            <CardTitle>Active Fundraisers</CardTitle>
            <CardDescription>
              {{ store.fundraisers.length }} fundraiser{{
                store.fundraisers.length !== 1 ? 's' : ''
              }}
              have raised {{ formatAmount(totalFundraiserRaised) }}
            </CardDescription>
          </div>
          <Dialog v-model:open="showInviteDialog">
            <DialogTrigger as-child>
              <Button :disabled="!store.peerToPeer?.enabled">
                <UserPlus class="w-4 h-4 mr-2" />
                Invite Fundraiser
              </Button>
            </DialogTrigger>
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
                    <Input
                      v-model="inviteEmail"
                      type="email"
                      placeholder="fundraiser@example.com"
                    />
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
      </CardHeader>
      <CardContent>
        <div v-if="store.fundraisers.length === 0" class="text-center py-8">
          <Users class="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
          <p class="text-muted-foreground">No fundraisers yet</p>
          <p class="text-sm text-muted-foreground">
            Invite supporters to start their own fundraising pages
          </p>
        </div>

        <Table v-else>
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
      </CardContent>
    </Card>
  </div>
</template>
