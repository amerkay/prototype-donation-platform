<script setup lang="ts">
import { computed } from 'vue'
import {
  EMAIL_CARD_COMPONENTS,
  splitBodyIntoCardSegments
} from '~/emails/components/cards/registry'
import type { EmailCardsPayload } from '~/emails/components/cards/types'
import { sanitizeRichText } from '~/features/_library/form-builder/utils/sanitize-html'

interface Props {
  bodyHtml: string
  imageUrl?: string
  cards?: EmailCardsPayload
  signatureText?: string
  preview?: boolean
  withFieldTargets?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  preview: false,
  withFieldTargets: false
})

const sanitizedBodyHtml = computed(() => sanitizeRichText(props.bodyHtml, { profile: 'email' }))
const bodySegments = computed(() => splitBodyIntoCardSegments(sanitizedBodyHtml.value, props.cards))
const signatureLines = computed(() =>
  props.signatureText ? props.signatureText.split(/\r?\n/) : []
)
const fieldTarget = (path: string): string | undefined =>
  props.withFieldTargets ? path : undefined

const EMAIL_SHARED_STYLES = `
.donation-email-body p {
  margin: 0 0 12px;
}

.donation-email-body .email-card-shell {
  border-color: #c7c7c7 !important;
}

@media (prefers-color-scheme: dark) {
  .donation-email-body .email-card-shell {
    border-color: #4a4a4a !important;
  }
}
`.trim()
</script>

<template>
  <EHtml lang="en">
    <EHead v-if="!props.preview">
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <EStyle>{{ EMAIL_SHARED_STYLES }}</EStyle>
    </EHead>
    <EBody class="donation-email-body" :style="{ fontFamily: 'sans-serif', padding: '8px' }">
      <component :is="'style'" v-if="props.preview">{{ EMAIL_SHARED_STYLES }}</component>
      <EContainer>
        <ESection v-if="imageUrl" :data-field="fieldTarget('email.imageUrl')">
          <img
            :src="imageUrl"
            alt="Email hero"
            width="600"
            style="max-width: 100%; height: auto; border-radius: 8px"
          />
        </ESection>
        <ESection v-if="imageUrl">
          <table width="100%" role="presentation" cellspacing="0" cellpadding="0" border="0">
            <tbody>
              <tr>
                <td style="height: 16px; font-size: 0">&nbsp;</td>
              </tr>
            </tbody>
          </table>
        </ESection>

        <ESection :data-field="fieldTarget('email.bodyHtml')">
          <template v-for="(segment, index) in bodySegments" :key="index">
            <!-- eslint-disable-next-line vue/no-v-html -- sanitized -->
            <div v-if="segment.kind === 'html' && segment.html" v-html="segment.html" />
            <component
              :is="EMAIL_CARD_COMPONENTS[segment.token]"
              v-else-if="segment.kind === 'card'"
              v-bind="segment.data"
            />
          </template>
        </ESection>

        <ESection v-if="signatureText" :data-field="fieldTarget('email.signatureNotice')">
          <table width="100%" role="presentation" cellspacing="0" cellpadding="0" border="0">
            <tbody>
              <tr>
                <td style="height: 16px; font-size: 0">&nbsp;</td>
              </tr>
              <tr>
                <td>
                  <template v-for="(line, lineIndex) in signatureLines" :key="lineIndex">
                    {{ line }}<br v-if="lineIndex < signatureLines.length - 1" />
                  </template>
                </td>
              </tr>
            </tbody>
          </table>
        </ESection>
      </EContainer>
    </EBody>
  </EHtml>
</template>
