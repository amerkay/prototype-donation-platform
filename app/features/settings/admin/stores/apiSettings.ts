import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ApiSettings } from '~/features/settings/admin/types'
import { apiSettings as defaults } from '~/sample-api-responses/api-sample-response-settings'
import { toast } from 'vue-sonner'

export const useApiSettingsStore = defineStore('apiSettings', () => {
  const apiKeys = ref([...defaults.apiKeys])
  const webhooks = ref([...defaults.webhooks])

  let hydrated = false
  function $hydrate() {
    if (hydrated) return
    try {
      // TODO-SUPABASE: Replace with supabase.from('org_integrations').select('api_keys, webhooks').eq('org_id', orgId).single()
      const saved = sessionStorage.getItem('settings-api')
      if (saved) {
        const data = JSON.parse(saved) as ApiSettings
        apiKeys.value = data.apiKeys
        webhooks.value = data.webhooks
      }
    } catch {
      /* ignore */
    }
    hydrated = true
  }

  function $persist() {
    if (!import.meta.client) return
    try {
      // TODO-SUPABASE: Replace with supabase.from('org_integrations').upsert({ org_id: orgId, api_keys, webhooks })
      sessionStorage.setItem(
        'settings-api',
        JSON.stringify({
          apiKeys: apiKeys.value,
          webhooks: webhooks.value
        })
      )
    } catch {
      /* ignore */
    }
  }

  function createApiKey(name: string) {
    // TODO-SUPABASE: Replace array mutation with supabase.from('org_integrations').update({ api_keys: [...existing, newKey] })
    const id = `key-${Date.now()}`
    const prefix = `dp_test_${Math.random().toString(36).slice(2, 8)}...`
    apiKeys.value.push({
      id,
      name,
      prefix,
      createdAt: new Date().toISOString(),
      lastUsedAt: ''
    })
    $persist()
    toast.success('API key created')
  }

  function deleteApiKey(id: string) {
    // TODO-SUPABASE: Replace array filter with supabase.from('org_integrations').update({ api_keys: filtered })
    apiKeys.value = apiKeys.value.filter((k) => k.id !== id)
    $persist()
    toast.success('API key deleted')
  }

  function addWebhook(data: { url: string; events: string[] }) {
    // TODO-SUPABASE: Replace array mutation with supabase.from('org_integrations').update({ webhooks: [...existing, newWebhook] })
    const id = `wh-${Date.now()}`
    webhooks.value.push({
      id,
      url: data.url,
      events: data.events,
      enabled: true,
      createdAt: new Date().toISOString()
    })
    $persist()
    toast.success('Webhook added')
  }

  function toggleWebhook(id: string) {
    // TODO-SUPABASE: Replace mutation with supabase.from('org_integrations').update({ webhooks: updated })
    const wh = webhooks.value.find((w) => w.id === id)
    if (wh) {
      wh.enabled = !wh.enabled
      $persist()
    }
  }

  function deleteWebhook(id: string) {
    // TODO-SUPABASE: Replace array filter with supabase.from('org_integrations').update({ webhooks: filtered })
    webhooks.value = webhooks.value.filter((w) => w.id !== id)
    $persist()
    toast.success('Webhook deleted')
  }

  if (import.meta.client) $hydrate()

  return {
    apiKeys,
    webhooks,
    createApiKey,
    deleteApiKey,
    addWebhook,
    toggleWebhook,
    deleteWebhook
  }
})
