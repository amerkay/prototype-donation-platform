<script setup lang="ts">
import { ref } from 'vue'
import DonationEmail from '~/emails/DonationEmail.vue'
import { useEmailRenderPayload } from '~/features/templates/admin/composables/useEmailRenderPayload'
import { usePreviewEditable } from '~/features/templates/admin/composables/usePreviewEditable'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail, Pencil } from 'lucide-vue-next'

const { payload, resolvedSubject, fromName, fromEmail } = useEmailRenderPayload()
const previewRef = ref<HTMLElement | null>(null)
const editable = ref(true)
const { hoveredField, editButtonStyle, hoverOutlineStyle, navigateToField } = usePreviewEditable(
  previewRef,
  editable
)
</script>

<template>
  <Card ref="previewRef" class="relative overflow-hidden pt-0 editable">
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

    <Transition name="fade">
      <div
        v-if="hoveredField"
        class="border-2 border-dashed border-gray-500 rounded pointer-events-none"
        :style="hoverOutlineStyle"
      />
    </Transition>

    <Transition name="fade">
      <Button
        v-if="hoveredField"
        variant="secondary"
        size="icon"
        class="h-6 w-6 rounded-full shadow-md pointer-events-auto"
        :style="editButtonStyle"
        @click.stop="navigateToField()"
      >
        <Pencil class="h-3 w-3" />
      </Button>
    </Transition>
  </Card>
</template>

<style scoped>
.editable :deep([data-field]) {
  cursor: pointer;
}

/* Restore paragraph spacing inside the email preview */
.email-preview-body :deep(p) {
  margin: 0 0 12px 0;
}
.email-preview-body :deep(p:last-child) {
  margin-bottom: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
