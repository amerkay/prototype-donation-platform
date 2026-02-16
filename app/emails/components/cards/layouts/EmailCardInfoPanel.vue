<script setup lang="ts">
import EmailCardShell from '~/emails/components/cards/layouts/EmailCardShell.vue'

interface Props {
  title: string
  status?: string
}

defineProps<Props>()
</script>

<template>
  <EmailCardShell>
    <table width="100%" role="presentation" cellspacing="0" cellpadding="0" border="0">
      <tbody>
        <tr>
          <td style="padding: 12px 12px 0; vertical-align: top">
            <div style="font-weight: 600">
              {{ title }}
            </div>
            <template v-if="status">
              <table width="100%" role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tbody>
                  <tr>
                    <td style="height: 4px; font-size: 0">&nbsp;</td>
                  </tr>
                </tbody>
              </table>
              <div>{{ status }}</div>
            </template>
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 12px 12px; vertical-align: top">
            <slot />
          </td>
        </tr>
      </tbody>
    </table>
  </EmailCardShell>
</template>
