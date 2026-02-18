<script setup lang="ts">
import DonationEmail from '~/emails/DonationEmail.vue'
import { useEmailRenderPayload } from '~/features/templates/admin/composables/useEmailRenderPayload'
import PreviewEditable from '~/features/_admin/components/PreviewEditable.vue'
import { Mail } from 'lucide-vue-next'

withDefaults(defineProps<{ editable?: boolean }>(), { editable: false })

const { payload, resolvedSubject, fromName, fromEmail } = useEmailRenderPayload()
</script>

<template>
  <PreviewEditable
    :enabled="editable"
    class="rounded-xl border bg-card text-card-foreground overflow-hidden pt-0"
  >
    <!-- Email header bar (UI chrome, not part of rendered email) -->
    <div class="px-4 py-3 bg-muted/50 border-b space-y-1">
      <div class="flex items-center gap-2">
        <Mail class="w-4 h-4 text-muted-foreground shrink-0" />
        <p data-field="email.subject" class="text-xs font-medium truncate">{{ resolvedSubject }}</p>
      </div>
      <p data-field="email.senderAddressNotice" class="text-[10px] text-muted-foreground pl-6">
        From: {{ fromName }} &lt;{{ fromEmail }}&gt;
      </p>
    </div>

    <!-- Live email preview (client-safe body renderer) -->
    <div class="email-preview-body px-4">
      <DonationEmail
        :body-html="payload.bodyHtml"
        :image-url="payload.imageUrl"
        :cards="payload.cards"
        :signature-text="payload.signatureText"
        preview
        with-field-targets
      />
    </div>
  </PreviewEditable>
</template>
