<script setup lang="ts">
import { toast } from 'vue-sonner'
import { useEmailTemplateStore } from '~/features/templates/admin/stores/emailTemplate'
import { useEmailRenderPayload } from '~/features/templates/admin/composables/useEmailRenderPayload'
import { EMAIL_TEMPLATE_META } from '~/features/templates/admin/email-templates'
import AdminResourceHeader from '~/features/_admin/components/AdminResourceHeader.vue'
import InlineEditableText from '~/features/_admin/components/InlineEditableText.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Send } from 'lucide-vue-next'

const store = useEmailTemplateStore()
const meta = computed(() => EMAIL_TEMPLATE_META[store.type])
const { payload } = useEmailRenderPayload()

const isSending = ref(false)

async function sendTestEmail() {
  isSending.value = true
  try {
    await $fetch('/api/send-email', {
      method: 'POST',
      body: {
        ...payload.value,
        to: payload.value.fromEmail
      }
    })
    toast.success('Test email sent', {
      description: `Sent to ${payload.value.fromEmail}`
    })
  } catch {
    toast.error('Failed to send test email', {
      description: 'Check that mailpit is running (docker compose up)'
    })
  } finally {
    isSending.value = false
  }
}

const emit = defineEmits<{
  'update:name': [value: string]
}>()
</script>

<template>
  <AdminResourceHeader :hide-right-on-mobile="false">
    <template #left>
      <InlineEditableText
        :model-value="store.name"
        display-class="text-lg font-bold"
        class="min-w-0"
        :max-length="75"
        @update:model-value="emit('update:name', $event)"
      />
      <Badge variant="outline">{{ meta.displayName }}</Badge>
    </template>

    <template #right>
      <Button variant="outline" size="sm" :disabled="isSending" @click="sendTestEmail">
        <Send class="w-3.5 h-3.5" />
        {{ isSending ? 'Sending…' : 'Send Test Email' }}
      </Button>
    </template>
  </AdminResourceHeader>
</template>
