<script setup lang="ts">
interface Props {
  bodyHtml: string
  imageUrl?: string
  signatureHtml?: string
}

defineProps<Props>()
</script>

<template>
  <EHtml lang="en">
    <EHead>
      <EStyle>
        p { margin: 0 0 12px 0; } p:last-child { margin-bottom: 0; } img[alt='Email hero'] { width:
        100% !important; max-width: 600px !important; height: auto !important; border-radius: 8px
        !important; margin-bottom: 16px !important; }
      </EStyle>
    </EHead>
    <EBody style="background-color: #ffffff; font-family: sans-serif; margin: 0; padding: 0">
      <EContainer>
        <!-- Hero image -->
        <ESection v-if="imageUrl">
          <EImg :src="imageUrl" alt="Email hero" :width="600" />
        </ESection>

        <!-- Body content -->
        <ESection>
          <div v-html="bodyHtml" />
        </ESection>

        <!-- Signature -->
        <ESection v-if="signatureHtml">
          <div v-html="signatureHtml" />
        </ESection>
      </EContainer>
    </EBody>
  </EHtml>
</template>
