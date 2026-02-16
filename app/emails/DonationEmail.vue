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

function normalizeEmailParagraphMargins(html: string): string {
  return html.replace(/<p\b([^>]*)>/gi, (_fullMatch, attrs: string) => {
    if (/style\s*=/i.test(attrs)) {
      const mergedAttrs = attrs.replace(/style\s*=\s*(["'])(.*?)\1/i, (_m, quote, styleValue) => {
        const normalized = styleValue.trim()
        const withTerminator =
          normalized && !normalized.endsWith(';') ? `${normalized};` : normalized
        const withMargin = /(^|;)\s*margin\s*:/i.test(withTerminator)
          ? withTerminator
          : `${withTerminator}margin:0;`
        return `style=${quote}${withMargin}${quote}`
      })
      return `<p${mergedAttrs}>`
    }
    return `<p${attrs} style="margin:0;">`
  })
}

const sanitizedBodyHtml = computed(() =>
  normalizeEmailParagraphMargins(sanitizeRichText(props.bodyHtml, { profile: 'email' }))
)
const bodySegments = computed(() => splitBodyIntoCardSegments(sanitizedBodyHtml.value, props.cards))
const signatureLines = computed(() =>
  props.signatureText ? props.signatureText.split(/\r?\n/) : []
)
const fieldTarget = (path: string): string | undefined =>
  props.withFieldTargets ? path : undefined
</script>

<template>
  <EHtml lang="en">
    <EHead v-if="!props.preview">
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    </EHead>
    <EBody :style="{ backgroundColor: '#ffffff', fontFamily: 'sans-serif', padding: '0' }">
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
