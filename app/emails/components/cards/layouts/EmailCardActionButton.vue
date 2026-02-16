<script setup lang="ts">
import { computed } from 'vue'
import { contrastForeground } from '~/features/settings/admin/utils/color-contrast'

interface Props {
  href: string
  label: string
  backgroundColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  backgroundColor: '#5f259f'
})
const textColor = computed(() => contrastForeground(props.backgroundColor))
</script>

<template>
  <table width="100%" role="presentation" cellspacing="0" cellpadding="0" border="0">
    <tbody>
      <tr>
        <td
          align="center"
          :style="`padding: 10px 12px; border: 1px solid ${backgroundColor}; background-color: ${backgroundColor}`"
        >
          <a
            :href="href"
            :style="`text-decoration: none; font-weight: 600; color: ${textColor}; display: block`"
          >
            {{ label }}
          </a>
        </td>
      </tr>
    </tbody>
  </table>
</template>
