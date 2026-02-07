import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { TeamMember, TeamSettings } from '~/features/settings/admin/types'
import { teamSettings as defaults } from '~/sample-api-responses/api-sample-response-settings'
import { toast } from 'vue-sonner'

export const useTeamSettingsStore = defineStore('teamSettings', () => {
  const members = ref<TeamMember[]>([...defaults.members])

  let hydrated = false
  function $hydrate() {
    if (hydrated) return
    try {
      const saved = sessionStorage.getItem('settings-team')
      if (saved) {
        const data = JSON.parse(saved) as TeamSettings
        members.value = data.members
      }
    } catch {
      /* ignore */
    }
    hydrated = true
  }

  function $persist() {
    if (!import.meta.client) return
    try {
      sessionStorage.setItem('settings-team', JSON.stringify({ members: members.value }))
    } catch {
      /* ignore */
    }
  }

  const activeMembers = computed(() => members.value.filter((m) => m.status === 'active'))

  function addMember(data: { name: string; email: string; role: TeamMember['role'] }) {
    const id = `member-${Date.now()}`
    const now = new Date().toISOString()
    members.value.push({
      id,
      name: data.name,
      email: data.email,
      role: data.role,
      status: 'invited',
      joinedAt: now,
      lastActiveAt: now
    })
    $persist()
    toast.success('Team member invited')
  }

  function updateMember(id: string, updates: Partial<TeamMember>) {
    const index = members.value.findIndex((m) => m.id === id)
    if (index === -1) return
    members.value[index] = { ...members.value[index]!, ...updates }
    $persist()
  }

  function removeMember(id: string) {
    members.value = members.value.filter((m) => m.id !== id)
    $persist()
    toast.success('Team member removed')
  }

  if (import.meta.client) $hydrate()

  return { members, activeMembers, addMember, updateMember, removeMember }
})
