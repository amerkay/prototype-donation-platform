<script setup lang="ts">
import AdminBreadcrumbBar from '~/features/_admin/components/AdminBreadcrumbBar.vue'
import BaseDialogOrDrawer from '~/components/BaseDialogOrDrawer.vue'
import FormRenderer from '~/features/_library/form-builder/FormRenderer.vue'
import { useApiSettingsStore } from '~/features/settings/admin/stores/apiSettings'
import { useApiKeyForm } from '~/features/settings/admin/forms/api-key-form'
import { useWebhookForm, WEBHOOK_EVENTS } from '~/features/settings/admin/forms/webhook-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import AdminDeleteDialog from '~/features/_admin/components/AdminDeleteDialog.vue'
import { Key, Webhook, Plus, Trash2, Copy } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

import { formatDate as _formatDate } from '~/lib/formatDate'

definePageMeta({ layout: 'admin' })

const store = useApiSettingsStore()
const apiKeyForm = useApiKeyForm
const webhookForm = useWebhookForm

const breadcrumbs = [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Settings', href: '#' },
  { label: 'API & Webhooks' }
]

const formatDate = (dateString: string): string => {
  if (!dateString) return 'Never'
  return _formatDate(dateString)
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text)
  toast.success('Copied to clipboard')
}

// Create API key dialog
const showCreateKeyDialog = ref(false)
const keyFormRef = ref()
const newKeyData = ref({ name: '' })

function openCreateKey() {
  newKeyData.value = { name: '' }
  showCreateKeyDialog.value = true
}

function handleCreateKey() {
  if (newKeyData.value.name.trim()) {
    store.createApiKey(newKeyData.value.name.trim())
    showCreateKeyDialog.value = false
  }
}

// Delete API key dialog
const keyToDelete = ref<string | null>(null)

function confirmDeleteKey() {
  if (keyToDelete.value) {
    store.deleteApiKey(keyToDelete.value)
    keyToDelete.value = null
  }
}

// Create webhook dialog
const showWebhookDialog = ref(false)
const webhookFormRef = ref()
const newWebhookData = ref({ url: '', events: '' })

function openAddWebhook() {
  newWebhookData.value = { url: '', events: '' }
  showWebhookDialog.value = true
}

function handleAddWebhook() {
  if (newWebhookData.value.url.trim()) {
    const events = newWebhookData.value.events
      ? newWebhookData.value.events.split(',').map((e) => e.trim())
      : WEBHOOK_EVENTS
    store.addWebhook({ url: newWebhookData.value.url.trim(), events })
    showWebhookDialog.value = false
  }
}

// Delete webhook dialog
const webhookToDelete = ref<string | null>(null)

function confirmDeleteWebhook() {
  if (webhookToDelete.value) {
    store.deleteWebhook(webhookToDelete.value)
    webhookToDelete.value = null
  }
}
</script>

