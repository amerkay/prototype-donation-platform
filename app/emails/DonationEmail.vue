<script setup lang="ts">
import { computed } from 'vue'
import { sanitizeRichText } from '~/features/_library/form-builder/utils/sanitize-html'

interface Props {
  bodyHtml: string
  imageUrl?: string
  signatureText?: string
  preview?: boolean
  withFieldTargets?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  preview: false,
  withFieldTargets: false
})

const sanitizedBodyHtml = computed(() => sanitizeRichText(props.bodyHtml, { profile: 'email' }))
const fieldTarget = (path: string): string | undefined =>
  props.withFieldTargets ? path : undefined
</script>

<template>
  <EHtml lang="en">
    <EHead v-if="!props.preview">
      <EStyle>
        p { margin: 0 0 12px 0; } p:last-child { margin-bottom: 0; } img[alt='Email hero'] { width:
        100% !important; max-width: 600px !important; height: auto !important; border-radius: 8px
        !important; margin-bottom: 16px !important; }
      </EStyle>
    </EHead>
    <EBody style="background-color: #ffffff; font-family: sans-serif; margin: 0; padding: 0">
      <EContainer>
        <!-- Hero image -->
        <ESection v-if="imageUrl" :data-field="fieldTarget('email.imageUrl')">
          <img
            v-if="props.preview"
            :src="imageUrl"
            alt="Email hero"
            width="600"
            style="width: 100%; border-radius: 8px; display: block; margin-bottom: 16px"
          />
          <EImg v-else :src="imageUrl" alt="Email hero" :width="600" />
        </ESection>

        <!-- Body content -->
        <ESection :data-field="fieldTarget('email.bodyHtml')">
          <!-- eslint-disable-next-line vue/no-v-html -- sanitized -->
          <div v-html="sanitizedBodyHtml" />
        </ESection>

        <!-- Signature -->
        <ESection v-if="signatureText" :data-field="fieldTarget('email.signatureNotice')">
          <p style="margin-top: 16px; color: #6b7280; white-space: pre-line">
            {{ signatureText }}
          </p>
        </ESection>
      </EContainer>
    </EBody>
  </EHtml>
</template>
