<script setup lang="ts">
import AdminBreadcrumbBar from '~/features/_admin/components/AdminBreadcrumbBar.vue'
import BaseDialogOrDrawer from '~/components/BaseDialogOrDrawer.vue'
import FormRenderer from '~/features/_library/form-builder/FormRenderer.vue'
import { useTeamSettingsStore } from '~/features/settings/admin/stores/teamSettings'
import { useTeamInviteForm } from '~/features/settings/admin/forms/team-invite-form'
import type { TeamMember } from '~/features/settings/admin/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import AdminDeleteDialog from '~/features/_admin/components/AdminDeleteDialog.vue'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Plus, MoreHorizontal, Shield, Code, User, Crown } from 'lucide-vue-next'

import { formatDate } from '~/lib/formatDate'

definePageMeta({ layout: 'admin' })

const store = useTeamSettingsStore()
const inviteForm = useTeamInviteForm

const breadcrumbs = [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Settings', href: '#' },
  { label: 'Team' }
]

const roleIcons: Record<string, typeof Crown> = {
  owner: Crown,
  admin: Shield,
  developer: Code,
  member: User
}

const roleBadgeVariant = (role: string) => {
  if (role === 'owner') return 'default'
  if (role === 'admin') return 'secondary'
  if (role === 'developer') return 'secondary'
  return 'outline'
}

// Invite dialog
const showInviteDialog = ref(false)
const inviteFormRef = ref()
const inviteData = ref({ name: '', email: '', role: 'member' as TeamMember['role'] })

function openInvite() {
  inviteData.value = { name: '', email: '', role: 'member' }
  showInviteDialog.value = true
}

function handleInvite() {
  store.addMember(inviteData.value)
  showInviteDialog.value = false
}

// Remove dialog
const memberToRemove = ref<TeamMember | null>(null)

function confirmRemove() {
  if (memberToRemove.value) {
    store.removeMember(memberToRemove.value.id)
    memberToRemove.value = null
  }
}
</script>

<template>
  <div>
    <AdminBreadcrumbBar :items="breadcrumbs" />

    <div class="flex flex-1 flex-col px-4 pt-0 pb-4 space-y-6">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-3xl font-bold">Team</h1>
          <p class="text-sm text-muted-foreground mt-1">
            {{ store.members.length }} members &middot; {{ store.activeMembers.length }} active
          </p>
        </div>
        <Button size="sm" @click="openInvite">
          <Plus class="w-4 h-4 mr-2" />
          Invite Member
        </Button>
      </div>

      <div class="space-y-3">
        <Card v-for="member in store.members" :key="member.id" class="py-4">
          <CardContent class="flex items-center justify-between">
            <div class="flex items-center gap-3 min-w-0">
              <div
                class="flex items-center justify-center w-10 h-10 rounded-full bg-muted text-sm font-medium"
              >
                {{
                  member.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                }}
              </div>
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-medium truncate">{{ member.name }}</span>
                  <Badge :variant="roleBadgeVariant(member.role)" class="text-xs capitalize">
                    <component :is="roleIcons[member.role]" class="w-3 h-3 mr-0.5" />
                    {{ member.role }}
                  </Badge>
                  <Badge v-if="member.status === 'invited'" variant="outline" class="text-xs">
                    Pending
                  </Badge>
                </div>
                <p class="text-xs text-muted-foreground truncate">
                  {{ member.email }} &middot; Last active {{ formatDate(member.lastActiveAt) }}
                </p>
              </div>
            </div>

            <DropdownMenu v-if="member.role !== 'owner'">
              <DropdownMenuTrigger as-child>
                <Button variant="ghost" size="icon" class="h-8 w-8">
                  <MoreHorizontal class="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem @click="store.updateMember(member.id, { role: 'admin' })">
                  Make Admin
                </DropdownMenuItem>
                <DropdownMenuItem @click="store.updateMember(member.id, { role: 'developer' })">
                  Make Developer
                </DropdownMenuItem>
                <DropdownMenuItem @click="store.updateMember(member.id, { role: 'member' })">
                  Make Member
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  class="text-destructive focus:text-destructive"
                  @click="memberToRemove = member"
                >
                  Remove
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- Invite Dialog -->
    <BaseDialogOrDrawer
      :open="showInviteDialog"
      description="Send an invitation to join your organization."
      @update:open="showInviteDialog = $event"
    >
      <template #header>Invite Team Member</template>
      <template #content>
        <FormRenderer
          ref="inviteFormRef"
          v-model="inviteData"
          :section="inviteForm"
          validate-on-mount
        />
      </template>
      <template #footer>
        <Button variant="outline" @click="showInviteDialog = false">Cancel</Button>
        <Button :disabled="!inviteFormRef?.isValid" @click="handleInvite"> Send Invite </Button>
      </template>
    </BaseDialogOrDrawer>

    <!-- Remove Dialog -->
    <AdminDeleteDialog
      :open="!!memberToRemove"
      title="Remove Team Member"
      :description="`Are you sure you want to remove ${memberToRemove?.name}? They will lose access immediately.`"
      confirm-label="Remove"
      @update:open="(v) => !v && (memberToRemove = null)"
      @confirm="confirmRemove"
    />
  </div>
</template>