<template>
  <div>
    <AdminBreadcrumbBar :items="breadcrumbs" />

    <div class="flex flex-1 flex-col px-4 pt-0 pb-4 space-y-6">
      <div>
        <h1 class="text-3xl font-bold">API & Webhooks</h1>
        <p class="text-sm text-muted-foreground mt-1">Manage API keys and webhook endpoints.</p>
      </div>

      <!-- API Keys -->
      <Card>
        <CardHeader>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <Key class="w-5 h-5 text-primary" />
              <CardTitle>API Keys</CardTitle>
            </div>
            <Button size="sm" @click="openCreateKey">
              <Plus class="w-4 h-4 mr-2" />
              Create Key
            </Button>
          </div>
          <CardDescription>
            Keys are used to authenticate API requests. Keep them secret.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            v-if="store.apiKeys.length === 0"
            class="text-sm text-muted-foreground py-4 text-center"
          >
            No API keys yet. Create one to get started.
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="key in store.apiKeys"
              :key="key.id"
              class="flex items-center justify-between rounded-lg border p-3"
            >
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-medium">{{ key.name }}</span>
                  <Badge variant="outline" class="text-xs font-mono">{{ key.prefix }}</Badge>
                </div>
                <p class="text-xs text-muted-foreground mt-0.5">
                  Created {{ formatDate(key.createdAt) }}
                  <template v-if="key.lastUsedAt">
                    &middot; Last used {{ formatDate(key.lastUsedAt) }}
                  </template>
                </p>
              </div>
              <div class="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  class="h-8 w-8"
                  @click="copyToClipboard(key.prefix)"
                >
                  <Copy class="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  class="h-8 w-8 text-destructive hover:text-destructive"
                  @click="keyToDelete = key.id"
                >
                  <Trash2 class="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Webhooks -->
      <Card>
        <CardHeader>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <Webhook class="w-5 h-5 text-primary" />
              <CardTitle>Webhooks</CardTitle>
            </div>
            <Button size="sm" @click="openAddWebhook">
              <Plus class="w-4 h-4 mr-2" />
              Add Endpoint
            </Button>
          </div>
          <CardDescription> Receive real-time notifications when events occur. </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            v-if="store.webhooks.length === 0"
            class="text-sm text-muted-foreground py-4 text-center"
          >
            No webhooks configured. Add an endpoint to start receiving events.
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="wh in store.webhooks"
              :key="wh.id"
              class="flex items-center justify-between rounded-lg border p-3"
            >
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-mono truncate">{{ wh.url }}</span>
                  <Badge :variant="wh.enabled ? 'default' : 'secondary'" class="text-xs shrink-0">
                    {{ wh.enabled ? 'Active' : 'Disabled' }}
                  </Badge>
                </div>
                <p class="text-xs text-muted-foreground mt-0.5">
                  {{ wh.events.length }} events &middot; Created {{ formatDate(wh.createdAt) }}
                </p>
              </div>
              <div class="flex items-center gap-2 ml-3">
                <Switch :checked="wh.enabled" @update:checked="store.toggleWebhook(wh.id)" />
                <Button
                  variant="ghost"
                  size="icon"
                  class="h-8 w-8 text-destructive hover:text-destructive"
                  @click="webhookToDelete = wh.id"
                >
                  <Trash2 class="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Create API Key Dialog -->
    <BaseDialogOrDrawer
      :open="showCreateKeyDialog"
      description="Give your key a descriptive name to identify its purpose."
      @update:open="showCreateKeyDialog = $event"
    >
      <template #header>Create API Key</template>
      <template #content>
        <FormRenderer
          ref="keyFormRef"
          v-model="newKeyData"
          :section="apiKeyForm"
          validate-on-mount
        />
      </template>
      <template #footer>
        <Button variant="outline" @click="showCreateKeyDialog = false">Cancel</Button>
        <Button :disabled="!keyFormRef?.isValid" @click="handleCreateKey">Create</Button>
      </template>
    </BaseDialogOrDrawer>

    <!-- Delete API Key Dialog -->
    <AdminDeleteDialog
      :open="!!keyToDelete"
      title="Delete API Key"
      description="This action cannot be undone. Any applications using this key will lose access."
      @update:open="(v) => !v && (keyToDelete = null)"
      @confirm="confirmDeleteKey"
    />

    <!-- Add Webhook Dialog -->
    <BaseDialogOrDrawer
      :open="showWebhookDialog"
      description="We'll send POST requests to this URL when events occur."
      @update:open="showWebhookDialog = $event"
    >
      <template #header>Add Webhook Endpoint</template>
      <template #content>
        <FormRenderer
          ref="webhookFormRef"
          v-model="newWebhookData"
          :section="webhookForm"
          validate-on-mount
        />
        <div class="flex flex-wrap gap-1 mt-3">
          <Badge
            v-for="event in WEBHOOK_EVENTS"
            :key="event"
            variant="outline"
            class="text-xs cursor-pointer"
            @click="
              newWebhookData.events = newWebhookData.events
                ? `${newWebhookData.events}, ${event}`
                : event
            "
          >
            {{ event }}
          </Badge>
        </div>
      </template>
      <template #footer>
        <Button variant="outline" @click="showWebhookDialog = false">Cancel</Button>
        <Button :disabled="!webhookFormRef?.isValid" @click="handleAddWebhook">
          Add Endpoint
        </Button>
      </template>
    </BaseDialogOrDrawer>

    <!-- Delete Webhook Dialog -->
    <AdminDeleteDialog
      :open="!!webhookToDelete"
      title="Delete Webhook"
      description="This endpoint will stop receiving events immediately."
      @update:open="(v) => !v && (webhookToDelete = null)"
      @confirm="confirmDeleteWebhook"
    />
  </div>
</template>
