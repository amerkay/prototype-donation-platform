<script setup lang="ts">
interface Props {
  bodyHtml: string
  imageUrl?: string
  signatureHtml?: string
}

defineProps<Props>()
</script>

<template>
  <div
    class="donation-email"
    style="background-color: #ffffff; font-family: sans-serif; margin: 0; padding: 0"
  >
    <div style="max-width: 600px; margin: 0 auto">
      <!-- Hero image -->
      <div v-if="imageUrl" data-field="email.imageUrl">
        <img
          :src="imageUrl"
          alt="Email hero"
          width="600"
          style="width: 100%; border-radius: 8px; display: block; margin-bottom: 16px"
        />
      </div>

      <!-- Body content -->
      <div data-field="email.bodyHtml">
        <!-- bodyHtml is already sanitized via processTemplateRichText -->
        <div v-html="bodyHtml" />
      </div>

      <!-- Signature -->
      <div v-if="signatureHtml" data-field="email.signatureNotice">
        <div v-html="signatureHtml" />
      </div>
    </div>
  </div>
</template>
